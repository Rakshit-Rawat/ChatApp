import React from "react";
import SocketManager from "./SocketManager";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MessengerLayout from "./pages/MessengerLayout";
import Home from "./pages/Home";

const App = () => {
  return (
    <Router>
      
        <SocketManager/>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/chat" element={<MessengerLayout />} />
          </Routes>{" "}
        
      
    </Router>
  );
};

export default App;
