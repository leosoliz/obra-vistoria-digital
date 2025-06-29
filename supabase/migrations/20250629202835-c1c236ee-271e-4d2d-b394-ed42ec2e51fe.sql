
-- Habilitar RLS na tabela obra_vistorias
ALTER TABLE public.obra_vistorias ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas suas próprias vistorias
CREATE POLICY "Users can view their own vistorias" 
  ON public.obra_vistorias 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para permitir que usuários insiram suas próprias vistorias
CREATE POLICY "Users can insert their own vistorias" 
  ON public.obra_vistorias 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários atualizem suas próprias vistorias
CREATE POLICY "Users can update their own vistorias" 
  ON public.obra_vistorias 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Habilitar RLS na tabela vistoria_fotos
ALTER TABLE public.vistoria_fotos ENABLE ROW LEVEL SECURITY;

-- Política para fotos - permitir acesso através da vistoria
CREATE POLICY "Users can view photos of their own vistorias" 
  ON public.vistoria_fotos 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.obra_vistorias 
      WHERE obra_vistorias.id = vistoria_fotos.vistoria_id 
      AND obra_vistorias.user_id = auth.uid()
    )
  );

-- Política para inserir fotos
CREATE POLICY "Users can insert photos for their own vistorias" 
  ON public.vistoria_fotos 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.obra_vistorias 
      WHERE obra_vistorias.id = vistoria_fotos.vistoria_id 
      AND obra_vistorias.user_id = auth.uid()
    )
  );
