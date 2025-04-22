
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FilePreview } from "@/components/files/FilePreview";
import { useFiles, File } from '@/hooks/useFiles';
import { applyWatermark, verifyWatermark } from '@/utils/steganography';
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

const WatermarkPage = () => {
  const { id } = useParams<{ id: string }>();
  const { getFileById, updateFile, logActivity } = useFiles();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: file, isLoading, error } = getFileById(id);
  
  const [watermarkText, setWatermarkText] = useState('');
  const [watermarkPosition, setWatermarkPosition] = useState('center');
  const [opacity, setOpacity] = useState(0.5);
  const [isVisible, setIsVisible] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(null);
  const [watermarkImage, setWatermarkImage] = useState<string | null>(null);
  const [isWatermarking, setIsWatermarking] = useState(false);
  
  const handleApplyWatermark = async () => {
    if (!file || !file.encrypted_data) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "File data not available"
      });
      return;
    }
    
    try {
      setIsWatermarking(true);
      
      // Create an Image object to load the file data
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.src = file.encrypted_data;
      
      // Wait for the image to load
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
      });
      
      // Apply watermark
      const watermarkedDataURL = await applyWatermark(image, {
        text: watermarkText,
        position: watermarkPosition,
        opacity: opacity,
        visible: isVisible,
      });
      
      setWatermarkImage(watermarkedDataURL);
      
      // Update file with watermark data
      if (watermarkedDataURL) {
        await updateFile.mutateAsync({
          id: file.id,
          encrypted_data: watermarkedDataURL,
          has_watermark: true,
          watermark_data: {
            text: watermarkText,
            position: watermarkPosition,
            opacity: opacity,
            visible: isVisible,
            timestamp: new Date().toISOString()
          }
        });
        
        await logActivity('watermark_applied', file.id, 'file', {
          fileName: file.name,
          watermarkText
        });
        
        toast({
          title: "Success",
          description: "Watermark applied successfully",
        });
      }
    } catch (err) {
      console.error("Watermark error:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to apply watermark"
      });
    } finally {
      setIsWatermarking(false);
    }
  };
  
  const handleVerifyWatermark = async () => {
    if (!file || !file.encrypted_data) {
      toast({
        variant: "destructive", 
        title: "Error",
        description: "File data not available"
      });
      return;
    }
    
    try {
      setIsVerifying(true);
      
      // Create an Image object to load the file data
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.src = file.encrypted_data;
      
      // Wait for the image to load
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
      });
      
      const result = await verifyWatermark(image);
      setVerificationResult(result ? `Watermark verified: ${result}` : "No watermark found");
    } catch (err) {
      console.error("Verification error:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to verify watermark"
      });
      setVerificationResult("Error verifying watermark");
    } finally {
      setIsVerifying(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (error || !file) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h3 className="text-lg font-medium">Error loading file</h3>
        <p className="text-muted-foreground mb-4">Could not load the requested file</p>
        <Button onClick={() => navigate('/vault')}>Back to Files</Button>
      </div>
    );
  }
  
  return (
    <div className="container py-8 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{file.name}</h1>
          <p className="text-muted-foreground">Watermark and protect your file</p>
        </div>
        <Button variant="outline" onClick={() => navigate(`/vault/file/${id}`)}>
          Back to File
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <FilePreview
            name={file.name}
            type={file.type}
            id={file.id}
            encrypted_data={watermarkImage || file.encrypted_data}
            is_encrypted={file.is_encrypted}
            encryption_key={file.encryption_key}
            onDownload={() => {}}
          />
        </div>
        
        <div className="space-y-6">
          <Tabs defaultValue="add">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="add">Add Watermark</TabsTrigger>
              <TabsTrigger value="verify">Verify Watermark</TabsTrigger>
            </TabsList>
            <TabsContent value="add" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Watermark Settings</CardTitle>
                  <CardDescription>
                    Add a watermark to protect your file from unauthorized use
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="watermark-text">Watermark Text</Label>
                    <Input
                      id="watermark-text"
                      placeholder="Enter watermark text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <select
                      id="position"
                      className="w-full p-2 border rounded"
                      value={watermarkPosition}
                      onChange={(e) => setWatermarkPosition(e.target.value)}
                    >
                      <option value="center">Center</option>
                      <option value="top-left">Top Left</option>
                      <option value="top-right">Top Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="bottom-right">Bottom Right</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="opacity">Opacity: {opacity}</Label>
                    <input
                      id="opacity"
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={opacity}
                      onChange={(e) => setOpacity(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="visible" 
                      checked={isVisible}
                      onCheckedChange={(checked) => setIsVisible(!!checked)}
                    />
                    <Label htmlFor="visible" className="font-normal">
                      Make watermark visible
                    </Label>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleApplyWatermark} 
                    disabled={!watermarkText || isWatermarking}
                    className="w-full"
                  >
                    {isWatermarking ? (
                      <>
                        <span className="animate-spin mr-2">⌛</span>
                        Applying Watermark...
                      </>
                    ) : 'Apply Watermark'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="verify" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Verify Watermark</CardTitle>
                  <CardDescription>
                    Check if this file contains a hidden watermark
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {verificationResult && (
                    <div className={`p-4 rounded-md ${verificationResult.includes("No") ? "bg-amber-50 text-amber-800 border border-amber-200" : "bg-green-50 text-green-800 border border-green-200"}`}>
                      {verificationResult}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleVerifyWatermark} 
                    disabled={isVerifying}
                    className="w-full"
                  >
                    {isVerifying ? 'Verifying...' : 'Verify Watermark'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default WatermarkPage;
