
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AutocompleteInput } from "@/components/AutocompleteInput";
import { FileText, MapPin, AlertCircle } from "lucide-react";

interface IdentificacaoObraFormProps {
  nomeObra: string;
  setNomeObra: (value: string) => void;
  localizacao: string;
  setLocalizacao: (value: string) => void;
  numeroContrato: string;
  setNumeroContrato: (value: string) => void;
  empresaResponsavel: string;
  setEmpresaResponsavel: (value: string) => void;
  engenheiroResponsavel: string;
  setEngenheiroResponsavel: (value: string) => void;
  fiscalPrefeitura: string;
  setFiscalPrefeitura: (value: string) => void;
  dataVistoria: string;
  setDataVistoria: (value: string) => void;
  horaVistoria: string;
  setHoraVistoria: (value: string) => void;
  autocompleteData: any;
  latitude?: number;
  longitude?: number;
  locationError: string | null;
  formatLocationString: (lat: number, lng: number) => string;
  isOnline: boolean;
  onContractSelect?: (numeroContrato: string) => void;
}

export const IdentificacaoObraForm: React.FC<IdentificacaoObraFormProps> = ({
  nomeObra,
  setNomeObra,
  localizacao,
  setLocalizacao,
  numeroContrato,
  setNumeroContrato,
  empresaResponsavel,
  setEmpresaResponsavel,
  engenheiroResponsavel,
  setEngenheiroResponsavel,
  fiscalPrefeitura,
  setFiscalPrefeitura,
  dataVistoria,
  setDataVistoria,
  horaVistoria,
  setHoraVistoria,
  autocompleteData,
  latitude,
  longitude,
  locationError,
  formatLocationString,
  isOnline,
  onContractSelect
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Identificação da Obra
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AutocompleteInput
            label="Nome da Obra"
            value={nomeObra}
            onChange={setNomeObra}
            suggestions={autocompleteData.nomes_obra}
            placeholder="Digite o nome da obra"
            required
          />
          
          <div>
            <Label htmlFor="localizacao">Localização *</Label>
            <div className="relative">
              <Input
                id="localizacao"
                value={localizacao}
                onChange={(e) => setLocalizacao(e.target.value)}
                placeholder="Coordenadas GPS serão preenchidas automaticamente"
                required
              />
              {(latitude && longitude) && (
                <MapPin className="absolute right-3 top-3 w-4 h-4 text-green-600" />
              )}
            </div>
            {locationError && (
              <p className="text-sm text-amber-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Localização não disponível
              </p>
            )}
            {(latitude && longitude) && (
              <p className="text-xs text-green-600 mt-1">
                GPS ativo: {formatLocationString(latitude, longitude)}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AutocompleteInput
            label="Número do Contrato"
            value={numeroContrato}
            onChange={(value) => {
              setNumeroContrato(value);
              if (onContractSelect) {
                onContractSelect(value);
              }
            }}
            suggestions={autocompleteData.numeros_contrato}
            placeholder="Número do contrato"
            required
          />

          <AutocompleteInput
            label="Empresa Responsável"
            value={empresaResponsavel}
            onChange={setEmpresaResponsavel}
            suggestions={autocompleteData.empresas_responsavel}
            placeholder="Nome da empresa"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AutocompleteInput
            label="Engenheiro Responsável"
            value={engenheiroResponsavel}
            onChange={setEngenheiroResponsavel}
            suggestions={autocompleteData.engenheiros_responsavel}
            placeholder="Nome do engenheiro"
            required
          />

          <div>
            <Label htmlFor="fiscalPrefeitura">Fiscal da Prefeitura *</Label>
            <Input
              id="fiscalPrefeitura"
              value={fiscalPrefeitura}
              onChange={(e) => setFiscalPrefeitura(e.target.value)}
              placeholder="Nome do fiscal"
              className={isOnline ? "bg-gray-50" : ""}
              readOnly={isOnline}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {isOnline ? "Preenchido automaticamente com seu nome" : "Campo habilitado para edição (modo offline)"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dataVistoria">Data da Vistoria *</Label>
            <Input
              id="dataVistoria"
              type="date"
              value={dataVistoria}
              onChange={(e) => setDataVistoria(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="horaVistoria">Hora da Vistoria *</Label>
            <Input
              id="horaVistoria"
              type="time"
              value={horaVistoria}
              onChange={(e) => setHoraVistoria(e.target.value)}
              required
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
