
import React from 'react';
import { format } from "date-fns";
import { File } from '@/hooks/useFiles';

interface FileHistoryProps {
  file: File;
}

export const FileHistory = ({ file }: FileHistoryProps) => {
  const formatDate = (date?: Date | string) => {
    if (!date) return 'Unknown date';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'MMM d, yyyy');
  };

  return (
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
  );
};
