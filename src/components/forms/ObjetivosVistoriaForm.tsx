
/**
 * FORMULÁRIO DE OBJETIVOS DA VISTORIA
 * 
 * Componente responsável pela primeira etapa do formulário de vistoria.
 * Permite ao usuário selecionar os objetivos da vistoria através de checkboxes
 * e especificar outros objetivos personalizados.
 * 
 * Funcionalidades:
 * - Seleção múltipla de objetivos predefinidos
 * - Campo para especificar outros objetivos
 * - Autocompletar baseado em dados históricos
 * - Validação de pelo menos um objetivo selecionado
 * 
 * Importante: O objetivo "Atualização Cadastral" tem comportamento especial:
 * - Quando selecionado, torna todos os outros campos do formulário opcionais
 * - Preenche automaticamente o nome da obra como "Atualização Cadastral"
 */

// Importações de componentes UI
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AutocompleteInput } from "@/components/AutocompleteInput";

/**
 * INTERFACE DAS PROPS DO COMPONENTE
 * 
 * Define as propriedades necessárias para o funcionamento do formulário
 */
interface ObjetivosVistoriaFormProps {
  objetivoVistoria: string[];                                          // Array com objetivos selecionados
  handleObjetivoChange: (objetivo: string, checked: boolean) => void;  // Função para alterar seleção de objetivos
  outroObjetivo: string;                                               // Valor do campo "outro objetivo"
  setOutroObjetivo: (value: string) => void;                          // Função para alterar "outro objetivo"
  autocompleteData: any;                                               // Dados para autocompletar
}

/**
 * COMPONENTE PRINCIPAL DO FORMULÁRIO
 * 
 * Renderiza o formulário de objetivos da vistoria com checkboxes
 * para objetivos predefinidos e campo para outros objetivos
 */
export const ObjetivosVistoriaForm: React.FC<ObjetivosVistoriaFormProps> = ({
  objetivoVistoria,
  handleObjetivoChange,
  outroObjetivo,
  setOutroObjetivo,
  autocompleteData
}) => {
  /**
   * OBJETIVOS PREDEFINIDOS
   * 
   * Lista dos objetivos padrão disponíveis para seleção.
   * Ordem importa: "Atualização Cadastral" está em primeiro por ser especial
   */
  const objetivosPredefinidos = [
    "Atualização Cadastral",                    // Objetivo especial - torna campos opcionais
    "Início de Obra",                          // Vistoria para início dos trabalhos
    "Vistoria de Rotina",                      // Acompanhamento regular
    "Medição",                                 // Verificação de medições
    "Vistoria Técnica/Análise de Conformidade", // Análise técnica detalhada
    "Encerramento/Entrega da Obra"             // Finalização da obra
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Objetivos da Vistoria *</CardTitle>
      </CardHeader>
      <CardContent>
        {/* SEÇÃO DE OBJETIVOS PREDEFINIDOS */}
        <div className="space-y-3">
          {objetivosPredefinidos.map((objetivo) => (
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

        {/* SEÇÃO DE OUTROS OBJETIVOS */}
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
