
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
    console.log('Iniciando captura de foto...');
    console.log('videoRef.current:', !!videoRef.current);
    console.log('canvasRef.current:', !!canvasRef.current);
    
    if (!videoRef.current || !canvasRef.current) {
      console.error('Refs não disponíveis para captura');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      console.error('Contexto do canvas não disponível');
      return;
    }

    console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const photoDataUrl = canvas.toDataURL();
    console.log('Foto capturada, tamanho do dataURL:', photoDataUrl.length);
    setPhoto(photoDataUrl);
  }, []);

  const confirmPhoto = useCallback(async () => {
    console.log('=== INÍCIO confirmPhoto ===');
    console.log('Estado atual - photo:', !!photo, 'canvas:', !!canvasRef.current, 'legenda:', legenda);
    
    if (!photo || !canvasRef.current) {
      console.error('Dados necessários não disponíveis para confirmação');
      console.log('photo exists:', !!photo);
      console.log('canvasRef.current exists:', !!canvasRef.current);
      return;
    }

    const canvas = canvasRef.current;
    console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
    
    try {
      console.log('Convertendo canvas para blob...');
      
      // Converter canvas para blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            console.log('Blob criado com sucesso, tamanho:', blob.size);
            resolve(blob);
          } else {
            console.error('Falha ao criar blob');
            reject(new Error('Erro ao converter canvas para blob'));
          }
        });
      });

      // Criar arquivo
      const file = new File([blob], `vistoria-${Date.now()}.png`, {
        type: 'image/png',
        lastModified: Date.now()
      });

      console.log('Arquivo criado:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      const photoData = {
        file,
        preview: photo,
        legenda: legenda || 'Foto da vistoria'
      };

      console.log('Chamando onCapture com dados:', {
        fileSize: photoData.file.size,
        fileName: photoData.file.name,
        legenda: photoData.legenda,
        previewLength: photoData.preview.length
      });

      // Chamar callback com os dados da foto
      onCapture(photoData);

      console.log('onCapture executado, parando stream...');

      // Parar stream da câmera
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      console.log('Fechando modal...');
      // Fechar modal
      onClose();
    } catch (error) {
      console.error('Erro ao confirmar foto:', error);
    }
  }, [photo, legenda, onCapture, onClose, stream]);

  const retakePhoto = useCallback(() => {
    console.log('Refazendo foto...');
    setPhoto(null);
    setLegenda('');
  }, []);

  const handleClose = useCallback(() => {
    console.log('Fechando câmera...');
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onClose();
  }, [stream, onClose]);

  React.useEffect(() => {
    console.log('Iniciando câmera...');
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
        
        {/* Canvas mantido sempre no DOM, mas escondido */}
        <canvas ref={canvasRef} className="hidden" />
        
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
          <Button 
            onClick={confirmPhoto} 
            className="w-full" 
            size="lg"
            disabled={isLoading}
          >
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
          <RotateCcw className="w-4 w-4 mr-2" />
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
        
        {/* Canvas mantido sempre no DOM, mas escondido */}
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
