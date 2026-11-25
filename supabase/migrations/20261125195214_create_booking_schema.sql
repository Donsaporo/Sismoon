/*
# Create complete booking schema for Sister Moon hotel

## Purpose
Booking persistence layer for the Sister Moon hotel website.
All booking data is written by the lobby-proxy edge function using service_role.
The frontend never reads or writes these tables directly.

## 1. New Tables

### booking_requests
Audit trail of successful reservations synced with Lobby PMS.
- reservation_id (text, PK): public confirmation identifier.
- accommodation_id (text): selected room, villa, or glamping slug.
- check_in / check_out (date): stay dates.
- adults (integer, 1-12): number of adult guests.
- children_ages (jsonb, default []): ages of minor guests.
- plan_slug (text): selected rate plan.
- quote (jsonb): quote snapshot.
- guest (jsonb): contact details.
- status (text, default 'pending').
- created_at (timestamptz, default now()).
- lobby_reference (text, nullable): Lobby PMS booking ID.
- idempotency_key (text, unique, nullable): prevents duplicates.
- lobby_status (text, nullable): Lobby status.
- quote_version (integer, nullable).

### booking_quotes
Validated quotes from Lobby availability data.
- id (uuid, PK).
- quote_token (text, unique): opaque token for frontend.
- quote_context (jsonb): full validated quote.
- expires_at (timestamptz): 15-minute expiry.
- consumed_at (timestamptz, nullable).
- created_at (timestamptz).

### booking_attempts
Idempotency and attempt-tracking for booking creation.
- id (uuid, PK).
- idempotency_key (text, unique).
- payload_hash (text): SHA-256 of payload.
- status (text, default 'requested').
- lobby_booking_ids (integer[]).
- lobby_raw_response (jsonb, nullable).
- lobby_raw_status (text, nullable).
- quote_id (uuid, nullable, FK to booking_quotes).
- guest_info (jsonb, nullable).
- error_message (text, nullable).
- created_at (timestamptz).
- updated_at (timestamptz).

## 2. Security
- RLS enabled on all three tables.
- All privileges revoked from anon and authenticated.
- GRANT ALL to service_role only.
- No policies — backend-only tables, edge function is sole writer.

## 3. Important notes
- Safe to re-run: all IF NOT EXISTS.
- service_role bypasses RLS.
- Frontend communicates exclusively through lobby-proxy edge function.
*/

CREATE TABLE IF NOT EXISTS public.booking_requests (
  reservation_id text PRIMARY KEY,
  accommodation_id text NOT NULL,
  check_in date NOT NULL,
  check_out date NOT NULL,
  adults integer NOT NULL CHECK (adults > 0 AND adults <= 12),
  children_ages jsonb NOT NULL DEFAULT '[]'::jsonb,
  plan_slug text NOT NULL,
  quote jsonb NOT NULL,
  guest jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  lobby_reference text,
  idempotency_key text,
  lobby_status text,
  quote_version integer
);

ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS booking_requests_idempotency_key_key
  ON public.booking_requests (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

REVOKE SELECT ON public.booking_requests FROM anon, authenticated;
REVOKE INSERT ON public.booking_requests FROM anon, authenticated;
REVOKE UPDATE ON public.booking_requests FROM anon, authenticated;
REVOKE DELETE ON public.booking_requests FROM anon, authenticated;

GRANT ALL ON public.booking_requests TO service_role;

CREATE TABLE IF NOT EXISTS public.booking_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_token text UNIQUE NOT NULL,
  quote_context jsonb NOT NULL,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.booking_quotes ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.booking_quotes FROM anon, authenticated;
GRANT ALL ON public.booking_quotes TO service_role;

CREATE TABLE IF NOT EXISTS public.booking_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key text UNIQUE NOT NULL,
  payload_hash text NOT NULL,
  status text NOT NULL DEFAULT 'requested',
  lobby_booking_ids integer[] DEFAULT '{}',
  lobby_raw_response jsonb,
  lobby_raw_status text,
  quote_id uuid REFERENCES public.booking_quotes(id),
  guest_info jsonb,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.booking_attempts ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.booking_attempts FROM anon, authenticated;
GRANT ALL ON public.booking_attempts TO service_role;
