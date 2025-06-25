
-- Criar tabela para os relatórios de vistoria
CREATE TABLE public.obra_vistorias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Identificação da obra
  nome_obra TEXT NOT NULL,
  localizacao TEXT NOT NULL,
  numero_contrato TEXT,
  empresa_responsavel TEXT,
  engenheiro_responsavel TEXT,
  fiscal_prefeitura TEXT,
  data_vistoria DATE NOT NULL,
  hora_vistoria TIME NOT NULL,
  
  -- Objetivo da vistoria
  objetivo_inicio_obra BOOLEAN DEFAULT false,
  objetivo_vistoria_rotina BOOLEAN DEFAULT false,
  objetivo_medicao BOOLEAN DEFAULT false,
  objetivo_vistoria_tecnica BOOLEAN DEFAULT false,
  objetivo_encerramento BOOLEAN DEFAULT false,
  objetivo_outros TEXT,
  
  -- Descrição das atividades
  descricao_atividades TEXT NOT NULL,
  
  -- Situação da obra
  situacao_conformidade BOOLEAN DEFAULT false,
  situacao_pendencias BOOLEAN DEFAULT false,
  situacao_irregularidades BOOLEAN DEFAULT false,
  situacao_paralisada BOOLEAN DEFAULT false,
  situacao_finalizada BOOLEAN DEFAULT false,
  detalhes_pendencias TEXT,
  
  -- Recomendações
  recomendacoes TEXT,
  
  -- Assinaturas
  fiscal_nome TEXT,
  fiscal_matricula TEXT,
  fiscal_assinatura TEXT, -- base64 da assinatura digital
  representante_nome TEXT,
  representante_cargo TEXT,
  representante_assinatura TEXT, -- base64 da assinatura digital
  
  -- Metadados
  status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'finalizado', 'enviado')),
  user_id UUID REFERENCES auth.users(id)
);

-- Criar tabela para as fotos das vistorias
CREATE TABLE public.vistoria_fotos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  vistoria_id UUID REFERENCES public.obra_vistorias(id) ON DELETE CASCADE,
  arquivo_url TEXT NOT NULL, -- URL do arquivo no Supabase Storage
  legenda TEXT NOT NULL,
  ordem INTEGER DEFAULT 1,
  tamanho_arquivo INTEGER,
  tipo_arquivo TEXT
);

-- Criar bucket para armazenar as fotos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vistoria-fotos',
  'vistoria-fotos',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.obra_vistorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vistoria_fotos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para obra_vistorias
CREATE POLICY "Usuários podem ver suas próprias vistorias" 
  ON public.obra_vistorias 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias vistorias" 
  ON public.obra_vistorias 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias vistorias" 
  ON public.obra_vistorias 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias vistorias" 
  ON public.obra_vistorias 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas RLS para vistoria_fotos
CREATE POLICY "Usuários podem ver fotos de suas vistorias" 
  ON public.vistoria_fotos 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.obra_vistorias 
      WHERE id = vistoria_fotos.vistoria_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem inserir fotos em suas vistorias" 
  ON public.vistoria_fotos 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.obra_vistorias 
      WHERE id = vistoria_fotos.vistoria_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem atualizar fotos de suas vistorias" 
  ON public.vistoria_fotos 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.obra_vistorias 
      WHERE id = vistoria_fotos.vistoria_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem deletar fotos de suas vistorias" 
  ON public.vistoria_fotos 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.obra_vistorias 
      WHERE id = vistoria_fotos.vistoria_id 
      AND user_id = auth.uid()
    )
  );

-- Políticas para o bucket de storage
CREATE POLICY "Usuários podem fazer upload de fotos" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'vistoria-fotos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuários podem ver suas próprias fotos" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'vistoria-fotos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuários podem deletar suas próprias fotos" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'vistoria-fotos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Habilitar realtime para as tabelas
ALTER TABLE public.obra_vistorias REPLICA IDENTITY FULL;
ALTER TABLE public.vistoria_fotos REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.obra_vistorias;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vistoria_fotos;

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at na tabela obra_vistorias
CREATE TRIGGER update_obra_vistorias_updated_at 
  BEFORE UPDATE ON public.obra_vistorias 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
