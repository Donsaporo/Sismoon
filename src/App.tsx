import { useEffect } from 'react';
import { Header, Footer } from './components/Shared';
import { BookingProvider } from './components/BookingContext';

import { RouterProvider, usePath, useAnchor } from './router';
import { roomPages, villaList } from './data/catalog';
import Home from './pages/Home';
import Stays from './pages/Stays';
import Villas from './pages/Villas';
import VillaPage from './pages/VillaPage';
import Rooms from './pages/Rooms';
import RoomPageView from './pages/RoomPageView';
import Glamping from './pages/Glamping';
import Experiences from './pages/Experiences';
import Island from './pages/Island';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import About from './pages/About';
import NotFound from './pages/NotFound';
import BookingResults from './pages/BookingResults';
import Checkout from './pages/Checkout';

const BASE = 'Sister Moon';

const routeMeta: Record<string, { title: string; description: string }> = {
  '/': { title: `Sister Moon | Hotel, villas y glamping en Isla Grande`, description: 'Habitaciones, villas, glamping, tours y restaurantes en Isla Grande, Colón, Panamá. Un rato de mar, naturaleza y vida de isla.' },
  '/alojamientos': { title: `Alojamientos | ${BASE}`, description: 'Habitaciones, cinco villas y glamping en Isla Grande. Encuentra tu manera de quedarte y consulta tarifas y condiciones.' },
  '/habitaciones': { title: `Habitaciones en Isla Grande | ${BASE}`, description: 'Planes por pareja y noche con y sin desayuno americano, y adicionales del hotel. Trae un libro: lo demás puede esperar.' },
  '/villas': { title: `Villas en Isla Grande | ${BASE}`, description: 'Cinco villas con capacidades, servicios y paquetes de 1, 2 y 3 noches en Isla Grande. Cada villa tiene su manera.' },
  '/glamping': { title: `Glamping en Isla Grande | ${BASE}`, description: 'Una estancia al aire libre con BBQ, piscina, baño privado y área de fogata. Más afuera, más cerca de la naturaleza.' },
  '/experiencias': { title: `Tours y restaurantes | ${BASE}`, description: 'Tours por las islas, restaurante y bar frente al mar, y el tiempo lento de Isla Grande. La isla pone el ritmo.' },
  '/isla-grande': { title: `Isla Grande y cómo llegar | ${BASE}`, description: 'Así organizas tu llegada a Isla Grande, Colón, Panamá: muelle, cruce en lancha y encuentro en Sister Moon.' },
  '/acerca-de': { title: `Capitán Hallax y nuestra historia | ${BASE}`, description: 'La historia del capitán Efraín Hallax y de Sister Moon en Isla Grande: una cabañita, dos cabañitas, tres cabañitas.' },
  '/galeria': { title: `Galería | ${BASE}`, description: 'Recorre en fotos el hotel, las villas, el glamping y el entorno de Isla Grande. Mira el lugar, imagínate el rato.' },
  '/contacto': { title: `Consulta tu visita | ${BASE}`, description: 'Arma tu consulta: alojamiento, tours, restaurantes, cómo llegar o ayuda para elegir. Atención de 9:00 a. m. a 6:00 p. m.' },
  '/reservar': { title: `Disponibilidad y tarifas | ${BASE}`, description: 'Elige tus fechas y encuentra tu espacio en la isla. Consulta disponibilidad y el total de tu estancia.' },
  '/reservar/checkout': { title: `Tu reserva | ${BASE}`, description: 'Completa tu reserva en Sister Moon. Demostración: no se realizan reservas ni cobros.' },
};

type Meta = { title: string; description: string };

function metaFor(path: string): Meta {
  const staticMeta = routeMeta[path];
  if (staticMeta) return staticMeta;

  const villaMatch = path.match(/^\/villas\/(villa-[1-5])$/);
  if (villaMatch) {
    const villa = villaList.find((entry) => entry.slug === villaMatch[1]);
    if (villa) {
      return {
        title: `${villa.name} | ${BASE}, Isla Grande`,
        description: `${villa.name}: ideal para ${villa.ideal} personas, con paquetes de 1, 2 y 3 noches. Consulta disponibilidad, tarifa total y condiciones.`,
      };
    }
  }

  const roomMatch = path.match(/^\/habitaciones\/(sm-(?:1|2|3|5|6|7|8|9|10|11))$/);
  if (roomMatch) {
    const room = roomPages.find((entry) => entry.slug === roomMatch[1]);
    if (room) {
      return {
        title: `${room.label} | ${BASE}`,
        description: `Consulta ${room.label}: planes del hotel por pareja y noche. Confirmamos disponibilidad y tarifa para tus fechas.`,
      };
    }
  }

  return { title: `Página no encontrada | ${BASE}`, description: 'La página que buscas no existe. Explora los alojamientos o vuelve al inicio.' };
}

function setMeta(path: string): void {
  const meta = metaFor(path);
  document.title = meta.title;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute('content', meta.description);
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute('href', `https://hotelsistermoon.com${path === '/' ? '/' : path}`);
}

function Routes() {
  const path = usePath();
  const anchor = useAnchor();

  useEffect(() => {
    setMeta(path);
    if (anchor) {
      setTimeout(() => document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' }), 80);
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [path, anchor]);

  if (path === '/') return <Home />;
  if (path === '/alojamientos') return <Stays />;
  if (path === '/habitaciones') return <Rooms />;
  if (path === '/villas') return <Villas />;
  if (path === '/glamping') return <Glamping />;
  if (path === '/experiencias') return <Experiences />;
  if (path === '/isla-grande') return <Island />;
  if (path === '/acerca-de') return <About />;
  if (path === '/galeria') return <Gallery />;
  if (path === '/contacto') return <Contact />;
  if (path === '/reservar') return <BookingResults />;
  if (path === '/reservar/checkout') return <Checkout />;

  const villaMatch = path.match(/^\/villas\/(villa-[1-5])$/);
  if (villaMatch) {
    const villa = villaList.find((entry) => entry.slug === villaMatch[1]);
    if (villa) return <VillaPage key={villa.slug} villa={villa} />;
  }

  const roomMatch = path.match(/^\/habitaciones\/(sm-(?:1|2|3|5|6|7|8|9|10|11))$/);
  if (roomMatch) {
    const room = roomPages.find((entry) => entry.slug === roomMatch[1]);
    if (room) return <RoomPageView key={room.slug} room={room} />;
  }

  return <NotFound />;
}

export default function App() {
  return (
    <RouterProvider>
      <BookingProvider>
        <div className="app-shell">
          <Header />
          <main id="contenido">
            <Routes />
          </main>
          <Footer />
        </div>
      </BookingProvider>
    </RouterProvider>
  );
}
