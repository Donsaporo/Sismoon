import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback, useRef } from 'react';
import type { ExtraSelection, GuestComposition, QuoteResult, GuestInfo, AccommodationType } from '../booking/types';
import { todayInPanama } from '../booking/utils';
import { useQuery } from '../router';

export type BookingState = {
  checkIn: string;
  checkOut: string;
  adults: number;
  childrenAges: number[];
  accommodationType: string;
  selectedAccommodationId: string | null;
  selectedPlanId: number | null;
  extras: ExtraSelection[];
  quote: QuoteResult | null;
  guest: GuestInfo;
};

type BookingContextValue = {
  state: BookingState;
  setCheckIn: (v: string) => void;
  setCheckOut: (v: string) => void;
  setAdults: (n: number) => void;
  setChildrenAges: (ages: number[]) => void;
  setAccommodationType: (t: string) => void;
  selectAccommodation: (id: string, planId: number | null) => void;
  setExtras: (extras: ExtraSelection[]) => void;
  setQuote: (quote: QuoteResult | null) => void;
  setGuest: (guest: GuestInfo) => void;
  resetSelection: () => void;
  searchQuery: { checkIn: string; checkOut: string; guests: GuestComposition; accommodationType?: AccommodationType };
  buildQueryString: () => string;
  syncFromUrl: () => void;
};

const emptyGuest: GuestInfo = { firstName: '', lastName: '', email: '', phone: '', notes: '' };

const defaultState: BookingState = {
  checkIn: '',
  checkOut: '',
  adults: 2,
  childrenAges: [],
  accommodationType: '',
  selectedAccommodationId: null,
  selectedPlanId: null,
  extras: [],
  quote: null,
  guest: emptyGuest,
};

const BookingContext = createContext<BookingContextValue>({
  state: defaultState,
  setCheckIn: () => {},
  setCheckOut: () => {},
  setAdults: () => {},
  setChildrenAges: () => {},
  setAccommodationType: () => {},
  selectAccommodation: () => {},
  setExtras: () => {},
  setQuote: () => {},
  setGuest: () => {},
  resetSelection: () => {},
  searchQuery: { checkIn: '', checkOut: '', guests: { adults: 2, childrenAges: [] } },
  buildQueryString: () => '',
  syncFromUrl: () => {},
});

function parseAgesParam(agesStr: string | null): number[] {
  if (!agesStr) return [];
  return agesStr.split('-').map(Number).filter((n) => !isNaN(n) && n >= 0 && n <= 17);
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const query = useQuery();
  const [state, setState] = useState<BookingState>(defaultState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const setCheckIn = useCallback((v: string) => {
    setState((prev) => (prev.checkIn === v ? prev : { ...prev, checkIn: v, quote: null }));
  }, []);
  const setCheckOut = useCallback((v: string) => {
    setState((prev) => (prev.checkOut === v ? prev : { ...prev, checkOut: v, quote: null }));
  }, []);
  const setAdults = useCallback((n: number) => {
    setState((prev) => (prev.adults === n ? prev : { ...prev, adults: n, quote: null }));
  }, []);
  const setChildrenAges = useCallback((ages: number[]) => {
    setState((prev) => ({ ...prev, childrenAges: ages, quote: null }));
  }, []);
  const setAccommodationType = useCallback((t: string) => {
    setState((prev) => (prev.accommodationType === t ? prev : { ...prev, accommodationType: t }));
  }, []);
  const selectAccommodation = useCallback((id: string, planId: number | null) => {
    setState((prev) =>
      prev.selectedAccommodationId === id && prev.selectedPlanId === planId
        ? prev
        : { ...prev, selectedAccommodationId: id, selectedPlanId: planId },
    );
  }, []);
  const setExtras = useCallback((extras: ExtraSelection[]) => {
    setState((prev) => ({ ...prev, extras, quote: null }));
  }, []);
  const setQuote = useCallback((quote: QuoteResult | null) => {
    setState((prev) => (prev.quote === quote ? prev : { ...prev, quote }));
  }, []);
  const setGuest = useCallback((guest: GuestInfo) => {
    setState((prev) => ({ ...prev, guest }));
  }, []);
  const resetSelection = useCallback(() => {
    setState((prev) => ({ ...prev, selectedAccommodationId: null, selectedPlanId: null, quote: null }));
  }, []);

  const syncFromUrl = useCallback(() => {
    const entrada = query.get('entrada') ?? '';
    const salida = query.get('salida') ?? '';
    const adultos = parseInt(query.get('adultos') ?? '2', 10);
    const menores = parseInt(query.get('menores') ?? '0', 10);
    const edades = query.get('edades') ?? '';
    const alojamiento = query.get('alojamiento') ?? '';
    const planParam = query.get('plan') ?? '';

    setState((prev) => ({
      ...prev,
      checkIn: entrada || prev.checkIn,
      checkOut: salida || prev.checkOut,
      adults: isNaN(adultos) || adultos < 1 ? 2 : adultos,
      childrenAges: menores > 0 ? parseAgesParam(edades) : [],
      selectedAccommodationId: alojamiento || prev.selectedAccommodationId,
      selectedPlanId: planParam === 'standard' || planParam === '' ? null : (parseInt(planParam, 10) || null),
      quote: null,
    }));
  }, [query]);

  useEffect(() => {
    syncFromUrl();
  }, [syncFromUrl]);

  const searchQuery = useMemo(
    () => ({
      checkIn: state.checkIn,
      checkOut: state.checkOut,
      guests: { adults: state.adults, childrenAges: state.childrenAges } as GuestComposition,
      accommodationType: (state.accommodationType || undefined) as AccommodationType | undefined,
    }),
    [state.checkIn, state.checkOut, state.adults, state.childrenAges, state.accommodationType],
  );

  const buildQueryString = useCallback((): string => {
    const s = stateRef.current;
    const params = new URLSearchParams();
    if (s.checkIn) params.set('entrada', s.checkIn);
    if (s.checkOut) params.set('salida', s.checkOut);
    if (s.adults) params.set('adultos', String(s.adults));
    if (s.childrenAges.length > 0) {
      params.set('menores', String(s.childrenAges.length));
      params.set('edades', s.childrenAges.join('-'));
    }
    if (s.selectedAccommodationId) params.set('alojamiento', s.selectedAccommodationId);
    if (s.selectedPlanId !== null) params.set('plan', String(s.selectedPlanId));
    else if (s.selectedAccommodationId) params.set('plan', 'standard');
    return params.toString();
  }, []);

  const value = useMemo<BookingContextValue>(
    () => ({
      state,
      setCheckIn,
      setCheckOut,
      setAdults,
      setChildrenAges,
      setAccommodationType,
      selectAccommodation,
      setExtras,
      setQuote,
      setGuest,
      resetSelection,
      searchQuery,
      buildQueryString,
      syncFromUrl,
    }),
    [state, searchQuery, buildQueryString, syncFromUrl, setCheckIn, setCheckOut, setAdults, setChildrenAges, setAccommodationType, selectAccommodation, setExtras, setQuote, setGuest, resetSelection],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking(): BookingContextValue {
  return useContext(BookingContext);
}

export { todayInPanama };
