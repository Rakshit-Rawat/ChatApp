import { BrowserRouter as Router, Route, Routes } from "react-router";

import SocketManager from "./SocketManager";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MessengerLayout from "./pages/MessengerLayout";
import Register from "./pages/Register";

const App = () => (
  <Router>
    <SocketManager />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/chat" element={<MessengerLayout />} />
    </Routes>
  </Router>
);

export default App;
