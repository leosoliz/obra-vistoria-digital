
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AutocompleteInput } from "@/components/AutocompleteInput";

interface ObjetivosVistoriaFormProps {
  objetivoVistoria: string[];
  handleObjetivoChange: (objetivo: string, checked: boolean) => void;
  outroObjetivo: string;
  setOutroObjetivo: (value: string) => void;
  autocompleteData: any;
}

export const ObjetivosVistoriaForm: React.FC<ObjetivosVistoriaFormProps> = ({
  objetivoVistoria,
  handleObjetivoChange,
  outroObjetivo,
  setOutroObjetivo,
  autocompleteData
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Objetivos da Vistoria *</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[
            "Atualização Cadastral",
            "Início de Obra",
            "Vistoria de Rotina", 
            "Medição",
            "Vistoria Técnica/Análise de Conformidade",
            "Encerramento/Entrega da Obra"
          ].map((objetivo) => (
            <div key={objetivo} className="flex items-center space-x-2">
              <Checkbox
                id={objetivo}
                checked={objetivoVistoria.includes(objetivo)}
                onCheckedChange={(checked) => handleObjetivoChange(objetivo, checked as boolean)}
              />
              <Label htmlFor={objetivo}>{objetivo}</Label>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <AutocompleteInput
            label="Outro objetivo (especificar)"
            value={outroObjetivo}
            onChange={setOutroObjetivo}
            suggestions={autocompleteData.outros_objetivos}
            placeholder="Especifique outro objetivo"
          />
        </div>
      </CardContent>
    </Card>
  );
};
