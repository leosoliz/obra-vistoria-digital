# Documentação do Desenvolvedor - Sistema de Vistoria de Obras

## Visão Geral da Arquitetura

O Sistema de Vistoria de Obras é uma aplicação web moderna construída com as seguintes tecnologias:

### Stack Tecnológico
- **Frontend**: React 18 com TypeScript
- **Build Tool**: Vite
- **Estilização**: Tailwind CSS
- **Componentes**: Shadcn/UI
- **Roteamento**: React Router DOM
- **Formulários**: React Hook Form com Zod
- **Estado**: React Query (TanStack Query)
- **Backend**: Supabase (BaaS)
- **Autenticação**: Supabase Auth
- **Banco de Dados**: PostgreSQL (Supabase)
- **Armazenamento**: Supabase Storage
- **PWA**: Service Worker para funcionalidade offline

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base do Shadcn/UI
│   ├── forms/          # Formulários específicos
│   ├── CameraCapture.tsx
│   ├── MobileMenu.tsx
│   └── AutocompleteInput.tsx
├── hooks/              # Hooks customizados
│   ├── useAuth.tsx
│   ├── useVistoria.tsx
│   ├── useGeolocation.tsx
│   ├── useOfflineStorage.tsx
│   └── outros...
├── pages/              # Páginas da aplicação
│   ├── Index.tsx       # Página principal (Nova Vistoria)
│   ├── Auth.tsx        # Página de autenticação
│   ├── VistoriasList.tsx
│   ├── VistoriaView.tsx
│   └── NotFound.tsx
├── integrations/       # Integrações externas
│   └── supabase/
│       ├── client.ts
│       └── types.ts
├── utils/              # Utilitários
│   ├── pdfGenerator.ts
│   └── outros...
├── lib/                # Configurações de bibliotecas
│   └── utils.ts
├── App.tsx             # Componente raiz
├── main.tsx            # Ponto de entrada
└── index.css           # Estilos globais
```

## Banco de Dados

### Tabelas Principais

#### `obra_vistorias`
Tabela principal que armazena as informações das vistorias:

```sql
CREATE TABLE obra_vistorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  nome_obra TEXT NOT NULL,
  localizacao TEXT NOT NULL,
  data_vistoria DATE NOT NULL,
  hora_vistoria TIME NOT NULL,
  numero_contrato TEXT,
  empresa_responsavel TEXT,
  engenheiro_responsavel TEXT,
  -- Objetivos da vistoria
  objetivo_vistoria_rotina BOOLEAN DEFAULT false,
  objetivo_vistoria_tecnica BOOLEAN DEFAULT false,
  objetivo_medicao BOOLEAN DEFAULT false,
  objetivo_inicio_obra BOOLEAN DEFAULT false,
  objetivo_encerramento BOOLEAN DEFAULT false,
  objetivo_atualizacao_cadastral BOOLEAN DEFAULT false,
  objetivo_outros TEXT,
  -- Situação da obra
  situacao_conformidade BOOLEAN DEFAULT false,
  situacao_irregularidades BOOLEAN DEFAULT false,
  situacao_paralisada BOOLEAN DEFAULT false,
  situacao_finalizada BOOLEAN DEFAULT false,
  situacao_pendencias BOOLEAN DEFAULT false,
  detalhes_pendencias TEXT,
  -- Dados da vistoria
  descricao_atividades TEXT NOT NULL,
  recomendacoes TEXT,
  -- Assinaturas
  fiscal_nome TEXT,
  fiscal_matricula TEXT,
  fiscal_prefeitura TEXT,
  fiscal_assinatura TEXT,
  representante_nome TEXT,
  representante_cargo TEXT,
  representante_assinatura TEXT,
  -- Geolocalização
  latitude DECIMAL,
  longitude DECIMAL,
  -- Metadados
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `vistoria_fotos`
Tabela para armazenar as fotos das vistorias:

```sql
CREATE TABLE vistoria_fotos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vistoria_id UUID REFERENCES obra_vistorias(id) ON DELETE CASCADE,
  arquivo_url TEXT NOT NULL,
  legenda TEXT NOT NULL,
  ordem INTEGER,
  tipo_arquivo TEXT,
  tamanho_arquivo INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `profiles`
Tabela para dados adicionais dos usuários:

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  user_type TEXT NOT NULL,
  location TEXT,
  location_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Fluxo de Autenticação

### Implementação
- Utiliza Supabase Auth para autenticação
- Hook `useAuth` gerencia o estado de autenticação
- Proteção de rotas com componentes `ProtectedRoute` e `PublicRoute`
- Persistência de sessão automática

### Fluxo de Login
1. Usuário insere credenciais
2. Supabase Auth valida e retorna sessão
3. Hook `useAuth` atualiza estado global
4. Usuário é redirecionado para página protegida

## Gerenciamento de Estado

### React Query
- Cache automático de dados
- Invalidação inteligente
- Retry automático em caso de falha
- Estados de loading/error

### Hooks Customizados
- `useVistoria`: Gerencia dados de vistoria individual
- `useVistorias`: Lista todas as vistorias
- `useVistoriaDetails`: Detalhes de uma vistoria específica
- `useGeolocation`: Captura localização GPS
- `useOfflineStorage`: Armazenamento offline

## Formulários

### Validação com Zod
```typescript
const vistoriaSchema = z.object({
  nomeObra: z.string().min(1, "Nome da obra é obrigatório"),
  localizacao: z.string().min(1, "Localização é obrigatória"),
  dataVistoria: z.string().min(1, "Data é obrigatória"),
  // ... outros campos
});
```

### Validação Condicional
Para atualização cadastral, os campos se tornam opcionais:

```typescript
const isAtualizacaoCadastral = objetivos.includes('Atualização Cadastral');

const schemaCondicional = isAtualizacaoCadastral 
  ? baseSchema.partial() 
  : baseSchema;
```

## Captura de Fotos

### Implementação
- Componente `CameraCapture` para captura via câmera
- Upload direto para Supabase Storage
- Redimensionamento automático
- Validação de formato e tamanho

### Fluxo de Upload
1. Usuário seleciona/captura imagem
2. Imagem é processada e redimensionada
3. Upload para Supabase Storage
4. URL salva no banco de dados
5. Associação com vistoria

## Geolocalização

### Implementação
- Hook `useGeolocation` para captura GPS
- Permissões solicitadas automaticamente
- Fallback para casos sem GPS
- Armazenamento de coordenadas no banco

## Geração de PDF

### Implementação
- Biblioteca jsPDF
- Incluí todas as informações da vistoria
- Fotos embutidas no PDF
- Formatação profissional

### Processo
1. Coleta dados da vistoria
2. Carrega imagens como base64
3. Gera PDF com layout estruturado
4. Disponibiliza para download

## Funcionalidade Offline

### Service Worker
- Cache de recursos estáticos
- Estratégia cache-first
- Atualização automática
- Notificação de nova versão

### Armazenamento Local
- LocalStorage para dados temporários
- Sincronização quando online
- Detecção de estado de rede

## Componentes Principais

### `Index.tsx` - Página Principal
- Formulário multi-etapa
- Validação condicional
- Gerenciamento de estado complexo
- Navegação entre etapas

### `VistoriasList.tsx` - Lista de Vistorias
- Listagem paginada
- Filtros e busca
- Cards responsivos
- Navegação para detalhes

### `VistoriaView.tsx` - Visualização
- Exibição completa de dados
- Galeria de imagens
- Geração de PDF
- Interface responsiva

## Estilização

### Tailwind CSS
- Design system configurado
- Tokens semânticos
- Modo escuro/claro
- Componentes responsivos

### Shadcn/UI
- Componentes base customizados
- Variantes para diferentes contextos
- Acessibilidade integrada
- Consistência visual

## Testes

### Estratégia de Testes
- Testes unitários para hooks
- Testes de integração para componentes
- Testes end-to-end para fluxos principais
- Mocking de APIs externas

## Deploy

### Processo de Deploy
1. Build da aplicação com Vite
2. Upload para Lovable hosting
3. Configuração de domínio
4. Configuração de variáveis de ambiente

### Variáveis de Ambiente
- `VITE_SUPABASE_URL`: URL do projeto Supabase
- `VITE_SUPABASE_ANON_KEY`: Chave pública do Supabase

## Monitoramento

### Logs
- Console logs para debug
- Error tracking
- Performance monitoring
- User analytics

### Métricas
- Tempo de carregamento
- Taxa de erro
- Uso de recursos
- Conversão de formulários

## Segurança

### Row Level Security (RLS)
- Políticas de acesso por usuário
- Isolamento de dados
- Validação server-side
- Auditoria de acesso

### Validação
- Sanitização de inputs
- Validação de tipos
- Proteção contra XSS
- Rate limiting

## Manutenção

### Atualizações
- Dependências atualizadas regularmente
- Migrations de banco documentadas
- Versionamento semântico
- Changelog detalhado

### Backup
- Backup automático do banco
- Backup de arquivos de mídia
- Estratégia de recuperação
- Testes de restore

## Extensibilidade

### Adicionando Novas Funcionalidades
1. Criar hook para lógica de negócio
2. Implementar componente de UI
3. Adicionar validação com Zod
4. Criar migração de banco se necessário
5. Atualizar tipos TypeScript
6. Documentar mudanças

### Padrões de Código
- Componentes funcionais com hooks
- TypeScript strict mode
- Nomes descritivos
- Comentários em código complexo
- Separação de responsabilidades

## Performance

### Otimizações
- Lazy loading de componentes
- Memoização de cálculos pesados
- Debounce em inputs de busca
- Compressão de imagens
- Cache de queries

### Métricas
- First Contentful Paint
- Largest Contentful Paint
- Time to Interactive
- Bundle size analysis