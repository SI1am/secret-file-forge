
import React from 'react';
import { FileText, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface FilePreviewProps {
  name: string;
  type: string;
  onDownload: () => void;
}

export const FilePreview = ({ name, type, onDownload }: FilePreviewProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center">
          {type.includes('image') ? (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <img 
                src={`https://source.unsplash.com/random/800x600/?${name.split('.')[0]}`} 
                alt={name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">
                Preview not available for this file type
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
