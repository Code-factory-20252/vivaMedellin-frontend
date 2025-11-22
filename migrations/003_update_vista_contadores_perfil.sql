-- Migration: Update vista_contadores_perfil to include follower counts
-- Description: Ensures the view includes follower/following counts for user profiles
-- Date: 2025-11-22

-- Drop existing view if it exists
DROP VIEW IF EXISTS public.vista_contadores_perfil;

-- Create or replace the view with follower counts
CREATE OR REPLACE VIEW public.vista_contadores_perfil AS
SELECT 
  p.id AS id_usuario,
  p.email,
  p.nombre,
  p.username,
  -- Count followers (users following this profile)
  (SELECT COUNT(*) FROM public.seguidores WHERE id_seguido = p.id) AS total_seguidores,
  -- Count following (users this profile follows)
  (SELECT COUNT(*) FROM public.seguidores WHERE id_seguidor = p.id) AS total_siguiendo,
  -- Count favorite events
  (SELECT COUNT(*) FROM public.eventos_favoritos WHERE id_usuario = p.id) AS total_eventos_favoritos
FROM public.perfil p;

-- Grant permissions
GRANT SELECT ON public.vista_contadores_perfil TO authenticated;
GRANT SELECT ON public.vista_contadores_perfil TO anon;
