import { useState } from 'react';
import { CalendarDays, Users, Search, Minus, Plus, X } from 'lucide-react';
import { useBooking, todayInPanama } from './BookingContext';
import { useNavigate } from '../router';
import { nightsBetween } from '../booking/utils';

type SearchBarProps = {
  variant?: 'hero' | 'inline';
  onSubmit?: () => void;
};

export function SearchBar({ variant = 'hero', onSubmit }: SearchBarProps) {
  const { state, setCheckIn, setCheckOut, setAdults, setChildrenAges } = useBooking();
  const navigate = useNavigate();
  const today = todayInPanama();
  const [showGuests, setShowGuests] = useState(false);
  const [error, setError] = useState('');

  const nights = nightsBetween(state.checkIn, state.checkOut);
  const childCount = state.childrenAges.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.checkIn || !state.checkOut) {
      setError('Selecciona fechas de entrada y salida.');
      return;
    }
    if (state.checkOut <= state.checkIn) {
      setError('La salida debe ser posterior a la entrada.');
      return;
    }
    if (state.checkIn < today) {
      setError('La entrada no puede ser anterior a hoy.');
      return;
    }
    if (state.childrenAges.some((a) => a < 0)) {
      setError('Selecciona la edad de cada menor.');
      return;
    }
    setError('');
    const qs = buildSearchQS(state.checkIn, state.checkOut, state.adults, state.childrenAges);
    navigate(`/reservar?${qs}`);
    onSubmit?.();
  };

  const addChild = () => {
    if (state.childrenAges.length >= 6) return;
    setChildrenAges([...state.childrenAges, -1]);
  };

  const removeChild = (index: number) => {
    setChildrenAges(state.childrenAges.filter((_, i) => i !== index));
  };

  const updateChildAge = (index: number, age: number) => {
    const ages = [...state.childrenAges];
    ages[index] = age;
    setChildrenAges(ages);
  };

  const guestSummary = `${state.adults} ${state.adults === 1 ? 'adulto' : 'adultos'}${childCount > 0 ? `, ${childCount} ${childCount === 1 ? 'menor' : 'menores'}` : ''}`;

  return (
    <form className={`search-bar ${variant === 'inline' ? 'search-bar-inline' : ''}`} onSubmit={handleSubmit}>
      <label className="search-field">
        <span>ENTRADA</span>
        <div className="search-field-input">
          <CalendarDays size={17} />
          <input
            type="date"
            min={today}
            aria-label="Fecha de entrada"
            value={state.checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
          />
        </div>
      </label>

      <label className="search-field">
        <span>SALIDA</span>
        <div className="search-field-input">
          <CalendarDays size={17} />
          <input
            type="date"
            min={state.checkIn || today}
            aria-label="Fecha de salida"
            value={state.checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </div>
      </label>

      <div className="search-field guest-field">
        <span>HUÉSPEDES</span>
        <button type="button" className="guest-trigger" onClick={() => setShowGuests(!showGuests)}>
          <Users size={16} />
          <strong>{guestSummary}</strong>
        </button>
        {showGuests && (
          <div className="guest-panel" role="dialog" aria-label="Selección de huéspedes">
            <div className="guest-row">
              <span>Adultos</span>
              <div className="stepper">
                <button type="button" onClick={() => setAdults(Math.max(1, state.adults - 1))} aria-label="Menos adultos"><Minus size={14} /></button>
                <strong>{state.adults}</strong>
                <button type="button" onClick={() => setAdults(Math.min(12, state.adults + 1))} aria-label="Más adultos"><Plus size={14} /></button>
              </div>
            </div>
            {state.childrenAges.map((age, i) => (
              <div key={i} className="guest-row">
                <span>Menor {i + 1} <button type="button" className="child-remove" onClick={() => removeChild(i)} aria-label="Quitar menor"><X size={12} /></button></span>
                <select value={age} aria-label={`Edad del menor ${i + 1}`} onChange={(e) => updateChildAge(i, Number(e.target.value))}>
                  <option value={-1} disabled>Selecciona la edad</option>
                  {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17].map((a) => <option key={a} value={a}>{a} años</option>)}
                </select>
              </div>
            ))}
            <button type="button" className="add-child-btn" onClick={addChild}><Plus size={14} /> Añadir menor</button>
            <button type="button" className="guest-done-btn" onClick={() => setShowGuests(false)}>Listo</button>
          </div>
        )}
      </div>

      <button className="search-submit" type="submit">
        <Search size={16} /> Ver disponibilidad
      </button>
      {error && <p className="search-error" role="alert">{error}</p>}
      {nights > 0 && !error && <p className="search-nights">{nights} {nights === 1 ? 'noche' : 'noches'}</p>}
    </form>
  );
}

function buildSearchQS(checkIn: string, checkOut: string, adults: number, childAges: number[]): string {
  const params = new URLSearchParams();
  params.set('entrada', checkIn);
  params.set('salida', checkOut);
  params.set('adultos', String(adults));
  if (childAges.length > 0) {
    params.set('menores', String(childAges.length));
    params.set('edades', childAges.join('-'));
  }
  return params.toString();
}
