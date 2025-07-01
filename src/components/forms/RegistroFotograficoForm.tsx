
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera } from "lucide-react";

interface CapturedPhoto {
  file: File;
  preview: string;
  legenda: string;
}

interface RegistroFotograficoFormProps {
  fotos: CapturedPhoto[];
  onCapturarFoto: () => void;
}

export const RegistroFotograficoForm: React.FC<RegistroFotograficoFormProps> = ({
  fotos,
  onCapturarFoto
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Registro Fotográfico
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button
            type="button"
            onClick={onCapturarFoto}
            variant="outline"
            className="w-full"
          >
            <Camera className="w-4 h-4 mr-2" />
            Capturar Foto
          </Button>

          {fotos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {fotos.map((foto, index) => (
                <div key={index} className="space-y-2">
                  <img
                    src={foto.preview}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-24 object-cover rounded border"
                  />
                  <p className="text-xs text-gray-600 truncate">
                    {foto.legenda || `Foto ${index + 1}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
