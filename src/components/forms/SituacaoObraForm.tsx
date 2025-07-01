
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SituacaoObraFormProps {
  situacaoObra: string;
  setSituacaoObra: (value: string) => void;
  detalhesPendencias: string;
  setDetalhesPendencias: (value: string) => void;
}

export const SituacaoObraForm: React.FC<SituacaoObraFormProps> = ({
  situacaoObra,
  setSituacaoObra,
  detalhesPendencias,
  setDetalhesPendencias
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Situação da Obra</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="situacaoObra">Situação Encontrada *</Label>
          <Select value={situacaoObra} onValueChange={setSituacaoObra} required>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a situação da obra" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Em Conformidade">Em Conformidade</SelectItem>
              <SelectItem value="Com Pendências">Com Pendências</SelectItem>
              <SelectItem value="Irregularidades Graves">Irregularidades Graves</SelectItem>
              <SelectItem value="Paralisada">Paralisada</SelectItem>
              <SelectItem value="Finalizada">Finalizada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(situacaoObra === "Com Pendências" || situacaoObra === "Irregularidades Graves") && (
          <div>
            <Label htmlFor="detalhesPendencias">Detalhes das Pendências/Irregularidades</Label>
            <Textarea
              id="detalhesPendencias"
              value={detalhesPendencias}
              onChange={(e) => setDetalhesPendencias(e.target.value)}
              placeholder="Descreva as pendências ou irregularidades encontradas..."
              className="min-h-[80px]"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
