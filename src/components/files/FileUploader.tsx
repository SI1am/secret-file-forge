
import React, { useState, useCallback } from 'react';
import { toast } from "sonner";
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useFiles } from '@/hooks/useFiles';
import { useAuth } from '@/hooks/useAuth';

// Note: Added explicit import line for react-dropzone from alternative method
// As direct import failed in build, fallback to dynamic import to mitigate build error
// Once 'react-dropzone' package installed, this can be changed back to static import

// react-dropzone types import fallback (will load dynamic if installed)
// @ts-ignore
let useDropzone: typeof import('react-dropzone').useDropzone;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  // Dynamically require to suppress build error if package missing
  // For this IDE context only; normally do 'import { useDropzone } from "react-dropzone";' directly after installing
  // Remove this try-catch if react-dropzone installs correctly
  // This is a workaround to fix compilation error for now.
  // If you see error in the console, please install the package.
  //  npm install react-dropzone
  /* eslint-disable */
  useDropzone = require('react-dropzone').useDropzone;
  /* eslint-enable */
} catch (e) {
  // fallback dummy useDropzone to prevent crash; will show error in UI if used
  useDropzone = () => ( {
    getRootProps: () => ({ onClick: () => alert("Please install react-dropzone to use the uploader.") }),
    getInputProps: () => ({}),
    isDragActive: false,
    open: () => alert("Please install react-dropzone to use the uploader."),
  });
}

interface FileUploaderProps {
  onUploadComplete?: (files: any[]) => void;
  maxFiles?: number;
  acceptedTypes?: string;
}

const FileUploader = ({ 
  onUploadComplete = () => {}, 
  maxFiles = 5,
  acceptedTypes = 'image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
}: FileUploaderProps) => {
  const [uploadingFiles, setUploadingFiles] = useState<{[key: string]: {file: File, progress: number, error?: string, complete?: boolean}}>({}); 
  const { uploadFile, logActivity } = useFiles();
  const { user } = useAuth();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newUploadingFiles = { ...uploadingFiles };

    acceptedFiles.forEach((file) => {
      const fileId = `${file.name}-${Date.now()}`;
      newUploadingFiles[fileId] = { 
        file, 
        progress: 0
      };
    });
    
    setUploadingFiles(newUploadingFiles);

    const uploadedFiles = [];
    for (const file of acceptedFiles) {
      const fileId = `${file.name}-${Date.now()}`;
      try {
        const base64String = await fileToBase64(file);
        
        for (let i = 0; i <= 100; i += 10) {
          setUploadingFiles(current => ({
            ...current,
            [fileId]: { ...current[fileId], progress: i }
          }));
          if (i < 100) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }

        if (user) {
          const uploadedFile = await uploadFile.mutateAsync({
            name: file.name,
            type: file.type,
            size: file.size,
            encrypted_data: base64String,
            user_id: user.id
          });
          
          uploadedFiles.push(uploadedFile);

          await logActivity('uploaded', uploadedFile.id, 'file', { name: file.name });
          
          setUploadingFiles(current => ({
            ...current,
            [fileId]: { ...current[fileId], progress: 100, complete: true }
          }));
        } else {
          toast.error("You must be logged in to upload files");
          setUploadingFiles(current => ({
            ...current,
            [fileId]: { ...current[fileId], error: "Authentication required" }
          }));
        }
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        setUploadingFiles(current => ({
          ...current,
          [fileId]: { ...current[fileId], error: "Upload failed" }
        }));
      }
    }

    if (uploadedFiles.length > 0) {
      onUploadComplete(uploadedFiles);
    }
  }, [uploadingFiles, uploadFile, user, onUploadComplete, logActivity]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    maxFiles,
    accept: acceptedTypes ? acceptedTypes.split(',').reduce((acc: Record<string, string[]>, type) => {
      const category = type.split('/')[0];
      if (!acc[category]) acc[category] = [];
      acc[category].push(type);
      return acc;
    }, {}) : undefined,
  });

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <h3 className="text-lg font-medium">
            {isDragActive ? "Drop files here" : "Drag & drop files here"}
          </h3>
          <p className="text-sm text-muted-foreground">
            or click to select files
          </p>
          <Button 
            variant="outline" 
            type="button" 
            onClick={(e) => {
              e.stopPropagation();
              open();
            }}
            className="mt-2"
          >
            Select Files
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Max {maxFiles} files. {acceptedTypes.replace(/\*/g, 'any').replace(/,/g, ', ')}
          </p>
        </div>
      </div>

      {Object.keys(uploadingFiles).length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploading files</h4>
          <div className="space-y-2">
            {Object.entries(uploadingFiles).map(([id, { file, progress, error, complete }]) => (
              <div key={id} className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="truncate">{file.name}</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-1" />
                </div>
                {error ? (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                ) : complete ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
