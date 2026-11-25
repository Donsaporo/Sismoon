import { useState, useEffect, useCallback } from 'react';
import { ArrowRight, Loader, Check, AlertCircle } from 'lucide-react';
import { useBooking, todayInPanama } from './BookingContext';
import { BookingService } from '../booking/BookingService';
import { bookingConfig } from '../booking/config';
import type { QuoteResult } from '../booking/types';
import { formatCurrency, nightsLabel, nightsBetween } from '../booking/utils';
import { useNavigate } from '../router';

const bookingService = new BookingService(bookingConfig);

type BookingModuleProps = {
  accommodationId: string;
  capacity: number;
  maxCapacity: number;
};

export function BookingModule({ accommodationId, capacity, maxCapacity }: BookingModuleProps) {
  const { state, setCheckIn, setCheckOut, setAdults, setChildrenAges, searchQuery, selectAccommodation, setQuote, buildQueryString } = useBooking();
  const navigate = useNavigate();
  const today = todayInPanama();
  const [quote, setQuoteState] = useState<QuoteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [availablePlans, setAvailablePlans] = useState<{ planId: number | null; planName: string; totalCents: number; averagePerNightCents: number }[]>([]);
  const [error, setError] = useState('');

  const hasDates = state.checkIn && state.checkOut;
  const nights = nightsBetween(state.checkIn, state.checkOut);

  const fetchQuote = useCallback(async () => {
    if (!hasDates || nights <= 0) return;
    setLoading(true);
    setError('');

    const response = await bookingService.searchAvailability(searchQuery);
    if (!response.searchValid) {
      setQuoteState(null);
      setError(response.validationErrors[0] ?? 'No hay disponibilidad para estas fechas.');
      setLoading(false);
      return;
    }

    const result = response.results.find((r) => r.accommodationId === accommodationId);
    if (!result || result.availability !== 'available' || result.plans.length === 0) {
      setQuoteState(null);
      setError(result?.statusMessage ?? 'No hay disponibilidad o cotización para esta selección. Prueba con otras fechas.');
      setAvailablePlans([]);
      setLoading(false);
      return;
    }

    setAvailablePlans(result.plans.map((p) => ({
      planId: p.planId,
      planName: p.planName,
      totalCents: p.totalCents,
      averagePerNightCents: p.averagePerNightCents,
    })));

    const planToUse = selectedPlanId !== null ? result.plans.find((p) => p.planId === selectedPlanId) : null;
    const plan = planToUse ?? result.plans[0];
    setSelectedPlanId(plan.planId);

    const q = await bookingService.getQuote(searchQuery, accommodationId, plan.planId, state.extras);
    if (!q) {
      setQuoteState(null);
      setError('No se pudo obtener una cotización. Prueba con otras fechas.');
    } else {
      setQuoteState(q);
      setQuote(q);
    }
    setLoading(false);
  }, [hasDates, nights, searchQuery, accommodationId, state.extras, selectedPlanId, setQuote]);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  const handlePlanChange = async (planId: number | null) => {
    setSelectedPlanId(planId);
    if (!hasDates || nights <= 0) return;
    setLoading(true);
    const q = await bookingService.getQuote(searchQuery, accommodationId, planId, state.extras);
    if (q) {
      setQuoteState(q);
      setQuote(q);
    }
    setLoading(false);
  };

  const handleContinue = () => {
    if (!quote) return;
    selectAccommodation(accommodationId, selectedPlanId);
    const qs = buildQueryString();
    navigate(`/reservar/checkout?${qs}`);
  };

  return (
    <div className="booking-module">
      <h3>Reservar esta estancia</h3>
      <p className="booking-module-capacity">Ideal {capacity} · hasta {maxCapacity} personas</p>

      <div className="booking-module-dates">
        <label>Entrada
          <input type="date" min={today} value={state.checkIn} onChange={(e) => setCheckIn(e.target.value)} />
        </label>
        <label>Salida
          <input type="date" min={state.checkIn || today} value={state.checkOut} onChange={(e) => setCheckOut(e.target.value)} />
        </label>
      </div>

      <div className="booking-module-guests">
        <label>Adultos
          <input type="number" min="1" max="12" value={state.adults} onChange={(e) => setAdults(Math.max(1, Number(e.target.value)))} />
        </label>
        <label>Menores
          <input type="number" min="0" max="6" value={state.childrenAges.length} onChange={(e) => {
            const count = Math.max(0, Number(e.target.value));
            const ages = Array(count).fill(-1);
            setChildrenAges(ages);
          }} />
        </label>
      </div>

      {availablePlans.length > 1 && (
        <label className="booking-module-plan">Plan
          <select value={selectedPlanId ?? 'standard'} onChange={(e) => {
            const val = e.target.value === 'standard' ? null : parseInt(e.target.value, 10);
            handlePlanChange(val);
          }}>
            {availablePlans.map((p) => (
              <option key={p.planId ?? 'standard'} value={p.planId ?? 'standard'}>{p.planName}</option>
            ))}
          </select>
        </label>
      )}

      {state.childrenAges.map((age, i) => (
        <label key={i} className="booking-module-age">Edad del menor {i + 1}
          <select value={age} onChange={(e) => {
            const ages = [...state.childrenAges];
            ages[i] = Number(e.target.value);
            setChildrenAges(ages);
          }}>
            <option value={-1} disabled>Selecciona la edad</option>
            {Array.from({ length: 18 }, (_, a) => <option key={a} value={a}>{a} años</option>)}
          </select>
        </label>
      ))}

      {!hasDates && <p className="booking-module-prompt">Selecciona tus fechas para ver disponibilidad y total.</p>}

      {hasDates && nights <= 0 && <p className="booking-module-error">La salida debe ser posterior a la entrada.</p>}

      {hasDates && nights > 0 && loading && <div className="booking-module-loading"><Loader size={16} className="spin" /> Consultando disponibilidad...</div>}

      {hasDates && nights > 0 && !loading && error && <p className="booking-module-error"><AlertCircle size={14} /> {error}</p>}

      {hasDates && nights > 0 && !loading && quote && (
        <div className="booking-module-quote">
          <div className="booking-module-quote-total">
            <span>Total de la estancia</span>
            <strong>{formatCurrency(quote.totalCents)}</strong>
          </div>
          <span className="booking-module-quote-avg">{nightsLabel(nights)} · Promedio {formatCurrency(quote.averagePerNightCents)} por noche</span>
          <div className="booking-module-deposit">
            <span>Pago en el hotel · sin cobro online</span>
          </div>
          {quote.inclusions.map((inc) => (
            <div key={inc} className="booking-module-inclusion"><Check size={12} /> {inc}</div>
          ))}
          <button className="dark-button booking-module-cta" onClick={handleContinue}>
            Continuar <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
