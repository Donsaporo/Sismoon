import { useState, useEffect, useCallback } from 'react';
import { ArrowRight, Users, AlertCircle, ChevronDown, ChevronUp, RotateCcw, Filter, MessageCircle, Phone } from 'lucide-react';
import { useBooking } from '../components/BookingContext';
import { SearchBar } from '../components/SearchBar';
import { SmartImage } from '../components/SmartImage';
import { Breadcrumbs } from '../components/Shared';
import { BookingService } from '../booking/BookingService';
import { bookingConfig } from '../booking/config';
import { hotelInfo } from '../data/catalog';
import type { AccommodationResult, InventoryResponse, PlanQuote, AccommodationType } from '../booking/types';
import { formatCurrency, nightsLabel, guestsLabel, formatDateShort, nightsBetween } from '../booking/utils';
import { useNavigate, useQuery } from '../router';

const bookingService = new BookingService(bookingConfig);

type TypeFilter = 'all' | AccommodationType;

const filterLabels: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'room', label: 'Habitaciones' },
  { value: 'villa', label: 'Villas' },
  { value: 'glamping', label: 'Glamping' },
];

export default function BookingResults() {
  const { state, searchQuery, selectAccommodation, buildQueryString } = useBooking();
  const navigate = useNavigate();
  const query = useQuery();
  const [data, setData] = useState<InventoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  useEffect(() => {
    const tipo = query.get('tipo');
    if (tipo === 'room' || tipo === 'villa' || tipo === 'glamping') {
      setTypeFilter(tipo);
    }
  }, [query]);

  const hasSearch = state.checkIn && state.checkOut;
  const nights = nightsBetween(state.checkIn, state.checkOut);
  const nightsValid = hasSearch && nights > 0;

  const doSearch = useCallback(async () => {
    if (!hasSearch) return;
    setLoading(true);
    const response = await bookingService.searchAvailability(searchQuery);
    setData(response);
    setLoading(false);
  }, [searchQuery, hasSearch]);

  useEffect(() => {
    doSearch();
  }, [doSearch]);

  const handleSelect = (result: AccommodationResult, plan: PlanQuote) => {
    selectAccommodation(result.accommodationId, plan.planId);
    const qs = buildQueryString();
    navigate(`/reservar/checkout?${qs}`);
  };

  const toggleDetail = (id: string) => {
    setExpandedDetails((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const allResults = data?.results ?? [];
  const filteredResults = typeFilter === 'all'
    ? allResults
    : allResults.filter((r) => r.type === typeFilter);
  const availableResults = filteredResults.filter((r) => r.availability === 'available');
  const unavailableResults = filteredResults.filter((r) => r.availability !== 'available');

  return (
    <div className="page booking-results-page">
      <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Reservar' }]} />

      <div className="booking-info-banner">
        <strong>Reserva sin cobro online</strong> · El pago se realiza en el hotel. Busca tu espacio y reserva tu estancia.
      </div>

      <div className="results-header">
        <div className="results-summary">
          {nightsValid ? (
            <>
              <h1>Tu estancia en Sister Moon</h1>
              <p className="results-meta">
                {formatDateShort(state.checkIn)} — {formatDateShort(state.checkOut)} · {nightsLabel(nights)} · {guestsLabel(searchQuery.guests)}
              </p>
              <button className="change-search-btn" onClick={() => setShowSearch(!showSearch)}>
                <RotateCcw size={14} /> Cambiar búsqueda
              </button>
            </>
          ) : (
            <>
              <h1>Elige tus fechas y encuentra tu espacio en la isla</h1>
              <p className="results-meta">Selecciona entrada, salida y huéspedes para ver disponibilidad y total.</p>
            </>
          )}
        </div>
      </div>

      {showSearch && (
        <div className="results-search-wrap">
          <SearchBar variant="inline" onSubmit={() => { setShowSearch(false); doSearch(); }} />
        </div>
      )}

      {!hasSearch && (
        <div className="results-prompt">
          <SearchBar variant="inline" />
        </div>
      )}

      {hasSearch && !nightsValid && (
        <div className="results-no-availability results-validation-error" role="alert">
          <AlertCircle size={32} />
          <h2>Revisa las fechas</h2>
          <p>La salida debe ser posterior a la entrada. Ajusta las fechas para buscar disponibilidad.</p>
          <div className="center-row">
            <button className="dark-button" onClick={() => setShowSearch(true)}>Cambiar fechas</button>
          </div>
        </div>
      )}

      {nightsValid && loading && (
        <div className="results-loading">
          <div className="results-skeleton" />
          <div className="results-skeleton" />
          <div className="results-skeleton" />
        </div>
      )}

      {nightsValid && !loading && data && !data.searchValid && (
        <div className="results-no-availability results-validation-error" role="alert">
          <AlertCircle size={32} />
          <h2>No podemos consultar disponibilidad en este momento</h2>
          {data.validationErrors.map((error) => <p key={error}>{error}</p>)}
          <div className="results-contact-fallback">
            <p>Contáctanos directamente y te ayudamos con tu reserva:</p>
            <a href={hotelInfo.whatsappLink} target="_blank" rel="noopener noreferrer" className="dark-button">
              <MessageCircle size={16} /> WhatsApp {hotelInfo.whatsappDisplay}
            </a>
            <a href={`tel:+${hotelInfo.whatsappNumber}`} className="dark-button">
              <Phone size={16} /> {hotelInfo.whatsappDisplay}
            </a>
          </div>
        </div>
      )}

      {nightsValid && !loading && data && data.searchValid && (
        <>
          <div className="results-type-filters">
            <Filter size={15} />
            {filterLabels.map((f) => (
              <button
                key={f.value}
                className={typeFilter === f.value ? 'filter-chip active' : 'filter-chip'}
                onClick={() => setTypeFilter(f.value)}
              >{f.label}</button>
            ))}
          </div>

          {availableResults.length > 0 && (
            <div className="results-list">
              {availableResults.map((result) => (
                <ResultCard
                  key={result.accommodationId}
                  result={result}
                  onSelect={handleSelect}
                  expanded={!!expandedDetails[result.accommodationId]}
                  onToggleDetail={() => toggleDetail(result.accommodationId)}
                  guests={searchQuery.guests}
                />
              ))}
            </div>
          )}

          {availableResults.length === 0 && unavailableResults.length > 0 && (
            <div className="results-no-availability">
              <AlertCircle size={32} />
              <h2>No encontramos disponibilidad para estas fechas</h2>
              <p>Prueba con otras fechas o explora otras opciones.</p>
              <div className="center-row">
                <button className="dark-button" onClick={() => setShowSearch(true)}>Cambiar fechas</button>
              </div>
            </div>
          )}

          {unavailableResults.length > 0 && availableResults.length > 0 && (
            <details className="results-unavailable-toggle">
              <summary>Otras opciones no disponibles para esta búsqueda ({unavailableResults.length})</summary>
              <div className="results-list">
                {unavailableResults.map((result) => (
                  <ResultCard
                    key={result.accommodationId}
                    result={result}
                    onSelect={handleSelect}
                    expanded={!!expandedDetails[result.accommodationId]}
                    onToggleDetail={() => toggleDetail(result.accommodationId)}
                    dimmed
                    guests={searchQuery.guests}
                  />
                ))}
              </div>
            </details>
          )}
        </>
      )}
    </div>
  );
}

type ResultCardProps = {
  result: AccommodationResult;
  onSelect: (result: AccommodationResult, plan: PlanQuote) => void;
  expanded: boolean;
  onToggleDetail: () => void;
  dimmed?: boolean;
  guests: { adults: number; childrenAges: number[] };
};

function ResultCard({ result, onSelect, expanded, onToggleDetail, dimmed, guests }: ResultCardProps) {
  const unavailable = result.availability !== 'available';
  const totalGuests = guests.adults + guests.childrenAges.length;
  const exceedsCapacity = totalGuests > result.capacity;
  const typeLabel = result.type === 'room' ? 'Habitación' : result.type === 'villa' ? 'Villa' : 'Glamping';

  return (
    <article className={`result-card ${dimmed ? 'dimmed' : ''}`}>
      <div className="result-card-image">
        {result.coverUrl ? (
          <SmartImage src={result.coverUrl} alt={result.photoAlt} aspectRatio="4/3" loading="lazy" />
        ) : (
          <div className="result-card-image-placeholder" />
        )}
        {result.accommodationId === 'villa-4' && <span className="villa-ref-badge">Ambiente del hotel · imagen de referencia</span>}
      </div>

      <div className="result-card-body">
        <div className="result-card-info">
          <span className="result-type-label">{typeLabel}</span>
          <h3>{result.name}</h3>
          <p className="result-capacity"><Users size={14} /> Ideal {result.capacity} · hasta {result.maxCapacity} personas</p>
          {exceedsCapacity && result.type === 'villa' && (
            <p className="result-capacity-note">La capacidad ampliada requiere un colchón inflable que trae el huésped.</p>
          )}
          <p className="result-description">{result.description}</p>
          <div className="result-services">
            {result.services.slice(0, 5).map((s) => <span key={s} className="result-service-tag">{s}</span>)}
          </div>
        </div>

        <div className="result-card-action">
          {unavailable ? (
            <div className="result-unavailable">
              <p className="result-unavailable-msg">{result.statusMessage ?? 'No disponible para esta búsqueda.'}</p>
              {result.availability === 'min-nights-not-met' && result.minNightsRequired && (
                <p className="result-min-nights">Para estas fechas, la estancia mínima es de {result.minNightsRequired} noches.</p>
              )}
              {result.availability === 'pending-rule' && (
                <p className="result-pending-msg">Selecciona otras fechas o consulta directamente.</p>
              )}
            </div>
          ) : (
            <>
              {result.plans.map((plan) => (
                <div key={plan.planId ?? 'standard'} className="result-plan">
                  <div className="result-plan-info">
                    <strong className="result-plan-name">{plan.planName}</strong>
                    <span className="result-plan-total">{formatCurrency(plan.totalCents)}</span>
                    <span className="result-plan-avg">Promedio {formatCurrency(plan.averagePerNightCents)} por noche</span>
                    <span className="result-plan-deposit">Pago en el hotel</span>
                  </div>
                  <button className="dark-button" onClick={() => onSelect(result, plan)}>
                    Elegir <ArrowRight size={15} />
                  </button>
                </div>
              ))}
              {expanded && result.plans[0] && (
                <div className="result-price-detail">
                  <div className="price-detail-row">
                    <span>Estancia</span>
                    <span>{nightsLabel(result.plans[0].nights.length)}</span>
                  </div>
                  <div className="price-detail-row">
                    <span>{result.plans[0].planName}</span>
                    <span>{formatCurrency(result.plans[0].accommodationSubtotalCents)}</span>
                  </div>
                  {result.plans[0].extrasTotalCents > 0 && (
                    <div className="price-detail-row">
                      <span>Adicionales</span>
                      <span>{formatCurrency(result.plans[0].extrasTotalCents)}</span>
                    </div>
                  )}
                  <div className="price-detail-row price-detail-total">
                    <span>Total</span>
                    <strong>{formatCurrency(result.plans[0].totalCents)}</strong>
                  </div>
                  <div className="price-detail-row">
                    <span>Pago</span>
                    <span>En el hotel</span>
                  </div>
                </div>
              )}
              {result.plans[0] && (
                <button className="result-detail-toggle" onClick={onToggleDetail}>
                  {expanded ? <><ChevronUp size={14} /> Ver menos detalle</> : <><ChevronDown size={14} /> Ver detalle del precio</>}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
