
import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { AlertTriangle, ArrowLeft, Download, Image, Lock } from "lucide-react";
import { embedMessageInImage, extractMessageFromImage } from "@/utils/steganography";
import { useFiles } from "@/hooks/useFiles";

const WatermarkPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [watermarkedImage, setWatermarkedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [password, setPassword] = useState("");
  const [usePassword, setUsePassword] = useState(false);
  const [opacity, setOpacity] = useState([30]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [extractedWatermark, setExtractedWatermark] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const { data: file, isLoading: fileLoading } = useFiles().getFileById(id);
  const { updateFile, logActivity } = useFiles();

  // Load the image
  useEffect(() => {
    if (!id || fileLoading || !file) return;

    if (!file.type.includes('image')) {
      toast.error("This file is not an image");
      navigate(-1);
      return;
    }

    // Use the encrypted_data if available, otherwise generate a placeholder
    if (file.encrypted_data) {
      setOriginalImage(file.encrypted_data);
    } else {
      // In a real app, you would fetch the actual image from your storage
      const mockImageUrl = `https://source.unsplash.com/random/800x600/?${file.name.split('.')[0]}`;
      setOriginalImage(mockImageUrl);
    }

    toast.info("Loading image...");
  }, [id, file, fileLoading, navigate]);

  const handleApplyWatermark = async () => {
    if (!watermarkText.trim()) {
      toast.error("Please enter watermark text");
      return;
    }

    if (usePassword && !password.trim()) {
      toast.error("Please enter a password");
      return;
    }

    if (!imageRef.current || !originalImage) {
      toast.error("Image not loaded properly");
      return;
    }

    setIsProcessing(true);
    toast.info("Applying watermark...");

    try {
      // Create a new Image object to ensure it's fully loaded
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = async () => {
        try {
          const watermarkedResult = await embedMessageInImage(
            img,
            watermarkText,
            usePassword ? password : undefined
          );

          setWatermarkedImage(watermarkedResult);

          // Update the file record
          if (id) {
            updateFile.mutate({
              id,
              has_watermark: true,
              watermark_data: {
                text: watermarkText,
                isProtected: usePassword,
                appliedAt: new Date().toISOString()
              }
            });

            await logActivity(
              "applied_watermark",
              id,
              "file",
              { fileName: file?.name, watermarkText }
            );
          }

          toast.success("Watermark applied successfully!");
        } catch (error) {
          console.error("Error in onload handler:", error);
          toast.error("Failed to apply watermark");
        } finally {
          setIsProcessing(false);
        }
      };
      
      img.onerror = () => {
        console.error("Failed to load image for watermarking");
        toast.error("Failed to load image for watermarking");
        setIsProcessing(false);
      };
      
      img.src = originalImage;
    } catch (error) {
      console.error("Error applying watermark:", error);
      toast.error("Failed to apply watermark");
      setIsProcessing(false);
    }
  };

  const handleVerifyWatermark = async () => {
    if (!watermarkedImage) {
      toast.error("No watermarked image to verify");
      return;
    }

    setIsVerifying(true);
    setExtractedWatermark(null);

    try {
      const extractedText = await extractMessageFromImage(
        watermarkedImage,
        usePassword ? password : undefined
      );

      setExtractedWatermark(extractedText);
      toast.success("Watermark verified successfully!");
    } catch (error) {
      console.error("Error verifying watermark:", error);
      toast.error("Failed to verify watermark. Password may be incorrect.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDownload = () => {
    if (!watermarkedImage) {
      toast.error("No watermarked image to download");
      return;
    }

    // Create an anchor element and trigger the download
    const link = document.createElement("a");
    link.href = watermarkedImage;
    link.download = `watermarked-${file?.name || "image"}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Log the download activity
    if (id) {
      logActivity(
        "downloaded_watermarked",
        id,
        "file",
        { fileName: file?.name }
      );
    }

    toast.success("Image downloaded successfully");
  };

  if (fileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading file data...</p>
        </div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-16 w-16 mx-auto text-destructive opacity-70" />
        <h2 className="mt-4 text-xl font-semibold">File not found</h2>
        <p className="mt-2 text-muted-foreground">
          The file you are looking for might have been removed or is no longer accessible.
        </p>
        <Button 
          variant="outline" 
          className="mt-6" 
          onClick={() => navigate("/vault")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Return to Vault
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Image Watermarking</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="watermarkText">Watermark Text</Label>
              <Input
                id="watermarkText"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="Enter watermark text"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="usePassword">Password Protection</Label>
                <Switch
                  id="usePassword"
                  checked={usePassword}
                  onCheckedChange={setUsePassword}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Protect your watermark with a password
              </p>
            </div>

            {usePassword && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="Enter password"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="opacity">Opacity: {opacity}%</Label>
              <Slider
                id="opacity"
                min={5}
                max={100}
                step={5}
                value={opacity}
                onValueChange={setOpacity}
              />
            </div>

            <div className="flex flex-col md:flex-row gap-3 pt-4">
              <Button
                onClick={handleApplyWatermark}
                disabled={isProcessing || !originalImage}
                className="flex-1"
              >
                <Image className="h-4 w-4 mr-2" />
                {isProcessing ? "Processing..." : "Apply Watermark"}
              </Button>
              {watermarkedImage && (
                <Button
                  onClick={handleVerifyWatermark}
                  disabled={isVerifying}
                  variant="outline"
                  className="flex-1"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  {isVerifying ? "Verifying..." : "Verify Watermark"}
                </Button>
              )}
              <Button
                onClick={handleDownload}
                disabled={!watermarkedImage}
                variant="outline"
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>

            {extractedWatermark && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">Extracted watermark:</p>
                <p className="text-sm mt-1">{extractedWatermark}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="bg-muted p-2 rounded-md overflow-hidden">
            <div className="aspect-video relative flex items-center justify-center">
              {originalImage ? (
                <img
                  ref={imageRef}
                  src={originalImage}
                  alt="Original"
                  className="max-h-full max-w-full object-contain"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <Image className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Loading image...</p>
                </div>
              )}
            </div>
          </div>

          {watermarkedImage && (
            <div className="mt-4">
              <Label className="block mb-2">Watermarked Image</Label>
              <div className="bg-muted p-2 rounded-md overflow-hidden">
                <div className="aspect-video relative flex items-center justify-center">
                  <img
                    src={watermarkedImage}
                    alt="Watermarked"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center">
                <Lock className="h-3 w-3 mr-1" />
                Steganographic watermark applied
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WatermarkPage;
