// src/pages/Index.tsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, GitBranch, History, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import heroImage from "@/assets/hero-image-warm.jpg";
import { Star, Quote } from "lucide-react";
import api from "@/lib/api";
import { useUser } from "@/Context/UserContext";


const Index: React.FC = () => {
  const { user, setUser, } = useUser();
  const navigate = useNavigate();

  const handleStart = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  const features = [
    { icon: GitBranch, title: "Version Control", description: "Track every change to your resume with Git-like version control." },
    { icon: History, title: "Timeline View", description: "Visualize your resume's evolution over time." },
    { icon: FileText, title: "Live Preview", description: "See your changes in real-time with our two-column editor." },
    { icon: Users, title: "Easy Sharing", description: "Generate secure, shareable links and export to PDF/JSON." },
  ];

  const testimonials = [
    { name: "Sarah Chen", role: "Product Manager", company: "TechFlow", content: "ResumeVault transformed how I manage my career documents.", rating: 5 },
    { name: "Marcus Rodriguez", role: "Software Engineer", company: "InnovateLabs", content: "As someone who codes daily, having Git-like features for my resume feels natural.", rating: 5 },
    { name: "Emily Watson", role: "UX Designer", company: "DesignCo", content: "The typography and warm color palette caught my eye immediately.", rating: 5 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg" />
            <span className="text-xl font-semibold text-foreground">ResumeVault</span>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
  <div className="flex items-center space-x-3">
    <span className="text-lg font-medium">Hello, {user.name}</span>
    <Button
  variant="outline"
  size="sm"
  className="btn-hero text-lg px-8 py-4 flex items-center"
  onClick={async () => {
    try {
      await api.post("/auth/logout"); // call backend logout
      setUser(null); // clear context
      navigate("/"); // redirect to home
    } catch (err) {
      console.log(err);
    }
  }}
>
  Logout
</Button>

  </div>
) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button className="btn-hero">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Version Control for Your <span className="text-primary">Professional Story</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed font-sans">
              Build, track, and manage your resumes like code.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleStart} size="lg" className="btn-hero text-lg px-8 py-4 flex items-center">
                Start Building Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
          <div>
            <img src={heroImage} alt="Hero" className="w-full h-auto rounded-2xl shadow-2xl" />
          </div>
        </div>
      </section>

      {/* Features & Testimonials (same as your design) */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Professional Resume Management, Simplified</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Everything you need to create, maintain, and share professional resumes with confidence and style.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <Card key={i} className="card-soft text-center group">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <f.icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">{f.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">What Our Users Say</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Join thousands of professionals who've transformed their careers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <Card key={idx} className="card-soft relative group">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(t.rating)].map((_, i2) => <Star key={i2} className="w-4 h-4 fill-primary text-primary" />)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed font-sans italic">"{t.content}"</p>
                  <div className="pt-4 border-t border-border">
                    <p className="font-semibold text-foreground">{t.name}</p>
                    <p className="text-sm text-muted-foreground font-sans">{t.role} at {t.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-muted/20 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary rounded-md" />
            <span className="font-semibold text-foreground">ResumeVault</span>
          </div>
          <p className="text-muted-foreground text-sm font-sans">© 2024 ResumeVault</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
