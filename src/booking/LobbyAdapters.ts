import type {
  InventoryProvider,
  InventoryResponse,
  QuoteResult,
  SearchQuery,
  ExtraSelection,
  ReservationProvider,
  Reservation,
  GuestInfo,
  AccommodationResult,
  PlanQuote,
  AvailabilityStatus,
  Currency,
  NightRate,
  ServiceError,
} from './types';
import { photosById } from '../data/catalog';
import { nightsBetween, eachNightDate, quoteExpiryMinutes } from './utils';

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lobby-proxy`;

function getAuthHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  };
}

async function callProxy(body: Record<string, unknown>): Promise<{ ok: boolean; data: unknown; status: number }> {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, data, status: response.status };
}

function getCoverUrl(accommodationId: string): string {
  const idMap: Record<string, string> = {
    'villa-1': 'sm-040', 'villa-2': 'sm-055', 'villa-3': 'sm-058',
    'villa-4': 'sm-007', 'villa-5': 'sm-071', 'glamping': 'sm-017',
    'sm-1': 'sm-018', 'sm-2': 'sm-018', 'sm-3': 'sm-021',
    'sm-5': 'sm-019', 'sm-6': 'sm-019', 'sm-7': 'sm-019',
    'sm-8': 'sm-022', 'sm-9': 'sm-025', 'sm-10': 'sm-019', 'sm-11': 'sm-019',
  };
  const photoId = idMap[accommodationId];
  return photoId && photosById[photoId] ? photosById[photoId].url : '';
}

type LobbySearchResult = {
  accommodationId: string;
  categoryId: number;
  name: string;
  available: boolean;
  status: string;
  statusMessage: string | null;
  minNightsRequired: number | null;
  plans: {
    planId: number | null;
    planName: string;
    nights: { date: string; amount: number }[];
    accommodationSubtotal: number;
    totalCents: number;
    averagePerNight: number;
    minNightsRequired: number | null;
    nonRefundable: boolean;
  }[];
};

function mapAccommodationType(slug: string): 'room' | 'villa' | 'glamping' {
  if (slug.startsWith('villa-')) return 'villa';
  if (slug === 'glamping') return 'glamping';
  return 'room';
}

function transformSearchResult(result: LobbySearchResult, query: SearchQuery): AccommodationResult {
  const type = mapAccommodationType(result.accommodationId);
  const nights = nightsBetween(query.checkIn, query.checkOut);

  const availabilityMap: Record<string, AvailabilityStatus> = {
    'available': 'available',
    'sold-out': 'sold-out',
    'min-nights-not-met': 'min-nights-not-met',
    'pending-rule': 'pending-rule',
  };

  const plans: PlanQuote[] = result.plans.map((p) => {
    const nightRates: NightRate[] = p.nights.map((n) => ({
      date: n.date,
      label: p.planName,
      amountCents: n.amount,
      isSpecialInterval: false,
    }));

    return {
      planId: p.planId,
      planName: p.planName,
      nights: nightRates,
      accommodationSubtotalCents: p.accommodationSubtotal,
      extrasTotalCents: 0,
      taxesTotalCents: 0,
      totalCents: p.totalCents,
      averagePerNightCents: p.averagePerNight,
      inclusions: [],
      conditions: [],
      minNightsSatisfied: p.minNightsRequired == null || nights >= p.minNightsRequired,
      minNightsRequired: p.minNightsRequired,
      currency: 'USD' as Currency,
    };
  });

  return {
    accommodationId: result.accommodationId,
    categoryId: result.categoryId,
    name: result.name,
    type,
    coverUrl: getCoverUrl(result.accommodationId),
    photoAlt: result.name,
    capacity: 2,
    maxCapacity: 4,
    services: [],
    description: '',
    availability: availabilityMap[result.status] ?? 'unavailable',
    plans,
    minNightsRequired: result.minNightsRequired,
    statusMessage: result.statusMessage,
  };
}

type LobbyQuoteResponse = {
  quoteToken: string;
  quoteVersion: number;
  search: SearchQuery;
  accommodationId: string;
  categoryId: number;
  planId: number | null;
  nights: { date: string; amount: number; label: string }[];
  accommodationSubtotalCents: number;
  extrasTotalCents: number;
  taxesTotalCents: number;
  totalCents: number;
  averagePerNightCents: number;
  inclusions: string[];
  conditions: string[];
  currency: Currency;
  expiresAt: string;
  minNightsRequired: number | null;
};

type LobbyCreateResponse = {
  reservationId: string;
  status: 'created' | 'unknown';
  lobbyBookingIds: number[];
  lobbyRawStatus: string;
  policies?: string[];
  planName?: string;
  distributed?: { booking_id: number; room_id: number }[];
  message?: string;
  alreadyExists?: boolean;
};

export class LobbyInventoryAdapter implements InventoryProvider {
  async searchAvailability(query: SearchQuery): Promise<InventoryResponse> {
    try {
      const { ok, data } = await callProxy({
        operation: 'search',
        checkIn: query.checkIn,
        checkOut: query.checkOut,
        adults: query.guests.adults,
        childrenAges: query.guests.childrenAges,
      });

      if (!ok) {
        const err = data as ServiceError;
        return {
          search: query,
          results: [],
          searchValid: false,
          validationErrors: err.validationErrors ?? [err.error ?? 'El servicio de reservas no está disponible.'],
        };
      }

      const lobbyResults = data as LobbySearchResult[];
      if (!Array.isArray(lobbyResults)) {
        return {
          search: query,
          results: [],
          searchValid: false,
          validationErrors: ['El servicio de reservas no está disponible en este momento. Contáctanos directamente.'],
        };
      }

      const results = lobbyResults.map((r) => transformSearchResult(r, query));
      return { search: query, results, searchValid: true, validationErrors: [] };
    } catch {
      return {
        search: query,
        results: [],
        searchValid: false,
        validationErrors: ['No pudimos conectar con el servicio de reservas. Contáctanos directamente.'],
      };
    }
  }

  async getQuote(
    query: SearchQuery,
    accommodationId: string,
    planId: number | null,
    _extras: ExtraSelection[],
  ): Promise<QuoteResult | null> {
    try {
      const { ok, data } = await callProxy({
        operation: 'quote',
        checkIn: query.checkIn,
        checkOut: query.checkOut,
        adults: query.guests.adults,
        childrenAges: query.guests.childrenAges,
        accommodationId,
        planId,
      });

      if (!ok) return null;

      const q = data as LobbyQuoteResponse;
      if (!q.quoteToken) return null;

      const nightRates: NightRate[] = q.nights.map((n) => ({
        date: n.date,
        label: n.label,
        amountCents: n.amount,
        isSpecialInterval: false,
      }));

      return {
        quoteToken: q.quoteToken,
        quoteVersion: q.quoteVersion,
        search: q.search,
        accommodationId: q.accommodationId,
        categoryId: q.categoryId,
        planId: q.planId,
        planName: q.nights[0]?.label ?? 'Tarifa',
        nights: nightRates,
        accommodationSubtotalCents: q.accommodationSubtotalCents,
        extrasTotalCents: q.extrasTotalCents,
        taxesTotalCents: q.taxesTotalCents,
        totalCents: q.totalCents,
        averagePerNightCents: q.averagePerNightCents,
        inclusions: q.inclusions,
        conditions: q.conditions,
        currency: q.currency,
        expiresAt: q.expiresAt,
        minNightsRequired: q.minNightsRequired,
      };
    } catch {
      return null;
    }
  }
}

export class LobbyReservationAdapter implements ReservationProvider {
  async createPendingReservation(quote: QuoteResult, guest: GuestInfo, idempotencyKey: string): Promise<Reservation> {
    const { ok, data } = await callProxy({
      operation: 'create',
      quoteToken: quote.quoteToken,
      guest,
      idempotencyKey,
    });

    if (!ok) {
      const err = data as ServiceError;
      throw new Error(err.error ?? 'No pudimos crear tu reserva. Inténtalo de nuevo o contáctanos.');
    }

    const res = data as LobbyCreateResponse;

    return {
      reservationId: res.reservationId,
      quote,
      guest,
      status: res.status === 'created' ? 'created' : 'unknown',
      createdAt: new Date().toISOString(),
      lobbyBookingIds: res.lobbyBookingIds ?? [],
      lobbyRawStatus: res.lobbyRawStatus ?? null,
      idempotencyKey,
    };
  }

  async getReservation(lookupToken: string): Promise<Reservation | null> {
    const { ok, data } = await callProxy({
      operation: 'get',
      quoteToken: lookupToken,
    });

    if (!ok) return null;

    const res = data as {
      reservationId: string;
      status: string;
      lobbyBookingIds: number[];
      lobbyRawStatus: string;
      policies?: string[];
      createdAt: string;
    };

    return {
      reservationId: res.reservationId,
      quote: {} as QuoteResult,
      guest: {} as GuestInfo,
      status: res.status === 'created' ? 'created' : res.status === 'unknown' ? 'unknown' : 'pending',
      createdAt: res.createdAt,
      lobbyBookingIds: res.lobbyBookingIds ?? [],
      lobbyRawStatus: res.lobbyRawStatus ?? null,
      idempotencyKey: res.reservationId,
    };
  }
}
