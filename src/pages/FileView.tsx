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
import { useFiles } from "@/hooks/useFiles";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [shareEmail, setShareEmail] = useState("");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  
  const { file, isLoadingFile, updateFile, refetchFile } = useFiles();
  
  useEffect(() => {
    if (id) {
      refetchFile({ queryKey: ['file', id] });
    }
  }, [id, refetchFile]);

  const handleDownload = () => {
    toast.success("Download started");
  };

  const handleEncrypt = async () => {
    if (!file) return;
    
    updateFile.mutate({
      id: file.id,
      is_encrypted: !file.is_encrypted
    });
  };

  const handleShareFile = () => {
    if (!shareEmail.trim() || !file) {
      toast.error("Please enter a valid email");
      return;
    }
    
    const updatedSharedWith = [...(file.shared_with || []), shareEmail];
    updateFile.mutate({
      id: file.id,
      shared_with: updatedSharedWith
    });
    
    setShareEmail("");
    setShareDialogOpen(false);
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return 'Unknown date';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'MMM d, yyyy');
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

  if (isLoadingFile) {
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

  const tags = file.tags || [];

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
            variant={file.is_encrypted ? "destructive" : "secondary"}
            onClick={handleEncrypt}
          >
            {file.is_encrypted ? (
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
                      {formatDate(file.upload_date || file.created_at)}
                    </p>
                  </div>
                  {file.expires_at && (
                    <div className="space-y-1 col-span-2">
                      <p className="text-sm font-medium">Expires On</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(file.expires_at)}
                      </p>
                    </div>
                  )}
                </div>
                
                {tags.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, i) => (
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
                      {file.is_encrypted ? (
                        <Badge variant="default" className="bg-green-500">Encrypted</Badge>
                      ) : (
                        <Badge variant="outline">Not encrypted</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Watermark</p>
                    <div className="flex items-center space-x-2">
                      {file.has_watermark ? (
                        <Badge variant="default" className="bg-green-500">Applied</Badge>
                      ) : (
                        <Badge variant="outline">None</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Data Masking</p>
                    <div className="flex items-center space-x-2">
                      {file.is_masked ? (
                        <Badge variant="default" className="bg-green-500">Applied</Badge>
                      ) : (
                        <Badge variant="outline">None</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Access</p>
                    <div className="flex items-center space-x-2">
                      {file.is_public ? (
                        <Badge variant="destructive">Public</Badge>
                      ) : (
                        <Badge variant="default" className="bg-green-500">Private</Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Shared With</p>
                  {file.shared_with && file.shared_with.length > 0 ? (
                    <div className="space-y-2">
                      {file.shared_with.map((email, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-background rounded-md border">
                          <span className="text-sm">{email}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              const updated = file.shared_with.filter(e => e !== email);
                              updateFile.mutate({
                                id: file.id,
                                shared_with: updated
                              });
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
                        {formatDate(file.upload_date || file.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  {file.is_encrypted && (
                    <div className="flex items-start">
                      <div className="relative mr-4">
                        <div className="bg-primary h-2 w-2 rounded-full mt-2"></div>
                        <div className="absolute top-3 bottom-0 left-1 w-[1px] -ml-px bg-muted-foreground/20"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">File encrypted</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(new Date(new Date(file.created_at).getTime() + 5 * 60000))}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {file.has_watermark && (
                    <div className="flex items-start">
                      <div className="relative mr-4">
                        <div className="bg-primary h-2 w-2 rounded-full mt-2"></div>
                        <div className="absolute top-3 bottom-0 left-1 w-[1px] -ml-px bg-muted-foreground/20"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Watermark applied</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(new Date(new Date(file.created_at).getTime() + 10 * 60000))}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {file.is_masked && (
                    <div className="flex items-start">
                      <div className="relative mr-4">
                        <div className="bg-primary h-2 w-2 rounded-full mt-2"></div>
                        <div className="absolute top-3 bottom-0 left-1 w-[1px] -ml-px bg-muted-foreground/20"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Data masking applied</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(new Date(new Date(file.created_at).getTime() + 15 * 60000))}
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
                {file.is_encrypted && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Lock className="h-4 w-4 text-green-500" />
                    <span>Encrypted file</span>
                  </div>
                )}
                
                {file.has_watermark && (
                  <div className="flex items-center space-x-2 text-sm">
                    <ImageIcon className="h-4 w-4 text-green-500" />
                    <span>Watermarked</span>
                  </div>
                )}
                
                {file.is_masked && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Eye className="h-4 w-4 text-green-500" />
                    <span>Data masked</span>
                  </div>
                )}
                
                {file.expires_at && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-amber-500" />
                    <span>Expires {formatDate(file.expires_at)}</span>
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
                  
                  {file.type.includes('image') && !file.has_watermark && (
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      onClick={() => navigate(`/vault/watermark/${file.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Add Watermark
                    </Button>
                  )}
                  
                  {!file.type.includes('image') && !file.is_masked && file.type.includes('spreadsheet') && (
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
                    {file.is_encrypted ? (
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
