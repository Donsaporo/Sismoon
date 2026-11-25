import { useState } from 'react';
import { ArrowRight, Check, Users, CalendarDays } from 'lucide-react';
import { photos, photosById, villaCommonConditions, villaList, villaCapacityNote, type Villa, type Photo } from '../data/catalog';
import { Breadcrumbs, Lightbox, PageIntro } from '../components/Shared';
import { BookingModule } from '../components/BookingModule';
import { useNavigate } from '../router';

export default function VillaPage({ villa }: { villa: Villa }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const navigate = useNavigate();
  const allGroupPhotos = photos.filter((photo) => photo.group === villa.name);
  const fichaPhotos: Photo[] = villa.fichaPhotoIds
    ? villa.fichaPhotoIds.map((id) => photosById[id]).filter(Boolean)
    : allGroupPhotos.slice(0, 4);
  const lightboxPhotos: Photo[] = villa.fichaPhotoIds
    ? villa.fichaPhotoIds.map((id) => photosById[id]).filter(Boolean)
    : allGroupPhotos;

  const others = villaList.filter((entry) => entry.slug !== villa.slug);
  const isVilla4 = villa.slug === 'villa-4';

  const scrollToBooking = () => {
    document.getElementById('booking-module')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="page">
      <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Villas', to: '/villas' }, { label: villa.name }]} />
      <PageIntro overline="VILLA" title={villa.name} copy={villa.intro} />

      <div className="villa-layout">
        <div className="villa-main">
          <div className="villa-hero">
            <img src={villa.cover} alt={villa.photoAlt ?? `Fotografía de ${villa.name}`} loading="eager" />

            {fichaPhotos.length > 0 && (
              <>
                <div className="villa-thumbs">
                  {fichaPhotos.map((photo, index) => (
                    <button key={photo.id} onClick={() => setLightbox(index)} aria-label={`Ver foto ${index + 1} de ${fichaPhotos.length}`}>
                      <img src={photo.url} alt={photo.alt} loading="lazy" />
                    </button>
                  ))}
                </div>
                <button className="ghost-button" onClick={() => setLightbox(0)}>Ver todas las fotos ({fichaPhotos.length}) <ArrowRight size={15} /></button>
              </>
            )}
          </div>

          {villa.photoNote && <p className="villa-photo-note small-copy">{villa.photoNote}</p>}

          <section className="villa-capacity">
            <p><Users size={16} /> Ideal para {villa.ideal} personas · hasta {villa.maxConditioned} con colchón inflable propio{isVilla4 ? ' (sujeto a confirmación)' : ''}.</p>
          </section>

          <section className="villa-services">
            <h2>Servicios</h2>
            <ul>{villa.services.map((service) => <li key={service}><Check size={15} /> {service}</li>)}</ul>
          </section>

          <section className="villa-availability-cta">
            <h2>Consulta la disponibilidad</h2>
            <p>Selecciona tus fechas y el número de personas para ver el total de tu estancia.</p>
          </section>

          <section className="conditions-box">
            <h3>Condiciones</h3>
            <ul>{villaCommonConditions.map((condition) => <li key={condition}>{condition}</li>)}</ul>
            <p className="small-copy">{villaCapacityNote}</p>
            {villa.note && <p className="small-copy">{villa.note}</p>}
          </section>
        </div>

        <aside className="villa-aside">
          <div id="booking-module">
            <BookingModule
              accommodationId={villa.slug}
              capacity={villa.ideal}
              maxCapacity={villa.maxConditioned}
            />
          </div>
          <div className="aside-box">
            <h3>Otras villas</h3>
            <div className="aside-links">
              {others.map((entry) => (
                <button key={entry.slug} onClick={() => navigate(`/villas/${entry.slug}`)}>{entry.name}</button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="mobile-sticky-bar">
        <span className="mobile-sticky-label">{villa.name}</span>
        <button className="dark-button" onClick={scrollToBooking}>
          <CalendarDays size={16} /> Reservar
        </button>
      </div>

      {lightbox !== null && <Lightbox photos={lightboxPhotos} index={lightbox} onClose={() => setLightbox(null)} onMove={setLightbox} />}
    </div>
  );
}
