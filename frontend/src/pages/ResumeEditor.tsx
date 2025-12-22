import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Save, Eye, History, Download, Plus, Trash2, Calendar, MapPin, Phone, Mail, Linkedin, Globe, User, FileText, Award, Briefcase, GraduationCap, Edit2, Check, X } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getResume, updateResume, updateResumeTitle, createResume, exportResumePDF, getVersion } from "@/services/resume";
import { useUser } from "@/Context/UserContext";
import { ResumePreviewModal } from "@/components/ResumePreviewModal";

export const ResumeEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUser();
  const [searchParams] = useSearchParams();
  const versionId = searchParams.get('version');
  
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      name: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      website: ""
    },
    summary: "",
    experience: [] as Array<{
      title: string;
      company: string;
      period: string;
      description: string;
    }>,
    education: [] as Array<{
      degree: string;
      school: string;
      period: string;
    }>,
    skills: [] as string[]
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resumeTitle, setResumeTitle] = useState("Untitled Resume");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState("");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load resume data
  useEffect(() => {
    const loadResume = async () => {
      if (!id) {
        // Creating new resume - create it first
        try {
          setLoading(true);
          const newResume = await createResume("New Resume", {
            personalInfo: { name: "", email: "", phone: "", location: "", linkedin: "", website: "" },
            summary: "",
            experience: [],
            education: [],
            skills: []
          });
          // Redirect to the new resume with its ID
          navigate(`/resume/${newResume._id}`, { replace: true });
        } catch (error) {
          console.error("Error creating resume:", error);
          toast({
            title: "Error",
            description: "Failed to create resume",
            variant: "destructive"
          });
          navigate("/dashboard");
        } finally {
          setLoading(false);
        }
        return;
      }
      
      try {
        setLoading(true);
        let resumeDataToLoad;
        
        // ✅ If version ID is provided, load that specific version
        if (versionId) {
          const [version, resume] = await Promise.all([
            getVersion(id, versionId),
            getResume(id)
          ]);
          resumeDataToLoad = version.snapshot;
          setResumeTitle(`${resume.title} (Version: ${version.message})`);
          setLastSaved(new Date(version.createdAt));
          // ✅ Disable editing when viewing a version
          setHasUnsavedChanges(false);
        } else {
          const resume = await getResume(id);
          resumeDataToLoad = resume.current;
          setResumeTitle(resume.title);
          setLastSaved(new Date(resume.updatedAt));
        }
        
        setResumeData(resumeDataToLoad || {
          personalInfo: { name: "", email: "", phone: "", location: "", linkedin: "", website: "" },
          summary: "",
          experience: [],
          education: [],
          skills: []
        });
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error("Error loading resume:", error);
        toast({
          title: "Error",
          description: "Failed to load resume",
          variant: "destructive"
        });
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadResume();
  }, [id, versionId, navigate, toast]);

  // Auto-save functionality (only if not viewing a version)
  useEffect(() => {
    if (!loading && id && !versionId && hasUnsavedChanges) {
      const timeoutId = setTimeout(() => {
        handleSave("autosave");
      }, 3000); // Auto-save after 3 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [resumeData, loading, id, versionId, hasUnsavedChanges]);

  const handleSave = async (message: string = "Manual save") => {
    if (!id) return;
    
    try {
      setSaving(true);
      await updateResume(id, resumeData, message, resumeTitle);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      toast({
        title: "Saved",
        description: "Resume saved successfully",
      });
    } catch (error) {
      console.error("Error saving resume:", error);
      toast({
        title: "Error",
        description: "Failed to save resume",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // ✅ Handle title editing
  const handleStartEditTitle = () => {
    setTempTitle(resumeTitle);
    setIsEditingTitle(true);
  };

  const handleSaveTitle = async () => {
    if (!id || !tempTitle.trim()) {
      setIsEditingTitle(false);
      return;
    }

    try {
      await updateResumeTitle(id, tempTitle.trim());
      setResumeTitle(tempTitle.trim());
      setIsEditingTitle(false);
      toast({
        title: "Success",
        description: "Resume title updated",
      });
    } catch (error) {
      console.error("Error updating title:", error);
      toast({
        title: "Error",
        description: "Failed to update title",
        variant: "destructive"
      });
      setTempTitle(resumeTitle); // Reset on error
    }
  };

  const handleCancelEditTitle = () => {
    setTempTitle(resumeTitle);
    setIsEditingTitle(false);
  };

  const updatePersonalInfo = (field: string, value: string) => {
    if (versionId) return; // ✅ Don't allow editing when viewing a version
    setResumeData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  const addExperience = () => {
    if (versionId) return; // ✅ Don't allow editing when viewing a version
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, { title: "", company: "", period: "", description: "" }]
    }));
    setHasUnsavedChanges(true);
  };

  const updateExperience = (index: number, field: string, value: string) => {
    if (versionId) return; // ✅ Don't allow editing when viewing a version
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
    setHasUnsavedChanges(true);
  };

  const removeExperience = (index: number) => {
    if (versionId) return; // ✅ Don't allow editing when viewing a version
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
    setHasUnsavedChanges(true);
  };

  const addEducation = () => {
    if (versionId) return; // ✅ Don't allow editing when viewing a version
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, { degree: "", school: "", period: "" }]
    }));
    setHasUnsavedChanges(true);
  };

  const updateEducation = (index: number, field: string, value: string) => {
    if (versionId) return; // ✅ Don't allow editing when viewing a version
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
    setHasUnsavedChanges(true);
  };

  const removeEducation = (index: number) => {
    if (versionId) return; // ✅ Don't allow editing when viewing a version
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
    setHasUnsavedChanges(true);
  };

  const updateSummary = (value: string) => {
    if (versionId) return; // ✅ Don't allow editing when viewing a version
    setResumeData(prev => ({ ...prev, summary: value }));
    setHasUnsavedChanges(true);
  };

  const updateSkills = (value: string) => {
    if (versionId) return; // ✅ Don't allow editing when viewing a version
    setResumeData(prev => ({ 
      ...prev, 
      skills: value.split(",").map(skill => skill.trim()).filter(skill => skill !== "")
    }));
    setHasUnsavedChanges(true);
  };

  const handleExportPDF = async () => {
    if (!id) return;
    
    try {
      // ✅ Save the current data first to ensure PDF has latest content
      if (hasUnsavedChanges) {
        await handleSave("PDF export");
        // ✅ Wait a moment for save to complete
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // ✅ Call backend API to generate PDF (download mode)
      const pdfBlob = await exportResumePDF(id, false);
      
      // ✅ Validate PDF blob is valid
      if (!pdfBlob || !(pdfBlob instanceof Blob)) {
        throw new Error("PDF blob is not a valid Blob object");
      }
      
      if (pdfBlob.size === 0) {
        throw new Error("PDF blob is empty");
      }

      // ✅ Validate blob type (should be application/pdf)
      if (pdfBlob.type && pdfBlob.type !== 'application/pdf') {
        console.warn('Unexpected blob type:', pdfBlob.type);
      }

      // ✅ Read first bytes to validate it's a PDF
      const arrayBuffer = await pdfBlob.slice(0, 4).arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const header = String.fromCharCode(...uint8Array);
      
      if (header !== '%PDF') {
        console.error('Invalid PDF header:', header);
        throw new Error("Downloaded file is not a valid PDF");
      }

      // ✅ Create download link and trigger download
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resumeTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // ✅ Clean up after a short delay
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      toast({
        title: "Success",
        description: "PDF downloaded successfully",
      });
    } catch (error: any) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to export PDF. Please try again.",
        variant: "destructive"
      });
    }
  };


  const handleHistory = () => {
    if (!id) return;
    navigate(`/timeline/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading resume...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Breadcrumbs items={[
            { label: "Dashboard", path: "/dashboard" },
            { label: resumeTitle }
          ]} />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* ✅ Back to Dashboard button */}
              <BackButton />
              <div>
                {isEditingTitle ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSaveTitle();
                        } else if (e.key === "Escape") {
                          handleCancelEditTitle();
                        }
                      }}
                      className="text-xl font-semibold h-8"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSaveTitle}
                      className="h-8 w-8 p-0"
                    >
                      <Check className="w-4 h-4 text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelEditTitle}
                      className="h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 group">
                    <h1 className="text-xl font-semibold text-foreground">{resumeTitle}</h1>
                    {!versionId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleStartEditTitle}
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Edit title"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-muted-foreground">
                    {lastSaved ? `Last saved ${lastSaved.toLocaleString()}` : "Not saved yet"}
                  </p>
                  {hasUnsavedChanges && (
                    <Badge variant="outline" className="text-orange-600 border-orange-200">
                      Unsaved changes
                    </Badge>
                  )}
                  {saving && (
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      Saving...
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {!versionId && (
                <>
                  <Button variant="outline" size="sm" className="btn-soft" onClick={handleHistory}>
                    <History className="w-4 h-4 mr-2" />
                    History
                  </Button>
                  <Button variant="outline" size="sm" className="btn-soft" onClick={() => setShowPreview(true)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm" className="btn-soft" onClick={handleExportPDF}>
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button 
                    className="btn-hero" 
                    size="sm" 
                    onClick={() => handleSave("Manual save")}
                    disabled={saving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              )}
              {versionId && (
                <Badge variant="outline" className="text-blue-600 border-blue-200">
                  Viewing Version (Read-only)
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Forms */}
          <div className="space-y-6 fade-in">
            {/* Personal Information */}
            <Card className="card-soft">
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={resumeData.personalInfo.name}
                        onChange={(e) => updatePersonalInfo('name', e.target.value)}
                        className="input-elegant pl-10"
                        placeholder="Enter your full name"
                        disabled={!!versionId}
                        readOnly={!!versionId}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={resumeData.personalInfo.email}
                        onChange={(e) => updatePersonalInfo('email', e.target.value)}
                        className="input-elegant pl-10"
                        placeholder="your.email@example.com"
                        disabled={!!versionId}
                        readOnly={!!versionId}
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={resumeData.personalInfo.phone}
                        onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                        className="input-elegant pl-10"
                        placeholder="+1 (555) 123-4567"
                        disabled={!!versionId}
                        readOnly={!!versionId}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        value={resumeData.personalInfo.location}
                        onChange={(e) => updatePersonalInfo('location', e.target.value)}
                        className="input-elegant pl-10"
                        placeholder="City, State/Country"
                        disabled={!!versionId}
                        readOnly={!!versionId}
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="linkedin" className="text-sm font-medium">LinkedIn</Label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="linkedin"
                        value={resumeData.personalInfo.linkedin}
                        onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                        className="input-elegant pl-10"
                        placeholder="linkedin.com/in/yourprofile"
                        disabled={!!versionId}
                        readOnly={!!versionId}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-sm font-medium">Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="website"
                        value={resumeData.personalInfo.website}
                        onChange={(e) => updatePersonalInfo('website', e.target.value)}
                        className="input-elegant pl-10"
                        placeholder="yourwebsite.com"
                        disabled={!!versionId}
                        readOnly={!!versionId}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Summary */}
            <Card className="card-soft">
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Professional Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={resumeData.summary}
                  onChange={(e) => updateSummary(e.target.value)}
                  className="input-elegant min-h-[120px] resize-none"
                  placeholder="Write a compelling summary of your professional background, highlighting your key achievements and career goals..."
                  disabled={!!versionId}
                  readOnly={!!versionId}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {resumeData.summary.length}/500 characters
                </p>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card className="card-soft">
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  value={resumeData.skills.join(", ")}
                  onChange={(e) => updateSkills(e.target.value)}
                  className="input-elegant"
                  placeholder="React, TypeScript, Node.js, Python, AWS, Docker..."
                  disabled={!!versionId}
                  readOnly={!!versionId}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Separate skills with commas • {resumeData.skills.length} skills added
                </p>
                {resumeData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {resumeData.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Experience */}
            <Card className="card-soft">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <Briefcase className="w-5 h-5 mr-2" />
                    Experience
                  </CardTitle>
                  {!versionId && (
                    <Button variant="outline" size="sm" onClick={addExperience}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Experience
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {resumeData.experience.map((exp, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Experience #{index + 1}</h4>
                      {!versionId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExperience(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Job Title</Label>
                        <Input
                          value={exp.title}
                          onChange={(e) => updateExperience(index, 'title', e.target.value)}
                          className="input-elegant"
                          placeholder="Senior Software Engineer"
                          disabled={!!versionId}
                          readOnly={!!versionId}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Company</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) => updateExperience(index, 'company', e.target.value)}
                          className="input-elegant"
                          placeholder="Tech Corp"
                          disabled={!!versionId}
                          readOnly={!!versionId}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Period</Label>
                        <Input
                          value={exp.period}
                          onChange={(e) => updateExperience(index, 'period', e.target.value)}
                          className="input-elegant"
                          placeholder="2022 - Present"
                          disabled={!!versionId}
                          readOnly={!!versionId}
                        />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                        <Textarea
                          value={exp.description}
                          onChange={(e) => updateExperience(index, 'description', e.target.value)}
                          className="input-elegant min-h-[80px] resize-none"
                          placeholder="Describe your key achievements and responsibilities..."
                          disabled={!!versionId}
                          readOnly={!!versionId}
                        />
                    </div>
                  </div>
                ))}
                {resumeData.experience.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No experience added yet.</p>
                    <p className="text-sm">Click "Add Experience" to get started.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Education */}
            <Card className="card-soft">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2" />
                    Education
                  </CardTitle>
                  {!versionId && (
                    <Button variant="outline" size="sm" onClick={addEducation}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Education
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {resumeData.education.map((edu, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Education #{index + 1}</h4>
                      {!versionId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEducation(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Degree</Label>
                      <Input
                        value={edu.degree}
                        onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                        className="input-elegant"
                        placeholder="Bachelor of Science in Computer Science"
                        disabled={!!versionId}
                        readOnly={!!versionId}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>School</Label>
                        <Input
                          value={edu.school}
                          onChange={(e) => updateEducation(index, 'school', e.target.value)}
                          className="input-elegant"
                          placeholder="Stanford University"
                          disabled={!!versionId}
                          readOnly={!!versionId}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Period</Label>
                        <Input
                          value={edu.period}
                          onChange={(e) => updateEducation(index, 'period', e.target.value)}
                          className="input-elegant"
                          placeholder="2018 - 2022"
                          disabled={!!versionId}
                          readOnly={!!versionId}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {resumeData.education.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No education added yet.</p>
                    <p className="text-sm">Click "Add Education" to get started.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preview */}
          <div className="slide-up">
            <Card className="card-soft sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-8 rounded-lg border border-border space-y-6 shadow-sm" style={{ fontFamily: 'Georgia, serif' }}>
                  {/* Header - Professional Style */}
                  <div className="text-center space-y-2 pb-4">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900" style={{ letterSpacing: '-0.5px' }}>
                      {resumeData.personalInfo.name || "Your Name"}
                    </h1>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>
                        {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
                        {resumeData.personalInfo.phone && <span className="mx-1">•</span>}
                        {resumeData.personalInfo.phone && <span>{resumeData.personalInfo.phone}</span>}
                        {resumeData.personalInfo.location && <span className="mx-1">•</span>}
                        {resumeData.personalInfo.location && <span>{resumeData.personalInfo.location}</span>}
                      </div>
                      {(resumeData.personalInfo.linkedin || resumeData.personalInfo.website) && (
                        <div className="text-xs">
                          {resumeData.personalInfo.linkedin && <span>LinkedIn: {resumeData.personalInfo.linkedin}</span>}
                          {resumeData.personalInfo.website && <span className="mx-1">•</span>}
                          {resumeData.personalInfo.website && <span>{resumeData.personalInfo.website}</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  {resumeData.summary && (
                    <div>
                      <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide border-b-2 border-gray-200 pb-1 mb-2">
                        Professional Summary
                      </h2>
                      <p className="text-xs text-gray-700 leading-relaxed text-justify">{resumeData.summary}</p>
                    </div>
                  )}

                  {/* Experience */}
                  {resumeData.experience.length > 0 && (
                    <div>
                      <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide border-b-2 border-gray-200 pb-1 mb-3">
                        Professional Experience
                      </h2>
                      {resumeData.experience.map((exp, index) => (
                        <div key={index} className="mb-4">
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold text-gray-900">{exp.title}</h3>
                              <p className="text-xs italic text-gray-600 mt-0.5">{exp.company}</p>
                            </div>
                            <span className="text-xs text-gray-500 font-medium whitespace-nowrap ml-2">{exp.period}</span>
                          </div>
                          {exp.description && (
                            <p className="text-xs text-gray-700 leading-relaxed text-justify mt-1">{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Education */}
                  {resumeData.education.length > 0 && (
                    <div>
                      <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide border-b-2 border-gray-200 pb-1 mb-3">
                        Education
                      </h2>
                      {resumeData.education.map((edu, index) => (
                        <div key={index} className="mb-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold text-gray-900">{edu.degree}</h3>
                              <p className="text-xs text-gray-600 mt-0.5">{edu.school}</p>
                            </div>
                            <span className="text-xs text-gray-500 font-medium whitespace-nowrap ml-2">{edu.period}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Skills */}
                  {resumeData.skills.length > 0 && (
                    <div>
                      <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide border-b-2 border-gray-200 pb-1 mb-2">
                        Technical Skills
                      </h2>
                      <div className="flex flex-wrap gap-1.5">
                        {resumeData.skills.map((skill, index) => (
                          <span 
                            key={index} 
                            className="px-2 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded border border-gray-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <ResumePreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        resumeId={id || ""}
        resumeData={resumeData}
      />
    </div>
  );
};