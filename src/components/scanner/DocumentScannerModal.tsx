"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  BookOpen,
  Camera,
  CheckCircle2,
  CreditCard,
  FlipHorizontal,
  FolderOpen,
  Lock,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FormField } from "@/lib/types";
import { preprocessImage } from "@/lib/ocr/imagePreprocessor";
import { parseNidImages } from "@/lib/ocr/nidParser";
import { parsePassportImage } from "@/lib/ocr/passportParser";
import {
  DocumentScanMode,
  ExtractedDocumentData,
  OCRProgress,
} from "@/lib/ocr/types";
import {
  FieldMetaItem,
  storeScannedFileInMemory,
  useIntakeStore,
} from "@/store/intake-store";
import { ScanSummaryDrawer } from "./ScanSummaryDrawer";

interface DocumentScannerModalProps {
  isOpen: boolean;
  availableFields: FormField[];
  onClose: () => void;
  defaultMode?: DocumentScanMode;
}

export function DocumentScannerModal({
  isOpen,
  availableFields,
  onClose,
  defaultMode = "passport",
}: DocumentScannerModalProps) {
  const { setAnswersBulk, setScannedDocAvailable } = useIntakeStore();

  const [scanMode, setScanMode] = useState<DocumentScanMode>(defaultMode);
  const [nidStep, setNidStep] = useState<"front" | "back">("front");

  // Camera stream state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<"environment" | "user">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // File upload state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Stored clean captured files
  const [cleanPassportFile, setCleanPassportFile] = useState<File | null>(null);
  const [cleanNidFrontFile, setCleanNidFrontFile] = useState<File | null>(null);
  const [cleanNidBackFile, setCleanNidBackFile] = useState<File | null>(null);
  const [nidFrontCanvas, setNidFrontCanvas] = useState<HTMLCanvasElement | null>(null);

  // OCR Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<OCRProgress | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedDocumentData | null>(null);
  const [showSummaryDrawer, setShowSummaryDrawer] = useState(false);

  // Stop camera stream cleanly
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setIsCameraStarting(false);
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  if (!isOpen) return null;

  const handleReset = () => {
    stopCameraStream();
    setCleanPassportFile(null);
    setCleanNidFrontFile(null);
    setCleanNidBackFile(null);
    setNidFrontCanvas(null);
    setNidStep("front");
    setIsProcessing(false);
    setOcrProgress(null);
    setExtractedData(null);
    setShowSummaryDrawer(false);
  };

  const handleModeChange = (mode: DocumentScanMode) => {
    setScanMode(mode);
    handleReset();
  };

  // Start live webcam or mobile back camera
  const startCamera = async (facing: "environment" | "user" = cameraFacing) => {
    stopCameraStream();
    setCameraError(null);
    setIsCameraStarting(true);

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setIsCameraStarting(false);
      setCameraError("Camera is not supported on this browser/device.");
      toast.error("Camera not supported. Please use the Manual File Upload option.");
      return;
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      setIsCameraActive(true);
      setIsCameraStarting(false);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: unknown) {
      setIsCameraStarting(false);
      setIsCameraActive(false);
      const errStr = err instanceof Error ? err.name : String(err);
      if (errStr === "NotAllowedError" || errStr === "PermissionDeniedError") {
        setCameraError("Camera permission denied. Please allow camera or upload files.");
        toast.error("Camera access was denied. You can upload document images directly.");
      } else {
        setCameraError("Could not access camera.");
        toast.error("Could not access camera. Please use manual upload.");
      }
    }
  };

  // Flip between front and rear cameras
  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === "environment" ? "user" : "environment";
    setCameraFacing(nextFacing);
    if (isCameraActive) {
      startCamera(nextFacing);
    }
  };

  // Capture frame from active camera
  const captureCameraFrame = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          stopCameraStream();
          const fileName = `${scanMode}_capture_${Date.now()}.jpg`;
          const file = new File([blob], fileName, { type: "image/jpeg" });
          processImageFile(file);
        }
      },
      "image/jpeg",
      0.95,
    );
  };

  // OCR Processing Pipeline
  const processImageFile = async (file: File) => {
    stopCameraStream();

    try {
      if (scanMode === "passport") {
        setCleanPassportFile(file);
        setIsProcessing(true);
        setOcrProgress({
          status: "Preprocessing image...",
          progress: 0.05,
          percentage: 5,
          stage: "preprocessing",
          message: "Optimizing contrast and sharpening text for OCR...",
        });

        const preprocessed = await preprocessImage(file, {
          createMrzCrop: true,
          mrzZoneHeightRatio: 0.35,
          contrastBoost: 48,
        });

        const result = await parsePassportImage(
          preprocessed.mrzCropCanvas,
          preprocessed.fullCanvas,
          (prog) => setOcrProgress(prog),
        );

        setExtractedData(result);
        setIsProcessing(false);
        setShowSummaryDrawer(true);
      } else {
        // NID Mode
        if (nidStep === "front") {
          setCleanNidFrontFile(file);
          setIsProcessing(true);
          setOcrProgress({
            status: "Preprocessing NID front...",
            progress: 0.05,
            percentage: 5,
            stage: "preprocessing",
            message: "Optimizing image...",
          });

          const preprocessed = await preprocessImage(file, {
            createMrzCrop: false,
            contrastBoost: 45,
          });

          setNidFrontCanvas(preprocessed.fullCanvas);
          setIsProcessing(false);
          setNidStep("back");
          toast.info("Front side captured! You can now scan or upload the back side for address auto-fill, or skip directly.");
        } else {
          // NID Back side
          setCleanNidBackFile(file);
          setIsProcessing(true);
          setOcrProgress({
            status: "Preprocessing NID back side...",
            progress: 0.05,
            percentage: 5,
            stage: "preprocessing",
            message: "Optimizing back side image...",
          });

          const preprocessed = await preprocessImage(file, {
            createMrzCrop: false,
            contrastBoost: 45,
          });

          if (nidFrontCanvas) {
            const result = await parseNidImages(
              nidFrontCanvas,
              preprocessed.fullCanvas,
              (prog) => setOcrProgress(prog),
            );
            setExtractedData(result);
            setIsProcessing(false);
            setShowSummaryDrawer(true);
          }
        }
      }
    } catch (err: unknown) {
      setIsProcessing(false);
      setOcrProgress(null);
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`OCR Extraction error: ${msg}`);
    }
  };

  const handleSkipBackSide = async () => {
    if (!nidFrontCanvas) return;

    setIsProcessing(true);
    try {
      const result = await parseNidImages(
        nidFrontCanvas,
        undefined,
        (prog) => setOcrProgress(prog),
      );
      setExtractedData(result);
      setIsProcessing(false);
      setShowSummaryDrawer(true);
    } catch (err: unknown) {
      setIsProcessing(false);
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`OCR error: ${msg}`);
    }
  };

  const handleApplyToForm = (
    answers: Record<string, string>,
    fieldMeta: Record<string, FieldMetaItem>,
    files: { passport?: File; nidFront?: File; nidBack?: File },
  ) => {
    setAnswersBulk(answers, fieldMeta);

    if (files.passport) {
      storeScannedFileInMemory("passport", files.passport);
      setScannedDocAvailable("passport", true);
    }
    if (files.nidFront) {
      storeScannedFileInMemory("nidFront", files.nidFront);
      setScannedDocAvailable("nidFront", true);
    }
    if (files.nidBack) {
      storeScannedFileInMemory("nidBack", files.nidBack);
      setScannedDocAvailable("nidBack", true);
    }

    setShowSummaryDrawer(false);
    onClose();
    handleReset();

    const count = Object.keys(answers).length;
    toast.success(`Auto-filled ${count} fields from your scanned document!`);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-6 backdrop-blur-xs animate-in fade-in-0 duration-200">
        <div className="relative flex max-h-[94vh] w-full max-w-4xl flex-col rounded-3xl border border-slate-200/90 bg-white shadow-2xl overflow-hidden">
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 bg-white px-5 sm:px-7 py-4 gap-3">
            <div className="flex items-center gap-3">
              {/* System Logo */}
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100 p-1.5 shadow-xs">
                <Image
                  src="/logo.png"
                  alt="IGL Logo"
                  width={36}
                  height={36}
                  className="h-full w-full object-contain"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Document Auto-Fill Center
                  </h2>
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200/60">
                    v2.4 Smart OCR
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Extract and verify machine-readable zone credentials instantaneously
                </p>
              </div>
            </div>

            {/* Right Header Controls: Mode pill & Encrypted badge */}
            <div className="flex items-center gap-2.5 sm:self-center">
              {/* Document Mode Toggle */}
              <div className="flex items-center rounded-xl bg-slate-100/90 p-1 border border-slate-200/70">
                <button
                  type="button"
                  onClick={() => handleModeChange("passport")}
                  disabled={isProcessing}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    scanMode === "passport"
                      ? "bg-white text-blue-700 shadow-xs border border-blue-200/60"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Passport (MRP/e-Pass)
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange("nid")}
                  disabled={isProcessing}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    scanMode === "nid"
                      ? "bg-white text-blue-700 shadow-xs border border-blue-200/60"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  National ID Card
                </button>
              </div>

              {/* Browser-Only Encrypted badge */}
              <div className="hidden lg:flex items-center gap-1.5 rounded-full bg-emerald-50/80 px-3 py-1 text-[11px] font-semibold text-emerald-800 border border-emerald-200/60">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Browser-Only Encrypted
              </div>

              {/* Close Button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClose}
                disabled={isProcessing}
                className="h-8 w-8 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Modal Main Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Live Progress View */}
            {isProcessing && ocrProgress && (
              <div className="flex min-h-[340px] flex-col items-center justify-center gap-4 text-center p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Sparkles className="h-7 w-7 animate-spin" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <p className="text-base font-bold text-slate-900">
                    {ocrProgress.status}
                  </p>
                  <p className="text-xs text-slate-500">
                    {ocrProgress.message}
                  </p>
                </div>
                <div className="w-full max-w-xs space-y-1">
                  <Progress value={ocrProgress.percentage} className="h-2.5" />
                  <p className="text-right text-[11px] font-semibold text-slate-500">
                    {ocrProgress.percentage}%
                  </p>
                </div>
              </div>
            )}

            {!isProcessing && (
              <>
                {/* NID Back Side Prompt Banner */}
                {scanMode === "nid" && nidStep === "back" && (
                  <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs">
                    <div className="space-y-0.5">
                      <p className="font-bold text-blue-900">
                        NID Front Side Captured!
                      </p>
                      <p className="text-blue-700">
                        Scan or upload the back side now to auto-fill your Bengali address, or skip directly.
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleSkipBackSide}
                      className="bg-blue-700 text-white font-semibold hover:bg-blue-800"
                    >
                      Skip &amp; Auto-fill
                    </Button>
                  </div>
                )}

                {/* 2-Column Exact Grid (Webcam Scanner Left, Manual File Upload Right on Desktop; Stacked on Mobile) */}
                <div className="flex flex-col-reverse md:grid md:grid-cols-2 gap-4 sm:gap-5">
                  {/* LEFT CARD: Webcam Scanner (Dark) */}
                  <div className="flex flex-col justify-between rounded-2xl bg-[#0f172a] p-4 sm:p-5 text-white border border-slate-800 shadow-lg min-h-[360px] sm:min-h-[410px]">
                    <div>
                      {/* Card Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4 text-blue-400" />
                          <h3 className="text-sm font-bold text-slate-100">
                            Webcam Scanner
                          </h3>
                        </div>
                        <span className="flex items-center gap-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          Recommended
                        </span>
                      </div>

                      {/* Optical Detect & FPS bar */}
                      <div className="flex items-center justify-between pt-2.5 pb-2 text-[10px] font-mono text-slate-400">
                        <span className="flex items-center gap-1.5 text-emerald-400 font-semibold tracking-wider uppercase">
                          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                          OPTICAL DETECT • ACTIVE
                        </span>
                        <span>FPS: 30 • 1080p</span>
                      </div>

                      {/* Dark Framing Box / Video Viewfinder */}
                      <div className="relative aspect-[1.38/1] w-full rounded-xl bg-[#090e17] border border-slate-800 overflow-hidden flex flex-col items-center justify-between p-3 my-2">
                        {/* Live Video Stream when active */}
                        {isCameraActive ? (
                          <>
                            <video
                              ref={videoRef}
                              playsInline
                              autoPlay
                              muted
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                            {/* Live Corner brackets overlay */}
                            <div className="pointer-events-none absolute inset-2.5 border border-dashed border-white/50 rounded-lg">
                              <div className="absolute -top-1 -left-1 h-5 w-5 border-t-2 border-l-2 border-cyan-400" />
                              <div className="absolute -top-1 -right-1 h-5 w-5 border-t-2 border-r-2 border-cyan-400" />
                              <div className="absolute -bottom-1 -left-1 h-5 w-5 border-b-2 border-l-2 border-cyan-400" />
                              <div className="absolute -bottom-1 -right-1 h-5 w-5 border-b-2 border-r-2 border-cyan-400" />
                            </div>
                            {/* Flip camera control */}
                            <button
                              type="button"
                              onClick={toggleCameraFacing}
                              className="absolute top-2 right-2 z-10 rounded-full bg-slate-900/80 p-1.5 text-white hover:bg-slate-800"
                              title="Flip Camera"
                            >
                              <FlipHorizontal className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          /* Inactive Mockup Framing Viewfinder (Matches Provided Design Image) */
                          <>
                            {/* 4 Cyan Corner Brackets */}
                            <div className="pointer-events-none absolute inset-3">
                              <div className="absolute top-0 left-0 h-5 w-5 border-t-2 border-l-2 border-cyan-400" />
                              <div className="absolute top-0 right-0 h-5 w-5 border-t-2 border-r-2 border-cyan-400" />
                              <div className="absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-cyan-400" />
                              <div className="absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-cyan-400" />
                            </div>

                            {/* Upper Passport Page Graphic */}
                            <div className="flex w-full items-center justify-between px-3 pt-2 gap-3">
                              {/* Photo placeholder */}
                              <div className="flex h-16 w-13 shrink-0 flex-col items-center justify-center rounded-md border border-slate-700 bg-slate-800/80 text-slate-400">
                                <div className="h-5 w-5 rounded-full border border-slate-500" />
                                <span className="mt-1 text-[8px] font-bold tracking-wider">PHOTO</span>
                              </div>

                              {/* Text Skeleton Bars */}
                              <div className="flex-1 space-y-1.5">
                                <div className="h-2 w-3/4 rounded-full bg-slate-700/60" />
                                <div className="h-2 w-full rounded-full bg-slate-700/60" />
                                <div className="h-2 w-5/6 rounded-full bg-slate-700/60" />
                                <div className="h-2 w-2/3 rounded-full bg-slate-700/60" />
                              </div>
                            </div>

                            {/* Center Positioning Guide Pill */}
                            <div className="my-auto z-10">
                              <span className="rounded-full bg-slate-900/90 border border-slate-700 px-3 py-1 text-[11px] font-medium text-slate-300 shadow-md">
                                ⛶ Position {scanMode === "passport" ? "passport page" : "NID card"} within guide
                              </span>
                            </div>

                            {/* Bottom MRZ Strip Mockup */}
                            <div className="w-full rounded-md bg-[#13233c] border border-blue-500/40 p-1.5 font-mono text-[9px] text-blue-300 tracking-wider">
                              <p className="truncate">P&lt;UTOERIKSSON&lt;&lt;ANNA&lt;MARIA&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</p>
                              <p className="truncate">L898902C36UT07408122F1204159ZE184226B&lt;&lt;&lt;&lt;10</p>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Viewfinder Sub-text */}
                      <div className="flex items-center justify-between text-[11px] pt-1 pb-2">
                        <span className="flex items-center gap-1 text-emerald-400 font-medium">
                          <Sparkles className="h-3 w-3" />
                          Auto-captures when aligned
                        </span>
                        <span className="font-mono text-slate-400 text-[10px]">
                          MRZ Zone Ready
                        </span>
                      </div>
                    </div>

                    {/* Camera Button & Security Note */}
                    <div className="pt-2 space-y-2">
                      {isCameraActive ? (
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={captureCameraFrame}
                            className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/30 text-xs sm:text-sm"
                          >
                            <Camera className="mr-2 h-4 w-4" />
                            Snap Photo Now
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={stopCameraStream}
                            className="h-11 rounded-xl border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          onClick={() => startCamera(cameraFacing)}
                          disabled={isCameraStarting}
                          className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/30 text-xs sm:text-sm transition-all"
                        >
                          {isCameraStarting ? (
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Camera className="mr-2 h-4 w-4" />
                          )}
                          Start {scanMode === "passport" ? "Laptop Webcam" : "Camera"} Scanner
                        </Button>
                      )}

                      {cameraError && (
                        <p className="text-center text-[11px] text-amber-400 font-medium">
                          {cameraError}
                        </p>
                      )}

                      <p className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
                        <Lock className="h-3 w-3" />
                        Camera feed never leaves your local hardware
                      </p>
                    </div>
                  </div>

                  {/* RIGHT CARD: Manual File Upload (Light) */}
                  <div className="flex flex-col justify-between rounded-2xl bg-slate-50/70 p-4 sm:p-5 border border-slate-200/90 shadow-xs min-h-[360px] sm:min-h-[410px]">
                    <div>
                      {/* Card Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                            <UploadCloud className="h-3.5 w-3.5" />
                          </div>
                          <h3 className="text-sm font-bold text-slate-900">
                            Manual File Upload
                          </h3>
                        </div>
                        <span className="rounded-full bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                          High Accuracy
                        </span>
                      </div>

                      {/* Hidden File Input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) processImageFile(file);
                        }}
                      />

                      {/* Dashed Drag & Drop Box */}
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragging(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) processImageFile(file);
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`my-3 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 sm:p-5 text-center cursor-pointer transition-all ${
                          isDragging
                            ? "border-blue-600 bg-blue-50/70"
                            : "border-blue-200 bg-white hover:border-blue-300 hover:bg-blue-50/20"
                        }`}
                      >
                        {/* Blue Cloud Icon in rounded circle */}
                        <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-blue-100/70 text-blue-600">
                          <UploadCloud className="h-6 w-6" />
                        </div>

                        <p className="text-sm font-bold text-slate-800">
                          Drag and drop document file
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          or click to browse your local folders
                        </p>

                        {/* Format badges */}
                        <div className="mt-3 flex flex-wrap items-center justify-center gap-1 text-[10px] text-slate-500 font-medium">
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 font-bold text-slate-600">JPG</span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 font-bold text-slate-600">PNG</span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 font-bold text-slate-600">PDF</span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 font-bold text-slate-600">HEIC</span>
                          <span className="text-slate-400 pl-1">• Up to 25MB</span>
                        </div>
                      </div>

                      {/* AUTO-EXTRACTED CREDENTIALS Checklist */}
                      <div className="pt-1">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 pb-2">
                          <span>AUTO-EXTRACTED CREDENTIALS</span>
                          <span className="normal-case text-slate-400 font-normal">Ready for document</span>
                        </div>

                        <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-xs text-slate-700">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span className="font-medium">Full Legal Name</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span className="font-medium">Passport / NID No.</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span className="font-medium">Date of Birth &amp; Expiry</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span className="font-medium">Nationality &amp; Gender</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Browse Files Button */}
                    <div className="pt-4">
                      <Button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-11 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold border border-blue-200/70 shadow-xs text-xs sm:text-sm"
                      >
                        <FolderOpen className="mr-2 h-4 w-4" />
                        Browse Files
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Modal Footer Bar */}
          <div className="border-t border-slate-100 bg-slate-50/80 px-5 sm:px-7 py-3 space-y-2">
            {/* Quick Tip Alert Bar */}
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50/90 border border-emerald-200/80 px-3.5 py-2 text-xs text-emerald-900">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <p>
                <strong className="font-bold">Quick Tip:</strong> Ensure all 4 corners of the document are visible without reflection or glare.
              </p>
            </div>

            {/* Bottom Row */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-slate-400" />
                Zero AI Cloud Retention Guarantee
              </span>
              <button
                type="button"
                onClick={onClose}
                className="font-bold text-blue-700 hover:text-blue-800 hover:underline cursor-pointer"
              >
                Enter Manually
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Post-scan Summary Drawer */}
      <ScanSummaryDrawer
        isOpen={showSummaryDrawer}
        extracted={extractedData}
        cleanFile={scanMode === "passport" ? cleanPassportFile : cleanNidFrontFile}
        cleanBackFile={cleanNidBackFile}
        availableFields={availableFields}
        onApply={handleApplyToForm}
        onDiscard={() => {
          setShowSummaryDrawer(false);
          handleReset();
        }}
      />
    </>
  );
}
