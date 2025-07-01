
import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, X, RotateCcw, Check } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (photo: { file: File; preview: string; legenda: string }) => void;
  onClose: () => void;
  latitude?: number;
  longitude?: number;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  onClose,
  latitude,
  longitude
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [legenda, setLegenda] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);

  const startCamera = async () => {
    try {
      console.log('Iniciando câmera...');
      
      // Para câmera traseira em dispositivos móveis
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
    }
  };

  const stopCamera = () => {
    console.log('Fechando câmera...');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    console.log('Iniciando captura de foto...');
    console.log('videoRef.current:', !!videoRef.current);
    console.log('canvasRef.current:', !!canvasRef.current);
    console.log('overlayCanvasRef.current:', !!overlayCanvasRef.current);
    
    if (!videoRef.current || !canvasRef.current || !overlayCanvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const overlayCtx = overlayCanvas.getContext('2d');

    if (!ctx || !overlayCtx) return;

    // Configurar dimensões do canvas baseado no vídeo
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    
    console.log('Video dimensions:', videoWidth, 'x', videoHeight);
    
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    overlayCanvas.width = videoWidth;
    overlayCanvas.height = videoHeight;

    // Desenhar o frame do vídeo
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight);

    // Desenhar overlay (logotipo e coordenadas)
    overlayCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    overlayCtx.fillRect(10, 10, 300, 80);

    // Logotipo
    const logo = new Image();
    logo.onload = () => {
      overlayCtx.drawImage(logo, 20, 20, 60, 60);
      
      // Texto
      overlayCtx.fillStyle = 'white';
      overlayCtx.font = '12px Arial';
      overlayCtx.fillText('PMPG - Planejamento Urbano', 70, 35);
      
      if (latitude && longitude) {
        overlayCtx.fillText(`GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`, 70, 55);
      }
      
      overlayCtx.fillText(`Data: ${new Date().toLocaleString('pt-BR')}`, 70, 75);

      // Combinar canvas principal com overlay
      ctx.drawImage(overlayCanvas, 0, 0);
      
      const dataURL = canvas.toDataURL('image/jpeg', 0.9);
      console.log('Foto capturada, tamanho do dataURL:', dataURL.length);
      setPhoto(dataURL);
      setIsCapturing(true);
      
      // Parar câmera após capturar
      stopCamera();
    };
    
    logo.src = '/lovable-uploads/b69256d9-aadd-4837-8726-b2ac0e97cc7e.png';
  };

  const retakePhoto = () => {
    console.log('Refazendo foto...');
    setPhoto(null);
    setIsCapturing(false);
    setLegenda('');
    // Reiniciar a câmera
    startCamera();
  };

  const confirmPhoto = () => {
    console.log('=== INÍCIO confirmPhoto ===');
    console.log('Estado atual - photo:', !!photo, 'legenda:', legenda);
    
    if (!photo) {
      console.log('Foto não disponível, saindo...');
      return;
    }

    console.log('Convertendo base64 para file...');
    
    // Converter base64 para File
    const arr = photo.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: mime });
    const file = new File([blob], `vistoria-${Date.now()}.jpg`, { type: mime });
    
    console.log('Arquivo criado:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    const photoData = {
      file: file,
      preview: photo,
      legenda: legenda
    };

    console.log('Chamando onCapture com dados:', {
      fileSize: photoData.file.size,
      fileName: photoData.file.name,
      legenda: photoData.legenda,
      previewLength: photoData.preview.length
    });

    onCapture(photoData);
    
    console.log('onCapture executado, limpando estado...');
    
    // Limpar estado e fechar
    setPhoto(null);
    setLegenda('');
    setIsCapturing(false);
  };

  useEffect(() => {
    if (!isCapturing && !photo) {
      startCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isCapturing, photo]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Capturar Foto</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {!photo ? (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                
                {/* Canvas ocultos para captura */}
                <canvas ref={canvasRef} className="hidden" />
                <canvas ref={overlayCanvasRef} className="hidden" />
                
                {/* Overlay visível durante o streaming */}
                <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white p-2 rounded text-xs max-w-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <img 
                      src="/lovable-uploads/b69256d9-aadd-4837-8726-b2ac0e97cc7e.png" 
                      alt="Logo" 
                      className="w-6 h-6"
                    />
                    <span className="font-semibold">Prefeitura de Presidente Getúlio</span>
                  </div>
                  {latitude && longitude && (
                    <div>GPS: {latitude.toFixed(6)}, {longitude.toFixed(6)}</div>
                  )}
                  <div>Data: {new Date().toLocaleString('pt-BR')}</div>
                </div>
              </div>

              <Button onClick={capturePhoto} className="w-full" size="lg">
                <Camera className="w-5 h-5 mr-2" />
                Capturar Foto
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={photo}
                  alt="Foto capturada"
                  className="w-full rounded-lg"
                />
              </div>

              <div>
                <Label htmlFor="legenda">Legenda da Foto</Label>
                <Input
                  id="legenda"
                  value={legenda}
                  onChange={(e) => setLegenda(e.target.value)}
                  placeholder="Adicione uma legenda..."
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={retakePhoto}
                  className="flex-1"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Tirar Novamente
                </Button>
                <Button
                  onClick={confirmPhoto}
                  className="flex-1"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Confirmar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
