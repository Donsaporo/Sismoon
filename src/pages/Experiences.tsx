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
          <img src={siteImages.experiences} alt="Área común frente al mar" loading="lazy" />
          <div>
            <h2>Un paseo por el mar.</h2>
            <p>El tour en lancha por las islas es una de las salidas disponibles desde el hotel. Revisa las opciones y cómo coordinar el paseo con el operador.</p>
            <div className="experience-actions">
              <button className="ghost-button" onClick={() => navigate('/contacto')}>Coordinar un tour <ArrowRight size={15} /></button>
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
          <img src={siteImages.restaurantDeck} alt="Ambiente del deck del restaurante frente al mar" loading="lazy" />
          <div>
            <h2>El ambiente de la mesa.</h2>
            <p>El restaurante y el bar están frente al mar. Disfruta la comida y el rato en un deck con vista a la costa.</p>
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
