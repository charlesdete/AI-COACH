import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./features/auth/pages/Login";
import SignUp from "./features/auth/pages/Signup";

// Import your pages so the router can see them
import Dashboard from "./roles/teachers/pages/Dashboard";
import LoopRooms from "./roles/teachers/pages/LoopRooms";
import ChatRoom from "./roles/teachers/pages/ChatRoom";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Login and Signup routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* YOUR ROUTES */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/loop/:topic" element={<LoopRooms />} />
        <Route path="/loop/:topic/chat/:roomId" element={<ChatRoom />} />

        {/* This line FIXES the black screen by making Dashboard the home page */}
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}
