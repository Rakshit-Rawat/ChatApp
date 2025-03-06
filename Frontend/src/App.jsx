import React from "react";
import { AuthProvider } from "./AuthContext";
import { SocketProvider } from "./SocketContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import User from "./User";
import MessengerLayout from "./MessengerLayout";
import Home from './Home'


const App = () => {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/user" element={<User />} />
            <Route path="/chat" element={<MessengerLayout />} />
          </Routes>{" "}
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
