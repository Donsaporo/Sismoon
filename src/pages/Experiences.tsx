import { ArrowRight, LifeBuoy } from 'lucide-react';
import { siteImages } from '../data/catalog';
import { Breadcrumbs, PageIntro } from '../components/Shared';
import { useNavigate } from '../router';

export default function Experiences() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Experiencias' }]} />
      <PageIntro overline="EXPERIENCIAS" title={<>Este es otro trip.</>} copy="Hay quien quiere salir en lancha y hay quien prefiere quedarse mirando el mar. Aquí puedes ir armando tu visita con tiempo para pasear, comer y descansar." />

      <div className="experience-blocks">
        <section id="tours" className="experience-block">
          <img src="/images/tours/sistermoon-tours-agua-turquesa-0347.webp" alt="Agua turquesa entre manglares y lanchas en una salida a Venas Azules" loading="lazy" />
          <div>
            <h2>Los mejores tours de Colón, con Sister Moon.</h2>
            <p>Descubre Venas Azules y vive el Caribe de Colón con Sister Moon. Escríbenos para conocer las opciones de tours y coordinar tu próxima salida.</p>
            <div className="experience-actions">
              <button className="ghost-button" onClick={() => navigate('/contacto')}>Consultar tours <ArrowRight size={15} /></button>
              <button className="inline-link-btn" onClick={() => navigate('/contacto')}><LifeBuoy size={14} /> ¿Necesitas ayuda? Escríbenos</button>
            </div>
          </div>
        </section>
        <section id="restaurantes" className="experience-block reverse">
          <img src={siteImages.restaurantMain} alt="Plato del restaurante de Sister Moon" loading="lazy" />
          <div>
            <h2>¿Nos sentamos a la mesa?</h2>
            <p>El restaurante y el bar del hotel son parte de Sister Moon. Conoce el menú, los horarios y las opciones para tu visita.</p>
            <p className="small-copy">El acceso al restaurante y al bar no incluye los consumos.</p>
            <div className="experience-actions">
              <button className="ghost-button" onClick={() => navigate('/contacto')}>Consultar el restaurante <ArrowRight size={15} /></button>
              <button className="inline-link-btn" onClick={() => navigate('/contacto')}><LifeBuoy size={14} /> ¿Necesitas ayuda? Escríbenos</button>
            </div>
          </div>
        </section>
        <section className="experience-block">
          <img src="/images/gallery/sistermoon-ambiente-mesa-aprobado.webp" alt="Vista aérea de Sister Moon junto al mar" loading="lazy" />
          <div>
            <h2>El ambiente de la mesa.</h2>
            <p>Disfruta la comida, la compañía y la vista al mar en Sister Moon.</p>
          </div>
        </section>
        <section className="experience-block">
          <img src={siteImages.firePit} alt="Área de descanso y fogata junto al mar" loading="lazy" />
          <div>
            <h2>También se vale quedarse quieto.</h2>
            <p>Trae tu libro, busca un rato para conversar o simplemente mira el horizonte. No hace falta llenar cada hora del día.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
