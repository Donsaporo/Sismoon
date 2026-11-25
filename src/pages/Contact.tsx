import { FormEvent, useState } from 'react';
import { ArrowRight, Check, Clock, Copy, Instagram, MessageCircle, Send } from 'lucide-react';
import { faqs, hotelInfo } from '../data/catalog';
import { Breadcrumbs, PageIntro } from '../components/Shared';
import { todayInPanama } from '../booking/utils';
import { useNavigate } from '../router';

type Topic = 'Alojamiento' | 'Tours' | 'Restaurantes' | 'Cómo llegar' | 'Ayúdame a elegir';

const topics: Topic[] = ['Alojamiento', 'Tours', 'Restaurantes', 'Cómo llegar', 'Ayúdame a elegir'];

const guestsErrorText = 'Indica cuántas personas vienen para poder orientarte.';
const datesErrorText = 'Revisa las fechas: la salida debe ser después de la entrada.';

type ContactForm = {
  stay: string;
  plan: string;
  startDate: string;
  endDate: string;
  visitDate: string;
  visitTime: string;
  adults: number;
  children: number;
  childrenAges: string;
  breakfast: string;
  requests: string;
};

const emptyForm: ContactForm = {
  stay: '',
  plan: '',
  startDate: '',
  endDate: '',
  visitDate: '',
  visitTime: '',
  adults: 2,
  children: 0,
  childrenAges: '',
  breakfast: 'No aplica',
  requests: '',
};

export default function Contact() {
  const navigate = useNavigate();
  const today = todayInPanama();
  const [form, setForm] = useState<ContactForm>(emptyForm);
  const [topic, setTopic] = useState<Topic>('Alojamiento');
  const [reviewed, setReviewed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedError, setCopiedError] = useState(false);
  const [datesError, setDatesError] = useState(false);
  const [guestsError, setGuestsError] = useState(false);

  const update = (patch: Partial<ContactForm>): void => setForm((prev) => ({ ...prev, ...patch }));

  const buildMessage = (): string => {
    if (topic === 'Tours') {
      const people = form.adults > 0 ? `${form.adults}${form.children > 0 ? ` y ${form.children} menores` : ''}` : '';
      const fecha = form.visitDate || '';
      let msg = `Hola, Sister Moon. Quiero consultar por un tour`;
      if (people) msg += ` para ${people}`;
      if (fecha) msg += ` el ${fecha}`;
      msg += `. ¿Me cuentan las opciones y cómo coordinarlo?`;
      if (form.requests.trim()) msg += `\n${form.requests.trim()}`;
      return msg;
    }
    if (topic === 'Restaurantes') {
      const people = form.adults > 0 ? `${form.adults}${form.children > 0 ? ` y ${form.children} menores` : ''}` : '';
      const fecha = form.visitDate || '';
      const hora = form.visitTime || '';
      let msg = `Hola, Sister Moon. Quiero consultar las opciones del restaurante`;
      if (people) msg += ` para ${people}`;
      if (fecha) msg += ` el ${fecha}`;
      if (hora) msg += ` a las ${hora}`;
      msg += `. ¿Me comparten menú, horarios y cómo organizar la visita?`;
      if (form.requests.trim()) msg += `\n${form.requests.trim()}`;
      return msg;
    }
    if (topic === 'Cómo llegar') {
      let msg = `Hola, Sister Moon. Quiero coordinar las indicaciones para llegar y el cruce en lancha.`;
      if (form.visitDate) msg += `\nFecha orientativa de llegada: ${form.visitDate}`;
      if (form.stay) msg += `\nAlojamiento: ${form.stay}`;
      if (form.requests.trim()) msg += `\n${form.requests.trim()}`;
      return msg;
    }
    if (topic === 'Ayúdame a elegir') {
      const people = `${form.adults} adultos${form.children > 0 ? ` y ${form.children} menores` : ''}`;
      let msg = `Hola, Sister Moon. No tengo claro qué elegir. Somos ${people}`;
      if (form.startDate) msg += `. Querríamos entrar el ${form.startDate}`;
      if (form.endDate) msg += ` y salir el ${form.endDate}`;
      msg += `. ¿Me ayudan a elegir entre habitación, villa y glamping?`;
      if (form.children > 0 && form.childrenAges.trim()) msg += `\nEdades de los menores: ${form.childrenAges.trim()}`;
      if (form.requests.trim()) msg += `\n${form.requests.trim()}`;
      return msg;
    }
    const stay = form.stay || 'una estancia';
    let msg = `Hola, Sister Moon. Quiero consultar una estancia en ${stay}.`;
    if (form.startDate) msg += `\nEntrada: ${form.startDate}`;
    if (form.endDate) msg += `\nSalida: ${form.endDate}`;
    msg += `\nSomos ${form.adults} adultos${form.children > 0 ? ` y ${form.children} menores` : ''}`;
    if (form.children > 0 && form.childrenAges.trim()) msg += ` (edades: ${form.childrenAges.trim()})`;
    if (form.plan && form.plan !== 'sin-desayuno') msg += `\nPlan: ${form.plan}`;
    if (form.breakfast && form.breakfast !== 'No aplica' && form.breakfast !== 'No') msg += `\nDesayuno: ${form.breakfast}`;
    if (form.requests.trim()) msg += `\n${form.requests.trim()}`;
    msg += `\n¿Me confirman disponibilidad, tarifa total y condiciones?`;
    return msg;
  };

  const message = buildMessage();
  const whatsappUrl = `${hotelInfo.whatsappLink}?text=${encodeURIComponent(message)}`;

  const valid = (): boolean => {
    let ok = true;
    if (topic === 'Alojamiento' || topic === 'Ayúdame a elegir') {
      if (form.adults < 1) { setGuestsError(true); ok = false; } else setGuestsError(false);
    }
    if (topic === 'Alojamiento' || topic === 'Ayúdame a elegir') {
      if (form.startDate && form.endDate && form.endDate <= form.startDate) { setDatesError(true); ok = false; }
      else if (form.startDate && form.startDate < today) { setDatesError(true); ok = false; }
      else setDatesError(false);
    }
    return ok;
  };

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (valid()) setReviewed(true);
  };

  const selectTopic = (next: Topic): void => {
    setTopic(next);
    setReviewed(false);
    setCopied(false);
    setCopiedError(false);
  };

  const copyMessage = (): void => {
    navigator.clipboard?.writeText(message).then(() => {
      setCopied(true);
      setCopiedError(false);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      setCopied(false);
      setCopiedError(true);
    });
  };

  const goToStays = (): void => navigate('/alojamientos');

  const showsStayDates = topic === 'Alojamiento' || topic === 'Ayúdame a elegir';
  const showsVisitDate = topic === 'Tours' || topic === 'Restaurantes' || topic === 'Cómo llegar';
  const showsVisitTime = topic === 'Restaurantes';
  const showsGuests = topic === 'Alojamiento' || topic === 'Tours' || topic === 'Restaurantes' || topic === 'Ayúdame a elegir';
  const showsStaySelect = topic === 'Alojamiento' || topic === 'Cómo llegar';

  return (
    <div className="page">
      <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Contacto' }]} />
      <PageIntro overline="HABLEMOS" title={<>Vamos armando tu visita.</>} copy="Dinos qué plan tienes en mente y cuándo quieres venir. Te ayudamos a revisar las opciones y te confirmamos la tarifa y las condiciones." />

      <div className="contact-layout">
        <div className="topic-flow">
          <div className="topic-step">
            <p className="topic-step-label">1. ¿Qué quieres consultar?</p>
            <div className="topic-chips" role="radiogroup" aria-label="Tema de la consulta">
              {topics.map((option) => (
                <button key={option} role="radio" aria-checked={topic === option} className={topic === option ? 'filter-chip active' : 'filter-chip'} onClick={() => selectTopic(option)}>{option}</button>
              ))}
            </div>
          </div>

          <form className="consult-form" onSubmit={submit}>
            <p className="topic-step-label">2. Cuéntanos los detalles</p>

            {showsStaySelect && (
              <label>Alojamiento
                <select value={form.stay} onChange={(event) => update({ stay: event.target.value })}>
                  <option value="">{topic === 'Cómo llegar' ? 'Si ya lo sabes' : 'Por definir'}</option>
                  <option>Habitaciones</option>
                  <option>Villa 1</option>
                  <option>Villa 2</option>
                  <option>Villa 3</option>
                  <option>Villa 4</option>
                  <option>Villa 5</option>
                  <option>Glamping</option>
                </select>
              </label>
            )}

            {topic === 'Alojamiento' && form.stay === 'Habitaciones' && (
              <label>Plan
                <select value={form.plan} onChange={(event) => update({ plan: event.target.value })}>
                  <option value="">Sin preferencia</option>
                  <option value="Habitación sin desayuno">Habitación sin desayuno</option>
                  <option value="Habitación con desayuno">Habitación con desayuno</option>
                </select>
              </label>
            )}

            {showsStayDates && (
              <div className="date-grid">
                <label>Entrada
                  <input type="date" min={today} value={form.startDate} onChange={(event) => update({ startDate: event.target.value })} />
                </label>
                <label>Salida
                  <input type="date" min={form.startDate || today} value={form.endDate} onChange={(event) => update({ endDate: event.target.value })} />
                </label>
              </div>
            )}
            {datesError && <p className="field-error" role="alert">{datesErrorText}</p>}

            {showsVisitDate && (
              <label>{topic === 'Cómo llegar' ? 'Fecha orientativa de llegada' : 'Fecha de la visita'}
                <input type="date" min={today} value={form.visitDate} onChange={(event) => update({ visitDate: event.target.value })} />
              </label>
            )}

            {showsVisitTime && (
              <label>Hora preferida
                <input type="time" value={form.visitTime} onChange={(event) => update({ visitTime: event.target.value })} />
              </label>
            )}

            {showsGuests && (
              <div className="date-grid">
                <label>Adultos
                  <input min="1" max="12" type="number" value={form.adults} onChange={(event) => update({ adults: Number(event.target.value) })} />
                </label>
                <label>Menores
                  <input min="0" max="12" type="number" value={form.children} onChange={(event) => update({ children: Number(event.target.value) })} />
                </label>
              </div>
            )}
            {(topic === 'Alojamiento' || topic === 'Ayúdame a elegir') && guestsError && <p className="field-error" role="alert">{guestsErrorText}</p>}
            {(topic === 'Alojamiento' || topic === 'Ayúdame a elegir') && form.children > 0 && (
              <label>Edades de los menores
                <input placeholder="Ej. 6, 10. Las necesitamos para cotizar." value={form.childrenAges} onChange={(event) => update({ childrenAges: event.target.value })} />
              </label>
            )}

            {(topic === 'Alojamiento' || topic === 'Ayúdame a elegir') && form.stay === 'Habitaciones' && (
              <label>Desayuno
                <select value={form.breakfast} onChange={(event) => update({ breakfast: event.target.value })}>
                  <option>No aplica</option>
                  <option>Sí, para habitaciones</option>
                  <option>No</option>
                </select>
              </label>
            )}

            <label>Otras solicitudes
              <textarea rows={3} placeholder="Opcional: mascotas, horarios de llegada, lo que quieras agregar" value={form.requests} onChange={(event) => update({ requests: event.target.value })} />
            </label>

            {topic === 'Ayúdame a elegir' && (
              <button type="button" className="ghost-button" onClick={goToStays}>Ver alojamientos primero <ArrowRight size={15} /></button>
            )}

            <button className="dark-button" type="submit">Revisar mi consulta <ArrowRight size={16} /></button>
            <p className="small-copy">Al revisar tu consulta verás un mensaje preparado para WhatsApp. Abrirlo no envía nada: tú decides si lo envías o si prefieres copiarlo y enviarlo después.</p>
          </form>

          {reviewed && (
            <section className="review-step reveal-fade" aria-live="polite">
              <p className="topic-step-label">3. Revisa tu mensaje</p>
              <pre className="summary-pre">{message}</pre>
              <div className="review-actions">
                <button className="ghost-button" onClick={copyMessage}>
                  {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Mensaje copiado' : 'Copiar mensaje'}
                </button>
                <a className="ghost-button" href={whatsappUrl} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> Abrir WhatsApp</a>
                <button className="ghost-button" onClick={() => setReviewed(false)}><Send size={15} /> Seguir editando</button>
              </div>
              {copied && <p className="copy-ok">Mensaje copiado. Ya puedes pegarlo en WhatsApp.</p>}
              {copiedError && <p className="field-error" role="alert">No pudimos copiarlo. Puedes seleccionar el mensaje y copiarlo directamente.</p>}
            </section>
          )}
        </div>

        <aside className="contact-aside">
          <div className="aside-box">
            <h3>Hablemos</h3>
            <p><Clock size={15} /> Horario de atención: {hotelInfo.hours}</p>
            <a href={hotelInfo.instagram} target="_blank" rel="noopener noreferrer"><Instagram size={15} /> @hotelsistermoon</a>
            <a href={hotelInfo.whatsappLink} target="_blank" rel="noopener noreferrer"><MessageCircle size={15} /> WhatsApp {hotelInfo.whatsappDisplay}</a>
          </div>
        </aside>
      </div>

      <section className="faq-section">
        <h2>Preguntas frecuentes</h2>
        {faqs.map((faq) => (
          <details key={faq.q} className="faq-item">
            <summary>{faq.q}</summary>
            <p>{faq.a}</p>
          </details>
        ))}
      </section>
    </div>
  );
}
