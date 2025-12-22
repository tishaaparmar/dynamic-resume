import { useState } from "react";
import { Download, Share, Link, FileText, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface ExportModalProps {
  children: React.ReactNode;
}

export const ExportModal = ({ children }: ExportModalProps) => {
  const [isPublic, setIsPublic] = useState(false);
  const [shareableLink] = useState("https://resume.vault/share/abc123def456");
  const { toast } = useToast();

  const handleExportPDF = () => {
    toast({
      title: "PDF Export Started",
      description: "Your resume is being prepared for download.",
    });
  };

  const handleExportJSON = () => {
    toast({
      title: "JSON Export Complete",
      description: "Resume data has been exported as JSON.",
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    toast({
      title: "Link Copied",
      description: "Shareable link has been copied to your clipboard.",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-card border border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">Export & Share Resume</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Download your resume or generate a shareable link for employers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Export Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Export Options</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="card-soft group cursor-pointer" onClick={handleExportPDF}>
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors">
                        Export as PDF
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Professional format for applications
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button className="w-full btn-hero" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </CardContent>
              </Card>

              <Card className="card-soft group cursor-pointer" onClick={handleExportJSON}>
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-secondary/50 rounded-lg flex items-center justify-center">
                      <Code className="w-5 h-5 text-secondary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium group-hover:text-secondary-foreground transition-colors">
                        Export as JSON
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Data format for integrations
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full btn-soft" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download JSON
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sharing Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Share Resume</h3>
            
            <Card className="card-soft">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-medium">Public Sharing</CardTitle>
                    <CardDescription className="text-xs">
                      Generate a secure link to share with employers
                    </CardDescription>
                  </div>
                  <Switch
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                </div>
              </CardHeader>
              
              {isPublic && (
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="shareLink" className="text-sm font-medium">Shareable Link</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="shareLink"
                        value={shareableLink}
                        readOnly
                        className="input-elegant"
                      />
                      <Button onClick={handleCopyLink} variant="outline" className="btn-soft">
                        <Link className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This link will expire in 30 days. Anyone with the link can view your resume.
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button className="flex-1 btn-hero" onClick={handleCopyLink}>
                      <Share className="w-4 h-4 mr-2" />
                      Copy Link
                    </Button>
                    <Button variant="outline" className="flex-1 btn-soft">
                      <Share className="w-4 h-4 mr-2" />
                      Email Link
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};