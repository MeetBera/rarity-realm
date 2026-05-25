import React, { useState, useRef } from "react";
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { cn } from "@/lib/utils";

// Helper function to center the crop box perfectly on first load
function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      { unit: "%", width: 50 },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export default function AdminCropper({ 
  initialImage, 
  characterName 
}: { 
  initialImage: string; 
  characterName: string;
}) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const imgRef = useRef<HTMLImageElement>(null);

  // 1. Handle image load and set initial centered crop
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1)); // Aspect ratio 1 forces a perfect square
  };

  // 2. Extract the cropped pixels using an invisible HTML Canvas
  const generateCropPreview = async () => {
    if (!imgRef.current || !completedCrop) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    // Convert canvas to base64 string for immediate preview
    const base64Image = canvas.toDataURL("image/jpeg");
    setPreviewUrl(base64Image);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-slate-900 text-white rounded-xl border border-slate-700">
      <h2 className="text-2xl font-black uppercase mb-4 text-violet-400">
        Crop Thumbnail: {characterName}
      </h2>

      <div className="flex flex-col md:flex-row gap-8">
        {/* LEFT SIDE: The Cropper */}
        <div className="flex-1 bg-black/50 p-4 rounded-lg border border-slate-800 flex items-center justify-center overflow-hidden">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1} // Locks the crop to a square!
            circularCrop // Makes the grid look like a circle to match your UI
          >
            <img
              ref={imgRef}
              src={initialImage}
              alt="Crop me"
              onLoad={onImageLoad}
              className="max-h-[60vh] w-auto object-contain"
              crossOrigin="anonymous" // Required if loading from Cloudinary
            />
          </ReactCrop>
        </div>

        {/* RIGHT SIDE: Controls & Preview */}
        <div className="w-full md:w-64 flex flex-col gap-6">
          <button
            onClick={generateCropPreview}
            className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-lg transition-colors"
          >
            Generate Preview
          </button>

          {previewUrl && (
            <div className="flex flex-col items-center gap-4 p-4 border border-slate-700 rounded-lg bg-slate-800/50">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                Avatar Result
              </h3>
              {/* This mimics how it will look in your GameCard */}
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                <img src={previewUrl} alt="Cropped Preview" className="w-full h-full object-cover" />
              </div>

              <button 
                onClick={() => console.log("Upload this base64 string:", previewUrl)}
                className="mt-2 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded transition-colors"
              >
                Save Thumbnail
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}