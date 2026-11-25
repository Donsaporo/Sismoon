import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { glampingInfo, roomPages, siteImages, villaList, villaCommonConditions, villaCapacityNote } from '../data/catalog';
import { Breadcrumbs, PageIntro } from '../components/Shared';
import { useNavigate } from '../router';

type CatalogItem = {
  name: string;
  category: 'Habitaciones' | 'Villas' | 'Glamping';
  image: string;
  alt: string;
  meta: string;
  to: string;
};

const catalogItems: CatalogItem[] = [
  { name: 'Habitaciones', category: 'Habitaciones', image: siteImages.rooms, alt: 'Cabañas con techos rojizos entre vegetación', meta: 'Por pareja y por noche', to: '/habitaciones' },
  ...villaList.map((villa) => ({ name: villa.name, category: 'Villas' as const, image: villa.cover, alt: villa.photoAlt ?? `Fotografía de ${villa.name}`, meta: `Ideal ${villa.ideal} · hasta ${villa.maxConditioned} con colchón propio`, to: `/villas/${villa.slug}` })),
  { name: 'Glamping', category: 'Glamping', image: glampingInfo.cover, alt: 'Piscina y estructuras entre vegetación en el área de glamping', meta: 'Al aire libre · hasta 4 personas', to: '/glamping' },
];

export default function Stays() {
  const [type, setType] = useState<'Todas' | 'Habitaciones' | 'Villas' | 'Glamping'>('Todas');
  const [groupSize, setGroupSize] = useState(0);
  const navigate = useNavigate();

  const filtered = catalogItems.filter((item) => {
    if (type !== 'Todas' && item.category !== type) return false;
    if (groupSize === 0) return true;
    if (item.category === 'Habitaciones') return false;
    if (item.category === 'Glamping') return false;
    const villa = villaList.find((entry) => entry.name === item.name);
    return villa ? villa.maxConditioned >= groupSize : false;
  });

  const resetFilters = (): void => { setType('Todas'); setGroupSize(0); };

  return (
    <div className="page">
      <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Alojamientos' }]} />
      <PageIntro overline="ALOJAMIENTOS" title={<>¿Cómo te quieres quedar?</>} copy="Habitaciones, cinco villas y glamping. Conoce los espacios y encuentra la opción para tu visita." />

      <section className="filters">
        <div className="filter-row">
          <span className="filter-label">Tipo</span>
          {(['Todas', 'Habitaciones', 'Villas', 'Glamping'] as const).map((option) => (
            <button key={option} className={type === option ? 'filter-chip active' : 'filter-chip'} onClick={() => setType(option)}>{option}</button>
          ))}
        </div>
        <div className="filter-row">
          <span className="filter-label">Personas</span>
          {[0, 2, 4, 6, 8, 10].map((size) => (
            <button key={size} className={groupSize === size ? 'filter-chip active' : 'filter-chip'} onClick={() => setGroupSize(size)}>{size === 0 ? 'Cualquiera' : `${size}+`}</button>
          ))}
        </div>
        <button className="ghost-button" onClick={resetFilters}>Restablecer filtros</button>
      </section>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>No hay alojamientos con estos filtros.</p>
          <p className="small-copy">Las habitaciones y el glamping se cotizan por consulta; prueba con otro tamaño de grupo o restablece los filtros.</p>
          <button className="ghost-button" onClick={resetFilters}>Restablecer filtros</button>
        </div>
      ) : (
        <div className="catalog-grid">
          {filtered.map((item) => {
            const villa = villaList.find((v) => v.name === item.name);
            return (
              <article key={item.to} className="catalog-card">
                <button className="catalog-image" style={{ backgroundImage: `url(${item.image})` }} role="img" aria-label={item.alt} onClick={() => navigate(item.to)}>
                  <span className="catalog-category">{item.category}</span>
                  {villa?.slug === 'villa-4' && <span className="villa-ref-badge">Ambiente del hotel · imagen de referencia</span>}
                </button>
                <div className="catalog-body">
                  <h3>{item.name}</h3>
                  <p className="catalog-meta">{item.meta}</p>
                  {villa?.photoNote && <p className="catalog-note">{villa.photoNote}</p>}
                  <div className="catalog-actions">
                    <button className="dark-button" onClick={() => navigate(item.to)}>Ver alojamiento <ArrowRight size={15} /></button>
                    <button className="ghost-button" onClick={() => navigate('/reservar')}>Ver disponibilidad</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <section className="conditions-box">
        <h3>Condiciones de las villas</h3>
        <ul>{villaCommonConditions.map((condition) => <li key={condition}>{condition}</li>)}</ul>
        <p className="small-copy">{villaCapacityNote}</p>
      </section>

      <section className="room-links-box">
        <h3>Habitaciones</h3>
        <div className="room-links">
          {roomPages.map((room) => (
            <button key={room.slug} onClick={() => navigate(`/habitaciones/${room.slug}`)}>{room.label}</button>
          ))}
        </div>
      </section>
    </div>
  );
}
