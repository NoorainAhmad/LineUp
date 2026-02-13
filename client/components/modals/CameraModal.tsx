import React, { useRef, useState, useEffect } from "react";
import { X, Camera, RefreshCw, Check, SwitchCamera } from "lucide-react";

interface CameraModalProps {
  onClose: () => void;
  onCapture: (imageSrc: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    stopCamera(); // Ensure previous stream is closed before starting new one
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error("Camera error:", err);
      setError(
        "Unable to access camera. Please check permissions or try a different browser.",
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.pause();
    }
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Match canvas size to video resolution
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");
      if (context) {
        // Mirror horizontally if using user-facing camera (selfie)
        if (facingMode === "user") {
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
        }

        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageSrc = canvas.toDataURL("image/jpeg", 0.9);
        setCapturedImage(imageSrc);
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    // Re-attach stream to video element when returning to view
    // Since React re-renders and the <video> element is recreated/mounted,
    // we need to ensure the stream is attached.
    // However, useEffect doesn't run again if facingMode hasn't changed.
    // We can use a side effect here or simply ensure the stream is still valid.
    setTimeout(() => {
      if (videoRef.current && streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
    }, 0);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      // Close modal which triggers unmount cleanup
      stopCamera();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-black flex flex-col items-center justify-center animate-in fade-in duration-300">
      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-linear-to-b from-black/60 to-transparent">
        <span className="text-white font-medium drop-shadow-md">
          Take Photo
        </span>
        <button
          onClick={onClose}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Main Viewport */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black">
        {error ? (
          <div className="text-center p-8 text-white max-w-md">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
              <Camera size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Camera Access Denied</h3>
            <p className="text-white/70">{error}</p>
          </div>
        ) : (
          <>
            {!capturedImage ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === "user" ? "transform -scale-x-100" : ""}`}
              />
            ) : (
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-contain"
              />
            )}
            <canvas ref={canvasRef} className="hidden" />
          </>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-8 pb-12 flex items-center justify-center gap-8 bg-linear-to-t from-black/80 to-transparent z-10">
        {!error && (
          <>
            {!capturedImage ? (
              <div className="flex items-center gap-8">
                {/* Placeholder to balance layout if needed, or flash toggle */}
                <div className="w-12"></div>

                <button
                  onClick={handleCapture}
                  className="w-20 h-20 rounded-full border-4 border-white bg-white/20 flex items-center justify-center hover:bg-white/40 transition-all active:scale-95"
                >
                  <div className="w-16 h-16 rounded-full bg-white"></div>
                </button>

                <button
                  onClick={toggleCamera}
                  className="w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
                  title="Switch Camera"
                >
                  <SwitchCamera size={24} />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={handleRetake}
                  className="flex flex-col items-center gap-2 text-white hover:text-red-400 transition-colors"
                >
                  <div className="p-4 bg-white/10 rounded-full backdrop-blur-sm">
                    <RefreshCw size={24} />
                  </div>
                  <span className="text-xs font-medium uppercase tracking-wider shadow-black drop-shadow-md">
                    Retake
                  </span>
                </button>

                <button
                  onClick={handleConfirm}
                  className="w-20 h-20 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center shadow-lg shadow-primary/30 transition-all active:scale-95 text-white"
                >
                  <Check size={40} />
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
