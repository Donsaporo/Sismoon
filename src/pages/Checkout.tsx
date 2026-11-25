import { useState, useEffect, useCallback } from 'react';
import { ArrowRight, Check, AlertCircle, Loader, CalendarDays, Users, BedDouble, Phone, MessageCircle, Mail, Info } from 'lucide-react';
import { useBooking } from '../components/BookingContext';
import { Breadcrumbs } from '../components/Shared';
import { BookingService } from '../booking/BookingService';
import { bookingConfig } from '../booking/config';
import { villaList, roomPages, hotelInfo } from '../data/catalog';
import type { QuoteResult, Reservation } from '../booking/types';
import { formatCurrency, nightsLabel, guestsLabel, formatDateShort, nightsBetween, isQuoteExpired, generateIdempotencyKey } from '../booking/utils';
import { useNavigate } from '../router';

const bookingService = new BookingService(bookingConfig);

type CheckoutStep = 'guest' | 'review' | 'result';

const stepLabels: { key: CheckoutStep; label: string }[] = [
  { key: 'guest', label: 'Tus datos' },
  { key: 'review', label: 'Revisión' },
  { key: 'result', label: 'Confirmación' },
];

function StepIndicator({ current }: { current: CheckoutStep }) {
  const currentIdx = stepLabels.findIndex((s) => s.key === current);
  return (
    <div className="checkout-steps-indicator">
      {stepLabels.map((step, idx) => (
        <div key={step.key} style={{ display: 'contents' }}>
          <div className={`checkout-step-item ${idx === currentIdx ? 'active' : idx < currentIdx ? 'done' : ''}`}>
            <span className="checkout-step-num">{idx < currentIdx ? <Check size={14} /> : idx + 1}</span>
            {step.label}
          </div>
          {idx < stepLabels.length - 1 && <div className={`checkout-step-line ${idx < currentIdx ? 'done' : ''}`} />}
        </div>
      ))}
    </div>
  );
}

export default function Checkout() {
  const { state, searchQuery, setQuote, setGuest } = useBooking();
  const navigate = useNavigate();
  const [step, setStep] = useState<CheckoutStep>('guest');
  const [quote, setQuoteState] = useState<QuoteResult | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState('');
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [processing, setProcessing] = useState(false);
  const [formError, setFormError] = useState('');

  const accommodationName = getAccommodationName(state.selectedAccommodationId);

  const fetchQuote = useCallback(async () => {
    if (!state.selectedAccommodationId || !state.checkIn || !state.checkOut) return;
    setLoadingQuote(true);
    setQuoteError('');
    const q = await bookingService.getQuote(
      searchQuery,
      state.selectedAccommodationId,
      state.selectedPlanId,
      state.extras,
    );
    if (!q) {
      setQuoteError('No pudimos obtener una cotización para esta selección. Prueba con otras fechas o contáctanos directamente.');
      setLoadingQuote(false);
      return;
    }
    setQuoteState(q);
    setQuote(q);
    setLoadingQuote(false);
  }, [state.selectedAccommodationId, state.selectedPlanId, state.checkIn, state.checkOut, state.extras, searchQuery, setQuote]);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  if (!state.selectedAccommodationId) {
    return (
      <div className="page">
        <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Reservar', to: '/reservar' }, { label: 'Checkout' }]} />
        <div className="checkout-empty">
          <h1>No hay una selección activa</h1>
          <p>Elige un alojamiento desde la página de resultados para iniciar tu reserva.</p>
          <button className="dark-button" onClick={() => navigate('/reservar')}>Ver disponibilidad <ArrowRight size={15} /></button>
        </div>
      </div>
    );
  }

  const nights = nightsBetween(state.checkIn, state.checkOut);

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const g = state.guest;
    if (!g.firstName.trim() || !g.lastName.trim()) { setFormError('Indica nombre y apellido del titular.'); return; }
    if (!g.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(g.email)) { setFormError('Indica un correo válido.'); return; }
    if (!g.phone.trim()) { setFormError('Indica un teléfono de contacto.'); return; }
    setFormError('');
    setStep('review');
  };

  const handleConfirm = async () => {
    if (!quote) return;
    if (isQuoteExpired(quote.expiresAt)) {
      setFormError('La cotización ha expirado. Vuelve a buscar para obtener una nueva.');
      return;
    }
    setProcessing(true);
    setFormError('');
    try {
      const idempotencyKey = generateIdempotencyKey();
      const res = await bookingService.createPendingReservation(quote, state.guest, idempotencyKey);
      setReservation(res);
      setStep('result');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Ocurrió un error al procesar tu reserva. Inténtalo de nuevo o contáctanos.');
    }
    setProcessing(false);
  };

  return (
    <div className="page checkout-page">
      <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Reservar', to: '/reservar' }, { label: 'Checkout' }]} />

      <div className="booking-info-banner">
        <strong>Reserva sin cobro online</strong> · El pago se realiza en el hotel. Tu reserva se registra y nos pondremos en contacto contigo.
      </div>

      <div className="checkout-layout">
        <div className="checkout-main">
          <StepIndicator current={step} />
          {step === 'guest' && (
            <section className="checkout-step">
              <h1>Tus datos</h1>
              <p className="checkout-step-desc">Necesitamos unos datos básicos para preparar tu reserva.</p>
              <form className="checkout-form" onSubmit={handleGuestSubmit}>
                <div className="form-row-2">
                  <label>Nombre
                    <input type="text" required value={state.guest.firstName} onChange={(e) => setGuest({ ...state.guest, firstName: e.target.value })} />
                  </label>
                  <label>Apellido
                    <input type="text" required value={state.guest.lastName} onChange={(e) => setGuest({ ...state.guest, lastName: e.target.value })} />
                  </label>
                </div>
                <label>Correo electrónico
                  <input type="email" required value={state.guest.email} onChange={(e) => setGuest({ ...state.guest, email: e.target.value })} />
                </label>
                <label>Teléfono
                  <input type="tel" required value={state.guest.phone} onChange={(e) => setGuest({ ...state.guest, phone: e.target.value })} />
                </label>
                <label>Notas (opcional)
                  <textarea rows={3} placeholder="Mascotas, horario de llegada, lo que quieras agregar" value={state.guest.notes} onChange={(e) => setGuest({ ...state.guest, notes: e.target.value })} />
                </label>
                {formError && <p className="field-error" role="alert">{formError}</p>}
                <button className="dark-button" type="submit">Continuar a revisión <ArrowRight size={16} /></button>
              </form>
            </section>
          )}

          {step === 'review' && (
            <section className="checkout-step">
              <h1>Revisa tu reserva</h1>
              <p className="checkout-step-desc">Confirma los detalles de tu estancia. No se realiza ningún cobro online.</p>
              <div className="payment-box">
                <div className="review-details">
                  <div className="review-row"><CalendarDays size={16} /> <span>{formatDateShort(state.checkIn)} — {formatDateShort(state.checkOut)}</span></div>
                  <div className="review-row"><span>{nightsLabel(nights)}</span></div>
                  <div className="review-row"><Users size={16} /> <span>{guestsLabel(searchQuery.guests)}</span></div>
                  <div className="review-row"><BedDouble size={16} /> <span>{accommodationName}</span></div>
                  <div className="review-row review-guest">
                    <strong>Titular:</strong> {state.guest.firstName} {state.guest.lastName}
                    <br />
                    <strong>Contacto:</strong> {state.guest.email} · {state.guest.phone}
                  </div>
                </div>
                {quote && (
                  <div className="review-price-box">
                    <div className="review-nights-breakdown">
                      {quote.nights.map((n) => (
                        <div key={n.date} className="summary-line">
                          <span>{formatDateShort(n.date)}</span>
                          <span>{formatCurrency(n.amountCents)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="summary-line summary-total"><span>Total de la estancia</span><strong>{formatCurrency(quote.totalCents)}</strong></div>
                    <p className="review-pay-at-hotel">El total se paga en el hotel. No se realiza ningún cobro online.</p>
                    {quote.inclusions.length > 0 && (
                      <div className="review-inclusions">
                        {quote.inclusions.map((inc) => (
                          <div key={inc} className="summary-inclusion"><Check size={13} /> {inc}</div>
                        ))}
                      </div>
                    )}
                    {quote.conditions.map((cond) => (
                      <p key={cond} className="summary-condition">{cond}</p>
                    ))}
                    <div className="review-tax-notice">
                      <Info size={14} /> Los impuestos aplicables se confirman al llegar al hotel.
                    </div>
                  </div>
                )}
                {formError && <p className="field-error" role="alert">{formError}</p>}
                <button className="dark-button checkout-pay-btn" onClick={handleConfirm} disabled={processing}>
                  {processing ? <><Loader size={16} className="spin" /> Procesando...</> : <>Confirmar reserva <ArrowRight size={16} /></>}
                </button>
              </div>
            </section>
          )}

          {step === 'result' && reservation && (
            <section className="checkout-step checkout-result">
              <ResultView reservation={reservation} onNewSearch={() => navigate('/reservar')} />
            </section>
          )}
        </div>

        <aside className="checkout-summary">
          <div className="summary-panel">
            <h3>Resumen de tu estancia</h3>
            <div className="summary-row"><CalendarDays size={15} /> <span>{formatDateShort(state.checkIn)} — {formatDateShort(state.checkOut)}</span></div>
            <div className="summary-row"><span>{nightsLabel(nights)}</span></div>
            <div className="summary-row"><Users size={15} /> <span>{guestsLabel(searchQuery.guests)}</span></div>
            <div className="summary-row"><BedDouble size={15} /> <span>{accommodationName}</span></div>
            <hr />
            {loadingQuote && <p className="summary-loading">Obteniendo cotización...</p>}
            {quoteError && <p className="summary-error">{quoteError}</p>}
            {quote && (
              <>
                <div className="summary-line"><span>Alojamiento</span><span>{formatCurrency(quote.accommodationSubtotalCents)}</span></div>
                {quote.extrasTotalCents > 0 && <div className="summary-line"><span>Adicionales</span><span>{formatCurrency(quote.extrasTotalCents)}</span></div>}
                <div className="summary-line summary-total"><span>Total de la estancia</span><strong>{formatCurrency(quote.totalCents)}</strong></div>
                <div className="summary-line"><span>Pago</span><span>En el hotel</span></div>
                {quote.inclusions.map((inc) => (
                  <div key={inc} className="summary-inclusion"><Check size={13} /> {inc}</div>
                ))}
                {quote.conditions.map((cond) => (
                  <p key={cond} className="summary-condition">{cond}</p>
                ))}
                <p className="summary-avg">Promedio {formatCurrency(quote.averagePerNightCents)} por noche</p>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function ResultView({ reservation, onNewSearch }: { reservation: Reservation; onNewSearch: () => void }) {
  const isCreated = reservation.status === 'created';
  const isUnknown = reservation.status === 'unknown';
  const lobbyRef = reservation.lobbyBookingIds.length > 0
    ? reservation.lobbyBookingIds.join(', ')
    : reservation.reservationId;

  return (
    <>
      {isCreated && (
        <div className="result-status result-approved">
          <div className="result-status-icon"><Check size={40} /></div>
          <h1>Tu reserva está registrada</h1>
          <p className="result-localizer">Número de reserva: <strong>{lobbyRef}</strong></p>
          {reservation.lobbyBookingIds.length > 1 && (
            <p className="result-distributed-note">
              Tu estancia se asignó en varias reservas ({reservation.lobbyBookingIds.length}). Esto puede significar que tu estancia se distribuye entre habitaciones. Te confirmaremos los detalles al contactarte.
            </p>
          )}
          <p>El pago se realiza en el hotel. Nos pondremos en contacto contigo para coordinar los detalles de tu llegada.</p>
        </div>
      )}
      {isUnknown && (
        <div className="result-status result-sync-pending">
          <div className="result-status-icon"><Loader size={40} /></div>
          <h1>Estamos verificando tu reserva</h1>
          <p className="result-localizer">Referencia: <strong>{reservation.reservationId}</strong></p>
          <p>Tu reserva fue recibida y la estamos verificando con el sistema. No necesitas enviarla de nuevo. Te contactaremos pronto para confirmar.</p>
        </div>
      )}

      <div className="result-contact-box">
        <h2>Contáctanos para coordinar tu pago y llegada</h2>
        <div className="result-contact-items">
          <a href={hotelInfo.whatsappLink} target="_blank" rel="noopener noreferrer" className="result-contact-item">
            <MessageCircle size={20} />
            <span>WhatsApp: {hotelInfo.whatsappDisplay}</span>
          </a>
          <a href={`tel:+${hotelInfo.whatsappNumber}`} className="result-contact-item">
            <Phone size={20} />
            <span>Teléfono: {hotelInfo.whatsappDisplay}</span>
          </a>
          <a href="mailto:reservas@sismoon.obzide.com" className="result-contact-item">
            <Mail size={20} />
            <span>Correo: reservas@sismoon.obzide.com</span>
          </a>
        </div>
        <p className="result-contact-note">{hotelInfo.hours}</p>
      </div>

      <div className="result-actions">
        <button className="dark-button" onClick={onNewSearch}>Hacer una nueva búsqueda <ArrowRight size={15} /></button>
      </div>
    </>
  );
}

function getAccommodationName(id: string | null): string {
  if (!id) return '';
  if (id.startsWith('villa-')) {
    const v = villaList.find((v) => v.slug === id);
    return v?.name ?? id;
  }
  if (id === 'glamping') return 'Glamping';
  const r = roomPages.find((r) => r.slug === id);
  return r?.label ?? id;
}
