
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface FileDetailsProps {
  name: string;
  type: string;
  size: number;
  uploadDate?: Date | string;
  expiresAt?: string;
  tags?: string[];
}

export const FileDetails = ({ name, type, size, uploadDate, expiresAt, tags = [] }: FileDetailsProps) => {
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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <div className="space-y-1">
          <p className="text-sm font-medium">File Name</p>
          <p className="text-sm text-muted-foreground">{name}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">File Type</p>
          <p className="text-sm text-muted-foreground">{type}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">File Size</p>
          <p className="text-sm text-muted-foreground">{formatFileSize(size)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Upload Date</p>
          <p className="text-sm text-muted-foreground">{formatDate(uploadDate)}</p>
        </div>
        {expiresAt && (
          <div className="space-y-1 col-span-2">
            <p className="text-sm font-medium">Expires On</p>
            <p className="text-sm text-muted-foreground">{formatDate(expiresAt)}</p>
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
  );
};
