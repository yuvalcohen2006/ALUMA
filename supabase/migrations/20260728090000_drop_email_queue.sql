-- Remove the email queue.
--
-- The original setup pushed every auth email through a pgmq queue drained by a
-- pg_cron job every 5 seconds, which called an edge function that read a
-- service-role key out of Vault. Two pieces of that (email_queue_wake and
-- email_queue_dispatch) were never captured as migrations, so a fresh project
-- could never reproduce it — that gap is what broke `db push`.
--
-- Auth emails now go straight out through Resend from the auth-email-hook
-- function. Sending directly is what Supabase documents, it removes six moving
-- parts, and it gets password-reset emails to people immediately instead of up
-- to five seconds later.
--
-- KEPT: public.email_send_log (audit trail of every send attempt),
-- public.suppressed_emails and public.email_unsubscribe_tokens (bounce and
-- unsubscribe handling are still meaningful).
--
-- Every statement is guarded: this must apply cleanly both to the old project
-- (where all of it exists) and to a fresh one (where none of it does).

-- 1. Stop the scheduler first, so nothing fires mid-teardown.
DO $$ BEGIN
  PERFORM cron.unschedule('process-email-queue');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 2. Drop the out-of-band cron callbacks.
DROP FUNCTION IF EXISTS public.email_queue_wake();
DROP FUNCTION IF EXISTS public.email_queue_dispatch();

-- 3. Drop the pgmq RPC wrappers the edge function used to reach the queues.
DROP FUNCTION IF EXISTS public.enqueue_email(text, jsonb);
DROP FUNCTION IF EXISTS public.read_email_batch(text, integer, integer);
DROP FUNCTION IF EXISTS public.delete_email(text, bigint);
DROP FUNCTION IF EXISTS public.move_to_dlq(text, text, bigint, jsonb);

-- 4. Drop the queues themselves, including their dead-letter queues.
DO $$
DECLARE q text;
BEGIN
  FOREACH q IN ARRAY ARRAY[
    'auth_emails',
    'transactional_emails',
    'auth_emails_dlq',
    'transactional_emails_dlq'
  ] LOOP
    BEGIN
      PERFORM pgmq.drop_queue(q);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END LOOP;
END $$;

-- 5. Drop the Vault secret that held a service-role key for the cron job.
--    Nothing reads it now, and a stray copy of that key is a liability.
DO $$ BEGIN
  DELETE FROM vault.secrets WHERE name = 'email_queue_service_role_key';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 6. The rate-limit/throughput knobs only ever fed the queue worker.
DROP TABLE IF EXISTS public.email_send_state;

-- Extensions (pgmq, pg_cron, pg_net, supabase_vault) are intentionally left
-- installed. They are harmless when unused, and dropping pg_net in particular
-- can cascade into unrelated Supabase internals.
