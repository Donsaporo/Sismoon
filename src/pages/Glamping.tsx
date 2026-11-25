import { glampingInfo } from '../data/catalog';
import { Breadcrumbs, PageIntro } from '../components/Shared';
import { BookingModule } from '../components/BookingModule';

export default function Glamping() {
  return (
    <div className="page">
      <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Glamping' }]} />
      <PageIntro overline="GLAMPING" title={<>Glamping en Isla Grande</>} copy="Más afuera, más cerca de la naturaleza. Si te gusta pasar tiempo al aire libre, conoce el área de glamping de Sister Moon." />

      <div className="villa-layout">
        <div className="villa-main">
          <section className="gallery-section">
            <h2>Conoce el área</h2>
            <div className="glamping-photos">
              <img src={glampingInfo.cover} alt="Piscina y estructuras entre vegetación en el área de glamping" loading="lazy" />
              <img src={glampingInfo.aerial} alt="Vista aérea del área asignada a campamento y glamping" loading="lazy" />
            </div>
          </section>

          <section className="villa-services">
            <h2>Qué incluye</h2>
            <ul>{glampingInfo.services.map((service) => <li key={service}>{service}</li>)}</ul>
          </section>

          <section className="conditions-box">
            <h3>Organiza tu estancia</h3>
            <p>Escríbenos para revisar qué necesitas traer, qué incluye la estancia y cómo organizar tu visita. Usa el módulo de reserva para consultar disponibilidad y el total para tus fechas.</p>
          </section>
        </div>

        <aside className="villa-aside">
          <BookingModule
            accommodationId="glamping"
            capacity={2}
            maxCapacity={4}
          />
        </aside>
      </div>
    </div>
  );
}
