
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DownloadIcon, 
  Trash, 
  Eye, 
  Lock, 
  Image,
  FileImage,
  File
} from "lucide-react";
import { toast } from "sonner";

interface FileCardProps {
  file: {
    id: string;
    name: string;
    size: number;
    type: string;
    uploadDate: Date;
    isEncrypted: boolean;
    tags?: string[];
  };
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  onDownload: (id: string) => void;
  onEncrypt?: (id: string) => void;
  onWatermark?: (id: string) => void;
  onMask?: (id: string) => void;
}

const FileCard = ({
  file,
  onDelete,
  onView,
  onDownload,
  onEncrypt,
  onWatermark,
  onMask,
}: FileCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getFileIcon = () => {
    if (file.type.includes('image')) {
      return <FileImage className="h-8 w-8 text-primary" />;
    } else if (file.type.includes('excel') || file.type.includes('spreadsheet')) {
      return <File className="h-8 w-8 text-vault-success" />;
    } else {
      return <File className="h-8 w-8 text-muted-foreground" />;
    }
  };

  const isImage = file.type.includes('image');
  const isSpreadsheet = file.type.includes('excel') || file.type.includes('spreadsheet');

  return (
    <Card 
      className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${isHovered ? 'ring-1 ring-primary' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowOptions(false);
      }}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-md bg-primary/10">
            {getFileIcon()}
          </div>
          <div className="space-y-1 flex-1 overflow-hidden">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium truncate" title={file.name}>
                {file.name}
              </h3>
              {file.isEncrypted && (
                <span className="security-badge security-badge-secure">
                  <Lock className="h-3 w-3 mr-1" />
                  Encrypted
                </span>
              )}
            </div>
            <div className="flex text-xs text-muted-foreground space-x-4">
              <span>{formatSize(file.size)}</span>
              <span>·</span>
              <span>{formatDate(file.uploadDate)}</span>
            </div>
            {file.tags && file.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {file.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-2 py-0.5 bg-primary/10 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className={`border-t p-2 bg-muted/20 ${showOptions || isHovered ? 'flex' : 'hidden'} flex-wrap gap-2`}>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1"
          onClick={() => onDownload(file.id)}
        >
          <DownloadIcon className="h-4 w-4 mr-1" /> Download
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1"
          onClick={() => onView(file.id)}
        >
          <Eye className="h-4 w-4 mr-1" /> View
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-vault-danger hover:text-vault-danger hover:bg-vault-danger/10"
          onClick={() => {
            toast.warning(
              "Are you sure you want to delete this file?",
              {
                action: {
                  label: "Delete",
                  onClick: () => onDelete(file.id)
                }
              }
            );
          }}
        >
          <Trash className="h-4 w-4 mr-1" /> Delete
        </Button>
        
        {isImage && onWatermark && (
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={() => onWatermark(file.id)}
          >
            <Image className="h-4 w-4 mr-1" /> Watermark
          </Button>
        )}
        
        {isSpreadsheet && onMask && (
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={() => onMask(file.id)}
          >
            <Lock className="h-4 w-4 mr-1" /> Mask Data
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default FileCard;
