import { useState, useRef, useEffect } from "react";
import { Upload, ZoomIn, ZoomOut, RotateCcw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const RESOLUTIONS = [
  { name: "HD 16:10", width: 1920, height: 1200 },
  { name: "Full HD 16:9", width: 1920, height: 1080 },
  { name: "WSXGA+ 16:10", width: 1680, height: 1050 },
  { name: "UXGA 4:3", width: 1600, height: 1200 },
  { name: "HD+ 16:9", width: 1600, height: 900 },
  { name: "WXGA+ 16:10", width: 1440, height: 900 },
  { name: "SXGA+ 4:3", width: 1400, height: 1050 },
  { name: "HD 16:9", width: 1366, height: 768 },
  { name: "WXGA 16:9", width: 1360, height: 768 }
];

export const ImageSizeFix = () => {
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [currentRes, setCurrentRes] = useState(RESOLUTIONS[1]);
  const [scale, setScale] = useState(100);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [bgMode, setBgMode] = useState<'color' | 'transparent'>('color');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageInfo, setImageInfo] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadZoneRef = useRef<HTMLDivElement>(null);

  const getDominantColor = (img: HTMLImageElement): string => {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return '#ffffff';

    tempCanvas.width = 1;
    tempCanvas.height = 1;
    tempCtx.drawImage(img, 0, 0, 1, 1);
    const pixel = tempCtx.getImageData(0, 0, 1, 1).data;
    return `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
  };

  const analyzeImage = (img: HTMLImageElement, file: File) => {
    const width = img.width;
    const height = img.height;
    const ratio = width / height;
    const fileSize = (file.size / 1024 / 1024).toFixed(2);

    const recs: string[] = [];
    let status = '';
    let isOptimal = false;

    if (width >= 2560 && height >= 1080 && Math.abs(ratio - 21/9) < 0.1) {
      status = '🎯 Optimal (21:9 Cinematic)';
      isOptimal = true;
    } else if (width >= 1920 && height >= 1080 && Math.abs(ratio - 16/9) < 0.1) {
      status = '✓ Standard HD (16:9)';
      isOptimal = true;
    } else {
      status = '⚠️ Below Recommended';
      
      if (width < 1920 || height < 1080) {
        recs.push(`Image resolution is ${width}×${height}px. Recommended minimum: 1920×1080px`);
      }
      if (Math.abs(ratio - 16/9) > 0.1 && Math.abs(ratio - 21/9) > 0.1) {
        recs.push(`Aspect ratio is ${ratio.toFixed(2)}:1. Recommended: 16:9 (1.78) or 21:9 (2.33)`);
      }
      if (parseFloat(fileSize) > 2) {
        recs.push('File size is large. Consider optimizing for web use.');
      }
    }

    setImageInfo({ width, height, ratio: ratio.toFixed(2), fileSize, status });
    setRecommendations(recs);
  };

  const loadImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setSourceImage(img);
        setBgColor(getDominantColor(img));
        analyzeImage(img, file);
        resetPosition(img);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const resetPosition = (img?: HTMLImageElement) => {
    const image = img || sourceImage;
    if (!image) return;

    const imgRatio = image.width / image.height;
    const canvasRatio = currentRes.width / currentRes.height;

    let newScale = 1;
    if (imgRatio > canvasRatio) {
      // Image is wider - fit to canvas width
      newScale = currentRes.width / image.width;
    } else {
      // Image is taller - fit to canvas height
      newScale = currentRes.height / image.height;
    }

    setPosX(0);
    setPosY(0);
    setScale(Math.round(newScale * 100));
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !ctx || !sourceImage) return;

    canvas.width = currentRes.width;
    canvas.height = currentRes.height;

    if (bgMode === 'color') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    const scaleFactor = scale / 100;
    const scaledWidth = sourceImage.width * scaleFactor;
    const scaledHeight = sourceImage.height * scaleFactor;

    const x = (canvas.width - scaledWidth) / 2 + posX;
    const y = (canvas.height - scaledHeight) / 2 + posY;

    ctx.drawImage(sourceImage, x, y, scaledWidth, scaledHeight);
  };

  useEffect(() => {
    if (sourceImage) {
      drawCanvas();
    }
  }, [sourceImage, currentRes, scale, posX, posY, bgMode, bgColor]);

  useEffect(() => {
    if (sourceImage) {
      resetPosition();
    }
  }, [currentRes]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      loadImage(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadImage(file);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - posX, y: e.clientY - posY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosX(e.clientX - dragStart.x);
    setPosY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `carousel-${currentRes.width}x${currentRes.height}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Image downloaded successfully!");
    }, 'image/png');
  };

  const downloadOriginal = () => {
    if (!sourceImage) return;
    const a = document.createElement('a');
    a.href = sourceImage.src;
    a.download = 'original-image.png';
    a.click();
    toast.success("Original image downloaded!");
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <Card>
        <CardContent className="pt-6">
          <div
            ref={uploadZoneRef}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-3 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-all hover:bg-muted/50"
          >
            <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl font-semibold mb-2">Click to upload or drag and drop</p>
            <p className="text-sm text-muted-foreground">Supports JPG, PNG, GIF, WEBP</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Image Analysis */}
      {imageInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="text-3xl">{imageInfo.status.includes('Optimal') || imageInfo.status.includes('Standard') ? '✓' : '⚠️'}</span>
              Image Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground font-medium">Dimensions:</span>
                <span className="font-semibold">{imageInfo.width} × {imageInfo.height}px</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground font-medium">Aspect Ratio:</span>
                <span className="font-semibold">{imageInfo.ratio}:1</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground font-medium">File Size:</span>
                <span className="font-semibold">{imageInfo.fileSize} MB</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground font-medium">Status:</span>
                <span className="font-semibold">{imageInfo.status}</span>
              </div>
            </div>

            {recommendations.length > 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4">
                <h3 className="text-yellow-900 font-semibold mb-3 flex items-center gap-2">
                  ⚠️ Recommendations
                </h3>
                <ul className="space-y-1 text-sm text-yellow-800 list-disc list-inside">
                  {recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Editor */}
      {sourceImage && (
        <Card>
          <CardHeader>
            <CardTitle>Crop & Export Tool</CardTitle>
            <CardDescription>Drag to reposition • Zoom in/out • Select resolution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-[250px_1fr] gap-6">
              {/* Resolutions */}
              <div className="bg-muted rounded-lg p-4 max-h-[600px] overflow-y-auto">
                <p className="text-xs font-bold uppercase text-muted-foreground mb-3 tracking-wide">
                  Resolutions
                </p>
                <div className="space-y-2">
                  {RESOLUTIONS.map((res) => (
                    <div
                      key={res.name}
                      onClick={() => setCurrentRes(res)}
                      className={`bg-background p-3 rounded-lg cursor-pointer border-2 transition-all hover:border-primary hover:translate-x-1 ${
                        currentRes.name === res.name ? 'border-primary bg-muted' : 'border-transparent'
                      }`}
                    >
                      <div className="font-semibold text-sm">{res.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{res.width} × {res.height}</div>
                      <div className="text-xs text-muted-foreground">{(res.width / res.height).toFixed(2)}:1</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Canvas Area */}
              <div>
                <div className="bg-muted p-6 rounded-lg text-center">
                  <div
                    className="inline-block relative border-2 border-border rounded-lg overflow-hidden cursor-move shadow-lg"
                    style={{
                      background: 'repeating-conic-gradient(#f0f0f0 0% 25%, white 0% 50%) 50% / 20px 20px'
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    <canvas
                      ref={canvasRef}
                      className="block max-w-full h-auto"
                      style={{ maxHeight: '500px' }}
                    />
                    <div className="absolute top-3 left-3 bg-black/75 text-white px-3 py-2 rounded-md text-sm font-semibold pointer-events-none">
                      {currentRes.width} × {currentRes.height}
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <Card>
                    <CardContent className="pt-4">
                      <label className="font-semibold text-sm mb-3 block flex items-center gap-2">
                        🔍 Zoom Level
                      </label>
                      <div className="flex items-center gap-3">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setScale(Math.max(50, scale - 10))}
                        >
                          <ZoomOut className="w-4 h-4" />
                        </Button>
                        <input
                          type="range"
                          min="50"
                          max="300"
                          value={scale}
                          onChange={(e) => setScale(Number(e.target.value))}
                          className="flex-1 h-2 rounded-lg outline-none bg-muted"
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setScale(Math.min(300, scale + 10))}
                        >
                          <ZoomIn className="w-4 h-4" />
                        </Button>
                        <input
                          type="number"
                          min="50"
                          max="300"
                          value={scale}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            if (val >= 50 && val <= 300) setScale(val);
                          }}
                          className="font-bold w-[70px] text-right bg-background border border-border rounded px-2 py-1"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <label className="font-semibold text-sm mb-3 block flex items-center gap-2">
                        🎨 Background
                      </label>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setBgMode('color')}
                          className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all font-semibold text-sm ${
                            bgMode === 'color' ? 'border-primary bg-muted' : 'border-border hover:border-primary hover:bg-muted/50'
                          }`}
                        >
                          Color Fill
                        </button>
                        <button
                          onClick={() => setBgMode('transparent')}
                          className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all font-semibold text-sm ${
                            bgMode === 'transparent' ? 'border-primary bg-muted' : 'border-border hover:border-primary hover:bg-muted/50'
                          }`}
                        >
                          Transparent
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 justify-center mt-6 pt-6 border-t">
                  <Button variant="outline" onClick={() => resetPosition()}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset Position
                  </Button>
                  <Button onClick={downloadImage}>
                    <Download className="w-4 h-4 mr-2" />
                    Save Cropped Image
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
