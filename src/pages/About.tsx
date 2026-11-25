import { ArrowRight } from 'lucide-react';
import { photosById } from '../data/catalog';
import { Breadcrumbs, PageIntro } from '../components/Shared';
import InstagramReels from '../components/InstagramReels';
import { useNavigate } from '../router';

export default function About() {
  const navigate = useNavigate();

  const coastPhoto = photosById['sm-009'];
  const deckPhoto = photosById['sm-003'];
  const pathPhoto = photosById['sm-014'];

  return (
    <div className="page">
      <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Acerca de' }]} />
      <PageIntro overline="ACERCA DE SISTER MOON" title={<>Primero fue una casa. Después, toda esta historia.</>} copy="Sister Moon se entiende mejor cuando conoces al capitán Efraín Hallax. La historia empieza con un lugar para vivir y sigue con las ganas de imaginar qué podría construir en el próximo rincón." />

      <section id="capitan-hallax" className="about-story">
        <div className="about-text">
          <h2>Un lote pequeño y una idea muy suya</h2>
          <p className="body-copy">Hallax cuenta que compró un lote pequeño, de unos 800 dólares, pensado para una casa. Quería un lugar de tranquilidad: leer un libro, pasar tiempo con alguien querido y respirar lejos de la presión de la ciudad. Su vida ya estaba ligada al mar, también por su trayectoria como práctico del Canal de Panamá. En Isla Grande fue dando forma a otra parte de esa vida.</p>

          <h2>Los rincones que fue habitando</h2>
          <p className="body-copy">Construía un espacio, se mudaba a él y después encontraba otro lugar donde quería hacer algo más. Los espacios de Sister Moon también fueron sus casas: lugares que conoció viviendo en ellos. Poco a poco llegaron más cabañas y, con el tiempo, la hotelería. Cuando lo cuenta, mezcla el entusiasmo por crear con bromas sobre todo lo que vino después.</p>

          <blockquote>
            <p>“Una cabañita, dos cabañitas, tres cabañitas.”</p>
            <cite>Capitán Hallax</cite>
          </blockquote>

          <h2>Por qué se llama Sister Moon</h2>
          <p className="body-copy">El nombre nace de Hermano Sol, Hermana Luna, la película conocida en inglés como Brother Sun, Sister Moon, y de un vínculo con una amiga que Hallax describe como espiritual. De esa referencia y de esa relación salió Sister Moon: Hermana Luna. Al recordarlo se compara con el hermano Sol y enseguida bromea sobre ser el hermano Tinieblas. Esa mezcla de sensibilidad y humor también forma parte de su manera de contar la historia.</p>

          <h2>Este es otro trip</h2>
          <p className="body-copy">Para Hallax, Sister Moon tiene su gente: personas que disfrutan la naturaleza, la conversación y un par de días sin tanto apuro. Su propuesta pone el descanso por delante de las fiestas masivas. Puedes venir con tu pareja, tu familia o tus amigos, cuidando también la tranquilidad de quienes comparten el lugar.</p>

          <blockquote className="closing-quote">
            <p>“Ven a relajarte.”</p>
            <cite>Capitán Hallax</cite>
          </blockquote>
        </div>
        <div className="about-photos">
          <img src={coastPhoto.url} alt={coastPhoto.alt} loading="lazy" />
          <img src={deckPhoto.url} alt={deckPhoto.alt} loading="lazy" />
          <img src={pathPhoto.url} alt={pathPhoto.alt} loading="lazy" />
        </div>
      </section>

      <section id="capitan-hallax-reels" className="about-reels">
        <InstagramReels />
      </section>

      <section className="about-cta">
        <h2>Encuentra tu lugar en Sister Moon</h2>
        <div className="center-row">
          <button className="dark-button" onClick={() => navigate('/alojamientos')}>Ver alojamientos <ArrowRight size={15} /></button>
          <button className="ghost-button" onClick={() => navigate('/contacto')}>Consultar una estancia <ArrowRight size={15} /></button>
        </div>
      </section>
    </div>
  );
}
