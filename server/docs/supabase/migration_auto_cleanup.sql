-- ==========================================================================
-- MIGRATION: Auto-cleanup expired jobs (after 2 hours)
-- Run this in the Supabase SQL Editor.
-- ==========================================================================

-- 1. Enable pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Cleanup function — deletes job rows only (storage files left as orphaned,
--    safe for low-traffic usage at 1-5 videos/day on free tier)
CREATE OR REPLACE FUNCTION public.cleanup_expired_jobs()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.jobs
  WHERE created_at < now() - interval '2 hours';
END;
$$;

-- 3. Schedule every 10 minutes
SELECT cron.schedule(
  'cleanup-expired-jobs',
  '*/10 * * * *',
  'SELECT public.cleanup_expired_jobs()'
);
