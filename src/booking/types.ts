export type ProductType = 'lodging' | 'tour' | 'restaurant';

export type AccommodationType = 'room' | 'villa' | 'glamping';

export type Currency = 'USD';

export type GuestComposition = {
  adults: number;
  childrenAges: number[];
};

export type SearchQuery = {
  checkIn: string;
  checkOut: string;
  guests: GuestComposition;
  accommodationType?: AccommodationType;
};

export type NightRate = {
  date: string;
  label: string;
  amountCents: number;
  isSpecialInterval: boolean;
};

export type PlanQuote = {
  planId: number | null;
  planName: string;
  nights: NightRate[];
  accommodationSubtotalCents: number;
  extrasTotalCents: number;
  taxesTotalCents: number;
  totalCents: number;
  averagePerNightCents: number;
  inclusions: string[];
  conditions: string[];
  minNightsSatisfied: boolean;
  minNightsRequired: number | null;
  currency: Currency;
};

export type AvailabilityStatus = 'available' | 'unavailable' | 'sold-out' | 'min-nights-not-met' | 'pending-rule';

export type AccommodationResult = {
  accommodationId: string;
  categoryId: number;
  name: string;
  type: AccommodationType;
  coverUrl: string;
  photoAlt: string;
  capacity: number;
  maxCapacity: number;
  services: string[];
  description: string;
  availability: AvailabilityStatus;
  plans: PlanQuote[];
  minNightsRequired: number | null;
  statusMessage: string | null;
};

export type QuoteResult = {
  quoteToken: string;
  quoteVersion: number;
  search: SearchQuery;
  accommodationId: string;
  categoryId: number;
  planId: number | null;
  planName: string;
  nights: NightRate[];
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

export type InventoryResponse = {
  search: SearchQuery;
  results: AccommodationResult[];
  searchValid: boolean;
  validationErrors: string[];
};

export interface InventoryProvider {
  searchAvailability(query: SearchQuery): Promise<InventoryResponse>;
  getQuote(query: SearchQuery, accommodationId: string, planId: number | null, extras: ExtraSelection[]): Promise<QuoteResult | null>;
}

export type ReservationStatus =
  | 'pending'
  | 'created'
  | 'unknown'
  | 'confirmed'
  | 'cancelled'
  | 'expired';

export type Reservation = {
  reservationId: string;
  quote: QuoteResult;
  guest: GuestInfo;
  status: ReservationStatus;
  createdAt: string;
  lobbyBookingIds: number[];
  lobbyRawStatus: string | null;
  idempotencyKey: string;
};

export type GuestInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
};

export interface ReservationProvider {
  createPendingReservation(quote: QuoteResult, guest: GuestInfo, idempotencyKey: string): Promise<Reservation>;
  getReservation(lookupToken: string): Promise<Reservation | null>;
}

export type ExtraSelection = {
  slug: string;
  quantity: number;
};

export type BookingMode = 'demo' | 'production';

export type BookingConfig = {
  mode: BookingMode;
  inventoryProvider: 'mock' | 'lobby';
  lobbyPropertyId: string;
};

export type ServiceError = {
  error: string;
  serviceUnavailable?: boolean;
  validationErrors?: string[];
};

export type LobbyAvailabilityDay = {
  date: string;
  categories: LobbyCategoryAvailability[];
};

export type LobbyCategoryAvailability = {
  category_id: number;
  name: string;
  available_rooms: number;
  restrictions: { min_stay: number; max_stay: number; lead_days: number };
  plans: LobbyPlanAvailability[];
};

export type LobbyPlanAvailability = {
  id: number | null;
  name: string;
  prices: { people: number; value: number }[];
};

export type LobbyRoom = {
  category_id: number;
  name: string;
  type: string;
  capacity: number;
  quantity: number;
  descriptions: { description: string; lang: string }[];
  photos: { photo_id: number; url: string }[];
};

export type LobbyRatePlan = {
  id: number;
  plan: string;
  adjustment: { type: number; value: number };
  min_stay: number;
  check_in_date_restriction: { from: string; to: string } | null;
  non_refundable: boolean;
};

export type LobbyChannel = {
  channel_id: number;
  name: string;
};

export type LobbyBookingResponse = {
  booking: {
    booking_id: number;
    room_id: number;
    distributed?: { booking_id: number; room_id: number }[];
  };
};

export type LobbyBookingDetail = {
  data: {
    id_reserva: number;
    estatus: string;
    tarifas_por_dia: { id: number; dia: string; precio: number }[];
    impuesto_alojamiento?: number;
    plan?: string;
    policies?: string[];
    grupo?: unknown;
  };
};

export type QuoteContext = {
  categoryId: number;
  planId: number | null;
  checkIn: string;
  checkOut: string;
  adults: number;
  childrenAges: number[];
  nights: NightRate[];
  totalCents: number;
  accommodationSubtotalCents: number;
  taxesTotalCents: number;
  currency: Currency;
  expiresAt: string;
};
