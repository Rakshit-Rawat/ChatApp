import React from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import User from "./User";
import MessengerLayout from "./pages/MessengerLayout";
import Home from './pages/Home'


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
