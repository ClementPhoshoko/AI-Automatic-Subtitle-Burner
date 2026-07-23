-- ==========================================================================
-- MIGRATION: Add metadata columns and thumbnails bucket
-- Run this in the Supabase SQL Editor after the base schema.
-- ==========================================================================

-- 1. Add new columns to jobs table
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS original_filename text,
  ADD COLUMN IF NOT EXISTS file_size bigint,
  ADD COLUMN IF NOT EXISTS duration_seconds numeric,
  ADD COLUMN IF NOT EXISTS resolution text,
  ADD COLUMN IF NOT EXISTS thumbnail_url text;

-- 2. Create thumbnails storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Thumbnails bucket — anyone can upload/view/delete
CREATE POLICY "Public access — thumbnails"
  ON storage.objects FOR ALL
  USING (bucket_id = 'thumbnails')
  WITH CHECK (bucket_id = 'thumbnails');
