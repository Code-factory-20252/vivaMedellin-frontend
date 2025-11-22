-- Migration: Create functions and indexes for user search
-- Description: Adds text search capabilities for finding users by username or name
-- Date: 2025-11-22

-- Create a function to search users by username or name
CREATE OR REPLACE FUNCTION public.search_users(search_query text, limit_count integer DEFAULT 20)
RETURNS TABLE (
  id uuid,
  username text,
  nombre text,
  email text,
  avatar_url text,
  edad integer,
  ubicacion text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.nombre,
    p.email,
    p.avatar_url,
    p.edad,
    p.ubicacion
  FROM public.perfil p
  WHERE 
    p.verificado = true
    AND (
      p.username ILIKE '%' || search_query || '%'
      OR p.nombre ILIKE '%' || search_query || '%'
    )
  ORDER BY 
    -- Prioritize exact matches, then prefix matches, then contains
    CASE 
      WHEN p.username ILIKE search_query THEN 1
      WHEN p.nombre ILIKE search_query THEN 2
      WHEN p.username ILIKE search_query || '%' THEN 3
      WHEN p.nombre ILIKE search_query || '%' THEN 4
      ELSE 5
    END,
    p.username
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_perfil_username_search 
  ON public.perfil USING gin (username gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_perfil_nombre_search 
  ON public.perfil USING gin (nombre gin_trgm_ops);

-- Enable the pg_trgm extension if not already enabled (for trigram indexing)
-- This helps with partial text matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.search_users(text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_users(text, integer) TO anon;
