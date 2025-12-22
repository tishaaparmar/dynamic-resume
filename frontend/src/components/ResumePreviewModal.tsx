import { X, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { exportResumePDF } from "@/services/resume";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ResumePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: string; // ✅ Resume ID for backend PDF export
  resumeData: {
    personalInfo: {
      name: string;
      email: string;
      phone: string;
      location: string;
      linkedin: string;
      website: string;
    };
    summary: string;
    experience: Array<{
      title: string;
      company: string;
      period: string;
      description: string;
    }>;
    education: Array<{
      degree: string;
      school: string;
      period: string;
    }>;
    skills: string[];
  };
}

export const ResumePreviewModal = ({ 
  isOpen, 
  onClose, 
  resumeId,
  resumeData
}: ResumePreviewModalProps) => {
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);
  const [viewing, setViewing] = useState(false);

  // ✅ Export PDF for download
  const handleExportPDF = async () => {
    if (!resumeId) {
      toast({
        title: "Error",
        description: "Resume ID is missing",
        variant: "destructive"
      });
      return;
    }

    try {
      setExporting(true);
      
      // ✅ Call backend API to generate PDF (download mode)
      const pdfBlob = await exportResumePDF(resumeId, false);
      
      // ✅ Validate blob is valid
      if (!pdfBlob || !(pdfBlob instanceof Blob)) {
        throw new Error("PDF blob is not a valid Blob object");
      }
      
      if (pdfBlob.size === 0) {
        throw new Error("PDF blob is empty");
      }

      // ✅ Validate PDF header
      const arrayBuffer = await pdfBlob.slice(0, 4).arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const header = String.fromCharCode(...uint8Array);
      
      if (header !== '%PDF') {
        console.error('Invalid PDF header:', header);
        throw new Error("Downloaded file is not a valid PDF");
      }

      // ✅ Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resumeData.personalInfo.name || "resume"}.pdf`;
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
    } finally {
      setExporting(false);
    }
  };

  // ✅ View PDF in new tab
  const handleViewPDF = async () => {
    if (!resumeId) {
      toast({
        title: "Error",
        description: "Resume ID is missing",
        variant: "destructive"
      });
      return;
    }

    try {
      setViewing(true);
      
      // ✅ Call backend API to generate PDF (view mode)
      const pdfBlob = await exportResumePDF(resumeId, true);
      
      // ✅ Validate blob is valid
      if (!pdfBlob || !(pdfBlob instanceof Blob)) {
        throw new Error("PDF blob is not a valid Blob object");
      }
      
      if (pdfBlob.size === 0) {
        throw new Error("PDF blob is empty");
      }

      // ✅ Validate PDF header
      const arrayBuffer = await pdfBlob.slice(0, 4).arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const header = String.fromCharCode(...uint8Array);
      
      if (header !== '%PDF') {
        console.error('Invalid PDF header:', header);
        throw new Error("Generated file is not a valid PDF");
      }

      // ✅ Open PDF in new tab for viewing
      const url = window.URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');
      
      // ✅ Clean up after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
      
      toast({
        title: "Success",
        description: "PDF opened in new tab",
      });
    } catch (error: any) {
      console.error("Error viewing PDF:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to view PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setViewing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-50">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-semibold text-gray-800">
              Resume Preview
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleViewPDF}
                disabled={viewing}
              >
                <Eye className="w-4 h-4 mr-2" />
                {viewing ? "Opening..." : "View PDF"}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportPDF}
                disabled={exporting}
              >
                <Download className="w-4 h-4 mr-2" />
                {exporting ? "Downloading..." : "Download PDF"}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div
          id="resume-preview"
          className="bg-white p-12 rounded-lg border border-gray-200 shadow-lg space-y-8 max-w-4xl mx-auto"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          {/* Header - Professional Style */}
          <div className="text-center space-y-3 pb-6">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900" style={{ letterSpacing: '-0.5px' }}>
              {resumeData.personalInfo.name || "Your Name"}
            </h1>
            <div className="text-sm text-gray-600 space-y-1">
              <div>
                {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
                {resumeData.personalInfo.phone && <span className="mx-2">•</span>}
                {resumeData.personalInfo.phone && <span>{resumeData.personalInfo.phone}</span>}
                {resumeData.personalInfo.location && <span className="mx-2">•</span>}
                {resumeData.personalInfo.location && <span>{resumeData.personalInfo.location}</span>}
              </div>
              {(resumeData.personalInfo.linkedin || resumeData.personalInfo.website) && (
                <div className="text-xs">
                  {resumeData.personalInfo.linkedin && <span>LinkedIn: {resumeData.personalInfo.linkedin}</span>}
                  {resumeData.personalInfo.website && <span className="mx-2">•</span>}
                  {resumeData.personalInfo.website && <span>{resumeData.personalInfo.website}</span>}
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          {resumeData.summary && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 uppercase tracking-wide border-b-2 border-gray-200 pb-2 mb-3">
                Professional Summary
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed text-justify">
                {resumeData.summary}
              </p>
            </div>
          )}

          {/* Experience */}
          {resumeData.experience.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 uppercase tracking-wide border-b-2 border-gray-200 pb-2 mb-4">
                Professional Experience
              </h2>
              {resumeData.experience.map((exp, index) => (
                <div key={index} className="mb-6">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900">{exp.title}</h3>
                      <p className="text-sm italic text-gray-600 mt-1">{exp.company}</p>
                    </div>
                    <span className="text-sm text-gray-500 font-medium whitespace-nowrap ml-4">{exp.period}</span>
                  </div>
                  {exp.description && (
                    <p className="text-sm text-gray-700 leading-relaxed text-justify mt-2">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {resumeData.education.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 uppercase tracking-wide border-b-2 border-gray-200 pb-2 mb-4">
                Education
              </h2>
              {resumeData.education.map((edu, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900">{edu.degree}</h3>
                      <p className="text-sm text-gray-600 mt-1">{edu.school}</p>
                    </div>
                    <span className="text-sm text-gray-500 font-medium whitespace-nowrap ml-4">{edu.period}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {resumeData.skills.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 uppercase tracking-wide border-b-2 border-gray-200 pb-2 mb-3">
                Technical Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.map((skill, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1.5 bg-gray-50 text-gray-700 text-xs font-medium rounded border border-gray-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

