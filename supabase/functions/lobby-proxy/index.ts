import { createClient } from "npm:@supabase/supabase-js@2.45.4";
// redeploy trigger

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const LOBBY_API_BASE = (Deno.env.get("LOBBY_API_BASE") ?? "https://api.lobbypms.com").replace(/\/$/, "");

type Operation = "search" | "quote" | "create" | "get" | "catalog";

interface ProxyRequest {
  operation: Operation;
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  childrenAges?: number[];
  accommodationId?: string;
  planId?: number | null;
  guest?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    notes: string;
  };
  idempotencyKey?: string;
  quoteToken?: string;
}

// ── Category mapping: internal slug -> Lobby category_id (property 12934) ──
// These IDs are from the Lobby motor and pending confirmation via GET /api/v1/rooms.
const CATEGORY_MAP: Record<string, number> = {
  "sm-1": 17460, "sm-2": 17461, "sm-3": 17462, "sm-4": 17463,
  "sm-5": 17464, "sm-6": 17465, "sm-7": 17466, "sm-8": 17467,
  "sm-9": 17468, "sm-10": 17469, "sm-11": 17470,
  "villa-1": 17471, "villa-2": 17472, "villa-3": 17473,
  "villa-4": 17474, "villa-5": 17475,
  "glamping": 17459,
};

const VALID_ACCOMMODATION_IDS = Object.keys(CATEGORY_MAP);

// ── Supabase client (service role) ──
function getSupabase() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Supabase service credentials not configured.");
  return createClient(url, key);
}

// ── Lobby API helpers ──
function getToken(): string {
  const token = Deno.env.get("pms_token_lobby");
  if (!token) throw new Error("Lobby PMS token not configured.");
  return token;
}

function lobbyUrl(path: string, params: Record<string, string | number | undefined> = {}): string {
  const url = new URL(`${LOBBY_API_BASE}${path}`);
  url.searchParams.set("api_token", getToken());
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  }
  return url.toString();
}

async function lobbyGet<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
  const resp = await fetch(lobbyUrl(path, params), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new LobbyError(resp.status, body || resp.statusText, path);
  }
  return resp.json() as Promise<T>;
}

async function lobbyPost<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const token = getToken();
  const resp = await fetch(`${LOBBY_API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, api_token: token }),
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new LobbyError(resp.status, text || resp.statusText, path);
  }
  return resp.json() as Promise<T>;
}

class LobbyError extends Error {
  status: number;
  path: string;
  requestId: string;
  constructor(status: number, message: string, path = "unknown") {
    super(message);
    this.status = status;
    this.path = path;
    this.requestId = crypto.randomUUID();
    this.name = "LobbyError";
  }
}

// ── Validation ──
function validateDates(checkIn?: string, checkOut?: string): string[] {
  const errors: string[] = [];
  if (!checkIn || !checkOut) {
    errors.push("Selecciona fechas de entrada y salida.");
    return errors;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkIn) || !/^\d{4}-\d{2}-\d{2}$/.test(checkOut)) {
    errors.push("Las fechas no son válidas.");
    return errors;
  }
  if (checkOut <= checkIn) {
    errors.push("La salida debe ser posterior a la entrada.");
  }
  return errors;
}

function todayStr(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Panama" });
}

// ── Generate opaque tokens ──
function generateToken(prefix: string): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${ts}-${rand}`;
}

async function hashPayload(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ── Date helpers (local/Panama, no UTC shift) ──
function eachNight(checkIn: string, checkOut: string): string[] {
  const [y, m, d] = checkIn.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  const nights: string[] = [];
  const [ey, em, ed] = checkOut.split("-").map(Number);
  const end = new Date(ey, em - 1, ed);
  const diffMs = end.getTime() - start.getTime();
  const count = Math.round(diffMs / 86400000);
  for (let i = 0; i < count; i++) {
    const dt = new Date(start);
    dt.setDate(dt.getDate() + i);
    nights.push(dt.toLocaleDateString("en-CA"));
  }
  return nights;
}

// ── Operation: catalog ──
interface CatalogResponse {
  data: Array<{
    category_id: number;
    name: string;
    type: string;
    capacity: number;
    quantity: number;
    descriptions: { description: string; lang: string }[];
    photos: { photo_id: number; url: string }[];
  }>;
  meta: { total_records: number; current_page: number; records_per_page: number; total_pages: number };
}

async function handleCatalog(): Promise<JSON> {
  const all: CatalogResponse["data"] = [];
  let page = 1;
  let totalPages = 1;
  while (page <= totalPages) {
    const resp = await lobbyGet<CatalogResponse>("/api/v1/rooms", { page });
    all.push(...resp.data);
    totalPages = resp.meta.total_pages;
    page++;
  }
  return all.map((c) => ({
    category_id: c.category_id,
    name: c.name,
    type: c.type,
    capacity: c.capacity,
    quantity: c.quantity,
    description: c.descriptions?.find((d) => d.lang === "es" || d.lang === "en")?.description ?? "",
    photo: c.photos?.[0]?.url ?? "",
  })) as unknown as JSON;
}

// ── Operation: search (availability) ──
interface AvailabilityV2Response {
  data: Array<{
    date: string;
    categories: Array<{
      category_id: number;
      name: string;
      available_rooms: number;
      restrictions: { min_stay: number; max_stay: number; lead_days: number };
      plans: Array<{
        id: number | null;
        name: string;
        prices: { people: number; value: number }[];
      }>;
    }>;
  }>;
  meta: { total_records: number; current_page: number; records_per_page: number; total_pages: number };
}

async function handleSearch(checkIn: string, checkOut: string, adults: number, childrenAges: number[]): Promise<JSON> {
  // Fetch all pages of availability
  const allDays: AvailabilityV2Response["data"] = [];
  let page = 1;
  let totalPages = 1;
  while (page <= totalPages) {
    const resp = await lobbyGet<AvailabilityV2Response>("/api/v2/available-rooms", {
      start_date: checkIn,
      end_date: checkOut,
      page,
      paginate: 50,
    });
    allDays.push(...resp.data);
    totalPages = resp.meta.total_pages;
    page++;
  }

  // Fetch rate plans to get plan names and metadata
  let ratePlans: Array<{ id: number; plan: string; non_refundable: boolean; min_stay: number }> = [];
  try {
    const rpResp = await lobbyGet<{ data: Array<{ id: number; plan: string; non_refundable: boolean; min_stay: number }> }>("/api/v1/rate-plans", { paginate: 50 });
    ratePlans = rpResp.data;
  } catch {
    // Rate plans are supplementary; search still works without them
  }

  // Group by category across all dates
  const nights = eachNight(checkIn, checkOut);
  const expectedNights = nights.length;

  const categoryMap = new Map<number, {
    category_id: number;
    name: string;
    days: AvailabilityV2Response["data"];
  }>();

  for (const day of allDays) {
    for (const cat of day.categories) {
      const existing = categoryMap.get(cat.category_id);
      if (existing) {
        existing.days.push(day);
      } else {
        categoryMap.set(cat.category_id, {
          category_id: cat.category_id,
          name: cat.name,
          days: [{ date: day.date, categories: [cat] }],
        });
      }
    }
  }

  const results: Record<string, unknown>[] = [];

  for (const [catId, info] of categoryMap) {
    // Map category_id back to our slug
    const slug = Object.entries(CATEGORY_MAP).find(([, id]) => id === catId)?.[0];
    if (!slug) continue;

    // Check that we have data for every night [checkIn, checkOut)
    const dayDates = new Set(info.days.map((d) => d.date));
    const missingNights = nights.filter((n) => !dayDates.has(n));

    // Collect restrictions and availability across all nights
    let minAvailable = Infinity;
    let maxMinStay = 0;
    let maxMaxStay = 0;
    let maxLeadDays = 0;
    const allPlans = new Map<string, { id: number | null; name: string; prices: { people: number; value: number }[] }>();

    for (const day of info.days) {
      const cat = day.categories.find((c) => c.category_id === catId);
      if (!cat) continue;
      minAvailable = Math.min(minAvailable, cat.available_rooms);
      maxMinStay = Math.max(maxMinStay, cat.restrictions?.min_stay ?? 0);
      maxMaxStay = Math.max(maxMaxStay, cat.restrictions?.max_stay ?? 0);
      maxLeadDays = Math.max(maxLeadDays, cat.restrictions?.lead_days ?? 0);
      for (const plan of cat.plans ?? []) {
        const key = plan.id == null ? "standard" : String(plan.id);
        if (!allPlans.has(key)) allPlans.set(key, plan);
      }
    }

    const available = missingNights.length === 0 && minAvailable > 0;
    const minStayOk = maxMinStay === 0 || expectedNights >= maxMinStay;
    const maxStayOk = maxMaxStay === 0 || expectedNights <= maxMaxStay;
    const leadOk = maxLeadDays === 0 || true; // lead_days validated by Lobby server-side

    let status = "available";
    let statusMessage: string | null = null;
    if (missingNights.length > 0 || minAvailable === 0) {
      status = "sold-out";
      statusMessage = "No hay disponibilidad para una de las noches seleccionadas.";
    } else if (!minStayOk) {
      status = "min-nights-not-met";
      statusMessage = `Para estas fechas, la estancia mínima es de ${maxMinStay} noches.`;
    } else if (!maxStayOk) {
      status = "pending-rule";
      statusMessage = `Para estas fechas, la estancia máxima es de ${maxMaxStay} noches.`;
    }

    // Build per-night prices for each plan, for the requested occupancy
    const totalPeople = adults + childrenAges.length;
    const planResults: Record<string, unknown>[] = [];

    for (const [, plan] of allPlans) {
      // Find the price for the closest matching people count
      const exactMatch = plan.prices.find((p) => p.people === totalPeople);
      const closestMatch = plan.prices
        .filter((p) => p.people <= totalPeople)
        .sort((a, b) => b.people - a.people)[0];
      const priceEntry = exactMatch ?? closestMatch;

      if (!priceEntry) continue;

      // Build per-night rates from the daily data
      const nightRates: { date: string; amount: number }[] = [];
      let allNightsPriced = true;
      for (const night of nights) {
        const day = info.days.find((d) => d.date === night);
        if (!day) { allNightsPriced = false; break; }
        const cat = day.categories.find((c) => c.category_id === catId);
        if (!cat) { allNightsPriced = false; break; }
        const dayPlan = (cat.plans ?? []).find((p) => (p.id ?? null) === (plan.id ?? null));
        if (!dayPlan) { allNightsPriced = false; break; }
        const dayPrice = dayPlan.prices.find((p) => p.people === priceEntry.people);
        if (!dayPrice) { allNightsPriced = false; break; }
        nightRates.push({ date: night, amount: dayPrice.value });
      }

      if (!allNightsPriced) continue;

      const subtotal = nightRates.reduce((sum, r) => sum + r.amount, 0);
      const ratePlanMeta = ratePlans.find((rp) => rp.id === plan.id);

      planResults.push({
        planId: plan.id,
        planName: plan.name === "STANDARD_RATE" ? "Tarifa estándar" : plan.name,
        nights: nightRates,
        accommodationSubtotal: subtotal,
        totalCents: subtotal, // Lobby prices appear to be in whole currency units, not cents
        averagePerNight: expectedNights > 0 ? Math.round(subtotal / expectedNights) : 0,
        minNightsRequired: maxMinStay > 0 ? maxMinStay : null,
        nonRefundable: ratePlanMeta?.non_refundable ?? false,
      });
    }

    results.push({
      accommodationId: slug,
      categoryId: catId,
      name: info.name,
      available: available && minStayOk && maxStayOk,
      status,
      statusMessage,
      minNightsRequired: maxMinStay > 0 ? maxMinStay : null,
      plans: planResults,
    });
  }

  return results as unknown as JSON;
}

// ── Operation: quote ──
async function handleQuote(
  checkIn: string,
  checkOut: string,
  adults: number,
  childrenAges: number[],
  accommodationId: string,
  planId: number | null,
): Promise<JSON> {
  const categoryId = CATEGORY_MAP[accommodationId];
  if (!categoryId) throw new Error("Alojamiento no reconocido.");

  // Re-fetch availability to validate pricing in real-time
  const nights = eachNight(checkIn, checkOut);
  let allDays: AvailabilityV2Response["data"] = [];
  let page = 1;
  let totalPages = 1;
  while (page <= totalPages) {
    const resp = await lobbyGet<AvailabilityV2Response>("/api/v2/available-rooms", {
      start_date: checkIn,
      end_date: checkOut,
      category_id: categoryId,
      page,
      paginate: 50,
    });
    allDays.push(...resp.data);
    totalPages = resp.meta.total_pages;
    page++;
  }

  const totalPeople = adults + childrenAges.length;
  const nightRates: { date: string; amount: number; label: string }[] = [];
  let allPriced = true;

  for (const night of nights) {
    const day = allDays.find((d) => d.date === night);
    if (!day) { allPriced = false; break; }
    const cat = day.categories.find((c) => c.category_id === categoryId);
    if (!cat) { allPriced = false; break; }

    const plan = (cat.plans ?? []).find((p) => (p.id ?? null) === (planId ?? null));
    if (!plan) { allPriced = false; break; }

    const priceEntry = plan.prices.find((p) => p.people === totalPeople)
      ?? plan.prices.filter((p) => p.people <= totalPeople).sort((a, b) => b.people - a.people)[0];
    if (!priceEntry) { allPriced = false; break; }

    nightRates.push({ date: night, amount: priceEntry.value, label: plan.name === "STANDARD_RATE" ? "Tarifa estándar" : plan.name });
  }

  if (!allPriced || nightRates.length !== nights.length) {
    throw new Error("No hay tarifa disponible para todas las noches seleccionadas con este plan y ocupación.");
  }

  const subtotal = nightRates.reduce((sum, r) => sum + r.amount, 0);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  const quoteToken = generateToken("q");
  const sb = getSupabase();

  const { error } = await sb.from("booking_quotes").insert({
    quote_token: quoteToken,
    quote_context: {
      categoryId,
      planId,
      checkIn,
      checkOut,
      adults,
      childrenAges,
      nights: nightRates,
      accommodationSubtotalCents: subtotal,
      totalCents: subtotal,
      taxesTotalCents: 0,
      currency: "USD",
      expiresAt,
    },
    expires_at: expiresAt,
  });

  if (error) throw new Error("No se pudo guardar la cotización.");

  return {
    quoteToken,
    quoteVersion: 1,
    search: { checkIn, checkOut, guests: { adults, childrenAges } },
    accommodationId,
    categoryId,
    planId,
    nights: nightRates,
    accommodationSubtotalCents: subtotal,
    extrasTotalCents: 0,
    taxesTotalCents: 0,
    totalCents: subtotal,
    averagePerNightCents: nights.length > 0 ? Math.round(subtotal / nights.length) : 0,
    inclusions: [],
    conditions: [],
    currency: "USD",
    expiresAt,
    minNightsRequired: null,
  } as unknown as JSON;
}

// ── Operation: create ──
interface BookingCreateResponse {
  booking: {
    booking_id: number;
    room_id: number;
    distributed?: { booking_id: number; room_id: number }[];
  };
}

async function handleCreate(
  quoteToken: string,
  guest: NonNullable<ProxyRequest["guest"]>,
  idempotencyKey: string,
): Promise<JSON> {
  const sb = getSupabase();

  // 1. Retrieve and validate the quote
  const { data: quoteRow, error: quoteErr } = await sb
    .from("booking_quotes")
    .select("id, quote_context, expires_at, consumed_at")
    .eq("quote_token", quoteToken)
    .maybeSingle();

  if (quoteErr || !quoteRow) throw new Error("La cotización no es válida o ha expirado.");
  if (new Date(quoteRow.expires_at).getTime() < Date.now()) throw new Error("La cotización ha expirado. Solicita una nueva.");
  if (quoteRow.consumed_at) throw new Error("Esta cotización ya fue utilizada para una reserva.");

  const ctx = quoteRow.quote_context as {
    categoryId: number;
    planId: number | null;
    checkIn: string;
    checkOut: string;
    adults: number;
    childrenAges: number[];
    nights: { date: string; amount: number }[];
    totalCents: number;
  };

  // 2. Atomic idempotency claim
  const payloadStr = JSON.stringify({
    categoryId: ctx.categoryId,
    checkIn: ctx.checkIn,
    checkOut: ctx.checkOut,
    adults: ctx.adults,
    planId: ctx.planId,
    guestName: `${guest.firstName} ${guest.lastName}`,
  });
  const payloadHash = await hashPayload(payloadStr);

  // Try to insert a new attempt — ON CONFLICT means key already used
  const { data: existingAttempt } = await sb
    .from("booking_attempts")
    .select("id, status, payload_hash, lobby_booking_ids, lobby_raw_status, error_message")
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  if (existingAttempt) {
    if (existingAttempt.payload_hash !== payloadHash) {
      throw new Error("Ya existe una reserva con esta clave pero datos diferentes. No se creó un duplicado.");
    }
    if (existingAttempt.status === "created") {
      return {
        reservationId: idempotencyKey,
        status: "created",
        lobbyBookingIds: existingAttempt.lobby_booking_ids,
        lobbyRawStatus: existingAttempt.lobby_raw_status,
        alreadyExists: true,
      } as unknown as JSON;
    }
    if (existingAttempt.status === "processing") {
      return {
        reservationId: idempotencyKey,
        status: "unknown",
        message: "Tu reserva está siendo verificada. No necesitas enviarla de nuevo. Te contactaremos pronto.",
      } as unknown as JSON;
    }
    if (existingAttempt.status === "unknown") {
      return {
        reservationId: idempotencyKey,
        status: "unknown",
        message: "Estamos verificando tu reserva. No necesitas enviarla de nuevo. Te contactaremos pronto.",
      } as unknown as JSON;
    }
    // status === "failed" — allow retry by updating existing row
  }

  // 3. Mark as processing
  if (existingAttempt) {
    await sb.from("booking_attempts")
      .update({ status: "processing", updated_at: new Date().toISOString(), error_message: null })
      .eq("id", existingAttempt.id);
  } else {
    const { error: insertErr } = await sb.from("booking_attempts").insert({
      idempotency_key: idempotencyKey,
      payload_hash: payloadHash,
      status: "processing",
      quote_id: quoteRow.id,
      guest_info: guest,
    });
    if (insertErr) {
      // Concurrent insert with same key — check what happened
      const { data: concurrent } = await sb
        .from("booking_attempts")
        .select("status, lobby_booking_ids, lobby_raw_status")
        .eq("idempotency_key", idempotencyKey)
        .maybeSingle();
      if (concurrent) {
        if (concurrent.status === "processing" || concurrent.status === "unknown") {
          return {
            reservationId: idempotencyKey,
            status: "unknown",
            message: "Tu reserva está siendo procesada. Espera un momento.",
          } as unknown as JSON;
        }
        if (concurrent.status === "created") {
          return {
            reservationId: idempotencyKey,
            status: "created",
            lobbyBookingIds: concurrent.lobby_booking_ids,
            lobbyRawStatus: concurrent.lobby_raw_status,
          } as unknown as JSON;
        }
      }
      throw new Error("No se pudo iniciar el proceso de reserva. Inténtalo de nuevo.");
    }
  }

  // 4. Build the Lobby POST /api/v1/bookings payload
  const holderName = `${guest.firstName} ${guest.lastName}`.trim();
  const ratesPerDay = ctx.nights.map((n) => ({ date: n.date, price: n.amount }));

  const bookingBody: Record<string, unknown> = {
    category_id: ctx.categoryId,
    start_date: ctx.checkIn,
    end_date: ctx.checkOut,
    total_adults: ctx.adults,
    total_children: ctx.childrenAges.length,
    holder_name: holderName,
    rates_per_day: ratesPerDay,
    note: `Reserva web Sister Moon · Ref: ${idempotencyKey}${guest.notes ? ` · ${guest.notes}` : ""}`,
  };

  if (ctx.planId !== null) {
    bookingBody.plan_id = ctx.planId;
  }

  // 5. Call Lobby with a timeout
  let lobbyResult: BookingCreateResponse;
  let timedOut = false;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    const token = getToken();
    const resp = await fetch(`${LOBBY_API_BASE}/api/v1/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...bookingBody, api_token: token }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!resp.ok) {
      const body = await resp.text().catch(() => "");
      // 422 RATES_PER_DAY or other validation error
      await sb.from("booking_attempts")
        .update({ status: "failed", error_message: `Lobby ${resp.status}: ${body.slice(0, 500)}`, updated_at: new Date().toISOString() })
        .eq("idempotency_key", idempotencyKey);
      const msg = resp.status === 422
        ? "Los datos de la tarifa no coinciden con los del sistema. Solicita una nueva cotización."
        : resp.status === 401 || resp.status === 403
        ? "No se pudo autenticar con el sistema de reservas. Contáctanos directamente."
        : "El sistema de reservas no está disponible. Inténtalo más tarde o contáctanos.";
      throw new Error(msg);
    }

    lobbyResult = await resp.json() as BookingCreateResponse;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      timedOut = true;
    } else if (!(err instanceof Error && err.message.includes("sistema de reservas"))) {
      // Network error — could have been received by Lobby
      timedOut = true;
    } else {
      throw err;
    }
  }

  if (timedOut) {
    // Mark as unknown — we don't know if Lobby received the request
    await sb.from("booking_attempts")
      .update({ status: "unknown", error_message: "Timeout or network error", updated_at: new Date().toISOString() })
      .eq("idempotency_key", idempotencyKey);

    return {
      reservationId: idempotencyKey,
      status: "unknown",
      message: "Estamos verificando tu reserva. No necesitas enviarla de nuevo. Te contactaremos pronto para confirmar.",
    } as unknown as JSON;
  }

  // 6. Success — collect all booking IDs (including distributed)
  const bookingIds: number[] = [lobbyResult.booking.booking_id];
  if (lobbyResult.booking.distributed) {
    for (const dist of lobbyResult.booking.distributed) {
      bookingIds.push(dist.booking_id);
    }
  }

  // Mark quote as consumed
  await sb.from("booking_quotes")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", quoteRow.id);

  // Update attempt with results
  await sb.from("booking_attempts")
    .update({
      status: "created",
      lobby_booking_ids: bookingIds,
      lobby_raw_response: { booking_id: lobbyResult.booking.booking_id, room_id: lobbyResult.booking.room_id, distributed: lobbyResult.booking.distributed ?? [] },
      updated_at: new Date().toISOString(),
    })
    .eq("idempotency_key", idempotencyKey);

  // Also persist to booking_requests for audit trail
  await sb.from("booking_requests").insert({
    reservation_id: idempotencyKey,
    accommodation_id: Object.entries(CATEGORY_MAP).find(([, id]) => id === ctx.categoryId)?.[0] ?? "",
    check_in: ctx.checkIn,
    check_out: ctx.checkOut,
    adults: ctx.adults,
    children_ages: JSON.stringify(ctx.childrenAges),
    plan_slug: ctx.planId != null ? String(ctx.planId) : "standard",
    quote: quoteRow.quote_context,
    guest: guest,
    status: "created",
    idempotency_key: idempotencyKey,
    lobby_reference: String(lobbyResult.booking.booking_id),
    lobby_status: "created",
  });

  // Try to fetch detail for raw status
  try {
    const detail = await lobbyGet<{ data: { id_reserva: number; estatus: string; policies?: string[]; plan?: string } }>(`/api/v1/bookings/${lobbyResult.booking.booking_id}`);
    const rawStatus = detail.data?.estatus ?? "created";
    const policies = detail.data?.policies ?? [];
    const planName = detail.data?.plan ?? "STANDARD";

    await sb.from("booking_attempts")
      .update({ lobby_raw_status: rawStatus, updated_at: new Date().toISOString() })
      .eq("idempotency_key", idempotencyKey);

    return {
      reservationId: idempotencyKey,
      status: "created",
      lobbyBookingIds: bookingIds,
      lobbyRawStatus: rawStatus,
      planName,
      policies: policies.slice(0, 3),
      distributed: lobbyResult.booking.distributed ?? [],
    } as unknown as JSON;
  } catch {
    // Detail fetch failed — booking still created
    return {
      reservationId: idempotencyKey,
      status: "created",
      lobbyBookingIds: bookingIds,
      lobbyRawStatus: "created",
      distributed: lobbyResult.booking.distributed ?? [],
    } as unknown as JSON;
  }
}

// ── Operation: get (lookup by token/attempt) ──
async function handleGet(quoteToken: string): Promise<JSON> {
  const sb = getSupabase();

  // Find the attempt by quote_token -> quote_id
  const { data: quoteRow } = await sb
    .from("booking_quotes")
    .select("id")
    .eq("quote_token", quoteToken)
    .maybeSingle();

  if (!quoteRow) throw new Error("Referencia no encontrada.");

  const { data: attempt, error } = await sb
    .from("booking_attempts")
    .select("id, status, lobby_booking_ids, lobby_raw_status, lobby_raw_response, error_message, guest_info, created_at, quote_id")
    .eq("quote_id", quoteRow.id)
    .maybeSingle();

  if (error || !attempt) throw new Error("Reserva no encontrada.");

  // If created, try to fetch latest status from Lobby
  let lobbyRawStatus = attempt.lobby_raw_status;
  let policies: string[] = [];
  if (attempt.status === "created" && attempt.lobby_booking_ids.length > 0) {
    try {
      const detail = await lobbyGet<{ data: { estatus: string; policies?: string[]; plan?: string } }>(`/api/v1/bookings/${attempt.lobby_booking_ids[0]}`);
      lobbyRawStatus = detail.data?.estatus ?? lobbyRawStatus;
      policies = detail.data?.policies ?? [];

      await sb.from("booking_attempts")
        .update({ lobby_raw_status: lobbyRawStatus, updated_at: new Date().toISOString() })
        .eq("id", attempt.id);
    } catch {
      // Lobby detail unavailable — return what we have
    }
  }

  // Filter sensitive data from response
  return {
    reservationId: quoteToken,
    status: attempt.status,
    lobbyBookingIds: attempt.lobby_booking_ids,
    lobbyRawStatus,
    policies: policies.slice(0, 3),
    createdAt: attempt.created_at,
    guestInfo: attempt.guest_info ? {
      firstName: (attempt.guest_info as { firstName: string }).firstName,
      lastName: (attempt.guest_info as { lastName: string }).lastName,
    } : null,
    errorMessage: attempt.error_message,
  } as unknown as JSON;
}

// ── Main handler ──
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Método no permitido." }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body: ProxyRequest = await req.json();

    // Validate operation
    if (!body.operation || !["search", "quote", "create", "get", "catalog"].includes(body.operation)) {
      return new Response(
        JSON.stringify({ error: "Operación no válida." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (body.operation === "catalog") {
      const result = await handleCatalog();
      return new Response(JSON.stringify(result), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (body.operation === "get") {
      if (!body.quoteToken) {
        return new Response(JSON.stringify({ error: "Falta el token de la reserva." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const result = await handleGet(body.quoteToken);
      return new Response(JSON.stringify(result), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // search, quote, create need dates
    const dateErrorss = validateDates(body.checkIn, body.checkOut);
    if (dateErrorss.length > 0) {
      return new Response(JSON.stringify({ error: dateErrorss.join(" "), validationErrors: dateErrorss }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (!body.adults || body.adults < 1 || body.adults > 12) {
      return new Response(JSON.stringify({ error: "El número de adultos debe estar entre 1 y 12." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (body.operation === "search") {
      const result = await handleSearch(body.checkIn!, body.checkOut!, body.adults, body.childrenAges ?? []);
      return new Response(JSON.stringify(result), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (body.operation === "quote") {
      if (!body.accommodationId || !VALID_ACCOMMODATION_IDS.includes(body.accommodationId)) {
        return new Response(JSON.stringify({ error: "Alojamiento no reconocido." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const result = await handleQuote(body.checkIn!, body.checkOut!, body.adults, body.childrenAges ?? [], body.accommodationId, body.planId ?? null);
      return new Response(JSON.stringify(result), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (body.operation === "create") {
      if (!body.quoteToken) {
        return new Response(JSON.stringify({ error: "Falta el token de cotización." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (!body.guest?.firstName?.trim() || !body.guest?.lastName?.trim()) {
        return new Response(JSON.stringify({ error: "Falta el nombre del titular." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (!body.guest?.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.guest.email)) {
        return new Response(JSON.stringify({ error: "Falta un correo válido." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (!body.guest?.phone?.trim()) {
        return new Response(JSON.stringify({ error: "Falta un teléfono de contacto." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (!body.idempotencyKey) {
        return new Response(JSON.stringify({ error: "Falta la clave de idempotencia." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const result = await handleCreate(body.quoteToken, body.guest, body.idempotencyKey);
      return new Response(JSON.stringify(result), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    throw new Error("Operación no soportada.");
  } catch (err) {
    const isLobbyErr = err instanceof LobbyError;
    const requestId = isLobbyErr ? err.requestId : crypto.randomUUID();
    let safeDetail = err instanceof Error ? err.message : "Unknown error";
    const secret = Deno.env.get("pms_token_lobby");
    if (secret) safeDetail = safeDetail.split(secret).join("[REDACTED]");
    safeDetail = safeDetail.replace(/api_token[^\s&<]*/gi, "api_token=[REDACTED]").replace(/https?:\/\/[^\s<>]+/gi, "[URL]").replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[EMAIL]").replace(/[A-Za-z0-9_-]{40,}/g, "[REDACTED]");
    console.error(JSON.stringify({ event: "lobby_proxy_error", requestId, upstreamStatus: isLobbyErr ? err.status : null, path: isLobbyErr ? err.path : null, errorType: err instanceof Error ? err.name : "Unknown", detail: safeDetail.replace(/<[^>]*>/g, " ").replace(/\s+/g," ").slice(0, 500) }));
    const isConfig = err instanceof Error && err.message.includes("not configured");
    const message = isConfig
      ? "El servicio de reservas no está disponible en este momento. Contáctanos directamente."
      : isLobbyErr
      ? "El sistema de reservas no está disponible. Inténtalo más tarde o contáctanos."
      : err instanceof Error
      ? err.message
      : "Ocurrió un error inesperado. Inténtalo de nuevo o contáctanos.";
    return new Response(
      JSON.stringify({ error: message, code: isConfig ? "PMS_CONFIG" : isLobbyErr ? "PMS_UPSTREAM" : "PMS_INTERNAL", requestId, serviceUnavailable: isConfig || isLobbyErr }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
