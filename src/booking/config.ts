import type { BookingConfig } from './types';

export const bookingConfig: BookingConfig = {
  mode: 'production',
  inventoryProvider: 'lobby',
  lobbyPropertyId: '12934',
};

export function isDemoMode(): boolean {
  return bookingConfig.mode === 'demo';
}

export function isProductionMode(): boolean {
  return bookingConfig.mode === 'production';
}

export function isBookingEnabled(): boolean {
  return Boolean(
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY,
  );
}

export function isLobbyEnabled(): boolean {
  return bookingConfig.inventoryProvider === 'lobby';
}
