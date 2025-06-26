
import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, X, RotateCcw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
    // Configurações específicas para iOS e outros dispositivos
    const baseConstraints = {
      video: {
        facingMode: facing,
        width: { ideal: 1920, max: 1920 },
        height: { ideal: 1080, max: 1080 },
        aspectRatio: { ideal: 16/9 }
      },
      audio: false
    };

    // Para dispositivos iOS, adicionar configurações específicas
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      return {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          aspectRatio: { ideal: 16/9 },
          // Configurações específicas para iOS
          frameRate: { ideal: 30, max: 30 }
        },
        audio: false
      };
    }

    return baseConstraints;
  };

  const startCamera = useCallback(async (facing: 'user' | 'environment' = 'environment') => {
    setIsLoading(true);
    try {
      // Parar stream anterior se existir
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints = getMediaConstraints(facing);
      console.log('Tentando acessar câmera com constraints:', constraints);

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      
      setStream(mediaStream);
      setFacingMode(facing);
      
      toast({
        title: "Câmera ativada",
        description: "Câmera pronta para capturar foto"
      });
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      
      let errorMessage = 'Erro ao acessar a câmera';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Permissão para acessar a câmera foi negada. Verifique as configurações do navegador.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'Nenhuma câmera foi encontrada no dispositivo.';
        } else if (error.name === 'NotSupportedError') {
          errorMessage = 'Câmera não é suportada neste navegador.';
        } else if (error.name === 'OverconstrainedError') {
          errorMessage = 'Configurações da câmera não são suportadas. Tentando configuração alternativa...';
          
          // Tentar configuração mais simples
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
            
            toast({
              title: "Câmera ativada",
              description: "Câmera ativada com configuração alternativa"
            });
            setIsLoading(false);
            return;
          } catch (fallbackError) {
            console.error('Erro no fallback:', fallbackError);
          }
        }
      }
      
      toast({
        title: "Erro na câmera",
        description: errorMessage,
        variant: "destructive"
      });
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

    // Definir tamanho do canvas baseado no vídeo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Desenhar o frame atual do vídeo no canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Converter para base64
    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setPhoto(photoDataUrl);

    toast({
      title: "Foto capturada",
      description: "Adicione uma legenda e confirme"
    });
  }, []);

  const confirmPhoto = useCallback(() => {
    if (!photo) return;

    // Converter base64 para Blob e depois para File
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

      // Limpar e fechar
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
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="flex justify-between items-center p-4 bg-black">
          <Button onClick={retakePhoto} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            Tirar Novamente
          </Button>
          <Button onClick={handleClose} variant="outline" size="sm">
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-4">
          <img src={photo} alt="Foto capturada" className="max-w-full max-h-full object-contain" />
        </div>
        
        <div className="p-4 bg-black space-y-4">
          <div>
            <Label htmlFor="legenda" className="text-white">Legenda da foto</Label>
            <Input
              id="legenda"
              value={legenda}
              onChange={(e) => setLegenda(e.target.value)}
              placeholder="Descreva a foto..."
              className="mt-2"
            />
          </div>
          <Button onClick={confirmPhoto} className="w-full" size="lg">
            Confirmar Foto
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex justify-between items-center p-4 bg-black">
        <Button onClick={switchCamera} variant="outline" size="sm" disabled={isLoading}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Trocar Câmera
        </Button>
        <Button onClick={handleClose} variant="outline" size="sm">
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex-1 relative">
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
      
      <div className="p-6 bg-black">
        <Button 
          onClick={capturePhoto} 
          disabled={isLoading}
          className="w-full" 
          size="lg"
        >
          <Camera className="w-6 h-6 mr-2" />
          Capturar Foto
        </Button>
      </div>
    </div>
  );
};
