
import { useState } from "react";
import { Copy, Check, Link, Mail, Globe, Lock } from "lucide-react";
import { File } from "@/hooks/useFiles";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { generateShareableLink } from "@/integrations/supabase/client";

interface ShareDialogProps {
  file: File;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateFile: (updates: Partial<File>) => void;
  onShareWithEmail: (email: string) => void;
}

const ShareDialog = ({ file, open, onOpenChange, onUpdateFile, onShareWithEmail }: ShareDialogProps) => {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [activeTab, setActiveTab] = useState("link");
  
  const shareableLink = generateShareableLink(file.id);
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleTogglePublic = () => {
    onUpdateFile({ is_public: !file.is_public });
    toast.success(file.is_public 
      ? "File is now private" 
      : "File is now public and can be accessed by anyone with the link"
    );
  };
  
  const handleShareWithEmail = () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }
    
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    onShareWithEmail(email);
    setEmail("");
  };
  
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  const handleAddAnonymous = () => {
    // Add 'anonymous' to shared_with to allow access without login
    const updatedSharedWith = [...(file.shared_with || [])];
    if (!updatedSharedWith.includes('anonymous')) {
      updatedSharedWith.push('anonymous');
      onUpdateFile({ shared_with: updatedSharedWith });
      toast.success("Public link sharing enabled");
    }
  };
  
  const handleRemoveAnonymous = () => {
    // Remove 'anonymous' from shared_with
    const updatedSharedWith = (file.shared_with || []).filter(email => email !== 'anonymous');
    onUpdateFile({ shared_with: updatedSharedWith });
    toast.success("Public link sharing disabled");
  };
  
  const isAnonymousShared = file.shared_with?.includes('anonymous');
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share "{file.name}"</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">Share Link</TabsTrigger>
            <TabsTrigger value="email">Share via Email</TabsTrigger>
          </TabsList>
          
          <TabsContent value="link" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Visibility:</span>
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <span className="text-sm">{file.is_public ? "Public" : "Private"}</span>
                <Switch
                  checked={file.is_public}
                  onCheckedChange={handleTogglePublic}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Link className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Link sharing:</span>
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <span className="text-sm">{isAnonymousShared ? "Enabled" : "Disabled"}</span>
                <Switch
                  checked={isAnonymousShared}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleAddAnonymous();
                    } else {
                      handleRemoveAnonymous();
                    }
                  }}
                />
              </div>
            </div>
            
            {(isAnonymousShared || file.is_public) && (
              <div className="space-y-2">
                <Label htmlFor="link">Shareable link</Label>
                <div className="flex space-x-2">
                  <Input
                    id="link"
                    value={shareableLink}
                    readOnly
                    className="flex-1"
                  />
                  <Button 
                    size="icon"
                    onClick={handleCopyLink}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {file.is_public 
                    ? "Anyone can access this link" 
                    : "Only people with the link can access this file"}
                </p>
              </div>
            )}
            
            {!isAnonymousShared && !file.is_public && (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Globe className="h-10 w-10 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-4">
                  Enable link sharing or set the file to public to generate a shareable link
                </p>
                <Button onClick={handleAddAnonymous}>Enable Link Sharing</Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="email" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="flex space-x-2">
                <Input
                  id="email"
                  placeholder="example@email.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleShareWithEmail}>
                  <Mail className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
            
            {file.shared_with && file.shared_with.length > 0 && (
              <div className="space-y-2">
                <Label>Shared with</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {file.shared_with
                    .filter(email => email !== 'anonymous')
                    .map((email, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-background rounded-md border">
                        <span className="text-sm truncate mr-2">{email}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const updated = file.shared_with.filter(e => e !== email);
                            onUpdateFile({ shared_with: updated });
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
