# Documentação do Usuário - Sistema de Vistoria de Obras

## Visão Geral

O Sistema de Vistoria de Obras é uma aplicação web desenvolvida para facilitar o registro e controle de vistorias em obras públicas. O sistema permite que fiscais e técnicos registrem informações detalhadas sobre as obras, incluindo fotografias, localização GPS, situação atual e objetivos da vistoria.

## Funcionalidades Principais

### 1. Autenticação
- Sistema de login seguro com email e senha
- Criação de conta para novos usuários
- Recuperação de senha
- Sessão persistente

### 2. Criação de Vistoria
O processo de criação de vistoria é dividido em etapas:

#### Etapa 1: Objetivos da Vistoria
- **Vistoria de Rotina**: Vistoria regular de acompanhamento
- **Vistoria Técnica**: Avaliação técnica específica
- **Medição**: Verificação de medições e quantitativos
- **Início de Obra**: Registro do início dos trabalhos
- **Encerramento**: Finalização da obra
- **Atualização Cadastral**: Atualização de dados cadastrais
- **Outros**: Permite especificar outros objetivos

**Importante**: Quando "Atualização Cadastral" é selecionado, todos os campos do formulário se tornam opcionais e o nome da obra é automaticamente preenchido como "Atualização Cadastral".

#### Etapa 2: Identificação da Obra
- **Nome da Obra**: Identificação da obra (obrigatório, exceto para atualização cadastral)
- **Localização**: Endereço completo da obra (obrigatório, exceto para atualização cadastral)
- **Número do Contrato**: Número do contrato relacionado (opcional)
- **Empresa Responsável**: Nome da empresa executora (opcional)
- **Engenheiro Responsável**: Nome do engenheiro responsável (opcional)

#### Etapa 3: Situação da Obra
- **Em Conformidade**: Obra está seguindo as especificações
- **Com Irregularidades**: Identificadas irregularidades
- **Paralisada**: Obra está paralisada
- **Finalizada**: Obra foi concluída
- **Com Pendências**: Existem pendências a serem resolvidas

Se "Com Pendências" for selecionado, um campo adicional aparece para detalhar as pendências.

#### Etapa 4: Registro Fotográfico
- Upload de múltiplas imagens
- Captura de fotos diretamente pelo dispositivo
- Adição de legendas para cada foto
- Visualização das imagens antes do envio
- Organização automática por ordem de upload

#### Etapa 5: Assinaturas
- **Fiscal**: Nome, matrícula, prefeitura e espaço para assinatura
- **Representante da Obra**: Nome, cargo e espaço para assinatura
- Captura de assinaturas digitais
- Validação de campos obrigatórios

### 3. Listagem de Vistorias
- Visualização de todas as vistorias criadas
- Informações resumidas: data, obra, localização, situação
- Busca e filtros por data, obra, situação
- Acesso rápido aos detalhes de cada vistoria

### 4. Visualização de Vistoria
- Exibição completa de todos os dados da vistoria
- Galeria de fotos com legendas
- Informações de geolocalização
- Dados das assinaturas
- Opção de geração de relatório PDF

### 5. Geração de Relatórios
- Relatório completo em PDF
- Inclui todas as informações da vistoria
- Fotos organizadas com legendas
- Assinaturas digitais
- Dados de geolocalização

## Como Usar

### Fazendo Login
1. Acesse a aplicação
2. Insira seu email e senha
3. Clique em "Entrar"
4. Se não tiver conta, clique em "Criar conta"

### Criando uma Nova Vistoria
1. Na página inicial, clique em "Nova Vistoria"
2. Siga as etapas em ordem:
   - Selecione os objetivos da vistoria
   - Preencha os dados da obra
   - Informe a situação atual
   - Adicione fotos com legendas
   - Colete as assinaturas
3. Clique em "Finalizar Vistoria"

### Visualizando Vistorias
1. Acesse "Minhas Vistorias"
2. Clique na vistoria desejada
3. Visualize todos os detalhes
4. Gere relatório PDF se necessário

### Dicas Importantes
- Mantenha o GPS ativado para capturar a localização
- Tire fotos claras e bem legendadas
- Preencha todos os campos obrigatórios
- Verifique as informações antes de finalizar
- Para atualização cadastral, apenas os objetivos são obrigatórios

## Requisitos Técnicos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexão com a internet
- Câmera para captura de fotos (opcional)
- GPS para localização (opcional)

## Suporte
Em caso de dúvidas ou problemas, entre em contato com o suporte técnico.