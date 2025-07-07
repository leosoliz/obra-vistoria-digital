
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AutocompleteInput } from "@/components/AutocompleteInput";
import { Users } from "lucide-react";

interface AssinaturasFormProps {
  fiscalNome: string;
  setFiscalNome: (value: string) => void;
  representanteNome: string;
  setRepresentanteNome: (value: string) => void;
  representanteCargo: string;
  setRepresentanteCargo: (value: string) => void;
  autocompleteData: any;
  isOnline: boolean;
}

export const AssinaturasForm: React.FC<AssinaturasFormProps> = ({
  fiscalNome,
  setFiscalNome,
  representanteNome,
  setRepresentanteNome,
  representanteCargo,
  setRepresentanteCargo,
  autocompleteData,
  isOnline
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Assinaturas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="fiscalNome">Nome do Fiscal *</Label>
          <Input
            id="fiscalNome"
            value={fiscalNome}
            onChange={(e) => setFiscalNome(e.target.value)}
            placeholder="Nome completo do fiscal"
            className={isOnline ? "bg-gray-50" : ""}
            readOnly={isOnline}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {isOnline ? "Preenchido automaticamente com seu nome" : "Campo habilitado para edição (modo offline)"}
          </p>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AutocompleteInput
            label="Nome do Representante da Obra"
            value={representanteNome}
            onChange={setRepresentanteNome}
            suggestions={autocompleteData.representantes_nome}
            placeholder="Nome do representante"
            required
          />

          <AutocompleteInput
            label="Cargo do Representante"
            value={representanteCargo}
            onChange={setRepresentanteCargo}
            suggestions={autocompleteData.representantes_cargo}
            placeholder="Cargo do representante"
            required
          />
        </div>
      </CardContent>
    </Card>
  );
};
