-- Auto-purge cron job for files in trash older than 30 days.
-- Apply this once in the Supabase SQL editor for the production project.
-- It schedules a daily HTTP POST to the purge-files edge function, authenticated
-- with a dedicated CRON_SECRET (stored both in Supabase Vault and in the edge
-- function's environment).
--
-- Prereqs (one-time):
--   1. Vault must contain two secrets:
--        - name: 'project_url'   value: https://<project-ref>.supabase.co
--        - name: 'cron_secret'   value: <any strong random string>
--      Add them via Dashboard → Project Settings → Vault → New secret.
--   2. The edge function must have CRON_SECRET set with the same value:
--        supabase secrets set CRON_SECRET=<same value> --project-ref <ref>
--      (or Dashboard → Edge Functions → Manage secrets).
--   3. Extensions pg_cron and pg_net enabled (Dashboard → Database → Extensions).

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net  with schema extensions;

-- Drop any previous schedule with the same name so this file is idempotent.
select cron.unschedule('cloudsyncpro-auto-purge-trash')
where exists (
  select 1 from cron.job where jobname = 'cloudsyncpro-auto-purge-trash'
);

-- Run every day at 03:15 UTC.
select cron.schedule(
  'cloudsyncpro-auto-purge-trash',
  '15 3 * * *',
  $$
  select net.http_post(
    url      := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
                || '/functions/v1/purge-files',
    headers  := jsonb_build_object(
      'Content-Type',   'application/json',
      'X-Cron-Secret',  (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
    ),
    body     := jsonb_build_object('mode', 'auto_purge'),
    timeout_milliseconds := 60000
  );
  $$
);

-- Inspect:
--   select * from cron.job where jobname = 'cloudsyncpro-auto-purge-trash';
--   select * from cron.job_run_details
--     where jobid = (select jobid from cron.job where jobname = 'cloudsyncpro-auto-purge-trash')
--     order by start_time desc limit 10;
