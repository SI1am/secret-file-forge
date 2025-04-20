
import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText, Download, Lock, Unlock, Eye, Calendar, ImageIcon } from "lucide-react";
import { File } from '@/hooks/useFiles';
import { useNavigate } from "react-router-dom";

interface FileSidebarProps {
  file: File;
  onDownload: () => void;
  onEncrypt: () => void;
}

export const FileSidebar = ({ file, onDownload, onEncrypt }: FileSidebarProps) => {
  const navigate = useNavigate();
  
  const getFileIcon = () => {
    if (file.type.includes('image')) {
      return <Eye className="h-8 w-8" />;
    } else if (file.type.includes('excel') || file.type.includes('spreadsheet')) {
      return <FileText className="h-8 w-8 text-green-500" />;
    } else {
      return <FileText className="h-8 w-8 text-blue-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
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
              <span>Expires {new Date(file.expires_at).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-muted/30 px-6 py-4">
        <div className="w-full space-y-2">
          <h4 className="text-sm font-medium">Quick Actions</h4>
          <div className="grid grid-cols-1 gap-2">
            <Button variant="outline" className="justify-start" onClick={onDownload}>
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
              onClick={onEncrypt}
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
  );
};
