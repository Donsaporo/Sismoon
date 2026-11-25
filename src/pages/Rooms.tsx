import { ArrowRight } from 'lucide-react';
import { photosById, roomExteriorNote, roomPages } from '../data/catalog';
import { Breadcrumbs, PageIntro } from '../components/Shared';
import { useNavigate } from '../router';

export default function Rooms() {
  const navigate = useNavigate();
  const gallery = ['sm-018', 'sm-019', 'sm-020', 'sm-021', 'sm-022', 'sm-023', 'sm-024', 'sm-025', 'sm-026', 'sm-027', 'sm-028', 'sm-029'].map((id) => photosById[id]);

  return (
    <div className="page">
      <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Habitaciones' }]} />
      <PageIntro overline="HABITACIONES" title={<>Habitaciones en Isla Grande</>} copy="Trae un libro. Lo demás puede esperar. Conoce las opciones del hotel y escoge tu plan. Si vienes con niños o necesitas espacio para alguien más, cuéntanos para revisar la opción que les quede mejor." />

      <section className="gallery-section">
        <div className="section-head">
          <h2>Un vistazo al hotel</h2>
          <p className="small-copy">{roomExteriorNote}</p>
        </div>
        <div className="photo-strip">
          {gallery.map((photo) => (
            <button key={photo.id} style={{ backgroundImage: `url(${photo.url})` }} role="img" aria-label={photo.alt} onClick={() => navigate('/galeria')} />
          ))}
        </div>
      </section>

      <section className="plans-section">
        <div className="section-head">
          <h2>Conoce nuestras habitaciones</h2>
          <p className="lead-copy">Dos planes del hotel: con y sin desayuno americano. Elige el tuyo y consulta la disponibilidad para tus fechas.</p>
        </div>
        <div className="plans-grid">
          <article className="plan-card">
            <h3>Habitación sin desayuno</h3>
            <p className="plan-desc">El plan base del hotel. ITBMS incluido.</p>
            <button className="dark-button" onClick={() => navigate('/reservar')}>Ver disponibilidad <ArrowRight size={15} /></button>
          </article>
          <article className="plan-card">
            <h3>Habitación con desayuno</h3>
            <p className="plan-desc">Incluye desayuno americano e ITBMS.</p>
            <button className="dark-button" onClick={() => navigate('/reservar')}>Ver disponibilidad <ArrowRight size={15} /></button>
          </article>
        </div>
      </section>

      <section className="room-links-box">
        <h3>Conoce nuestras habitaciones</h3>
        <p className="small-copy">Cada habitación tiene su ficha: elige la tuya y la consultamos contigo.</p>
        <div className="room-links">
          {roomPages.map((room) => (
            <button key={room.slug} onClick={() => navigate(`/habitaciones/${room.slug}`)}>{room.label}</button>
          ))}
        </div>
      </section>

      <section className="conditions-box">
        <h3>Adicionales del hotel</h3>
        <p className="small-copy">Niños, adultos adicionales, mascotas, coolers y descorche de botella. Los montos se incluyen en la cotización según tu grupo y plan.</p>
        <button className="ghost-button" onClick={() => navigate('/reservar')}>Cotizar mi estancia <ArrowRight size={15} /></button>
      </section>
    </div>
  );
}
