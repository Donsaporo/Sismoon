# Project memory

## Product intent & audience

- Hotel booking system integrating with LobbyPMS as the PMS provider.
- Spanish-speaking end-users (error messages are in Spanish, e.g. "servicio de reservas no disponible").
- Booking flow: search availability → get quote → create booking → retrieve booking status.

## Brand personality & voice

- Professional, hospitality-oriented tone.
- User-facing messages in Spanish.

## Visual design & UX direction

- Frontend: Vite + React (TypeScript).
- No UI/design decisions inferred yet beyond the framework stack.

## Decisions, constraints & rationale

- Backend: Supabase (Postgres + Edge Functions).
- Edge function `lobby-proxy` proxies all LobbyPMS operations: search, quote, create, get, catalog.
- Three booking tables: `booking_requests`, `booking_quotes`, `booking_attempts`.
- RLS enabled on all tables; `anon` and `authenticated` roles have zero access — only `service_role` (used by the edge function) can read/write.
- Supabase-internal secrets (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, etc.) are auto-configured.
- `pms_token_lobby` (LobbyPMS API token) must be set manually as an edge function secret; without it the proxy returns a service-unavailable error.
- Edge function deploy tool skips redeploy when file hash is unchanged; touching the file's timestamp/content forces redeploy.

## Open questions & assumptions

- `pms_token_lobby` not yet configured — user needs to provide it or set it via Supabase dashboard.
- UI/UX design direction (styling, components, layout) not yet established.
- No inferred user auth strategy beyond RLS lockdown; booking is likely mediated entirely through the edge function.