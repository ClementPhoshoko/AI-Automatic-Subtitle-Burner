-- ==========================================================================
-- SUPABASE SCHEMA — AI Automatic Subtitle Burner
-- Run this in the Supabase SQL Editor to bootstrap the project.
-- ==========================================================================

-- 0. EXTENSIONS
-- --------------------------------------------------------------------------
create extension if not exists "pgcrypto" schema "extensions";

-- ==========================================================================
-- 1. ENUMS
-- ==========================================================================

create type job_status as enum ('queued', 'processing', 'completed', 'failed');

create type subtitle_style as enum ('classic', 'tiktok', 'minimal', 'cinema', 'apple', 'netflix', 'youtube');

-- Migration if the type already exists:
-- alter type subtitle_style add value 'apple';
-- alter type subtitle_style add value 'netflix';
-- alter type subtitle_style add value 'youtube';

-- ==========================================================================
-- 2. TABLES
-- ==========================================================================

-- Stores every subtitle-processing job.
create table if not exists public.jobs (
  id                uuid        primary key default gen_random_uuid(),
  status            job_status  not null default 'queued',
  original_video_url text       not null,
  output_video_url   text,
  transcript_json    jsonb,
  subtitle_style    subtitle_style not null default 'classic',
  error_message     text,
  retry_count       integer     not null default 0 check (retry_count >= 0 and retry_count <= 5),
  created_at        timestamptz not null default now(),
  completed_at      timestamptz
);

-- ==========================================================================
-- 3. INDEXES
-- ==========================================================================

-- Speed up worker polling for queued jobs (oldest first).
create index if not exists idx_jobs_status_created
  on public.jobs (status, created_at asc)
  where status = 'queued';

-- Speed up dashboard listing (most recent first).
create index if not exists idx_jobs_created_desc
  on public.jobs (created_at desc);

-- ==========================================================================
-- 4. ROW-LEVEL SECURITY
-- ==========================================================================

alter table public.jobs enable row level security;

-- Public access policies (auth is a future enhancement).
-- When auth is added, replace these with user-specific policies.

create policy "Allow all select on jobs"
  on public.jobs for select using (true);

create policy "Allow all insert on jobs"
  on public.jobs for insert with check (true);

create policy "Allow all update on jobs"
  on public.jobs for update using (true) with check (true);

create policy "Allow all delete on jobs"
  on public.jobs for delete using (true);

-- ==========================================================================
-- 5. VIEWS
-- ==========================================================================

-- Dashboard summary — job counts grouped by status.
create or replace view public.job_summary as
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
create or replace view public.recent_jobs as
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

-- ==========================================================================
-- 6. HELPER FUNCTIONS
-- ==========================================================================

-- Create a new processing job and return it.
create or replace function public.create_job(
  p_original_video_url text,
  p_subtitle_style     subtitle_style default 'classic'
)
returns public.jobs
language sql
as $$
  insert into public.jobs (original_video_url, subtitle_style)
  values (p_original_video_url, p_subtitle_style)
  returning *;
$$;

-- Mark a job as processing.
create or replace function public.mark_job_processing(p_job_id uuid)
returns void
language sql
as $$
  update public.jobs
  set status = 'processing'
  where id = p_job_id and status = 'queued';
$$;

-- Mark a job as completed with its output details.
create or replace function public.complete_job(
  p_job_id          uuid,
  p_output_video_url text,
  p_transcript_json  jsonb
)
returns void
language sql
as $$
  update public.jobs
  set
    status            = 'completed',
    output_video_url  = p_output_video_url,
    transcript_json   = p_transcript_json,
    completed_at      = now()
  where id = p_job_id and status = 'processing';
$$;

-- Mark a job as failed with an error message and increment retry count.
create or replace function public.fail_job(
  p_job_id       uuid,
  p_error_message text
)
returns void
language sql
as $$
  update public.jobs
  set
    status        = 'failed',
    error_message = p_error_message,
    retry_count   = retry_count + 1
  where id = p_job_id and status = 'processing';
$$;

-- Re-queue a failed or stuck-processing job (called by worker for retry).
create or replace function public.requeue_job(p_job_id uuid)
returns void
language sql
as $$
  update public.jobs
  set
    status        = 'queued',
    error_message = null
  where id = p_job_id and status in ('failed', 'processing') and retry_count < 3;
$$;

-- Delete a job and return its video URLs (for storage cleanup).
create or replace function public.delete_job(p_job_id uuid)
returns table (original_url text, output_url text)
language sql
as $$
  delete from public.jobs where id = p_job_id
  returning original_video_url, output_video_url;
$$;

-- ==========================================================================
-- 7. STORAGE — BUCKETS & POLICIES
-- ==========================================================================

-- Create storage buckets (run separately if the dashboard is preferred).
insert into storage.buckets (id, name, public)
values
  ('uploads',   'uploads',   true),
  ('processed', 'processed', true)
on conflict (id) do nothing;

-- Uploads bucket — anyone can upload/view/delete.
create policy "Public access — uploads"
  on storage.objects for all
  using (bucket_id = 'uploads')
  with check (bucket_id = 'uploads');

-- Processed bucket — anyone can upload/view/delete.
create policy "Public access — processed"
  on storage.objects for all
  using (bucket_id = 'processed')
  with check (bucket_id = 'processed');

-- ==========================================================================
-- 8. TRIGGERS
-- ==========================================================================

-- Auto-set completed_at when status changes to completed.
create or replace function public.set_completed_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'completed' and old.status != 'completed' then
    new.completed_at = now();
  end if;
  return new;
end;
$$;

create trigger trg_jobs_set_completed_at
  before update on public.jobs
  for each row
  when (new.status = 'completed')
  execute function public.set_completed_at();

-- ==========================================================================
-- MIGRATION: Add metadata columns and storage buckets
-- Run this in the Supabase SQL Editor after the base schema.
-- ==========================================================================

-- 1. Add new columns to jobs table
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS original_filename text,
  ADD COLUMN IF NOT EXISTS file_size bigint,
  ADD COLUMN IF NOT EXISTS duration_seconds numeric,
  ADD COLUMN IF NOT EXISTS resolution text,
  ADD COLUMN IF NOT EXISTS thumbnail_url text;

-- 2. Ensure all storage buckets exist
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('uploads',    'uploads',    true),
  ('processed',  'processed',  true),
  ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Thumbnails bucket policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public access — thumbnails'
  ) THEN
    CREATE POLICY "Public access — thumbnails"
      ON storage.objects FOR ALL
      USING (bucket_id = 'thumbnails')
      WITH CHECK (bucket_id = 'thumbnails');
  END IF;
END $$;
