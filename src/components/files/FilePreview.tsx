
import React, { useState, useEffect } from 'react';
import { FileText, Download, FileCode, FileSpreadsheet, Lock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { decryptFile, decryptText } from "@/utils/encryption";
import { supabase } from "@/integrations/supabase/client";

interface FilePreviewProps {
  name: string;
  type: string;
  id?: string;
  encrypted_data?: string;
  encryption_key?: string;
  onDownload: () => void;
  is_encrypted?: boolean;
}

export const FilePreview = ({ 
  name, 
  type, 
  id, 
  encrypted_data,
  encryption_key,
  is_encrypted,
  onDownload 
}: FilePreviewProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decryptionKey, setDecryptionKey] = useState('');
  const [showDecryptForm, setShowDecryptForm] = useState(is_encrypted);

  useEffect(() => {
    if (id && type.includes('image') && !encrypted_data && !is_encrypted) {
      loadPreview();
    } else if (encrypted_data && type.includes('image') && !is_encrypted) {
      setPreviewUrl(encrypted_data);
    }
  }, [id, type, encrypted_data, is_encrypted]);

  const loadPreview = async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (encrypted_data) {
        setPreviewUrl(encrypted_data);
      } else {
        setPreviewUrl(`https://source.unsplash.com/random/800x600/?${name.split('.')[0]}`);
      }
    } catch (err) {
      console.error("Error loading preview:", err);
      setError("Failed to load preview");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecrypt = async () => {
    if (!encrypted_data || !decryptionKey) {
      toast.error("Please enter a decryption key");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (type.includes('image')) {
        const decryptedData = await decryptText(encrypted_data, decryptionKey);
        setPreviewUrl(decryptedData);
        setShowDecryptForm(false);
        toast.success("File decrypted successfully");
      } else {
        // For non-image files, we'll handle download after decryption
        const decryptedFile = await decryptFile(
          new Uint8Array(Buffer.from(encrypted_data, 'base64')).buffer,
          decryptionKey,
          name,
          type
        );
        
        // Create a download link for the decrypted file
        const url = URL.createObjectURL(decryptedFile);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success("File decrypted and downloaded successfully");
      }
    } catch (err) {
      console.error("Decryption error:", err);
      setError("Failed to decrypt file. Please check your decryption key.");
      toast.error("Failed to decrypt file. Please check your decryption key.");
    } finally {
      setIsLoading(false);
    }
  };

  const getFileIcon = () => {
    if (type.includes('pdf')) {
      return <FileText className="h-16 w-16 text-red-500" />;
    } else if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv')) {
      return <FileSpreadsheet className="h-16 w-16 text-green-500" />;
    } else if (type.includes('code') || type.includes('json') || type.includes('xml') || type.includes('html')) {
      return <FileCode className="h-16 w-16 text-blue-500" />;
    } else {
      return <FileText className="h-16 w-16 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-sm text-muted-foreground">Loading preview...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" className="mt-4" onClick={loadPreview}>
                Retry
              </Button>
            </div>
          ) : showDecryptForm ? (
            <div className="text-center py-12 space-y-4 max-w-md mx-auto w-full px-4">
              <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="font-medium">Encrypted File</h3>
              <p className="text-sm text-muted-foreground">
                Enter the decryption key to view this file
              </p>
              <div className="space-y-2">
                <Label htmlFor="decryption-key">Decryption Key</Label>
                <Input
                  id="decryption-key"
                  type="password"
                  value={decryptionKey}
                  onChange={(e) => setDecryptionKey(e.target.value)}
                  placeholder="Enter decryption key"
                />
                <Button 
                  className="w-full" 
                  onClick={handleDecrypt}
                  disabled={!decryptionKey}
                >
                  Decrypt File
                </Button>
              </div>
            </div>
          ) : type.includes('image') && previewUrl ? (
            <div className="w-full h-full flex items-center justify-center">
              <img 
                src={previewUrl} 
                alt={name}
                className="max-h-full max-w-full object-contain"
                crossOrigin="anonymous"
              />
            </div>
          ) : (
            <div className="text-center py-12">
              {getFileIcon()}
              <p className="mt-4 text-sm text-muted-foreground">
                Preview not available for {type.split('/')[1] || type} files
              </p>
              <Button variant="outline" className="mt-4" onClick={onDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download to view
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
