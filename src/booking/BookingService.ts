import type {
  BookingConfig,
  ExtraSelection,
  GuestInfo,
  InventoryProvider,
  QuoteResult,
  Reservation,
  ReservationProvider,
  SearchQuery,
} from './types';
import { LobbyInventoryAdapter, LobbyReservationAdapter } from './LobbyAdapters';
import { isQuoteExpired } from './utils';

export class BookingService {
  private inventory: InventoryProvider;
  private reservations: ReservationProvider;
  private config: BookingConfig;

  constructor(config: BookingConfig) {
    this.config = config;
    this.inventory = new LobbyInventoryAdapter();
    this.reservations = new LobbyReservationAdapter();
  }

  async searchAvailability(query: SearchQuery) {
    return this.inventory.searchAvailability(query);
  }

  async getQuote(query: SearchQuery, accommodationId: string, planId: number | null, extras: ExtraSelection[]): Promise<QuoteResult | null> {
    return this.inventory.getQuote(query, accommodationId, planId, extras);
  }

  isQuoteValid(quote: QuoteResult | null): boolean {
    if (!quote) return false;
    return !isQuoteExpired(quote.expiresAt);
  }

  async createPendingReservation(quote: QuoteResult, guest: GuestInfo, idempotencyKey: string): Promise<Reservation> {
    if (!this.isQuoteValid(quote)) {
      throw new Error('La cotización ha expirado. Solicita una nueva.');
    }
    return this.reservations.createPendingReservation(quote, guest, idempotencyKey);
  }

  getReservation(lookupToken: string) {
    return this.reservations.getReservation(lookupToken);
  }
}
