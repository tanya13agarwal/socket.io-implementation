import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import {CssBaseline} from '@mui/material'

ReactDOM.createRoot(document.getElementById('root')).render(
  // kyuki server p response 2 times generate horha tha isliye strictMode off krdia abhi
  // <React.StrictMode>
  <>
    <CssBaseline/>
    <App />
  </>
  // </React.StrictMode>,
)
