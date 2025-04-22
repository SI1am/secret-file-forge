
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, Download, AlertTriangle, Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useFiles } from "@/hooks/useFiles";
import { supabase, verifySharedAccess } from "@/integrations/supabase/client";
import { FilePreview } from "@/components/files/FilePreview";
import { FileDetails } from "@/components/files/FileDetails";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const SharedFileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");
  const { data: file, isLoading, error } = useFiles().getFileById(id);
  
  useEffect(() => {
    const checkAccess = async () => {
      if (id) {
        const access = await verifySharedAccess(id);
        setHasAccess(access);
      }
      setLoading(false);
    };
    
    checkAccess();
  }, [id]);
  
  const handleDownload = async () => {
    if (!file) return;
    
    try {
      // Log an anonymous download
      await supabase.from('activity_logs').insert([{
        user_id: 'anonymous',
        action: 'downloaded',
        resource_id: file.id,
        resource_type: file.name,
        details: { from: 'shared_link' }
      }]);
      
      toast.success("Download started");
    } catch (error) {
      console.error('Error logging download:', error);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading file...</p>
        </div>
      </div>
    );
  }

  if (error || !file || !hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-destructive/10 p-4 mb-4">
              {!hasAccess ? <Lock className="h-8 w-8 text-destructive" /> : <AlertTriangle className="h-8 w-8 text-destructive" />}
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {!hasAccess ? "Access Denied" : "File Not Available"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {!hasAccess 
                ? "You don't have permission to view this file or it may have been removed."
                : "The file you're trying to access is unavailable or doesn't exist."
              }
            </p>
            <Button 
              variant="outline" 
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Return Home
            </Button>
          </CardContent>
        </Card>
        <p className="mt-6 text-sm text-muted-foreground">
          Secured by Data-Vault
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between border-b pb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{file.name}</h1>
        </div>
        
        <Button onClick={handleDownload} className="w-full sm:w-auto mt-2 sm:mt-0">
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="preview" className="mt-4">
          <FilePreview
            name={file.name}
            type={file.type}
            onDownload={handleDownload}
          />
        </TabsContent>
        
        <TabsContent value="details" className="mt-4">
          <div className="p-4 bg-muted/30 rounded-md">
            <FileDetails
              name={file.name}
              type={file.type}
              size={file.size}
              uploadDate={file.upload_date}
              expiresAt={file.expires_at}
              tags={file.tags}
            />
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="text-center text-sm text-muted-foreground mt-8">
        <p>Shared securely with Data-Vault</p>
      </div>
    </div>
  );
};

export default SharedFileView;
