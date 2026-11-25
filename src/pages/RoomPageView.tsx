import { hotelInfo, photosById, roomExteriorNote, roomPages, type RoomPage } from '../data/catalog';
import { Breadcrumbs, PageIntro } from '../components/Shared';
import { BookingModule } from '../components/BookingModule';
import { useNavigate } from '../router';
import { CalendarDays } from 'lucide-react';

export default function RoomPageView({ room }: { room: RoomPage }) {
  const navigate = useNavigate();
  const related = room.folderRelated.map((id) => photosById[id]);
  const fallback = room.fallback.map((id) => photosById[id]);
  const display = related.length > 0 ? related : fallback;

  const scrollToBooking = () => {
    document.getElementById('booking-module')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="page">
      <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Habitaciones', to: '/habitaciones' }, { label: room.label }]} />
      <PageIntro overline="HABITACIÓN" title={room.label} copy="¿Te interesa esta habitación? Dinos cuándo quieres venir y cuántos vienen contigo. Te confirmamos la disponibilidad, el plan y las condiciones para tu estancia." />

      <div className="villa-layout">
        <div className="villa-main">
          <section className="gallery-section">
            <h2>Exteriores del hotel</h2>
            <p className="small-copy">{roomExteriorNote}</p>
            <div className="room-photo-grid">
              {display.map((photo) => (
                <button key={photo.id} className="room-photo-item" style={{ backgroundImage: `url(${photo.url})` }} role="img" aria-label={photo.alt} onClick={() => navigate('/galeria')} />
              ))}
            </div>
          </section>

          <section className="conditions-box">
            <h3>Planes del hotel</h3>
            <p>Esta habitación está disponible con y sin desayuno americano. Consulta la disponibilidad y el total para tus fechas usando el módulo de reserva.</p>
          </section>

          <section className="conditions-box">
            <h3>Condiciones</h3>
            <p>Consulta la tarifa para tus fechas. Atención {hotelInfo.hours.toLowerCase()}.</p>
          </section>
        </div>

        <aside className="villa-aside">
          <div id="booking-module">
            <BookingModule
              accommodationId={room.slug}
              capacity={2}
              maxCapacity={4}
            />
          </div>
          <div className="aside-box">
            <h3>Otras habitaciones</h3>
            <div className="aside-links">
              {roomPages.filter((entry) => entry.slug !== room.slug).map((entry) => (
                <button key={entry.slug} onClick={() => navigate(`/habitaciones/${entry.slug}`)}>{entry.label}</button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="mobile-sticky-bar">
        <span className="mobile-sticky-label">{room.label}</span>
        <button className="dark-button" onClick={scrollToBooking}>
          <CalendarDays size={16} /> Reservar
        </button>
      </div>
    </div>
  );
}
