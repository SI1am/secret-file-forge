
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Upload, Eye, Image, File } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import FileUploader from "@/components/files/FileUploader";
import FileCard from "@/components/files/FileCard";
import ActivityLogs from "@/components/activity/ActivityLogs";
import { useFiles } from "@/hooks/useFiles";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const navigate = useNavigate();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const { files = [], isLoading, deleteFile, updateFile, logActivity } = useFiles();
  const { user } = useAuth();
  
  const handleUploadComplete = (uploadedFiles: any[]) => {
    setUploadDialogOpen(false);
    // Implementation for file upload will be handled in a separate update
  };

  const handleDeleteFile = async (id: string) => {
    // Find the file name before deleting
    const fileToDelete = files.find(f => f.id === id);
    
    if (fileToDelete) {
      // First log the activity
      await logActivity("deleted", id, fileToDelete.name);
      
      // Then delete the file
      deleteFile.mutate(id);
    }
  };

  const handleViewFile = (id: string) => {
    navigate(`/vault/file/${id}`);
  };

  const handleDownloadFile = async (id: string) => {
    // Find the file to download
    const fileToDownload = files.find(f => f.id === id);
    
    if (fileToDownload) {
      // Log the download activity
      await logActivity("downloaded", id, fileToDownload.name);
      // Implementation for file download will be handled in a separate update
    }
  };

  const handleWatermarkImage = (id: string) => {
    navigate(`/vault/watermark/${id}`);
  };

  const handleMaskData = (id: string) => {
    navigate(`/vault/mask/${id}`);
  };

  const getFilteredFiles = () => {
    if (!files || files.length === 0) return [];
    
    switch (activeTab) {
      case "images":
        return files.filter(file => file.type?.includes("image"));
      case "documents":
        return files.filter(file => 
          file.type?.includes("pdf") || 
          file.type?.includes("doc") || 
          file.type?.includes("sheet")
        );
      case "encrypted":
        return files.filter(file => file.is_encrypted);
      default:
        return files;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your Secure Vault</h1>
          <p className="text-muted-foreground">
            Manage and protect your sensitive files in one place
          </p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="button-primary">
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Files</DialogTitle>
            </DialogHeader>
            <FileUploader 
              onUploadComplete={handleUploadComplete}
              maxFiles={5}
              acceptedTypes="*"
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 md:w-fit">
              <TabsTrigger value="all">All Files</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="encrypted">Encrypted</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="mt-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading files...</p>
                  </div>
                </div>
              ) : getFilteredFiles().length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getFilteredFiles().map((file) => (
                    <FileCard
                      key={file.id}
                      file={{
                        ...file,
                        upload_date: file.upload_date || new Date(file.created_at)
                      }}
                      onDelete={handleDeleteFile}
                      onView={handleViewFile}
                      onDownload={handleDownloadFile}
                      onWatermark={handleWatermarkImage}
                      onMask={handleMaskData}
                    />
                  ))}
                </div>
              ) : (
                <Card className="bg-muted/40">
                  <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="rounded-full bg-primary/10 p-3 mb-4">
                      {activeTab === "images" ? (
                        <Image className="h-6 w-6 text-primary" />
                      ) : activeTab === "documents" ? (
                        <File className="h-6 w-6 text-primary" />
                      ) : (
                        <Eye className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No files found</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm">
                      {activeTab === "all"
                        ? "You haven't uploaded any files yet. Upload your first file to get started."
                        : `No ${activeTab} found in your vault. Upload some or switch to a different category.`}
                    </p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Upload File
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Upload Files</DialogTitle>
                        </DialogHeader>
                        <FileUploader 
                          onUploadComplete={handleUploadComplete}
                          maxFiles={5}
                          acceptedTypes="*"
                        />
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <ActivityLogs />

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Storage Summary</CardTitle>
              <CardDescription>Files in your vault</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Total Files</p>
                  <p className="text-lg font-semibold">{files?.length || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Images</p>
                  <p className="text-lg font-semibold">
                    {files?.filter(file => file.type?.includes("image"))?.length || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Documents</p>
                  <p className="text-lg font-semibold">
                    {files?.filter(file => 
                      file.type?.includes("pdf") || 
                      file.type?.includes("doc") || 
                      file.type?.includes("sheet")
                    )?.length || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Encrypted</p>
                  <p className="text-lg font-semibold">
                    {files?.filter(file => file.is_encrypted)?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
