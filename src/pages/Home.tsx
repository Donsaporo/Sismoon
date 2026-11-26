import { ArrowRight } from 'lucide-react';
import { homeGalleryIds, photosById, siteImages, glampingInfo } from '../data/catalog';
import { SearchBar } from '../components/SearchBar';
import { useNavigate } from '../router';

export default function Home() {
  const navigate = useNavigate();

  const gallery = homeGalleryIds.map((id) => photosById[id]);
  const heroGalleryImage = siteImages.homeHamaca;
  const captainPhoto = photosById['sm-009'];

  return (
    <div className="home-page">
      <section className="hero" id="top" style={{ backgroundImage: `linear-gradient(180deg, rgba(15, 40, 27, .34), rgba(15, 40, 27, .62)), url(${siteImages.hero})` }}>
        <div className="hero-content">
          <p className="overline hero-overline">HOTEL · VILLAS · GLAMPING · TOURS · RESTAURANTES · ISLA GRANDE</p>
          <h1 className="hero-title">The Last Home</h1>
          <p className="hero-copy">Un libro, un rato de mar y tiempo para los tuyos. Hotel, villas, glamping, tours y restaurantes en Isla Grande, Colón. Ven a relajarte.</p>
          <div className="hero-actions">
            <button className="light-button" onClick={() => navigate('/reservar')}>Ver disponibilidad <ArrowRight size={16} /></button>
            <button className="light-button ghost" onClick={() => navigate('/alojamientos')}>Ver alojamientos <ArrowRight size={16} /></button>
          </div>
        </div>
        <SearchBar variant="hero" />
      </section>

      <section className="home-intro">
        <div className="home-intro-grid">
          <div>
            <p className="overline">A RITMO DE ISLA</p>
            <h2>Trae un libro. Lo demás puede esperar.</h2>
          </div>
          <div>
            <p className="large-copy">Sister Moon está en Isla Grande, Colón. Un lugar que fue creciendo poco a poco, con espacios para descansar, compartir y pasar un rato frente al mar. Ven con los tuyos y disfruta la isla a tu manera.</p>
          </div>
        </div>
      </section>

      <section className="home-stays">
        <div className="section-head">
          <p className="overline">QUÉDATE UN RATO</p>
          <h2>¿Cómo te quieres quedar?</h2>
          <p className="lead-copy">Habitaciones, cinco villas y glamping. Conoce los espacios y encuentra la opción para tu visita.</p>
        </div>
        <div className="stay-grid">
          <button className="stay-card" onClick={() => navigate('/habitaciones')}>
            <span className="stay-image" style={{ backgroundImage: `url(${siteImages.rooms})` }} role="img" aria-label="Cabañas con techos rojizos entre vegetación" />
            <span className="stay-copy"><small>Por pareja</small><strong>Habitaciones</strong><span>Un espacio para descansar después de un día de isla.</span><em>Ver habitaciones <ArrowRight size={15} /></em></span>
          </button>
          <button className="stay-card" onClick={() => navigate('/villas')}>
            <span className="stay-image" style={{ backgroundImage: `url(${siteImages.villas})` }} role="img" aria-label="Villa de dos niveles entre palmeras" />
            <span className="stay-copy"><small>1 · 2 · 3 noches</small><strong>Villas</strong><span>Cinco opciones con distintas capacidades y espacios para compartir.</span><em>Ver las villas <ArrowRight size={15} /></em></span>
          </button>
          <button className="stay-card" onClick={() => navigate('/glamping')}>
            <span className="stay-image" style={{ backgroundImage: `url(${glampingInfo.cover})` }} role="img" aria-label="Piscina y estructuras entre vegetación en el área de glamping" />
            <span className="stay-copy"><small>Al aire libre</small><strong>Glamping</strong><span>Conoce el área y organiza tu estancia al aire libre.</span><em>Ver glamping <ArrowRight size={15} /></em></span>
          </button>
        </div>
      </section>

      <section className="home-experiences">
        <div className="section-head">
          <p className="overline">POR AQUÍ HAY MÁS</p>
          <h2>Un paseo y una buena mesa.</h2>
        </div>
        <div className="home-experiences-blocks">
          <div className="home-exp-block">
            <h3>Tours</h3>
            <p>Descubre los mejores tours de Colón con Sister Moon. Consulta las opciones para conocer Venas Azules y disfrutar el Caribe.</p>
            <button className="ghost-button" onClick={() => navigate('/experiencias#tours')}>Ver tours <ArrowRight size={15} /></button>
          </div>
          <div className="home-exp-block">
            <h3>Restaurantes</h3>
            <p>El restaurante y el bar del hotel también son parte de la visita. Conoce el menú, los horarios y las opciones para tu mesa.</p>
            <p className="small-copy">El acceso al restaurante y al bar no incluye los consumos.</p>
            <button className="ghost-button" onClick={() => navigate('/experiencias#restaurantes')}>Conocer el restaurante <ArrowRight size={15} /></button>
          </div>
        </div>
      </section>

      <section className="home-captain">
        <div className="home-captain-block">
          <div className="home-captain-text">
            <p className="overline">CAPITÁN HALLAX</p>
            <h2>Antes de ser hotel, fue casa.</h2>
            <p>Un lote pequeño, una casa y ganas de tener un lugar para respirar. Hallax fue construyendo rincones donde él mismo vivía; después vinieron más cabañas y la hotelería. El nombre, la historia y la manera de recibir en Sister Moon tienen mucho que ver con él.</p>
            <button className="dark-button" onClick={() => navigate('/acerca-de#capitan-hallax')}>Conoce la historia del capitán <ArrowRight size={15} /></button>
          </div>
          <figure className="home-captain-photo">
            <img src={captainPhoto.url} alt={captainPhoto.alt} loading="lazy" />
            <figcaption>La costa de Sister Moon</figcaption>
          </figure>
        </div>
      </section>

      <section className="home-gallery">
        <div className="section-head">
          <p className="overline">ÉCHALE UN VISTAZO</p>
          <h2>Un vistazo a Sister Moon.</h2>
        </div>
        <div className="home-gallery-grid">
          <button className="hg-item hg-main" style={{ backgroundImage: `url(${heroGalleryImage})` }} role="img" aria-label="Hamaca frente al mar en Sister Moon" onClick={() => navigate('/galeria')} />
          {gallery.slice(1, 5).map((photo, index) => (
            <button key={index} className="hg-item" style={{ backgroundImage: `url(${photo.url})` }} role="img" aria-label={photo.alt} onClick={() => navigate('/galeria')} />
          ))}
        </div>
        <div className="center-row">
          <button className="ghost-button" onClick={() => navigate('/galeria')}>Ver todas las fotos <ArrowRight size={15} /></button>
        </div>
      </section>

      <section className="home-arrival-closing">
        <div className="home-arrival-closing-inner">
          <div className="home-arrival-block">
            <p className="overline">ANTES DE VENIR</p>
            <h2>Vamos organizando la llegada.</h2>
            <p>Antes de salir, revisa el muelle, el cruce en lancha y las indicaciones para llegar a tu alojamiento.</p>
            <button className="ghost-button" onClick={() => navigate('/isla-grande')}>Cómo llegar <ArrowRight size={15} /></button>
          </div>
          <div className="home-closing-block">
            <h2>¿Cuándo nos vemos en la isla?</h2>
            <p>Cuéntanos tus fechas y cuántos vienen contigo. Te ayudamos a revisar las opciones.</p>
            <button className="dark-button" onClick={() => navigate('/reservar')}>Ver disponibilidad <ArrowRight size={15} /></button>
          </div>
        </div>
      </section>
    </div>
  );
}
