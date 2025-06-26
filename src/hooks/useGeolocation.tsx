
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface GeolocationData {
  latitude: number | null;
  longitude: number | null;
  isLoading: boolean;
  error: string | null;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<GeolocationData>({
    latitude: null,
    longitude: null,
    isLoading: false,
    error: null
  });

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalização não é suportada pelo navegador'));
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutos
      };

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => {
          let errorMessage = 'Erro ao obter localização';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permissão de localização negada';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Localização indisponível';
              break;
            case error.TIMEOUT:
              errorMessage = 'Tempo limite para obter localização';
              break;
          }
          reject(new Error(errorMessage));
        },
        options
      );
    });
  };

  const requestLocation = async () => {
    setLocation(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      setLocation({
        latitude,
        longitude,
        isLoading: false,
        error: null
      });

      toast({
        title: "Localização obtida",
        description: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
      });

      return { latitude, longitude };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setLocation(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));

      toast({
        title: "Erro de Geolocalização",
        description: errorMessage,
        variant: "destructive"
      });

      return null;
    }
  };

  const formatLocationString = (lat: number, lng: number): string => {
    return `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
  };

  return {
    ...location,
    requestLocation,
    formatLocationString
  };
};
