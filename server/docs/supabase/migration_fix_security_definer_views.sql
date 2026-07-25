-- Fix: Recreate views without SECURITY DEFINER
-- These views were created with SECURITY DEFINER which is a security risk.
-- Drop and recreate them so they use the querying user's permissions.

drop view if exists public.recent_jobs;
drop view if exists public.job_summary;

-- Dashboard summary — job counts grouped by status.
create or replace view public.job_summary
with (security_invoker = true) as
select
  status,
  count(*)                       as count,
  count(*) filter (
    where created_at >= now() - interval '24 hours'
  )                              as last_24h
from public.jobs
group by status
order by status;

-- Recent jobs for the dashboard table.
create or replace view public.recent_jobs
with (security_invoker = true) as
select
  id,
  status,
  subtitle_style,
  original_video_url,
  output_video_url,
  created_at,
  completed_at
from public.jobs
order by created_at desc
limit 50;
