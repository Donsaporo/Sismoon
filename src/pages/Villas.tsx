import { ArrowRight, Users } from 'lucide-react';
import { villaList, villaCommonConditions, villaCapacityNote } from '../data/catalog';
import { Breadcrumbs, PageIntro } from '../components/Shared';
import { useNavigate } from '../router';

export default function Villas() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Villas' }]} />
      <PageIntro overline="VILLAS" title={<>Cada villa tiene su manera.</>} copy="Hay planes de dos y planes de venir con todos. Conoce las cinco villas, compara sus espacios y escoge la que mejor les quede. Consulta la disponibilidad y el total de tu estancia para tus fechas." />

      <div className="catalog-grid">
        {villaList.map((villa) => (
          <article key={villa.slug} className="catalog-card">
            <button className="catalog-image" style={{ backgroundImage: `url(${villa.cover})` }} role="img" aria-label={villa.photoAlt ?? `Fotografía de ${villa.name}`} onClick={() => navigate(`/villas/${villa.slug}`)}>
              <span className="catalog-category">Villa</span>
              {villa.slug === 'villa-4' && <span className="villa-ref-badge">Ambiente del hotel · imagen de referencia</span>}
            </button>
            <div className="catalog-body">
              <h3>{villa.name}</h3>
              <p className="catalog-meta"><Users size={14} /> Ideal {villa.ideal} · hasta {villa.maxConditioned} con colchón propio</p>
              <p className="catalog-intro">{villa.intro}</p>
              {villa.photoNote && <p className="catalog-note">{villa.photoNote}</p>}
              <div className="catalog-actions">
                <button className="dark-button" onClick={() => navigate(`/villas/${villa.slug}`)}>Ver villa <ArrowRight size={15} /></button>
                <button className="ghost-button" onClick={() => navigate('/reservar')}>Ver disponibilidad</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <section className="conditions-box">
        <h3>Condiciones comunes</h3>
        <ul>{villaCommonConditions.map((condition) => <li key={condition}>{condition}</li>)}</ul>
        <p className="small-copy">{villaCapacityNote}</p>
      </section>
    </div>
  );
}
