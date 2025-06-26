
-- Adicionar campos de latitude e longitude na tabela obra_vistorias
ALTER TABLE public.obra_vistorias 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);

-- Adicionar comentários para documentar os novos campos
COMMENT ON COLUMN public.obra_vistorias.latitude IS 'Latitude da localização da obra obtida via GPS';
COMMENT ON COLUMN public.obra_vistorias.longitude IS 'Longitude da localização da obra obtida via GPS';
