// components/reviews/camera-capture.tsx

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, X, RotateCcw, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
  maxSizeMB?: number;
}

/**
 * Camera Capture Component for Review Photo Verification
 * Only allows real-time camera capture, no file uploads
 */
export function CameraCapture({
  onCapture,
  onCancel,
  maxSizeMB = 5
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");

  // ============================================
  // START CAMERA
  // ============================================
  const startCamera = useCallback(async () => {
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("[Camera] Error accessing camera:", err);
      setError(
        "Unable to access camera. Please ensure you've granted camera permissions and try again."
      );
    }
  }, [facingMode]);

  // ============================================
  // STOP CAMERA
  // ============================================
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // ============================================
  // CAPTURE PHOTO
  // ============================================
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const imageData = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(imageData);

    // Stop camera after capture
    stopCamera();
  }, [stopCamera]);

  // ============================================
  // RETAKE PHOTO
  // ============================================
  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  // ============================================
  // CONFIRM PHOTO
  // ============================================
  const confirmPhoto = useCallback(async () => {
    if (!capturedImage) return;

    try {
      // Convert base64 to File object
      const response = await fetch(capturedImage);
      const blob = await response.blob();

      // Check file size
      const sizeMB = blob.size / (1024 * 1024);
      if (sizeMB > maxSizeMB) {
        setError(`Photo size (${sizeMB.toFixed(2)}MB) exceeds maximum allowed size of ${maxSizeMB}MB`);
        return;
      }

      const file = new File([blob], `review-photo-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      onCapture(file);
    } catch (err) {
      console.error("[Camera] Error processing photo:", err);
      setError("Failed to process photo. Please try again.");
    }
  }, [capturedImage, onCapture, maxSizeMB]);

  // ============================================
  // FLIP CAMERA (front/back)
  // ============================================
  const flipCamera = useCallback(() => {
    stopCamera();
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }, [stopCamera]);

  // ============================================
  // LIFECYCLE
  // ============================================
  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // ============================================
  // RENDER
  // ============================================
  return (
    <Card className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Photo Verification</h3>
          <p className="text-sm text-muted-foreground">
            Take a photo to verify your review
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          aria-label="Close camera"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Camera/Preview Area */}
      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
        {capturedImage ? (
          // Show captured image
          <div className="relative w-full h-full">
            <Image
              src={capturedImage}
              alt="Captured photo"
              fill
              className="object-cover"
              priority
            />
          </div>
        ) : (
          // Show live camera feed
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
          </>
        )}

        {/* Camera inactive overlay */}
        {!isCameraActive && !capturedImage && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="text-center space-y-2">
              <Camera className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">
                Initializing camera...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {capturedImage ? (
          // Preview controls
          <>
            <Button
              variant="outline"
              onClick={retakePhoto}
              className="gap-2"
              size="lg"
            >
              <RotateCcw className="h-4 w-4" />
              Retake
            </Button>
            <Button
              onClick={confirmPhoto}
              className="gap-2"
              size="lg"
            >
              <Check className="h-4 w-4" />
              Use This Photo
            </Button>
          </>
        ) : (
          // Camera controls
          <>
            <Button
              variant="outline"
              onClick={flipCamera}
              disabled={!isCameraActive}
              className="gap-2"
              aria-label="Flip camera"
            >
              <RotateCcw className="h-4 w-4" />
              Flip
            </Button>
            <Button
              onClick={capturePhoto}
              disabled={!isCameraActive}
              size="lg"
              className="gap-2"
            >
              <Camera className="h-5 w-5" />
              Capture Photo
            </Button>
          </>
        )}
      </div>

      {/* Info */}
      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>📸 Only camera photos are accepted for verification</p>
        <p>Maximum file size: {maxSizeMB}MB</p>
      </div>
    </Card>
  );
}
