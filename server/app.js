import express from 'express';
import { Server } from 'socket.io';
import {createServer} from 'http';
// if we want to use it in APIs the we pass cors as middleware
// agr ese hi socket.io me use krna h (as seen in io creation), can do it without importing
import cors from 'cors';

// authentication
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const port = 3000;
const secretKeyJWT = "ahwvxdetdcwuswqogsquw";
const app = express();


const server = createServer(app);
// io means circuit 
// kyuki server or client dono alg alg ports pe chal rhe, cors k through connection krna padega
const io = new Server(server, {
    cors:{
        // * :- allow all origins
        // we are giving frontend ka origin
        origin:"http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
    }
});


// cors used as middleware (options, methods, credentials object is optional here: used while uisng API)
app.use(cors({
    // * :- allow all origins
    // we are giving frontend ka origin
    origin:"http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
})); 


app.get('/', (req,res) => {
    res.send("hello world!");
});

app.get('/login', (req,res) => {
    const token = jwt.sign({_id:"cbhegvcxwcsytqws"}, secretKeyJWT);
    res
    .cookie("token", token, { httpOnly:true, secure:true, sameSite:"none" })
    .json({
        message:"login successful"
    });
});


// optional:- we can add middleware for authentication
//eg, agr user false hai, then connect hi ni krege, else next mtlb io.on pe jayege
// const user = false;
// authentication sample 1
// io.use((socket,next)=>{
//     if(user) next();
// });
io.use((socket, next)=>{
    cookieParser()(socket.request, socket.request.res, (err)=>{
        if(err) return next(err);

        const token = socket.request.cookies.token;
        if(!token) return next(new Error("Authentication Error"));

        const decoded = jwt.verify(token, secretKeyJWT);
        next();
    });
});

// create a circuit
// individual client is socket
// jse hi client side p koi socket ya user connect hoga, ye events trigger hoke chalege
io.on("connection", (socket) => {
    // events
    console.log("User Connected"); 
    console.log("id: ", socket.id);

    // // now trigger event using emit
    // best practice:- emit ka use client side pe kia kro
    // socket.emit("welcome", `Welcome to the Server.`);
    // // broadcast message
    // socket.broadcast.emit("welcome", `${socket.id} joined the server`);

    //  message event on server side (client se trigger hoke aayega)
    // real time communication
    socket.on("message", (data)=>{
        console.log(data);
        // saaare users ko ye message jayega
        // io.emit("receive-message", data);
        // socket.broadcast.emit("receive-message", data); // mujhe chodhke baki users ko milega
        // ek particular room ko message send krna h:-
        // agr upr destrcuture kr lete(data ki jgh {message, room} le lete, then yha srf room likhte)
        // to ke sath socket ya io kuch bhi lgao doesn't matter
        io.to(data.room).emit("receive-message", data.message); // socket.to(data.room).emit("receive-message", data.message);
    })


    // join room feature
    socket.on("join-room", (roomName)=>{
        socket.join(roomName);
        console.log(`user joined room ${roomName}`);
    })

    // disconnect user
    socket.on("disconnect", ()=>{
        console.log("User Disconnected: ", socket.id);
    })

});




// server p hi listen krna h kyuki io server pe hi create hua h
server.listen(port, ()=> 
    { console.log(`server is running on port ${port}`); 
});