import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Eye, RotateCcw, GitCompare, Clock } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  listVersions,
  getResume,
  restoreVersion,
  compareVersions,
} from "@/services/resume";

interface Version {
  _id: string;
  message: string;
  createdAt: string;
}

export const Timeline = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [versions, setVersions] = useState<Version[]>([]);
  const [resumeTitle, setResumeTitle] = useState("Resume");
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [compareFrom, setCompareFrom] = useState<string | null>(null);
  const [compareTo, setCompareTo] = useState<string | null>(null);
  const [compareResult, setCompareResult] = useState<object | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        navigate("/dashboard");
        return;
      }
      try {
        setLoading(true);
        const [versionsData, resume] = await Promise.all([
          listVersions(id),
          getResume(id),
        ]);
        setVersions([...versionsData].reverse());
        setResumeTitle(resume.title || "Resume");
      } catch (error) {
        console.error("Error loading timeline:", error);
        toast({
          title: "Error",
          description: "Failed to load version history",
          variant: "destructive",
        });
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate, toast]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleView = (versionId: string) => {
    navigate(`/resume/${id}?version=${versionId}`);
  };

  const handleRestore = async (versionId: string) => {
    if (!id) return;
    try {
      setRestoring(versionId);
      await restoreVersion(id, versionId);
      toast({
        title: "Restored",
        description: "Resume restored to this version",
      });
      navigate(`/resume/${id}`);
    } catch (error) {
      console.error("Error restoring version:", error);
      toast({
        title: "Error",
        description: "Failed to restore version",
        variant: "destructive",
      });
    } finally {
      setRestoring(null);
    }
  };

  const handleCompare = async () => {
    if (!id || !compareFrom || !compareTo) {
      toast({
        title: "Select two versions",
        description: "Pick a 'from' and 'to' version to compare",
        variant: "destructive",
      });
      return;
    }
    try {
      const result = await compareVersions(id, compareFrom, compareTo);
      setCompareResult(result.delta);
      toast({ title: "Comparison ready", description: "See changes below" });
    } catch (error) {
      console.error("Error comparing versions:", error);
      toast({
        title: "Error",
        description: "Failed to compare versions",
        variant: "destructive",
      });
    }
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
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Breadcrumbs
            items={[
              { label: "Dashboard", path: "/dashboard" },
              { label: resumeTitle, path: `/resume/${id}` },
              { label: "Version History" },
            ]}
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-4">
              <BackButton to={`/resume/${id}`} label="Back to Editor" />
              <div>
                <h1 className="text-xl font-semibold">Version History</h1>
                <p className="text-sm text-muted-foreground">
                  {versions.length} version{versions.length !== 1 ? "s" : ""} saved
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate(`/resume/${id}`)}>
              Edit Current
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Compare tool */}
        <Card className="card-soft">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <GitCompare className="w-4 h-4" />
              Compare Versions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">From</label>
                <select
                  className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
                  value={compareFrom || ""}
                  onChange={(e) => setCompareFrom(e.target.value || null)}
                >
                  <option value="">Select version...</option>
                  {versions.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.message} — {formatDate(v.createdAt)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">To</label>
                <select
                  className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
                  value={compareTo || ""}
                  onChange={(e) => setCompareTo(e.target.value || null)}
                >
                  <option value="">Select version...</option>
                  {versions.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.message} — {formatDate(v.createdAt)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Button size="sm" onClick={handleCompare}>
              Compare
            </Button>
            {compareResult && (
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-48">
                {JSON.stringify(compareResult, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-4">
            {versions.map((version, index) => (
              <div key={version._id} className="relative pl-14">
                <div className="absolute left-4 top-5 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                <Card className="card-soft">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{version.message}</span>
                          {index === 0 && (
                            <Badge variant="default" className="text-xs">
                              Latest
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(version.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(version._id)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        {index !== 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestore(version._id)}
                            disabled={restoring === version._id}
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            {restoring === version._id ? "Restoring..." : "Restore"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Timeline;
