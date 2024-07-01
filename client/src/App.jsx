import React, { useEffect, useMemo, useState } from 'react'
import {io} from 'socket.io-client';

import {Container, TextField, Typography, Button, Stack} from '@mui/material'

const App = () => {

  // server ka url dete h while connection setup 
  // const socket = io("http://localhost:3000");
  // second method
  const socket = useMemo(()=>io("http://localhost:3000", {
    withCredentials: true,
  }),[]);

  // create an array of messages
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  // for specific room creation
  const [room, setRoom] = useState("");
  const [socketId, setSocketId] = useState("");
  // for join room feature, we need roomName
  const [roomName, setRoomName] = useState("");


  console.log(messages);

  const handleSubmit = (e)=>{
    //jse hi form trigger ho, page refresh na ho uske liye use preventDefault
    e.preventDefault();
    // emit message event (trigger message event)
    // socket.emit("message", message);
    // emit room event
    socket.emit("message", {message, room});
    // reset to empty message box
    setMessage("");
  }

  const joinRoomHandler = (e) => {
    e.preventDefault();
    socket.emit("join-room", roomName);
    // join krne k baad roomName ko empty set krna h
    setRoomName("");
  }
  
  // manage events
  // jse hi connection vala socket trigger hoga, following perform hoga
  // if you console log on client side, connected likh k aa jayega
  useEffect(()=>{
    socket.on("connect",()=>{
      // jse hi connect ho, socketid daaldo
      setSocketId(socket.id);
      console.log("connected", socket.id);
    });

    // welcome event jo trigger hua tha, yha receive hoga
    socket.on("welcome", (data)=>{
      console.log(data);
    });

    // receive message listener
    socket.on("receive-message", (data)=>{
      console.log(data);
      // append the latest message into array of messages
      setMessages((messages)=>[...messages, data]);
    });


    // jb bhi return krege(saara desired kaam kr chuke h), disconnect event trigger hojayega
    return () => {
      socket.disconnect();
    };

  },[]);
  
  // if we want message on server side, client side p trigger krege
  return (
    <Container maxWidth="sm">

      {/* heading */}
      {/* <Typography variant='h1' component="div" gutterBottom> Welcome to Socket.io </Typography> */}
      <Typography variant='h2' component="div" gutterBottom> {socketId} </Typography>

      {/* join room feature */}
      <form onSubmit={joinRoomHandler}>
        <TextField value={roomName} onChange={e=>setRoomName(e.target.value)} id="outlined-basic" label="Room Name" variant='outlined'/>
        <Button type='submit' variant="contained" color="primary">Join</Button>
      </form>

      {/* form */}
      <form onSubmit={handleSubmit}>
        <TextField value={message} onChange={e=>setMessage(e.target.value)} id="outlined-basic" label="message" variant='outlined'/>
        <TextField value={room} onChange={e=>setRoom(e.target.value)} id="outlined-basic" label="room" variant='outlined'/>
        <Button type='submit' variant="contained" color="primary">Send</Button>
      </form>

      {/* display all incoming messages  */}
      <Stack>
        {
          messages.map(
            (m,i) => (
              <Typography key={i} variant='h6' component='div' gutterBottom>{m}</Typography>
            )
          )
        }
      </Stack>

    </Container>
  )
}

export default App