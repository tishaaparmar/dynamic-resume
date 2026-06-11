// src/pages/Index.tsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  History,
  Eye,
  LayoutGrid,
  Copy,
  FolderKanban,
  FileDown,
  Monitor,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import heroImage from "@/assets/hero-image-warm.jpg";
import api from "@/lib/api";
import { useUser } from "@/Context/UserContext";

const Logo: React.FC = () => (
  <div className="flex items-center space-x-2.5">
    <svg className="w-8 h-8 filter drop-shadow-sm" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f9a882" />
          <stop offset="100%" stopColor="#fccba1" />
        </linearGradient>
      </defs>
      <rect x="4" y="2" width="24" height="28" rx="4.5" fill="url(#logoGrad)" />
      <path d="M20 2L28 10H20V2Z" fill="#ffedd5" opacity="0.95" />
      <path d="M20 2V10H28" stroke="white" strokeWidth="1.2" strokeLinejoin="round" />
      <line x1="8" y1="14" x2="24" y2="14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="8" y1="20" x2="24" y2="20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="8" y1="26" x2="17" y2="26" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
    <span className="text-xl font-bold tracking-tight text-slate-800 font-sans">
      Resume<span className="text-orange-500">.io</span>
    </span>
  </div>
);

const Index: React.FC = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const handleStart = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  const features = [
    {
      icon: History,
      title: "Timeline Editor",
      description: "Manage your career journey through an intuitive timeline view. Easily organize education, work experience, projects, and achievements to keep your resume structured.",
    },
    {
      icon: Eye,
      title: "Live Resume Preview",
      description: "See changes instantly as you build your resume. Real-time preview with professional formatting provides a seamless WYSIWYG editing experience.",
    },
    {
      icon: LayoutGrid,
      title: "Multiple Resume Layouts",
      description: "Switch between different professional resume templates. Compare layouts before exporting to ensure ATS-friendly and recruiter-ready designs.",
    },
    {
      icon: Copy,
      title: "Resume Duplication",
      description: "Create copies of existing resumes with one click. Customize different versions for different job applications and save time by reusing content.",
    },
    {
      icon: FolderKanban,
      title: "Smart Resume Management",
      description: "Store and manage multiple resumes in one place. Quick access to edit, preview, duplicate, and download from a unified dashboard.",
    },
    {
      icon: Monitor,
      title: "Responsive Experience",
      description: "Build and edit resumes seamlessly across desktop, tablet, and mobile devices. A fully optimized interface designed for productivity.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager",
      company: "TechFlow",
      content: "Resume.io transformed how I manage my career documents.",
      rating: 5,
    },
    {
      name: "Marcus Rodriguez",
      role: "Software Engineer",
      company: "InnovateLabs",
      content: "As someone who codes daily, having Git-like features for my resume feels natural.",
      rating: 5,
    },
    {
      name: "Emily Watson",
      role: "UX Designer",
      company: "DesignCo",
      content: "The typography and elegant template layouts caught my eye immediately.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Glassmorphic Navigation Bar */}
      <nav className="border-b border-orange-100/50 bg-white/70 backdrop-blur-md sticky top-0 z-50 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-slate-600">Hello, {user.name}</span>
                <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")} className="border-orange-100 hover:bg-orange-50/50">
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-orange-100 hover:bg-orange-50/50"
                  onClick={async () => {
                    try {
                      await api.post("/auth/logout");
                      setUser(null);
                      navigate("/");
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
                  <Button variant="ghost" className="hover:bg-orange-50/50">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button className="btn-hero rounded-lg">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero with Back-Light Radial Glow */}
      <section className="relative py-20 lg:py-28 overflow-hidden bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-orange-100/40 via-orange-50/15 to-transparent">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl lg:text-6xl font-bold text-slate-800 mb-6 leading-tight tracking-tight font-serif">
              Build Better Resumes <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Faster</span>
            </h1>
            <p className="text-lg text-slate-500 mb-8 leading-relaxed font-sans font-light">
              Create, duplicate, track, and export professional, recruiter-ready resumes with a real-time preview and intuitive career timelines.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleStart} size="lg" className="btn-hero text-base px-8 py-4 flex items-center rounded-lg">
                Start Building Today
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-orange-400/5 rounded-2xl blur-3xl -z-10" />
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-200 to-amber-200 rounded-xl blur opacity-25 group-hover:opacity-100 transition duration-1000 -z-10" />
            <img src={heroImage} alt="Hero Preview" className="w-full h-auto rounded-xl shadow-xl border border-orange-100/80 relative bg-white" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 border-y border-orange-100/40 bg-orange-50/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold tracking-tight text-slate-800 mb-4 font-serif">
              Professional Resume Management, Simplified
            </h2>
            <p className="text-lg text-slate-500 max-w-3xl mx-auto font-light">
              Everything you need to create, maintain, duplicate, and export high-quality resumes with total confidence and ease.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <Card
                key={i}
                className="card-soft border border-orange-100/40 p-6 flex flex-col justify-between hover:shadow-[0_8px_30px_rgba(251,146,60,0.08)] hover:border-orange-200/80 transition-all duration-300 bg-white"
              >
                <div>
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center border border-orange-100/60 mb-5">
                    <f.icon className="w-5 h-5 text-orange-500" />
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-800 mb-2.5 font-serif">{f.title}</CardTitle>
                  <p className="text-sm text-slate-500 leading-relaxed font-normal">{f.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold tracking-tight text-slate-800 mb-4 font-serif">
              What Our Users Say
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-light">
              Join thousands of professionals who have accelerated their job search.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <Card key={idx} className="card-soft border border-orange-100/40 p-6 bg-white flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(t.rating)].map((_, i2) => (
                      <Star key={i2} className="w-4 h-4 fill-orange-400 text-orange-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-sans italic">
                    "{t.content}"
                  </p>
                </div>
                <div className="pt-4 mt-6 border-t border-orange-50 flex flex-col">
                  <span className="font-semibold text-slate-850 text-sm">{t.name}</span>
                  <span className="text-xs text-slate-400 font-sans">
                    {t.role} at {t.company}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-orange-100/40 bg-orange-50/20 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo />
          <p className="text-slate-400 text-sm font-sans">© 2026 Resume.io. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
