import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, RefreshCw, CheckCircle, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface FaceCaptureProps {
    onCapture: (image: string) => void;
    onRetake: () => void;
    status: 'idle' | 'capturing' | 'verifying' | 'verified' | 'error';
    errorMessage?: string;
}

export function FaceCapture({ onCapture, onRetake, status, errorMessage }: FaceCaptureProps) {
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let stream: MediaStream | null = null;

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setHasPermission(true);
                }
            } catch (err) {
                console.error("Camera access denied:", err);
                setHasPermission(false);
            }
        };

        if (status === 'idle' && !capturedImage) {
            startCamera();
        }

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [status, capturedImage]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (context) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const image = canvas.toDataURL('image/jpeg', 0.8);
                setCapturedImage(image);
                onCapture(image);
            }
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
        onRetake();
    };

    if (status === 'verified') {
        return (
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center p-8 bg-green-500/10 border border-green-500/30 rounded-xl"
            >
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                    <ShieldCheck className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-green-500 mb-1">Identity Verified</h3>
                <p className="text-muted-foreground text-sm">Face verification successful.</p>
            </motion.div>
        );
    }

    if (capturedImage || status === 'verifying' || status === 'error') {
        return (
            <div className="relative rounded-xl overflow-hidden bg-black/50 aspect-video flex items-center justify-center border-2 border-primary/20">
                {capturedImage && (
                    <img src={capturedImage} alt="Captured" className="absolute inset-0 w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10" />

                <div className="z-20 text-center w-full px-4">
                    {status === 'verifying' ? (
                        <>
                            <RefreshCw className="h-10 w-10 text-primary animate-spin mx-auto mb-3" />
                            <p className="text-primary font-mono text-sm">Verifying with AI Vision...</p>
                        </>
                    ) : status === 'error' ? (
                        <div className="flex flex-col items-center">
                            <AlertCircle className="h-10 w-10 text-destructive mb-3" />
                            <p className="text-destructive font-medium mb-1">Verification Failed</p>
                            <p className="text-white/70 text-xs mb-4">{errorMessage || "Could not verify face."}</p>
                            <Button variant="outline" size="sm" onClick={handleRetake}>
                                Try Again
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <CheckCircle className="h-10 w-10 text-primary mb-3" />
                            <p className="text-white font-medium mb-4">Image Captured</p>
                            <Button variant="outline" size="sm" onClick={handleRetake}>
                                Retake Photo
                            </Button>
                        </div>
                    )}
                </div>

                {status === 'verifying' && (
                    <motion.div
                        className="absolute top-0 left-0 w-full h-1 bg-primary/50 z-30 shadow-[0_0_20px_rgba(34,211,238,0.5)]"
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/30">
                {hasPermission === false ? (
                    <div className="text-center p-4">
                        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
                        <p className="text-destructive font-bold">Camera Access Denied</p>
                        <p className="text-muted-foreground text-xs mt-1">Please enable camera access to verify.</p>
                    </div>
                ) : (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
                        />
                        <canvas ref={canvasRef} className="hidden" />
                        {/* Face Guide Overlay */}
                        <div className="absolute inset-0 border-[30px] border-black/40 rounded-[50%] scale-75 pointer-events-none z-10" />
                    </>
                )}
            </div>

            <Button
                onClick={handleCapture}
                className="w-full"
                variant="secondary"
                disabled={hasPermission === false}
            >
                <Camera className="mr-2 h-4 w-4" />
                Capture Selfie
            </Button>
        </div>
    );
}
