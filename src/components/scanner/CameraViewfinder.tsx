"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, FlipHorizontal, RefreshCw, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraViewfinderProps {
  mode: "passport" | "nid";
  subLabel?: string;
  onCapture: (file: File) => void;
  onClose?: () => void;
}

export function CameraViewfinder({
  mode,
  subLabel,
  onCapture,
  onClose,
}: CameraViewfinderProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [flash, setFlash] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  const startCamera = async (facing: "environment" | "user") => {
    // Stop any existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setErrorMessage(null);

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setHasCamera(false);
      setErrorMessage("Live camera is not supported in this browser. Please use file upload or device camera picker.");
      return;
    }

    try {
      let stream: MediaStream;
      try {
        // Preferred: High resolution back camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } catch {
        // Fallback: standard video stream
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setHasCamera(true);
    } catch (err: unknown) {
      setHasCamera(false);
      const errStr = err instanceof Error ? err.name : String(err);
      if (errStr === "NotAllowedError" || errStr === "PermissionDeniedError") {
        setErrorMessage("Camera access was denied. Please allow camera permissions or upload an image.");
      } else {
        setErrorMessage("Could not connect to camera. Please use file upload instead.");
      }
    }
  };

  useEffect(() => {
    startCamera(facingMode);

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [facingMode]);

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const captureFrame = () => {
    if (!videoRef.current || isCapturing) return;

    setIsCapturing(true);
    setFlash(true);
    setTimeout(() => setFlash(false), 200);

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsCapturing(false);
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        setIsCapturing(false);
        if (blob) {
          const fileName = `${mode}_capture_${Date.now()}.jpg`;
          const file = new File([blob], fileName, { type: "image/jpeg" });
          onCapture(file);
        }
      },
      "image/jpeg",
      0.95,
    );
  };

  const handleNativePickerFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCapture(file);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-slate-950 text-white min-h-[380px] sm:min-h-[480px]">
      {/* Hidden fallback input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleNativePickerFile}
      />

      {/* Shutter flash animation */}
      {flash && (
        <div className="absolute inset-0 z-50 bg-white/80 pointer-events-none transition-opacity duration-200" />
      )}

      {/* Video Viewfinder */}
      {hasCamera && (
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Camera Overlay & Framing Box */}
      {hasCamera && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-between p-4 sm:p-6">
          {/* Top Instructions */}
          <div className="rounded-full bg-slate-900/80 px-4 py-1.5 text-xs font-semibold text-slate-100 backdrop-blur-md shadow-md">
            {subLabel ||
              (mode === "passport"
                ? "Align Passport Bio-Data Page & bottom MRZ zone"
                : "Align NID Card within the frame")}
          </div>

          {/* Framing Target Box */}
          <div
            className={`relative w-full max-w-md border-2 border-dashed border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] transition-all ${
              mode === "passport"
                ? "aspect-[1.4/1] rounded-2xl"
                : "aspect-[1.58/1] rounded-xl"
            }`}
          >
            {/* Corner brackets */}
            <div className="absolute -top-1 -left-1 h-6 w-6 border-t-4 border-l-4 border-blue-400 rounded-tl-lg" />
            <div className="absolute -top-1 -right-1 h-6 w-6 border-t-4 border-r-4 border-blue-400 rounded-tr-lg" />
            <div className="absolute -bottom-1 -left-1 h-6 w-6 border-b-4 border-l-4 border-blue-400 rounded-bl-lg" />
            <div className="absolute -bottom-1 -right-1 h-6 w-6 border-b-4 border-r-4 border-blue-400 rounded-br-lg" />

            {/* Passport MRZ Zone Highlighter */}
            {mode === "passport" && (
              <div className="absolute inset-x-0 bottom-0 h-[32%] border-t-2 border-emerald-400/80 bg-emerald-500/10 flex items-center justify-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 drop-shadow">
                  Keep 2-Line MRZ (P&lt;BGD...) Here
                </span>
              </div>
            )}
          </div>

          {/* Bottom spacing placeholder */}
          <div className="h-10" />
        </div>
      )}

      {/* Camera Controls Bar */}
      {hasCamera && (
        <div className="absolute inset-x-0 bottom-4 z-20 flex items-center justify-around px-6">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleCameraFacing}
            className="h-12 w-12 rounded-full bg-slate-900/70 text-white hover:bg-slate-800"
            title="Flip Camera"
          >
            <FlipHorizontal className="h-6 w-6" />
          </Button>

          {/* Large Shutter Button */}
          <button
            type="button"
            onClick={captureFrame}
            disabled={isCapturing}
            className="flex h-18 w-18 items-center justify-center rounded-full border-4 border-white bg-blue-600 shadow-xl transition-transform active:scale-90 hover:bg-blue-500 disabled:opacity-50"
            aria-label="Capture photo"
          >
            <Camera className="h-8 w-8 text-white" />
          </button>

          {onClose ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-12 w-12 rounded-full bg-slate-900/70 text-white hover:bg-slate-800"
              title="Close Viewfinder"
            >
              <X className="h-6 w-6" />
            </Button>
          ) : (
            <div className="w-12" />
          )}
        </div>
      )}

      {/* Permission Denied or Unsupported Camera State */}
      {hasCamera === false && (
        <div className="z-10 flex max-w-sm flex-col items-center gap-4 p-6 text-center">
          <div className="rounded-full bg-amber-500/20 p-3 text-amber-400">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <p className="text-sm font-medium text-slate-300">
            {errorMessage || "Camera unavailable."}
          </p>
          <div className="flex flex-col gap-2 w-full">
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-12 w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-semibold"
            >
              <Camera className="mr-2 h-5 w-5" />
              Take Photo with Device Camera
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => startCamera(facingMode)}
              className="h-11 w-full rounded-xl border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Camera Connection
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
