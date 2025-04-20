
import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Download, Image, Lock } from "lucide-react";
import { embedMessageInImage } from "@/utils/steganography";

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
  const imageRef = useRef<HTMLImageElement>(null);

  // In a real app, this would fetch the image from your backend
  useEffect(() => {
    // Mock loading the image
    const mockImageUrl = "https://source.unsplash.com/random/800x600/?document";
    setOriginalImage(mockImageUrl);

    // Simulate loading
    toast.info("Loading image...");
  }, [id]);

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
      // In a real app, this would call your server-side function or do client-side steganography
      const watermarkedResult = await embedMessageInImage(
        imageRef.current,
        watermarkText,
        usePassword ? password : undefined
      );

      setWatermarkedImage(watermarkedResult);
      toast.success("Watermark applied successfully!");
    } catch (error) {
      console.error("Error applying watermark:", error);
      toast.error("Failed to apply watermark");
    } finally {
      setIsProcessing(false);
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
    link.download = `watermarked-${id || "image"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Image downloaded successfully");
  };

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
