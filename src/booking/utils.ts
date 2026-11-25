import type { Currency, GuestComposition, NightRate } from './types';

const PANAMA_TZ = 'America/Panama';

export function todayInPanama(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: PANAMA_TZ });
}

export function parsePanamaDate(dateStr: string): Date | null {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDateShort(dateStr: string): string {
  const date = parsePanamaDate(dateStr);
  if (!date) return dateStr;
  return date.toLocaleDateString('es-PA', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateLong(dateStr: string): string {
  const date = parsePanamaDate(dateStr);
  if (!date) return dateStr;
  return date.toLocaleDateString('es-PA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  const start = parsePanamaDate(checkIn);
  const end = parsePanamaDate(checkOut);
  if (!start || !end) return 0;
  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function eachNightDate(checkIn: string, checkOut: string): string[] {
  const nights = nightsBetween(checkIn, checkOut);
  if (nights <= 0) return [];
  const start = parsePanamaDate(checkIn);
  if (!start) return [];
  const dates: string[] = [];
  for (let i = 0; i < nights; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    dates.push(d.toLocaleDateString('en-CA'));
  }
  return dates;
}

export function formatCurrency(amount: number, currency: Currency = 'USD'): string {
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2, style: 'currency', currency });
}

export function totalGuests(guests: GuestComposition): number {
  return guests.adults + guests.childrenAges.length;
}

export function nightsLabel(nights: number): string {
  if (nights === 1) return '1 noche';
  return `${nights} noches`;
}

export function guestsLabel(guests: GuestComposition): string {
  const total = totalGuests(guests);
  if (total === 1) return '1 persona';
  return `${total} personas`;
}

export function sumNightRates(rates: NightRate[]): number {
  return rates.reduce((sum, r) => sum + r.amountCents, 0);
}

export function quoteExpiryMinutes(minutes: number = 15): string {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

export function isQuoteExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() < Date.now();
}

export function generateIdempotencyKey(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `idem-${ts}-${rand}`;
}
