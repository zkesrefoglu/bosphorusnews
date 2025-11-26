import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Watermark() {
  const [mainImage, setMainImage] = useState<HTMLImageElement | null>(null);
  const [watermarkImage, setWatermarkImage] = useState<HTMLImageElement | null>(null);
  const [mainImageName, setMainImageName] = useState('No file selected');
  const [watermarkImageName, setWatermarkImageName] = useState('No file selected');
  const [positionX, setPositionX] = useState(50);
  const [positionY, setPositionY] = useState(50);
  const [watermarkSize, setWatermarkSize] = useState(30);
  const [opacity, setOpacity] = useState(70);
  const [invertColors, setInvertColors] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImageName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => setMainImage(img);
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWatermarkImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setWatermarkImageName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => setWatermarkImage(img);
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!mainImage || !watermarkImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match main image
    canvas.width = mainImage.width;
    canvas.height = mainImage.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw main image
    ctx.drawImage(mainImage, 0, 0);

    // Calculate watermark dimensions
    const maxDimension = Math.min(canvas.width, canvas.height);
    const watermarkWidth = watermarkImage.width * (maxDimension / watermarkImage.width) * (watermarkSize / 100);
    const watermarkHeight = watermarkImage.height * (watermarkWidth / watermarkImage.width);

    // Calculate position
    const x = (canvas.width - watermarkWidth) * (positionX / 100);
    const y = (canvas.height - watermarkHeight) * (positionY / 100);

    if (invertColors) {
      // Create a temporary canvas to process the watermark
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;
      
      tempCanvas.width = watermarkWidth;
      tempCanvas.height = watermarkHeight;

      // Draw the watermark on temp canvas
      tempCtx.drawImage(watermarkImage, 0, 0, watermarkWidth, watermarkHeight);

      // Get image data
      const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const data = imageData.data;

      // Invert only black/grayscale pixels
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Check if pixel is grayscale
        const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
        const brightness = (r + g + b) / 3;

        // Only invert if pixel is dark AND grayscale
        if (brightness < 128 && maxDiff < 30) {
          data[i] = 255 - r;
          data[i + 1] = 255 - g;
          data[i + 2] = 255 - b;
        }
      }

      // Put modified image data back
      tempCtx.putImageData(imageData, 0, 0);

      // Draw the processed watermark with opacity
      ctx.globalAlpha = opacity / 100;
      ctx.drawImage(tempCanvas, x, y);
      ctx.globalAlpha = 1.0;
    } else {
      // Draw watermark normally with opacity
      ctx.globalAlpha = opacity / 100;
      ctx.drawImage(watermarkImage, x, y, watermarkWidth, watermarkHeight);
      ctx.globalAlpha = 1.0;
    }
  }, [mainImage, watermarkImage, positionX, positionY, watermarkSize, opacity, invertColors]);

  const handleDownload = () => {
    if (!mainImage || !watermarkImage || !canvasRef.current) return;

    const dataURL = canvasRef.current.toDataURL('image/png');
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(
        `<html><head><title>Watermarked Image</title></head><body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#000;">
          <img src="${dataURL}" style="max-width:100%;max-height:100vh;" alt="Watermarked Image">
          <div style="position:fixed;top:20px;right:20px;background:rgba(255,255,255,0.9);padding:15px;border-radius:8px;font-family:sans-serif;">
            <p style="margin:0 0 10px 0;font-weight:600;">Right-click the image and select "Save image as..." to download</p>
          </div>
        </body></html>`
      );
      newWindow.document.close();
    }

    toast({
      title: "Image opened",
      description: "Right-click the image in the new tab to save it",
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-foreground">Image Watermark Tool</h1>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Preview Panel */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Preview</h2>
            <div className="w-full h-[500px] bg-muted rounded-lg flex items-center justify-center overflow-hidden border-2 border-dashed border-border">
              {mainImage && watermarkImage ? (
                <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />
              ) : (
                <p className="text-muted-foreground text-center px-4">
                  Upload both images to see preview
                </p>
              )}
            </div>
          </Card>

          {/* Controls Panel */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6 text-foreground">Upload & Controls</h2>
            
            <div className="space-y-6">
              {/* Position X */}
              <div className="space-y-2">
                <Label className="flex justify-between">
                  <span>Horizontal Position</span>
                  <span className="text-muted-foreground">{positionX}%</span>
                </Label>
                <Slider
                  value={[positionX]}
                  onValueChange={(value) => setPositionX(value[0])}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>

              {/* Position Y */}
              <div className="space-y-2">
                <Label className="flex justify-between">
                  <span>Vertical Position</span>
                  <span className="text-muted-foreground">{positionY}%</span>
                </Label>
                <Slider
                  value={[positionY]}
                  onValueChange={(value) => setPositionY(value[0])}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>

              {/* Watermark Size */}
              <div className="space-y-2">
                <Label className="flex justify-between">
                  <span>Watermark Size</span>
                  <span className="text-muted-foreground">{watermarkSize}%</span>
                </Label>
                <Slider
                  value={[watermarkSize]}
                  onValueChange={(value) => setWatermarkSize(value[0])}
                  min={10}
                  max={100}
                  step={1}
                />
              </div>

              {/* Opacity */}
              <div className="space-y-2">
                <Label className="flex justify-between">
                  <span>Opacity</span>
                  <span className="text-muted-foreground">{opacity}%</span>
                </Label>
                <Slider
                  value={[opacity]}
                  onValueChange={(value) => setOpacity(value[0])}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>

              {/* Invert Colors */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="invert"
                  checked={invertColors}
                  onCheckedChange={(checked) => setInvertColors(checked as boolean)}
                />
                <Label htmlFor="invert" className="cursor-pointer">
                  Invert Watermark Blacks
                </Label>
              </div>

              {/* Upload Buttons */}
              <div className="grid md:grid-cols-2 gap-4 pt-4">
                <div className="space-y-2">
                  <Label>Main Image</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageUpload}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground italic">{mainImageName}</p>
                </div>

                <div className="space-y-2">
                  <Label>Watermark Image</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleWatermarkImageUpload}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground italic">{watermarkImageName}</p>
                </div>
              </div>

              {/* Download Button */}
              <Button
                onClick={handleDownload}
                disabled={!mainImage || !watermarkImage}
                className="w-full"
                size="lg"
              >
                <Download className="mr-2 h-5 w-5" />
                Download Image
              </Button>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
