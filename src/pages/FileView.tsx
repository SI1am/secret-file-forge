
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useFiles } from "@/hooks/useFiles";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";

import { FilePreview } from "@/components/files/FilePreview";
import { FileDetails } from "@/components/files/FileDetails";
import { FileSecurityInfo } from "@/components/files/FileSecurityInfo";
import { FileHistory } from "@/components/files/FileHistory";
import { FileSidebar } from "@/components/files/FileSidebar";

const FileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shareEmail, setShareEmail] = useState("");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const { user } = useAuth();
  
  const { updateFile, logActivity } = useFiles();
  const { data: file, isLoading, error } = useFiles().getFileById(id);

  const handleDownload = async () => {
    if (!file) return;
    
    // For now, just show a toast since we're not actually downloading
    toast.success("Download started");
    
    // Log the download activity
    await logActivity("downloaded", file.id, "file", { fileName: file.name });
  };

  const handleEncrypt = async () => {
    if (!file) return;
    
    updateFile.mutate({
      id: file.id,
      is_encrypted: !file.is_encrypted
    });
    
    // Log the encryption/decryption activity
    await logActivity(
      file.is_encrypted ? "decrypted" : "encrypted", 
      file.id, 
      "file",
      { fileName: file.name }
    );
  };

  const handleShareFile = async () => {
    if (!shareEmail.trim() || !file) {
      toast.error("Please enter a valid email");
      return;
    }
    
    const updatedSharedWith = [...(file.shared_with || []), shareEmail];
    updateFile.mutate({
      id: file.id,
      shared_with: updatedSharedWith
    });
    
    // Log the share activity with details
    await logActivity(
      "shared", 
      file.id, 
      "file", 
      { fileName: file.name, shared_with: shareEmail }
    );
    
    setShareEmail("");
    setShareDialogOpen(false);
  };

  const handleRemoveSharedEmail = async (email: string) => {
    if (!file) return;
    const updated = file.shared_with.filter(e => e !== email);
    updateFile.mutate({
      id: file.id,
      shared_with: updated
    });
    
    // Log the unshare activity
    await logActivity(
      "unshared", 
      file.id, 
      "file", 
      { fileName: file.name, removed_user: email }
    );
    
    toast.success(`Removed ${email} from shared list`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading file...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Error loading file:", error);
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 mx-auto text-muted-foreground opacity-30" />
        <h2 className="mt-4 text-xl font-semibold">Error loading file</h2>
        <p className="mt-2 text-muted-foreground">
          There was a problem loading this file. Please try again later.
        </p>
        <Button 
          variant="outline" 
          className="mt-6" 
          onClick={() => navigate("/vault")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Return to Vault
        </Button>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 mx-auto text-muted-foreground opacity-30" />
        <h2 className="mt-4 text-xl font-semibold">File not found</h2>
        <p className="mt-2 text-muted-foreground">
          The file you are looking for might have been removed or is no longer accessible.
        </p>
        <Button 
          variant="outline" 
          className="mt-6" 
          onClick={() => navigate("/vault")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Return to Vault
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/vault")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{file.name}</h1>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          
          <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Share File</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Recipient Email</Label>
                  <Input
                    placeholder="email@example.com"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                  />
                </div>
                <Button onClick={handleShareFile} className="w-full">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share File
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <FilePreview
            name={file.name}
            type={file.type}
            onDownload={handleDownload}
          />

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="p-4 bg-muted/30 rounded-md mt-2">
              <FileDetails
                name={file.name}
                type={file.type}
                size={file.size}
                uploadDate={file.upload_date}
                expiresAt={file.expires_at}
                tags={file.tags}
              />
            </TabsContent>
            
            <TabsContent value="security" className="p-4 bg-muted/30 rounded-md mt-2">
              <FileSecurityInfo
                file={file}
                onUpdateSharedWith={handleRemoveSharedEmail}
              />
            </TabsContent>
            
            <TabsContent value="history" className="p-4 bg-muted/30 rounded-md mt-2">
              <FileHistory file={file} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <FileSidebar
            file={file}
            onDownload={handleDownload}
            onEncrypt={handleEncrypt}
          />
        </div>
      </div>
    </div>
  );
};

export default FileView;
