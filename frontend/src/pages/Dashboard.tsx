// src/pages/Dashboard.tsx
import React, { useState, useEffect } from "react";
import { Plus, FileText, Calendar, MoreVertical, Trash2, Edit, Copy, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useUser } from "@/Context/UserContext";
import { useNavigate } from "react-router-dom";
import { listResumes, createResume, deleteResume, duplicateResume } from "@/services/resume";
import { BackButton } from "@/components/BackButton";
import { useToast } from "@/hooks/use-toast";
import { createDefaultSnapshot } from "@/types/resume";

interface Resume {
  _id: string;
  title: string;
  description: string;
  updatedAt: string;
  versionCount?: number;
}

const Dashboard: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) loadResumes();
  }, [user]);

  const loadResumes = async () => {
    try {
      setLoading(true);
      const resumesData = await listResumes();
      setResumes(resumesData);
    } catch (error) {
      console.error("Error loading resumes:", error);
      toast({
        title: "Error",
        description: "Failed to load resumes",
        variant: "destructive"
      });
      setResumes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateResume = async () => {
    try {
      setCreating(true);
      const newResume = await createResume("New Resume", createDefaultSnapshot());
      await loadResumes();
      navigate(`/resume/${newResume._id}`);
    } catch (error) {
      console.error("Error creating resume:", error);
      toast({
        title: "Error",
        description: "Failed to create resume",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    try {
      await deleteResume(resumeId);
      setResumes(prev => prev.filter(r => r._id !== resumeId));
      toast({
        title: "Deleted",
        description: "Resume deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting resume:", error);
      toast({
        title: "Error",
        description: "Failed to delete resume",
        variant: "destructive"
      });
    }
  };

  const handleDuplicateResume = async (resumeId: string) => {
    try {
      const duplicated = await duplicateResume(resumeId);
      await loadResumes();
      toast({
        title: "Success",
        description: "Resume duplicated successfully",
      });
      // Navigate to the duplicated resume
      navigate(`/resume/${duplicated._id}`);
    } catch (error) {
      console.error("Error duplicating resume:", error);
      toast({
        title: "Error",
        description: "Failed to duplicate resume",
        variant: "destructive"
      });
    }
  };


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading resumes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <BackButton to="/" label="Home" />
            <div>
              <h1 className="text-2xl font-semibold text-foreground">ResumeVault</h1>
              <p className="text-muted-foreground font-sans">Hello, {user.name}</p>
            </div>
          </div>
          <Button className="btn-hero" onClick={handleCreateResume} disabled={creating}>
            <Plus className="w-4 h-4 mr-2" />
            {creating ? "Creating..." : "New Resume"}
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats & Grid (same as yours) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="card-soft hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{resumes?.length || 0}</p>
                  <p className="text-sm text-muted-foreground font-sans">Total Resumes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-soft hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-secondary/50 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{resumes?.reduce((acc, r) => acc + (r.versionCount || 0), 0) || 0}</p>
                  <p className="text-sm text-muted-foreground font-sans">Total Versions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-soft hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-accent/50 rounded-lg flex items-center justify-center">
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{resumes?.length || 0}</p>
                  <p className="text-sm text-muted-foreground font-sans">Active Resumes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grid of resumes */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Your Resumes</h2>
            <Button variant="outline" className="btn-soft">View All</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(!resumes || resumes.length === 0) ? (
              <div className="col-span-full text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No resumes yet</h3>
                <p className="text-muted-foreground mb-4">Create your first resume to get started</p>
                <Button onClick={handleCreateResume} disabled={creating}>
                  <Plus className="w-4 h-4 mr-2" />
                  {creating ? "Creating..." : "Create Resume"}
                </Button>
              </div>
            ) : (
              resumes.map((resume, i) => (
                <Card 
                  key={resume._id} 
                  className="card-soft cursor-pointer group animate-fade-in hover-scale" 
                  style={{ animationDelay: `${i * 100}ms` }}
                  onClick={() => navigate(`/resume/${resume._id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">{resume.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">Last updated {formatDate(resume.updatedAt)}</p>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border border-border">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/resume/${resume._id}`); }}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/timeline/${resume._id}`); }}>
                            <History className="w-4 h-4 mr-2" />
                            Version History
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicateResume(resume._id); }}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive" 
                            onClick={(e) => { e.stopPropagation(); handleDeleteResume(resume._id); }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Badge variant="default" className="bg-primary/10 text-primary">Active</Badge>
                        <span className="text-sm text-muted-foreground">{resume.versionCount || 0} versions</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/timeline/${resume._id}`);
                        }}
                      >
                        <History className="w-3 h-3 mr-1" />
                        History
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
