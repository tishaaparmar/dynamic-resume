// src/pages/Login.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/AuthCard";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/Context/UserContext";
import { login } from "@/services/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setUser } = useUser(); // ✅ hook inside component
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const data = await login(email, password);

      // ✅ Save user in context
      setUser({ name: data.user.name, email: data.user.email });

      toast({
        title: "Logged in!",
        description: `Welcome back, ${data.user.name}`,
      });

      navigate("/dashboard"); // ✅ Redirect to dashboard
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Invalid credentials";
      setError(errorMessage);
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <AuthCard
      title="Sign in to Resume.io"
      description="Enter your credentials to access your professional resume vault."
    >
      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm font-medium">{error}</p>
        )}

        <Button type="submit" className="w-full btn-hero">
          Sign In
        </Button>

        <div className="text-center">
          <Link
            to="/signup"
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Don’t have an account? Sign up
          </Link>
        </div>
      </form>
    </AuthCard>
  );
};

export default Login;
