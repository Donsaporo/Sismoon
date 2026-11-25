import { ArrowRight } from 'lucide-react';
import { siteImages } from '../data/catalog';
import { useNavigate } from '../router';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="page notfound" style={{ backgroundImage: `linear-gradient(180deg, rgba(23, 62, 41, .78), rgba(23, 62, 41, .9)), url(${siteImages.closing})` }}>
      <p className="overline light-overline">404</p>
      <h1>Esta ruta<br /><i>se perdió en el mar.</i></h1>
      <p className="hero-copy">La página que buscas no existe. Explora los alojamientos o vuelve al inicio.</p>
      <div className="center-row">
        <button className="light-button" onClick={() => navigate('/')}>Ir al inicio <ArrowRight size={16} /></button>
        <button className="light-button ghost" onClick={() => navigate('/alojamientos')}>Ver alojamientos <ArrowRight size={16} /></button>
      </div>
    </div>
  );
}
