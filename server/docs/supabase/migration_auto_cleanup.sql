-- ==========================================================================
-- MIGRATION: Auto-cleanup jobs and storage files after 2 hours
-- Run this in the Supabase SQL Editor.
-- ==========================================================================

-- 1. Enable pg_cron (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Create the cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_expired_jobs()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  job_record RECORD;
  upload_name text;
BEGIN
  FOR job_record IN
    SELECT id, original_video_url, output_video_url, thumbnail_url
    FROM public.jobs
    WHERE created_at < now() - interval '2 hours'
  LOOP
    -- Delete uploaded source file
    IF job_record.original_video_url IS NOT NULL THEN
      upload_name := regexp_replace(job_record.original_video_url, '^.+/uploads/', '');
      DELETE FROM storage.objects
      WHERE bucket_id = 'uploads' AND name = upload_name;
    END IF;

    -- Delete processed output file
    DELETE FROM storage.objects
    WHERE bucket_id = 'processed'
      AND name = 'job_' || job_record.id || '_processed.mp4';

    -- Delete thumbnail
    DELETE FROM storage.objects
    WHERE bucket_id = 'thumbnails'
      AND name = 'thumb_' || job_record.id || '.jpg';

    -- Delete the job record
    DELETE FROM public.jobs WHERE id = job_record.id;
  END LOOP;
END;
$$;

-- 3. Schedule the cleanup to run every 10 minutes
SELECT cron.schedule(
  'cleanup-expired-jobs',
  '*/10 * * * *',
  'SELECT public.cleanup_expired_jobs()'
);
