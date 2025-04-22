
import React, { useState, useEffect } from 'react';
import { FileText, Download, FileCode, FileSpreadsheet } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface FilePreviewProps {
  name: string;
  type: string;
  id?: string;
  encrypted_data?: string;
  onDownload: () => void;
}

export const FilePreview = ({ name, type, id, encrypted_data, onDownload }: FilePreviewProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only attempt to load preview if we have a file ID
    if (id && type.includes('image') && !encrypted_data) {
      loadPreview();
    } else if (encrypted_data && type.includes('image')) {
      // For encrypted images, we can use the encrypted data directly
      setPreviewUrl(encrypted_data);
    }
  }, [id, type, encrypted_data]);

  const loadPreview = async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, fetch the file from your storage
      // For now, using a placeholder image based on the file name
      setPreviewUrl(`https://source.unsplash.com/random/800x600/?${name.split('.')[0]}`);
    } catch (err) {
      console.error("Error loading preview:", err);
      setError("Failed to load preview");
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
          ) : type.includes('image') && previewUrl ? (
            <div className="w-full h-full flex items-center justify-center">
              <img 
                src={previewUrl} 
                alt={name}
                className="max-h-full max-w-full object-contain"
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
