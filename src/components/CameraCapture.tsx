
import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Camera, X, RotateCcw } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (photo: { file: File; preview: string; legenda: string }) => void;
  onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [legenda, setLegenda] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const getMediaConstraints = (facing: 'user' | 'environment') => {
    return {
      video: {
        facingMode: { ideal: facing },
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
        aspectRatio: { ideal: 16/9 }
      },
      audio: false
    };
  };

  const startCamera = useCallback(async (facing: 'user' | 'environment' = 'environment') => {
    setIsLoading(true);
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints = getMediaConstraints(facing);
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      
      setStream(mediaStream);
      setFacingMode(facing);
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      // Tentativa com configuração simplificada
      try {
        const simpleConstraints = {
          video: { facingMode: facing },
          audio: false
        };
        const fallbackStream = await navigator.mediaDevices.getUserMedia(simpleConstraints);
        
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.play();
        }
        
        setStream(fallbackStream);
        setFacingMode(facing);
      } catch (fallbackError) {
        console.error('Erro no fallback:', fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  }, [stream]);

  const switchCamera = useCallback(() => {
    const newFacing = facingMode === 'user' ? 'environment' : 'user';
    startCamera(newFacing);
  }, [facingMode, startCamera]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setPhoto(photoDataUrl);
  }, []);

  const confirmPhoto = useCallback(() => {
    if (!photo) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;

      const file = new File([blob], `vistoria-${Date.now()}.jpg`, {
        type: 'image/jpeg',
        lastModified: Date.now()
      });

      onCapture({
        file,
        preview: photo,
        legenda: legenda || 'Foto da vistoria'
      });

      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      onClose();
    }, 'image/jpeg', 0.8);
  }, [photo, legenda, onCapture, onClose, stream]);

  const retakePhoto = useCallback(() => {
    setPhoto(null);
    setLegenda('');
  }, []);

  const handleClose = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onClose();
  }, [stream, onClose]);

  React.useEffect(() => {
    startCamera();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  if (photo) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col safe-area-inset">
        <div className="flex justify-between items-center p-4 bg-black min-h-[60px]">
          <Button onClick={retakePhoto} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            Tirar Novamente
          </Button>
          <Button onClick={handleClose} variant="outline" size="sm">
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
          <img 
            src={photo} 
            alt="Foto capturada" 
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
        
        <div className="p-4 bg-black space-y-4 min-h-[140px]">
          <Card className="p-4">
            <Label htmlFor="legenda" className="text-sm font-medium">
              Legenda da foto
            </Label>
            <Input
              id="legenda"
              value={legenda}
              onChange={(e) => setLegenda(e.target.value)}
              placeholder="Descreva a foto..."
              className="mt-2"
            />
          </Card>
          <Button onClick={confirmPhoto} className="w-full" size="lg">
            Confirmar Foto
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col safe-area-inset">
      <div className="flex justify-between items-center p-4 bg-black min-h-[60px]">
        <Button onClick={switchCamera} variant="outline" size="sm" disabled={isLoading}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Trocar Câmera
        </Button>
        <Button onClick={handleClose} variant="outline" size="sm">
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-lg">Carregando câmera...</div>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-black min-h-[100px] flex items-center justify-center">
        <Button 
          onClick={capturePhoto} 
          disabled={isLoading}
          className="w-20 h-20 rounded-full p-0" 
          size="lg"
        >
          <Camera className="w-8 h-8" />
        </Button>
      </div>
    </div>
  );
};
