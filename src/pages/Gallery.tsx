import { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { galleryGroups, type Photo, photosForGroup } from '../data/catalog';
import { Breadcrumbs, PageIntro, Lightbox } from '../components/Shared';
import { useNavigate } from '../router';

const PAGE_SIZE = 16;

export default function Gallery() {
  const [filter, setFilter] = useState<string>('Todas');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const navigate = useNavigate();

  const activeGroup = galleryGroups.find((entry) => entry.label === filter)?.group ?? 'Todas';
  const filtered: Photo[] = photosForGroup(activeGroup);
  const shown = filtered.slice(0, visible);

  const visibleGroups = galleryGroups.filter((group) => group.count > 0);

  const changeFilter = (label: string): void => {
    setFilter(label);
    setVisible(PAGE_SIZE);
    setLightbox(null);
  };

  return (
    <div className="page">
      <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Galería' }]} />
      <PageIntro overline="GALERÍA" title={<>Mira el lugar. Imagínate el rato.</>} copy="Fotos del hotel, las villas, el glamping y el entorno. Usa los filtros para conocer cada espacio y compara con calma." />

      <section className="filters">
        <div className="filter-row wrap">
          {visibleGroups.map((group) => (
            <button key={group.label} className={filter === group.label ? 'filter-chip active' : 'filter-chip'} onClick={() => changeFilter(group.label)}>
              {group.label} ({group.count})
            </button>
          ))}
        </div>
        {filter !== 'Todas' && (
          <button className="ghost-button" onClick={() => changeFilter('Todas')}><RotateCcw size={14} /> Ver todas</button>
        )}
      </section>

      {filtered.length > 0 ? (
        <>
          <p className="filter-count" aria-live="polite">{shown.length} de {filtered.length} fotografías</p>
          <div className="gallery-grid">
            {shown.map((photo, index) => (
              <button key={photo.id} className="gallery-item" onClick={() => setLightbox(index)} aria-label={`Abrir foto ${index + 1}: ${photo.alt}`}>
                <img src={photo.url} alt={photo.alt} loading="lazy" width={photo.width} height={photo.height} />
                <span className="gallery-tag">{photo.group}</span>
              </button>
            ))}
          </div>
          {visible < filtered.length && (
            <div className="center-row">
              <button className="dark-button" onClick={() => setVisible(visible + PAGE_SIZE)}>Cargar más <ChevronRight size={15} /></button>
            </div>
          )}
          {lightbox !== null && (
            <Lightbox
              photos={filtered}
              index={lightbox}
              onClose={() => setLightbox(null)}
              onMove={(next) => setLightbox(Math.min(Math.max(next, 0), filtered.length - 1))}
            />
          )}
        </>
      ) : (
        <div className="gallery-empty">
          <p>No hay fotos disponibles para este filtro.</p>
          <div className="center-row">
            <button className="dark-button" onClick={() => changeFilter('Todas')}>Ver todas las fotos</button>
            {filter === 'Villa 4' && (
              <button className="ghost-button" onClick={() => navigate('/villas/villa-4')}>Ver Villa 4</button>
            )}
          </div>
        </div>
      )}

      <div className="center-row back-home">
        <button className="ghost-button" onClick={() => changeFilter('Todas')}><ChevronLeft size={14} /> Volver al inicio de la galería</button>
      </div>
    </div>
  );
}
