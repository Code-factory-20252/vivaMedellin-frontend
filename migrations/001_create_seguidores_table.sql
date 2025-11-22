-- Migration: Create seguidores table for follow/unfollow functionality
-- Description: This table stores relationships between users (followers/following)
-- Date: 2025-11-22

-- Create seguidores table
CREATE TABLE IF NOT EXISTS public.seguidores (
  id_seguidor uuid NOT NULL,
  id_seguido uuid NOT NULL,
  creado_en timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT seguidores_pkey PRIMARY KEY (id_seguidor, id_seguido),
  CONSTRAINT seguidores_id_seguido_fkey FOREIGN KEY (id_seguido) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT seguidores_id_seguidor_fkey FOREIGN KEY (id_seguidor) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT check_no_self_follow CHECK ((id_seguidor <> id_seguido))
) TABLESPACE pg_default;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_seguidores_seguidor ON public.seguidores USING btree (id_seguidor) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_seguidores_seguido ON public.seguidores USING btree (id_seguido) TABLESPACE pg_default;

-- Enable Row Level Security (RLS)
ALTER TABLE public.seguidores ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all follow relationships
CREATE POLICY "Allow users to view follow relationships" ON public.seguidores
  FOR SELECT
  USING (true);

-- Policy: Users can only create follow relationships for themselves
CREATE POLICY "Users can follow others" ON public.seguidores
  FOR INSERT
  WITH CHECK (auth.uid() = id_seguidor);

-- Policy: Users can only delete their own follow relationships
CREATE POLICY "Users can unfollow others" ON public.seguidores
  FOR DELETE
  USING (auth.uid() = id_seguidor);

-- Grant permissions
GRANT ALL ON public.seguidores TO authenticated;
GRANT SELECT ON public.seguidores TO anon;
