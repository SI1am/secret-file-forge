
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

interface FileUploaderProps {
  onUploadComplete: (files: File[]) => void;
  maxFiles?: number;
  acceptedTypes?: string;
}

const FileUploader = ({
  onUploadComplete,
  maxFiles = 10,
  acceptedTypes = "*",
}: FileUploaderProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    // Check if adding would exceed max files
    if (files.length + newFiles.length > maxFiles) {
      toast.error(`You can upload a maximum of ${maxFiles} files at once`);
      const allowedCount = maxFiles - files.length;
      newFiles = newFiles.slice(0, allowedCount);
    }

    // Filter files by accepted types if specified
    if (acceptedTypes !== "*") {
      const acceptedExtensions = acceptedTypes.split(",").map(type => 
        type.trim().toLowerCase().replace(".", "")
      );

      newFiles = newFiles.filter(file => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        if (!extension) return false;
        return acceptedExtensions.includes(extension);
      });

      if (newFiles.length === 0) {
        toast.error(`Please upload files of the following types: ${acceptedTypes}`);
        return;
      }
    }

    setFiles(prevFiles => [...prevFiles, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const simulateUpload = async () => {
    if (files.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    setUploadProgress(0);
    
    // Simulate progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 200));
      setUploadProgress(i);
    }
    
    // In a real app, this would be an API call to upload the files
    await new Promise(r => setTimeout(r, 500));
    
    toast.success(`Successfully uploaded ${files.length} file(s)`);
    onUploadComplete(files);
    setUploadProgress(null);
    setFiles([]);
  };

  return (
    <div className="space-y-4">
      <Card
        className={`border-2 border-dashed p-6 text-center ${
          isDragging ? "border-primary bg-primary/5" : "border-gray-300"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="rounded-full bg-primary/10 p-3">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Drag files here</h3>
            <p className="text-sm text-muted-foreground">
              or click to browse files
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadProgress !== null}
          >
            Select Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            accept={acceptedTypes}
            className="hidden"
            disabled={uploadProgress !== null}
          />
          <p className="text-xs text-muted-foreground">
            Maximum {maxFiles} files{acceptedTypes !== "*" && `. Accepted types: ${acceptedTypes}`}
          </p>
        </div>
      </Card>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="text-sm font-medium">Selected Files ({files.length})</div>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between rounded-md border p-2"
              >
                <div className="flex items-center overflow-hidden">
                  <div className="ml-2 flex flex-col">
                    <span className="truncate text-sm font-medium">
                      {file.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => removeFile(index)}
                  disabled={uploadProgress !== null}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove file</span>
                </Button>
              </div>
            ))}
          </div>

          {uploadProgress !== null ? (
            <div className="space-y-2">
              <Progress value={uploadProgress} />
              <div className="text-xs text-muted-foreground text-right">
                {uploadProgress}% complete
              </div>
            </div>
          ) : (
            <Button onClick={simulateUpload} className="w-full">
              Upload {files.length} file{files.length !== 1 && "s"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
