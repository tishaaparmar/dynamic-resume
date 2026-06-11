// src/pages/Signup.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/AuthCard";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/Context/UserContext";
import api from "@/lib/api";

export const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();
  const { setUser } = useUser(); // ✅ hook inside component
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Backend signup request
      const res = await api.post("/auth/signup", { name, email, password });
      
      // Set user context
      setUser(res.data.user);

      toast({
        title: "Account created!",
        description: "Welcome to Resume.io. Your journey starts now.",
      });

      navigate("/"); // ✅ Redirect to Index page
    } catch (err: any) {
      toast({
        title: "Signup failed",
        description: err.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthCard
      title="Create your account"
      description="Join Resume.io to start building and versioning your professional story."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
        </div>

        <Button type="submit" className="w-full btn-hero">Create Account</Button>

        <div className="text-center">
          <Link to="/login" className="text-sm text-primary hover:text-primary/80 transition-colors">
            Already have an account? Sign in
          </Link>
        </div>
      </form>
    </AuthCard>
  );
};
