import { ArrowRight, LifeBuoy } from 'lucide-react';
import { siteImages } from '../data/catalog';
import { Breadcrumbs, PageIntro } from '../components/Shared';
import { useNavigate } from '../router';

export default function Island() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Isla Grande' }]} />
      <PageIntro overline="ISLA GRANDE · COLÓN" title={<>Isla Grande y cómo llegar</>} copy="Sister Moon está en Isla Grande, en el Caribe de Colón. Mar, vegetación y espacios para pasar unos días con menos apuro. Antes de salir, organiza con nosotros los detalles de tu llegada." />

      <div className="island-grid">
        <img src={siteImages.island} alt="Panorámica de la costa y alojamientos entre vegetación" loading="lazy" />
        <img src={siteImages.islandPath} alt="Sendero costero entre palmeras" loading="lazy" />
      </div>

      <section className="arrival-steps">
        <h2>Así organizas tu llegada</h2>
        <ol className="steps-grid">
          <li>
            <span className="step-num">1</span>
            <h3>Cuéntanos cuándo vienes.</h3>
            <p>Confirma tus fechas y el alojamiento con el equipo antes del viaje.</p>
          </li>
          <li>
            <span className="step-num">2</span>
            <h3>Coordina el cruce.</h3>
            <p>Revisa el muelle de salida, la lancha y las indicaciones vigentes para llegar a la isla.</p>
          </li>
          <li>
            <span className="step-num">3</span>
            <h3>Llega a Sister Moon.</h3>
            <p>Te orientamos sobre el punto de llegada y el acceso al hotel o a tu alojamiento.</p>
          </li>
        </ol>
        <div className="center-row">
          <button className="dark-button" onClick={() => navigate('/alojamientos')}>Ver alojamientos <ArrowRight size={15} /></button>
          <button className="ghost-button" onClick={() => navigate('/contacto')}>Coordinar mi llegada <LifeBuoy size={15} /></button>
        </div>
        <p className="small-copy access-note">Si alguien del grupo necesita evitar escaleras o recorridos con desnivel, cuéntanos antes de elegir alojamiento.</p>
      </section>
    </div>
  );
}
