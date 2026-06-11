import { X, Download, Eye, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { exportResumePDF } from "@/services/resume";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { ResumeSnapshot } from "@/types/resume";

interface ResumePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: string;
  resumeData: ResumeSnapshot;
  resumeTitle?: string;
  onHistory?: () => void;
  onSaveBeforeExport?: () => Promise<void>;
}

export const ResumePreviewModal = ({
  isOpen,
  onClose,
  resumeId,
  resumeData,
  resumeTitle,
  onHistory,
  onSaveBeforeExport,
}: ResumePreviewModalProps) => {
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);
  const [viewing, setViewing] = useState(false);

  const validateAndGetBlob = async (viewMode: boolean) => {
    if (onSaveBeforeExport) {
      await onSaveBeforeExport();
      await new Promise((r) => setTimeout(r, 400));
    }
    const pdfBlob = await exportResumePDF(resumeId, viewMode);
    if (!pdfBlob || pdfBlob.size === 0) throw new Error("PDF is empty");
    const header = String.fromCharCode(...new Uint8Array(await pdfBlob.slice(0, 4).arrayBuffer()));
    if (header !== "%PDF") throw new Error("Invalid PDF file");
    return pdfBlob;
  };

  const handleExportPDF = async () => {
    if (!resumeId) return;
    try {
      setExporting(true);
      const pdfBlob = await validateAndGetBlob(false);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${(resumeTitle || resumeData.personalInfo.name || "resume").replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`;
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
    } finally {
      setExporting(false);
    }
  };

  const handleViewPDF = async () => {
    if (!resumeId) return;
    try {
      setViewing(true);
      const pdfBlob = await validateAndGetBlob(true);
      const url = window.URL.createObjectURL(pdfBlob);
      window.open(url, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      toast({ title: "Success", description: "PDF opened in new tab" });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to view PDF",
        variant: "destructive",
      });
    } finally {
      setViewing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-50">
        <DialogHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <DialogTitle className="text-2xl font-semibold">Resume Preview</DialogTitle>
            <div className="flex items-center space-x-2">
              {onHistory && (
                <Button variant="outline" size="sm" onClick={onHistory}>
                  <History className="w-4 h-4 mr-2" />
                  History
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleViewPDF} disabled={viewing}>
                <Eye className="w-4 h-4 mr-2" />
                {viewing ? "Opening..." : "View PDF"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={exporting}>
                <Download className="w-4 h-4 mr-2" />
                {exporting ? "Downloading..." : "Download PDF"}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="rounded-lg border border-gray-200 shadow-lg overflow-hidden">
          <ResumePreview data={resumeData} scale="md" />
        </div>
      </DialogContent>
    </Dialog>
  );
};
