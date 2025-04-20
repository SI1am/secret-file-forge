import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Eye, 
  Download, 
  ArrowLeft, 
  Lock, 
  Unlock, 
  Share2,
  Calendar,
  FileText,
  ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FileDetails {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  isEncrypted: boolean;
  isPublic: boolean;
  hasWatermark: boolean;
  isMasked: boolean;
  tags?: string[];
  sharedWith: string[];
  expires?: Date | null;
}

const FileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [file, setFile] = useState<FileDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareEmail, setShareEmail] = useState("");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    const fetchFile = async () => {
      setLoading(true);
      
      try {
        if (!id) {
          toast.error("File not found");
          navigate("/vault");
          return;
        }
        
        const fileData = {
          id,
          name: id.includes("image") ? "company-logo.png" : "confidential-report.xlsx",
          size: id.includes("image") ? 1200000 : 2500000,
          type: id.includes("image") ? "image/png" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          uploadDate: new Date(2025, 3, 15),
          isEncrypted: id.includes("file-1") || id.includes("file-3") || id.includes("file-5"),
          isPublic: false,
          hasWatermark: id.includes("image") && (id.includes("file-2") || id.includes("file-4")),
          isMasked: !id.includes("image") && id.includes("file-3"),
          tags: id.includes("file-1") ? ["Report", "Financial"] : 
                id.includes("file-2") ? ["Image", "Branding"] : 
                id.includes("file-3") ? ["Customer", "PII"] :
                id.includes("file-4") ? ["Image", "Personnel"] : ["Confidential", "Planning"],
          sharedWith: [],
          expires: id.includes("file-5") ? new Date(2025, 6, 15) : null
        };
        
        setFile(fileData);
      } catch (error) {
        console.error("Error fetching file:", error);
        toast.error("Failed to load file details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchFile();
  }, [id, navigate]);

  const handleDownload = () => {
    toast.success("Download started");
  };

  const handleEncrypt = () => {
    if (!file) return;
    
    setFile(prev => prev ? {...prev, isEncrypted: !prev.isEncrypted} : null);
    
    toast.success(file.isEncrypted 
      ? "File decrypted successfully" 
      : "File encrypted successfully"
    );
  };

  const handleShareFile = () => {
    if (!shareEmail.trim() || !file) {
      toast.error("Please enter a valid email");
      return;
    }
    
    const updatedSharedWith = [...(file.sharedWith || []), shareEmail];
    setFile({...file, sharedWith: updatedSharedWith});
    
    toast.success(`File shared with ${shareEmail}`);
    setShareEmail("");
    setShareDialogOpen(false);
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getFileIcon = () => {
    if (!file) return <FileText className="h-8 w-8" />;
    
    if (file.type.includes('image')) {
      return <Eye className="h-8 w-8" />;
    } else if (file.type.includes('excel') || file.type.includes('spreadsheet')) {
      return <FileText className="h-8 w-8 text-green-500" />;
    } else {
      return <FileText className="h-8 w-8 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading file...</p>
        </div>
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
          <ArrowLeft className="h-4 w-4" />
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
          
          <Button
            variant={file.isEncrypted ? "destructive" : "secondary"}
            onClick={handleEncrypt}
          >
            {file.isEncrypted ? (
              <>
                <Unlock className="h-4 w-4 mr-2" />
                Decrypt
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Encrypt
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center">
                {file.type.includes('image') ? (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <img 
                      src={`https://source.unsplash.com/random/800x600/?${file.name.split('.')[0]}`} 
                      alt={file.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
                    <p className="mt-4 text-sm text-muted-foreground">
                      Preview not available for this file type
                    </p>
                    <Button variant="outline" className="mt-4" onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download to view
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="p-4 bg-muted/30 rounded-md mt-2">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">File Name</p>
                    <p className="text-sm text-muted-foreground">{file.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">File Type</p>
                    <p className="text-sm text-muted-foreground">{file.type}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">File Size</p>
                    <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Upload Date</p>
                    <p className="text-sm text-muted-foreground">
                      {format(file.uploadDate, "MMM d, yyyy")}
                    </p>
                  </div>
                  {file.expires && (
                    <div className="space-y-1 col-span-2">
                      <p className="text-sm font-medium">Expires On</p>
                      <p className="text-sm text-muted-foreground">
                        {format(file.expires, "MMM d, yyyy")}
                      </p>
                    </div>
                  )}
                </div>
                
                {file.tags && file.tags.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {file.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="security" className="p-4 bg-muted/30 rounded-md mt-2">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Encryption</p>
                    <div className="flex items-center space-x-2">
                      {file.isEncrypted ? (
                        <Badge variant="default" className="bg-green-500">Encrypted</Badge>
                      ) : (
                        <Badge variant="outline">Not encrypted</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Watermark</p>
                    <div className="flex items-center space-x-2">
                      {file.hasWatermark ? (
                        <Badge variant="default" className="bg-green-500">Applied</Badge>
                      ) : (
                        <Badge variant="outline">None</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Data Masking</p>
                    <div className="flex items-center space-x-2">
                      {file.isMasked ? (
                        <Badge variant="default" className="bg-green-500">Applied</Badge>
                      ) : (
                        <Badge variant="outline">None</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Access</p>
                    <div className="flex items-center space-x-2">
                      {file.isPublic ? (
                        <Badge variant="destructive">Public</Badge>
                      ) : (
                        <Badge variant="default" className="bg-green-500">Private</Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Shared With</p>
                  {file.sharedWith && file.sharedWith.length > 0 ? (
                    <div className="space-y-2">
                      {file.sharedWith.map((email, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-background rounded-md border">
                          <span className="text-sm">{email}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              const updated = file.sharedWith.filter(e => e !== email);
                              setFile({...file, sharedWith: updated});
                              toast.success(`Removed ${email} from shared list`);
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      This file hasn't been shared with anyone yet
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="p-4 bg-muted/30 rounded-md mt-2">
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="relative mr-4">
                      <div className="bg-primary h-2 w-2 rounded-full mt-2"></div>
                      <div className="absolute top-3 bottom-0 left-1 w-[1px] -ml-px bg-muted-foreground/20"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">File uploaded</p>
                      <p className="text-xs text-muted-foreground">
                        {format(file.uploadDate, "MMMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                  
                  {file.isEncrypted && (
                    <div className="flex items-start">
                      <div className="relative mr-4">
                        <div className="bg-primary h-2 w-2 rounded-full mt-2"></div>
                        <div className="absolute top-3 bottom-0 left-1 w-[1px] -ml-px bg-muted-foreground/20"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">File encrypted</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(file.uploadDate.getTime() + 5 * 60000), "MMMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {file.hasWatermark && (
                    <div className="flex items-start">
                      <div className="relative mr-4">
                        <div className="bg-primary h-2 w-2 rounded-full mt-2"></div>
                        <div className="absolute top-3 bottom-0 left-1 w-[1px] -ml-px bg-muted-foreground/20"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Watermark applied</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(file.uploadDate.getTime() + 10 * 60000), "MMMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {file.isMasked && (
                    <div className="flex items-start">
                      <div className="relative mr-4">
                        <div className="bg-primary h-2 w-2 rounded-full mt-2"></div>
                        <div className="absolute top-3 bottom-0 left-1 w-[1px] -ml-px bg-muted-foreground/20"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Data masking applied</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(file.uploadDate.getTime() + 15 * 60000), "MMMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start">
                    <div className="relative mr-4">
                      <div className="bg-primary h-2 w-2 rounded-full mt-2"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Last viewed</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(), "MMMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="rounded-full bg-primary/10 p-3">
                  {getFileIcon()}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{file.name}</h3>
                  <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                {file.isEncrypted && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Lock className="h-4 w-4 text-green-500" />
                    <span>Encrypted file</span>
                  </div>
                )}
                
                {file.hasWatermark && (
                  <div className="flex items-center space-x-2 text-sm">
                    <ImageIcon className="h-4 w-4 text-green-500" />
                    <span>Watermarked</span>
                  </div>
                )}
                
                {file.isMasked && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Eye className="h-4 w-4 text-green-500" />
                    <span>Data masked</span>
                  </div>
                )}
                
                {file.expires && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-amber-500" />
                    <span>Expires {format(file.expires, "MMM d, yyyy")}</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 px-6 py-4">
              <div className="w-full space-y-2">
                <h4 className="text-sm font-medium">Quick Actions</h4>
                <div className="grid grid-cols-1 gap-2">
                  <Button variant="outline" className="justify-start" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  
                  {file.type.includes('image') && !file.hasWatermark && (
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      onClick={() => navigate(`/vault/watermark/${file.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Add Watermark
                    </Button>
                  )}
                  
                  {!file.type.includes('image') && !file.isMasked && file.type.includes('spreadsheet') && (
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      onClick={() => navigate(`/vault/mask/${file.id}`)}
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Mask Data
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={handleEncrypt}
                  >
                    {file.isEncrypted ? (
                      <>
                        <Unlock className="h-4 w-4 mr-2" />
                        Decrypt File
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Encrypt File
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FileView;
