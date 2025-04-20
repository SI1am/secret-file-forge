
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { File } from '@/hooks/useFiles';

interface FileSecurityInfoProps {
  file: File;
  onUpdateSharedWith: (email: string) => void;
}

export const FileSecurityInfo = ({ file, onUpdateSharedWith }: FileSecurityInfoProps) => {
  return (
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
                    onUpdateSharedWith(email);
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
  );
};
