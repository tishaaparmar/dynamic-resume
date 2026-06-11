import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  Save,
  Eye,
  History,
  Download,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  getResume,
  updateResume,
  updateResumeTitle,
  createResume,
  exportResumePDF,
  getVersion,
} from "@/services/resume";
import { ResumePreviewModal } from "@/components/ResumePreviewModal";
import { ResumeForm } from "@/components/resume/ResumeForm";
import { ResumePreview } from "@/components/resume/ResumePreview";
import {
  ResumeSnapshot,
  createDefaultSnapshot,
  normalizeSnapshot,
} from "@/types/resume";

export const ResumeEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const versionId = searchParams.get("version");

  const [resumeData, setResumeData] = useState<ResumeSnapshot>(createDefaultSnapshot());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resumeTitle, setResumeTitle] = useState("Untitled Resume");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState("");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const readOnly = !!versionId;

  useEffect(() => {
    const loadResume = async () => {
      if (!id) {
        try {
          setLoading(true);
          const newResume = await createResume("New Resume", createDefaultSnapshot());
          navigate(`/resume/${newResume._id}`, { replace: true });
        } catch {
          toast({ title: "Error", description: "Failed to create resume", variant: "destructive" });
          navigate("/dashboard");
        } finally {
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        if (versionId) {
          const [version, resume] = await Promise.all([
            getVersion(id, versionId),
            getResume(id),
          ]);
          setResumeData(normalizeSnapshot(version.snapshot));
          setResumeTitle(`${resume.title} (Version: ${version.message})`);
          setLastSaved(new Date(version.createdAt));
        } else {
          const resume = await getResume(id);
          setResumeData(normalizeSnapshot(resume.current));
          setResumeTitle(resume.title);
          setLastSaved(new Date(resume.updatedAt));
        }
        setHasUnsavedChanges(false);
      } catch {
        toast({ title: "Error", description: "Failed to load resume", variant: "destructive" });
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    loadResume();
  }, [id, versionId, navigate, toast]);

  const handleSave = useCallback(
    async (message: string = "Manual save") => {
      if (!id || readOnly) return;
      try {
        setSaving(true);
        await updateResume(id, resumeData, message, resumeTitle);
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        if (message !== "autosave") {
          toast({ title: "Saved", description: "Resume saved successfully" });
        }
      } catch {
        toast({ title: "Error", description: "Failed to save resume", variant: "destructive" });
      } finally {
        setSaving(false);
      }
    },
    [id, readOnly, resumeData, resumeTitle, toast]
  );

  useEffect(() => {
    if (!loading && id && !readOnly && hasUnsavedChanges) {
      const t = setTimeout(() => handleSave("autosave"), 3000);
      return () => clearTimeout(t);
    }
  }, [resumeData, loading, id, readOnly, hasUnsavedChanges, handleSave]);

  const handleDataChange = (data: ResumeSnapshot) => {
    if (readOnly) return;
    setResumeData(data);
    setHasUnsavedChanges(true);
  };

  const handleSaveTitle = async () => {
    if (!id || !tempTitle.trim() || readOnly) {
      setIsEditingTitle(false);
      return;
    }
    try {
      await updateResumeTitle(id, tempTitle.trim());
      setResumeTitle(tempTitle.trim());
      setIsEditingTitle(false);
      toast({ title: "Success", description: "Resume title updated" });
    } catch {
      toast({ title: "Error", description: "Failed to update title", variant: "destructive" });
    }
  };

  const handleExportPDF = async () => {
    if (!id) return;
    try {
      if (hasUnsavedChanges && !readOnly) {
        await handleSave("PDF export");
        await new Promise((r) => setTimeout(r, 400));
      }
      const pdfBlob = await exportResumePDF(id, false);
      if (!pdfBlob?.size) throw new Error("Empty PDF");
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${resumeTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      toast({ title: "Success", description: "PDF downloaded" });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to export PDF",
        variant: "destructive",
      });
    }
  };

  const handleHistory = () => {
    if (id) navigate(`/timeline/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Breadcrumbs
            items={[
              { label: "Dashboard", path: "/dashboard" },
              { label: resumeTitle },
            ]}
          />
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center space-x-4">
              <BackButton />
              <div>
                {isEditingTitle ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveTitle();
                        if (e.key === "Escape") setIsEditingTitle(false);
                      }}
                      className="text-xl font-semibold h-8"
                      autoFocus
                    />
                    <Button variant="ghost" size="sm" onClick={handleSaveTitle} className="h-8 w-8 p-0">
                      <Check className="w-4 h-4 text-green-600" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditingTitle(false)} className="h-8 w-8 p-0">
                      <X className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 group">
                    <h1 className="text-xl font-semibold">{resumeTitle}</h1>
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setTempTitle(resumeTitle);
                          setIsEditingTitle(true);
                        }}
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-muted-foreground">
                    {lastSaved ? `Last saved ${lastSaved.toLocaleString()}` : "Not saved yet"}
                  </p>
                  {hasUnsavedChanges && (
                    <Badge variant="outline" className="text-orange-600 border-orange-200 text-xs">
                      Unsaved
                    </Badge>
                  )}
                  {saving && (
                    <Badge variant="outline" className="text-blue-600 border-blue-200 text-xs">
                      Saving...
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!readOnly ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleHistory}>
                    <History className="w-4 h-4 mr-2" />
                    History
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportPDF}>
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button size="sm" className="btn-hero" onClick={() => handleSave("Manual save")} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </>
              ) : (
                <>
                  <Badge variant="outline" className="text-blue-600">Read-only version</Badge>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/resume/${id}`)}>
                    Back to current
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ResumeForm data={resumeData} onChange={handleDataChange} readOnly={readOnly} />
          <div className="slide-up">
            <Card className="card-soft sticky top-28">
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border shadow-sm overflow-hidden max-h-[calc(100vh-12rem)] overflow-y-auto">
                  <ResumePreview data={resumeData} scale="sm" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ResumePreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        resumeId={id || ""}
        resumeData={resumeData}
        resumeTitle={resumeTitle}
        onHistory={() => {
          setShowPreview(false);
          handleHistory();
        }}
        onSaveBeforeExport={hasUnsavedChanges ? () => handleSave("PDF export") : undefined}
      />
    </div>
  );
};
