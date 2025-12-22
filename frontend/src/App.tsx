import React from "react";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import { Signup } from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import { ResumeEditor } from "./pages/ResumeEditor";
import NotFound from "./pages/NotFound";
import { useUser } from "@/Context/UserContext";

const App = () => {
  const { loading } = useUser(); // get loading from context

  if (loading) {
    // Show a simple loading screen while fetching user
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/resume/:id" element={<ResumeEditor />} />
      <Route path="/editor" element={<ResumeEditor />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
