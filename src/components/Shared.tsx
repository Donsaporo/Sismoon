import { useEffect, useRef, useState, ReactNode } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, X, Copy, Check, Instagram, MessageCircle } from 'lucide-react';
import { brand, hotelInfo, Photo } from '../data/catalog';
import { useNavigate, usePath } from '../router';

function Logo({ variant = 'full' }: { variant?: 'full' | 'symbol' }) {
  const navigate = useNavigate();
  return (
    <a
      className="logo-link"
      href="/#/"
      onClick={(event) => { event.preventDefault(); navigate('/'); }}
      aria-label="Sister Moon inicio"
    >
      <img src={variant === 'full' ? brand.full : brand.symbol} alt="Hotel Sister Moon" className="logo-img" />
    </a>
  );
}

function StaysMenu({ onNavigate }: { onNavigate?: () => void }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const close = (event: MouseEvent): void => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const go = (to: string): void => {
    setOpen(false);
    onNavigate?.();
    navigate(to);
  };

  const items = [
    { to: '/habitaciones', label: 'Habitaciones' },
    { to: '/villas', label: 'Villas' },
    { to: '/glamping', label: 'Glamping' },
    { to: '/alojamientos', label: 'Ver todos' },
  ];

  return (
    <div className="dropdown" ref={ref}>
      <button
        className="nav-link"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen(!open)}
        onKeyDown={(event) => { if (event.key === 'Escape') setOpen(false); }}
      >
        Alojamientos <ChevronDown size={14} className={open ? 'rotated' : ''} />
      </button>
      {open && (
        <div className="dropdown-panel" role="menu">
          {items.map((item) => (
            <button key={item.to} role="menuitem" className="dropdown-item" onClick={() => go(item.to)}>{item.label}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function ExperiencesMenu({ onNavigate }: { onNavigate?: () => void }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const close = (event: MouseEvent): void => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const go = (to: string): void => {
    setOpen(false);
    onNavigate?.();
    navigate(to);
  };

  const items = [
    { to: '/experiencias#tours', label: 'Tours' },
    { to: '/experiencias#restaurantes', label: 'Restaurantes' },
    { to: '/experiencias', label: 'Ver todo' },
  ];

  return (
    <div className="dropdown" ref={ref}>
      <button
        className="nav-link"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen(!open)}
        onKeyDown={(event) => { if (event.key === 'Escape') setOpen(false); }}
      >
        Experiencias <ChevronDown size={14} className={open ? 'rotated' : ''} />
      </button>
      {open && (
        <div className="dropdown-panel" role="menu">
          {items.map((item) => (
            <button key={item.to} role="menuitem" className="dropdown-item" onClick={() => go(item.to)}>{item.label}</button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const path = usePath();
  const navigate = useNavigate();

  useEffect(() => { setMenuOpen(false); }, [path]);

  const go = (to: string): void => {
    setMenuOpen(false);
    navigate(to);
  };

  const isActive = (to: string): boolean => {
    const [raw] = to.split('#');
    return path === raw || (raw !== '/' && path.startsWith(`${raw}/`));
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <Logo />
        <button className="mobile-toggle" aria-expanded={menuOpen} aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
        <nav className={menuOpen ? 'main-nav open' : 'main-nav'} aria-label="Navegación principal">
          <StaysMenu onNavigate={() => setMenuOpen(false)} />
          <ExperiencesMenu onNavigate={() => setMenuOpen(false)} />
          <button className={`nav-link ${isActive('/isla-grande') ? 'active' : ''}`} onClick={() => go('/isla-grande')}>La isla</button>
          <button className={`nav-link ${isActive('/acerca-de') ? 'active' : ''}`} onClick={() => go('/acerca-de')}>Acerca de</button>
          <button className={`nav-link ${isActive('/galeria') ? 'active' : ''}`} onClick={() => go('/galeria')}>Galería</button>
          <button className={`nav-link ${isActive('/contacto') ? 'active' : ''}`} onClick={() => go('/contacto')}>Contacto</button>
          <button className="header-cta" onClick={() => go('/reservar')}>Reservar</button>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  const navigate = useNavigate();
  const go = (to: string) => (event: { preventDefault: () => void }) => { event.preventDefault(); navigate(to); };

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <img src={brand.wordmark} alt="Hotel Sister Moon" className="footer-logo" />
          <p>Sister Moon · Isla Grande, Colón, Panamá. Un rato de mar, naturaleza y vida de isla.</p>
          <p className="footer-hours">Horario de atención: {hotelInfo.hours}</p>
        </div>
        <div className="footer-col">
          <h3>Alojamientos</h3>
          <a href="/#/alojamientos" onClick={go('/alojamientos')}>Ver todos</a>
          <a href="/#/habitaciones" onClick={go('/habitaciones')}>Habitaciones</a>
          <a href="/#/villas" onClick={go('/villas')}>Villas</a>
          <a href="/#/glamping" onClick={go('/glamping')}>Glamping</a>
        </div>
        <div className="footer-col">
          <h3>Descubre</h3>
          <a href="/#/experiencias" onClick={go('/experiencias#tours')}>Tours</a>
          <a href="/#/experiencias" onClick={go('/experiencias#restaurantes')}>Restaurantes</a>
          <a href="/#/isla-grande" onClick={go('/isla-grande')}>Isla Grande</a>
          <a href="/#/acerca-de" onClick={go('/acerca-de#capitan-hallax')}>Capitán Hallax</a>
          <a href="/#/galeria" onClick={go('/galeria')}>Galería</a>
        </div>
        <div className="footer-col">
          <h3>Contacto</h3>
          <a href={hotelInfo.whatsappLink} target="_blank" rel="noopener noreferrer"><MessageCircle size={14} /> WhatsApp {hotelInfo.whatsappDisplay}</a>
          <a href={hotelInfo.instagram} target="_blank" rel="noopener noreferrer"><Instagram size={14} /> @hotelsistermoon</a>
        </div>
      </div>
      <div className="footer-bottom">
        <small>Hotel Sister Moon · Isla Grande, Colón, Panamá · Un rato de mar, naturaleza y vida de isla</small>
      </div>
    </footer>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  const navigate = useNavigate();
  return (
    <nav className="breadcrumbs" aria-label="Ruta de navegación">
      {items.map((item, index) => (
        <span key={item.label}>
          {index > 0 && <ChevronRight size={12} />}
          {item.to ? (
            <a href={item.to} onClick={(event) => { event.preventDefault(); navigate(item.to!); }}>{item.label}</a>
          ) : (
            <span aria-current="page">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function Lightbox({
  photos,
  index,
  onClose,
  onMove,
}: {
  photos: Photo[];
  index: number;
  onClose: () => void;
  onMove: (next: number) => void;
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<Element | null>(null);
  const photo = photos[index];

  useEffect(() => {
    triggerRef.current = document.activeElement;
    dialogRef.current?.focus();
    return () => {
      if (triggerRef.current instanceof HTMLElement) triggerRef.current.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') onMove((index - 1 + photos.length) % photos.length);
      if (event.key === 'ArrowRight') onMove((index + 1) % photos.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, photos.length, onClose, onMove]);

  if (!photo) return null;

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={`Foto ${index + 1} de ${photos.length}`} onClick={onClose}>
      <div className="lightbox-inner" onClick={(event) => event.stopPropagation()} ref={dialogRef} tabIndex={-1}>
        <button className="lightbox-close" onClick={onClose} aria-label="Cerrar visor"><X size={20} /></button>
        <button className="lightbox-arrow prev" onClick={() => onMove((index - 1 + photos.length) % photos.length)} aria-label="Foto anterior"><ChevronLeft size={26} /></button>
        <img src={photo.url} alt={photo.alt} className="lightbox-image" />
        <button className="lightbox-arrow next" onClick={() => onMove((index + 1) % photos.length)} aria-label="Foto siguiente"><ChevronRight size={26} /></button>
        <div className="lightbox-caption">
          <span>{photo.alt}</span>
          <small>{index + 1} de {photos.length}</small>
        </div>
      </div>
    </div>
  );
}

export function useCopySummary(): { copied: boolean; copy: (text: string) => void } {
  const [copied, setCopied] = useState(false);
  const copy = (text: string): void => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => setCopied(false));
  };
  return { copied, copy };
}

export function CopyButton({ text }: { text: string }) {
  const { copied, copy } = useCopySummary();
  return (
    <button className="ghost-button" onClick={() => copy(text)}>
      {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copiado' : 'Copiar resumen'}
    </button>
  );
}

export function PageIntro({ overline, title, copy, children }: { overline: string; title: ReactNode; copy?: string; children?: ReactNode }) {
  return (
    <section className="page-intro">
      <p className="overline">{overline}</p>
      <h1>{title}</h1>
      {copy && <p className="lead-copy">{copy}</p>}
      {children}
    </section>
  );
}
