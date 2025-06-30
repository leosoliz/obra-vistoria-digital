
import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Camera, X, RotateCcw } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (photo: { file: File; preview: string; legenda: string }) => void;
  onClose: () => void;
  latitude?: number;
  longitude?: number;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;

    reader.readAsDataURL(blob);
  });
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error("Erro ao converter para base64"));
      }
    };

    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}

function base64ToFile(base64: string, filename: string): File {
  const arr: string[] = base64.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);

  if (!mimeMatch) {
    throw new Error("Invalid base64 string");
  }

  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  const n = bstr.length;
  const u8arr = new Uint8Array(n);

  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }

  return new File([u8arr], filename, { type: mime });
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose, latitude, longitude }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
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
        aspectRatio: { ideal: 16 / 9 }
      },
      audio: false
    };
  };

  const formatLocationString = (lat: number, lng: number): string => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  const drawOverlay = useCallback(() => {
    if (!overlayCanvasRef.current || !videoRef.current) return;

    const canvas = overlayCanvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Ajustar o tamanho do canvas para corresponder ao vídeo
    canvas.width = video.videoWidth || video.clientWidth;
    canvas.height = video.videoHeight || video.clientHeight;

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Carregar e desenhar o logotipo
    const logo = new Image();
    logo.crossOrigin = 'anonymous';
    logo.src = '/lovable-uploads/216f61c9-3d63-4dfe-9f04-239b1cb9cd3b.png';
    logo.onload = () => {
      // Desenhar logotipo no canto superior esquerdo
      const logoSize = Math.min(canvas.width * 0.15, 120);
      ctx.drawImage(logo, 20, 300, logoSize, logoSize);
    };


    // Desenhar coordenadas GPS se disponíveis
    if (latitude && longitude) {
      const coordsText = `GPS: ${formatLocationString(latitude, longitude)}`;

      // Configurar estilo do texto
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(canvas.width - 210, canvas.height - 70, 200, 30);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '14px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(coordsText, canvas.width - 10, canvas.height - 50);
    }

    // Desenhar timestamp
    const now = new Date();
    const timestamp = now.toLocaleString('pt-BR');

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(canvas.width - 210, canvas.height - 35, 200, 30);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(timestamp, canvas.width - 10, canvas.height - 15);
  }, [latitude, longitude]);

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

        // Aguardar o vídeo carregar para começar a desenhar o overlay
        videoRef.current.onloadedmetadata = () => {
          const drawOverlayLoop = () => {
            drawOverlay();
            requestAnimationFrame(drawOverlayLoop);
          };
          drawOverlayLoop();
        };
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

          videoRef.current.onloadedmetadata = () => {
            const drawOverlayLoop = () => {
              drawOverlay();
              requestAnimationFrame(drawOverlayLoop);
            };
            drawOverlayLoop();
          };
        }

        setStream(fallbackStream);
        setFacingMode(facing);
      } catch (fallbackError) {
        console.error('Erro no fallback:', fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  }, [stream, drawOverlay]);

  const switchCamera = useCallback(() => {
    const newFacing = facingMode === 'user' ? 'environment' : 'user';
    startCamera(newFacing);
  }, [facingMode, startCamera]);

  const capturePhoto = useCallback(() => {
    console.log('Iniciando captura de foto...');
    console.log('videoRef.current:', !!videoRef.current);
    console.log('canvasRef.current:', !!canvasRef.current);
    console.log('overlayCanvasRef.current:', !!overlayCanvasRef.current);

    if (!videoRef.current || !canvasRef.current || !overlayCanvasRef.current) {
      console.error('Refs não disponíveis para captura');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      console.error('Contexto do canvas não disponível');
      return;
    }

    console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Desenhar o vídeo no canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Desenhar o overlay com logotipo e coordenadas por cima
    if (overlayCanvas.width > 0 && overlayCanvas.height > 0) {
      context.drawImage(overlayCanvas, 0, 0, canvas.width, canvas.height);
    }

    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.9);
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

    try {
      console.log('Convertendo base64 para file...');

      // Criar arquivo
      const file = base64ToFile(photo, `vistoria-${Date.now()}.jpg`);
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
        <canvas ref={overlayCanvasRef} className="hidden" />

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

        {/* Overlay canvas para logotipo e coordenadas */}
        <canvas
          ref={overlayCanvasRef}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Canvas para captura mantido sempre no DOM, mas escondido */}
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
