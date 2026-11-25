export type PhotoGroup =
  | 'Áreas comunes'
  | 'Habitaciones'
  | 'Glamping'
  | 'Restaurante'
  | 'Villa 1'
  | 'Villa 2'
  | 'Villa 3'
  | 'Villa 4'
  | 'Villa 5';

export type Photo = {
  id: string;
  url: string;
  width: number;
  height: number;
  alt: string;
  group: PhotoGroup;
};

export type RateRow = { nights: string; total: string };

export type Villa = {
  slug: string;
  name: string;
  intro: string;
  cover: string;
  photoAlt?: string;
  photoNote?: string;
  ideal: number;
  maxConditioned: number;
  services: string[];
  rates: RateRow[];
  note?: string;
  fichaPhotoIds?: string[];
};

export type RoomPage = {
  slug: string;
  label: string;
  folderRelated: string[];
  fallback: string[];
};

export const ENDPOINT = 'https://ik.imagekit.io/3hhgoodtd';
export const NEW_ENDPOINT = 'https://ik.imagekit.io/dq7d7xx3z/sistermoon';

function ikNew(key: string, width?: number): string {
  const params = width ? `tr=w-${width},f-webp` : 'tr=f-webp';
  return `${NEW_ENDPOINT}/${key}.webp?${params}`;
}

// asset convention:
//  - starts with "http" → full URL already
//  - starts with "new:"  → new endpoint flat key (e.g. "new:villa-1-exterior-0133")
//  - otherwise            → old endpoint relative path (e.g. "villas/villa-1/cocina.webp")
const rawPhotos: [string, string, number, number, string, PhotoGroup][] = [
  ['sm-001', 'area-comun/deck/dji-20260609112805-0116-d.webp', 2400, 1350, 'Vista aérea del hotel junto a la costa rocosa', 'Áreas comunes'],
  ['sm-002', 'area-comun/deck/dji-20260609121350-0131-d.webp', 2400, 1350, 'Deck y palmeras vistos desde arriba', 'Áreas comunes'],
  ['sm-003', 'area-comun/deck.webp', 2400, 1600, 'Deck con sillas frente al mar', 'Áreas comunes'],
  ['sm-004', 'area-comun/entrada.webp', 2400, 1600, 'Sendero de entrada a Sister Moon', 'Áreas comunes'],
  ['sm-005', 'area-comun/fogata1.webp', 2400, 1600, 'Área de descanso y fogata junto al mar', 'Áreas comunes'],
  ['sm-006', 'area-comun/foto-logo.webp', 2400, 1600, 'Entrada con letrero de Sister Moon', 'Áreas comunes'],
  ['sm-007', 'area-comun/general/dji-20260609112609-0111-d.webp', 2400, 1350, 'Edificios del hotel y piscina junto al mar', 'Áreas comunes'],
  ['sm-008', 'area-comun/general/dji-20260609112708-0115-d.webp', 2400, 1350, 'Vista frontal aérea del hotel y el deck', 'Áreas comunes'],
  ['sm-009', 'area-comun/general/dji-20260609113048-0117-d.webp', 2400, 1350, 'Panorámica de la costa y alojamientos entre vegetación', 'Áreas comunes'],
  ['sm-010', 'area-comun/general/dji-20260609120048-0119-d.webp', 2400, 1350, 'Hotel y oleaje vistos desde el mar', 'Áreas comunes'],
  ['sm-011', 'area-comun/general/dji-20260609121242-0130-d.webp', 2400, 1350, 'Panorámica aérea de Sister Moon y la costa', 'Áreas comunes'],
  ['sm-012', 'area-comun/teatro-de-olas-1.webp', 2400, 1600, 'Deck frente al mar entre palmeras', 'Áreas comunes'],
  ['sm-013', 'area-comun/teatro-de-olas.webp', 2400, 1600, 'Área común frente al mar', 'Áreas comunes'],
  ['sm-014', 'area-comun/vista-1.webp', 2400, 1600, 'Sendero costero entre palmeras con una persona', 'Áreas comunes'],
  ['sm-015', 'area-comun/vista-2.webp', 2400, 1600, 'Camino hacia el mar con una persona entre palmeras', 'Áreas comunes'],
  // Glamping — URLs migrated to new endpoint
  ['sm-016', 'new:glamping-area-0138', 2400, 1350, 'Vista aérea del área asignada a campamento y glamping', 'Glamping'],
  ['sm-017', 'new:glamping-piscina-0139', 2400, 1350, 'Piscina y estructuras entre vegetación en el área de glamping', 'Glamping'],
  // Habitaciones — 8 existing exteriors (old endpoint) + 4 new interiors (new endpoint)
  ['sm-018', 'habitaciones/1/dji-20260609120404-0121-d.webp', 2400, 1350, 'Exterior de edificio de habitaciones entre palmeras', 'Habitaciones'],
  ['sm-019', 'habitaciones/10/dji-20260609120500-0122-d.webp', 2400, 1350, 'Conjunto de cabañas entre palmeras', 'Habitaciones'],
  ['sm-020', 'habitaciones/10/dji-20260609120535-0125-d.webp', 2400, 1350, 'Cabañas del hotel vistas desde arriba', 'Habitaciones'],
  ['sm-021', 'habitaciones/3/dji-20260609121131-0129-d.webp', 2400, 1350, 'Exterior y balcón de edificio de habitaciones', 'Habitaciones'],
  ['sm-022', 'habitaciones/8/dji-20260609120512-0123-d.webp', 2400, 1350, 'Cabañas con techos rojizos entre vegetación', 'Habitaciones'],
  ['sm-023', 'habitaciones/8/dji-20260609120741-0126-d.webp', 2400, 1350, 'Exterior de cabaña elevada con balcón', 'Habitaciones'],
  ['sm-024', 'habitaciones/8/dji-20260609121050-0128-d.webp', 2400, 1350, 'Vista frontal de cabaña elevada entre palmeras', 'Habitaciones'],
  ['sm-025', 'habitaciones/9/dji-20260609120910-0127-d.webp', 2400, 1350, 'Cabaña elevada y balcón entre vegetación', 'Habitaciones'],
  ['sm-026', 'new:habitaciones-dormitorio-09536', 2400, 1600, 'Dormitorio con cama y ventanal', 'Habitaciones'],
  ['sm-027', 'new:habitaciones-dormitorio-09539', 2400, 1600, 'Dormitorio con cama y aire acondicionado', 'Habitaciones'],
  ['sm-028', 'new:habitaciones-bano-09544', 2400, 1600, 'Baño con ducha y lavamanos', 'Habitaciones'],
  ['sm-029', 'new:habitaciones-fachada-09558', 2400, 1600, 'Fachada de edificio de habitaciones', 'Habitaciones'],
  // Villa 1 — 13 photos. 0132 and 0134 stay in gallery (old endpoint). 0133, 05812, 05817, 05820 migrated to new endpoint.
  ['sm-030', 'villas/villa-1/cocina.webp', 2400, 1600, 'Cocina con refrigerador y barra', 'Villa 1'],
  ['sm-031', 'villas/villa-1/dji-20260609121421-0132-d.webp', 2400, 1350, 'Vista del alojamiento y costa desde el mar', 'Villa 1'],
  ['sm-032', 'new:villa-1-exterior-0133', 2400, 1350, 'Fachada de alojamiento junto a la costa', 'Villa 1'],
  ['sm-033', 'villas/villa-1/dji-20260609121516-0134-d.webp', 2400, 1350, 'Vista exterior del alojamiento entre palmeras', 'Villa 1'],
  ['sm-034', 'villas/villa-1/dsc05810.webp', 2400, 1600, 'Sala interior con sofá y cortinas', 'Villa 1'],
  ['sm-035', 'new:villa-1-dormitorio-05812', 2400, 1600, 'Dormitorio con cama y aire acondicionado', 'Villa 1'],
  ['sm-036', 'villas/villa-1/dsc05813.webp', 2400, 1600, 'Cocina con barra y refrigerador', 'Villa 1'],
  ['sm-037', 'villas/villa-1/dsc05815.webp', 2400, 1600, 'Sala de estar con sofá y mesa', 'Villa 1'],
  ['sm-038', 'new:villa-1-hamaca-05817', 2400, 1600, 'Terraza cubierta con hamaca', 'Villa 1'],
  ['sm-039', 'villas/villa-1/dsc05819.webp', 2400, 1600, 'Terraza con sillas y espacio de BBQ', 'Villa 1'],
  ['sm-040', 'new:villa-1-portada-05820', 2400, 1600, 'Exterior de alojamiento con terraza cubierta', 'Villa 1'],
  ['sm-041', 'villas/villa-1/dsc05821.webp', 2400, 1600, 'Fachada y hamaca bajo terraza cubierta', 'Villa 1'],
  ['sm-042', 'villas/villa-1/dsc05822.webp', 2400, 1600, 'Deck sobre la orilla del mar', 'Villa 1'],
  // Villa 2 — 16 photos (14 original + 2 new). 05827, 05835, 05838 migrated to new endpoint.
  ['sm-043', 'villas/villa-2/dji-20260609121642-0135-d.webp', 2400, 1350, 'Vista aérea de villa con piscina y terraza', 'Villa 2'],
  ['sm-044', 'villas/villa-2/dsc05825.webp', 2400, 1600, 'Interior abierto con sala y camas', 'Villa 2'],
  ['sm-045', 'villas/villa-2/dsc05826.webp', 2400, 1600, 'Sofá y mesa en espacio interior', 'Villa 2'],
  ['sm-046', 'new:villa-2-camas-05827', 2400, 1600, 'Camas en interior de madera', 'Villa 2'],
  ['sm-047', 'villas/villa-2/dsc05828.webp', 2400, 1600, 'Sala y acceso a cocina', 'Villa 2'],
  ['sm-048', 'villas/villa-2/dsc05829.webp', 2400, 1600, 'Cocina con fregadero y refrigerador', 'Villa 2'],
  ['sm-049', 'villas/villa-2/dsc05832.webp', 2400, 1600, 'Área de cocina con estufa', 'Villa 2'],
  ['sm-050', 'villas/villa-2/dsc05833.webp', 2400, 1600, 'Mesa alta con sillas en interior', 'Villa 2'],
  ['sm-051', 'villas/villa-2/dsc05834.webp', 2400, 1600, 'Camas junto a ventanas y salida a terraza', 'Villa 2'],
  ['sm-052', 'new:villa-2-mesa-05835', 2400, 1600, 'Mesa bajo terraza cubierta frente al mar', 'Villa 2'],
  ['sm-053', 'villas/villa-2/dsc05836.webp', 2400, 1600, 'Comedor exterior entre palmeras', 'Villa 2'],
  ['sm-054', 'villas/villa-2/dsc05837.webp', 2400, 1600, 'Terraza con hamaca y sillas', 'Villa 2'],
  ['sm-055', 'new:villa-2-portada-05838', 2400, 1600, 'Piscina junto a terraza de la villa', 'Villa 2'],
  ['sm-056', 'villas/villa-2/dsc05839.webp', 2400, 1600, 'Piscina y fachada de la villa', 'Villa 2'],
  ['sm-057', 'new:villa-2-piscina-09643', 2400, 1600, 'Piscina de la villa con terraza y vegetación', 'Villa 2'],
  ['sm-058b', 'new:villa-2-terraza-09644', 2400, 1600, 'Terraza de la villa con vista al mar', 'Villa 2'],
  // Villa 3 — 9 photos (3 aerials removed, pending identification). DSC05786 intentionally last.
  ['sm-060', 'villas/villa-3/dsc05783.webp', 2400, 1600, 'Corredor inferior de Villa 3 con postes y barandas', 'Villa 3'],
  ['sm-061', 'villas/villa-3/dsc05787.webp', 2400, 1600, 'Balcón de Villa 3 con vista al mar', 'Villa 3'],
  ['sm-062', 'villas/villa-3/dsc05788.webp', 2400, 1600, 'Terraza cubierta de Villa 3 frente al mar', 'Villa 3'],
  ['sm-063', 'new:villas-azul-piscina-05789', 2400, 1600, 'Piscina y pérgola con hamaca de Villa 3', 'Villa 3'],
  ['sm-064', 'villas/villa-3/dsc05792.webp', 2400, 1600, 'Cocina con barra y refrigerador de Villa 3', 'Villa 3'],
  ['sm-065', 'new:villa-3-sala-05796', 2400, 1600, 'Sala de estar con ventanas y puertas azules de Villa 3', 'Villa 3'],
  ['sm-066', 'new:villa-3-comedor-05797', 2400, 1600, 'Comedor interior junto a balcón de Villa 3', 'Villa 3'],
  ['sm-067', 'new:villa-3-cocina-05798', 2400, 1600, 'Cocina abierta con barra de Villa 3', 'Villa 3'],
  ['sm-068', 'villas/villa-3/dsc05786.webp', 2400, 1600, 'Piscina con deck junto a estructura azul de Villa 3', 'Villa 3'],
  // Villa 5 — 16 photos. 0105, 0107, 05771, 05775, 05781 migrated to new endpoint.
  ['sm-069', 'new:villa-5-piscina-0105', 2400, 1350, 'Vista cenital de villa y piscina', 'Villa 5'],
  ['sm-070', 'villas/villa-5/dji-20260609111919-0106-d.webp', 2400, 1350, 'Piscina junto a villa vista desde arriba', 'Villa 5'],
  ['sm-071', 'new:villa-5-portada-0107', 2400, 1350, 'Villa de dos niveles entre palmeras', 'Villa 5'],
  ['sm-072', 'villas/villa-5/dji-20260609113203-0118-d.webp', 2400, 1350, 'Fachada y balcones de villa', 'Villa 5'],
  ['sm-073', 'villas/villa-5/dsc05768.webp', 2400, 1600, 'Cocina con estufa y refrigerador', 'Villa 5'],
  ['sm-074', 'villas/villa-5/dsc05769.webp', 2400, 1600, 'Cocina equipada y alacenas', 'Villa 5'],
  ['sm-075', 'villas/villa-5/dsc05770.webp', 2400, 1600, 'Cocina con barra de desayuno', 'Villa 5'],
  ['sm-076', 'new:villa-5-sala-05771', 2400, 1600, 'Sala y comedor con salida al balcón', 'Villa 5'],
  ['sm-077', 'villas/villa-5/dsc05772.webp', 2400, 1600, 'Vista longitudinal de sala y comedor', 'Villa 5'],
  ['sm-078', 'villas/villa-5/dsc05773.webp', 2400, 1600, 'Sala con sofá junto al balcón', 'Villa 5'],
  ['sm-079', 'villas/villa-5/dsc05774.webp', 2400, 1600, 'Comedor y sofá en sala luminosa', 'Villa 5'],
  ['sm-080', 'new:villa-5-balcon-05775', 2400, 1600, 'Balcón con sillas frente al mar', 'Villa 5'],
  ['sm-081', 'villas/villa-5/dsc05778.webp', 2400, 1600, 'Terraza inferior con hamaca y escaleras', 'Villa 5'],
  ['sm-082', 'villas/villa-5/dsc05779.webp', 2400, 1600, 'Hamaca bajo terraza de madera', 'Villa 5'],
  ['sm-083', 'villas/villa-5/dsc05780.webp', 2400, 1600, 'Sillas en balcón con vista al mar', 'Villa 5'],
  ['sm-084', 'new:villa-5-bbq-05781', 2400, 1600, 'Área exterior de BBQ con mesa y bancas', 'Villa 5'],
  // Áreas comunes — 3 nuevas
  ['sm-085', 'new:galeria-costa-cenital-0331', 2400, 1350, 'Costa rocosa vista desde arriba', 'Áreas comunes'],
  ['sm-086', 'new:galeria-entrada-mar-0333', 2400, 1600, 'Entrada al mar entre rocas', 'Áreas comunes'],
  ['sm-087', 'new:galeria-deck-09583', 2400, 1600, 'Deck del hotel frente al mar', 'Áreas comunes'],
  // Restaurante — 3 nuevas
  ['sm-088', 'new:restaurante-plato-09564', 2400, 1600, 'Plato del restaurante de Sister Moon', 'Restaurante'],
  ['sm-089', 'new:restaurante-plato-09562', 2400, 1600, 'Plato del restaurante de Sister Moon', 'Restaurante'],
  ['sm-090', 'new:restaurante-plato-09566', 2400, 1600, 'Plato del restaurante de Sister Moon', 'Restaurante'],
];

export const pendingAerials = [
  { id: 'sm-aerial-0108', key: 'villas-azul-dron-0108', note: 'Pendiente de identificación' },
  { id: 'sm-aerial-0109', key: 'villas-azul-dron-0109', note: 'Pendiente de identificación' },
  { id: 'sm-aerial-0110', key: 'villas-azul-dron-0110', note: 'Pendiente de identificación' },
];

export const photos: Photo[] = rawPhotos.map(([id, asset, width, height, alt, group]) => {
  let url: string;
  if (asset.startsWith('http')) {
    url = asset;
  } else if (asset.startsWith('new:')) {
    url = ikNew(asset.slice(4));
  } else {
    url = `${ENDPOINT}/sistermoon/${asset}`;
  }
  return { id, url, width, height, alt, group };
});

export const photosById: Record<string, Photo> = Object.fromEntries(photos.map((photo) => [photo.id, photo]));

export const galleryGroups: { label: string; group: PhotoGroup | 'Todas'; count: number }[] = [
  { label: 'Todas', group: 'Todas', count: photos.length },
  { label: 'Hotel y entorno', group: 'Áreas comunes', count: photos.filter((p) => p.group === 'Áreas comunes').length },
  { label: 'Habitaciones', group: 'Habitaciones', count: photos.filter((p) => p.group === 'Habitaciones').length },
  { label: 'Glamping', group: 'Glamping', count: photos.filter((p) => p.group === 'Glamping').length },
  { label: 'Villa 1', group: 'Villa 1', count: photos.filter((p) => p.group === 'Villa 1').length },
  { label: 'Villa 2', group: 'Villa 2', count: photos.filter((p) => p.group === 'Villa 2').length },
  { label: 'Villa 3', group: 'Villa 3', count: photos.filter((p) => p.group === 'Villa 3').length },
  { label: 'Villa 4', group: 'Villa 4', count: photos.filter((p) => p.group === 'Villa 4').length },
  { label: 'Villa 5', group: 'Villa 5', count: photos.filter((p) => p.group === 'Villa 5').length },
  { label: 'Restaurante', group: 'Restaurante', count: photos.filter((p) => p.group === 'Restaurante').length },
];

export const brand = {
  full: `${ENDPOINT}/sistermoon/sismoon-full-logo-png.webp`,
  symbol: `${ENDPOINT}/sistermoon/sismoon-logo-sin-texto-png.webp`,
  wordmark: `${ENDPOINT}/sistermoon/sismoon-logo-solo-texto.webp`,
  temporal: `${ENDPOINT}/sistermoon/logo-sister-moon-temporal.webp`,
};

export const siteImages = {
  hero: ikNew('inicio-portada-0307', 1280),
  heroAlternative: photosById['sm-003'].url,
  island: ikNew('isla-panoramica-0330', 1280),
  islandPath: photosById['sm-014'].url,
  rooms: photosById['sm-022'].url,
  villas: photosById['sm-071'].url,
  glamping: photosById['sm-017'].url,
  glampingAerial: photosById['sm-016'].url,
  experiences: photosById['sm-013'].url,
  slowTime: photosById['sm-012'].url,
  closing: photosById['sm-003'].url,
  contact: photosById['sm-007'].url,
  firePit: photosById['sm-005'].url,
  entrance: photosById['sm-004'].url,
  restaurantMain: ikNew('restaurante-plato-09564', 960),
  restaurantDeck: ikNew('restaurante-deck', 960),
  homeHamaca: ikNew('inicio-hamaca-09542', 1280),
};

export const villaList: Villa[] = [
  {
    slug: 'villa-1',
    name: 'Villa 1',
    intro: 'Para una escapada de dos frente al mar. Conoce sus espacios y consulta las condiciones si vienen más personas.',
    cover: photosById['sm-040'].url,
    ideal: 2,
    maxConditioned: 4,
    services: ['Cama King', 'Cocina equipada', 'A/C', 'BBQ', 'Vista al mar', 'Acceso Club de Playa'],
    rates: [
      { nights: '1 noche', total: '$175' },
      { nights: '2 noches', total: '$300' },
      { nights: '3 noches', total: '$450' },
    ],
    fichaPhotoIds: ['sm-030', 'sm-032', 'sm-035', 'sm-038'],
  },
  {
    slug: 'villa-2',
    name: 'Villa 2',
    intro: 'Espacio para compartir con los tuyos, con piscina privada y terraza BBQ frente al mar.',
    cover: photosById['sm-055'].url,
    ideal: 6,
    maxConditioned: 8,
    services: ['1 cama doble + 3 camas ¾ + cama plegable', 'A/C', 'Piscina privada', 'Terraza BBQ', 'Vista al mar'],
    rates: [
      { nights: '1 noche', total: '$275' },
      { nights: '2 noches', total: '$500' },
      { nights: '3 noches', total: '$700' },
    ],
    fichaPhotoIds: ['sm-052', 'sm-046', 'sm-044', 'sm-057', 'sm-058b'],
  },
  {
    slug: 'villa-3',
    name: 'Villa 3',
    intro: 'En la colina, con cocina equipada, BBQ y piscina privada. Mira sus espacios y organiza unos días de isla con los tuyos.',
    cover: photosById['sm-061'].url,
    ideal: 6,
    maxConditioned: 10,
    services: ['Ubicada en colina', '1 cama doble + 4 camas ¾', 'Cocina equipada', 'BBQ', 'Piscina privada', 'Vista al mar'],
    rates: [
      { nights: '1 noche', total: '$350' },
      { nights: '2 noches', total: '$650' },
      { nights: '3 noches', total: '$900' },
    ],
    fichaPhotoIds: ['sm-063', 'sm-065', 'sm-066', 'sm-067'],
  },
  {
    slug: 'villa-4',
    name: 'Villa 4',
    intro: 'Una opción para compartir unos días de isla, con piscina privada y terraza BBQ. Consulta la distribución y la capacidad para tu grupo.',
    cover: photosById['sm-007'].url,
    photoAlt: 'Ambiente del hotel y piscina junto al mar, imagen de referencia para Villa 4',
    photoNote: 'Esta foto muestra el ambiente general del hotel como referencia. Las fotos verificadas de Villa 4 se confirmarán al consultar.',
    ideal: 5,
    maxConditioned: 7,
    services: ['1 cama doble + litera de 2 camas', 'A/C', 'Piscina privada', 'Terraza BBQ', 'Vista al mar'],
    rates: [
      { nights: '1 noche', total: '$300' },
      { nights: '2 noches', total: '$550' },
      { nights: '3 noches', total: '$800' },
    ],
    note: 'La distribución de camas y la capacidad ampliada de esta villa se confirman al consultar.',
  },
  {
    slug: 'villa-5',
    name: 'Villa 5',
    intro: 'Dos habitaciones con baños independientes, deck, mirador, balcón y vista al mar. Un espacio para reunirse y también tener su rato aparte.',
    cover: photosById['sm-071'].url,
    ideal: 6,
    maxConditioned: 8,
    services: ['2 habitaciones con baños independientes', 'Cama doble + cama ¾ + litera', 'A/C', 'Piscina privada', 'Deck, mirador y balcón', 'Vista al mar'],
    rates: [
      { nights: '1 noche', total: '$350' },
      { nights: '2 noches', total: '$650' },
      { nights: '3 noches', total: '$900' },
    ],
    fichaPhotoIds: ['sm-069', 'sm-076', 'sm-080', 'sm-084'],
  },
];

export const villaRatesNote = 'Estos importes corresponden al total de la estancia indicada. Escríbenos para confirmar tus fechas y las condiciones aplicables.';

export const villaCommonConditions = [
  'El alojamiento en villa permite acceder al bar, piscina y restaurante del hotel. Los consumos no están incluidos por ese acceso.',
  'Cooler permitido sin costo adicional en villas.',
  'Supervisión adulta de menores en piscinas y terrazas.',
];

export const villaCapacityNote = 'La capacidad ampliada requiere un colchón inflable que trae el huésped. Confirma con nuestro equipo la distribución para tu grupo.';

export const roomPages: RoomPage[] = [
  { slug: 'sm-1', label: 'Habitación SM 1', folderRelated: ['sm-018'], fallback: ['sm-019', 'sm-022'] },
  { slug: 'sm-2', label: 'Habitación SM 2', folderRelated: ['sm-018'], fallback: ['sm-019', 'sm-022'] },
  { slug: 'sm-3', label: 'Habitación SM 3', folderRelated: ['sm-021'], fallback: ['sm-019', 'sm-022'] },
  { slug: 'sm-5', label: 'Habitación SM 5', folderRelated: [], fallback: ['sm-019', 'sm-022'] },
  { slug: 'sm-6', label: 'Habitación SM 6', folderRelated: [], fallback: ['sm-019', 'sm-022'] },
  { slug: 'sm-7', label: 'Habitación SM 7', folderRelated: [], fallback: ['sm-019', 'sm-022'] },
  { slug: 'sm-8', label: 'Habitación SM 8', folderRelated: ['sm-019', 'sm-022', 'sm-023', 'sm-024'], fallback: ['sm-019', 'sm-022'] },
  { slug: 'sm-9', label: 'Habitación SM 9', folderRelated: ['sm-019', 'sm-024', 'sm-025'], fallback: ['sm-019', 'sm-022'] },
  { slug: 'sm-10', label: 'Habitación SM 10', folderRelated: ['sm-019', 'sm-020'], fallback: ['sm-019', 'sm-022'] },
  { slug: 'sm-11', label: 'Habitación SM 11', folderRelated: [], fallback: ['sm-019', 'sm-022'] },
];

export const roomExteriorNote = 'Estas fotos muestran los exteriores del hotel. Escríbenos para conocer las opciones de habitación para tus fechas.';

export const roomPlans = [
  { slug: 'sin-desayuno', name: 'Habitación sin desayuno', price: '$82.50', unit: 'por pareja y noche', includes: 'ITBMS incluido.' },
  { slug: 'con-desayuno', name: 'Habitación con desayuno', price: '$110.00', unit: 'por pareja y noche', includes: 'Desayuno americano e ITBMS incluidos.' },
];

export const hotelExtras = [
  { label: 'Niños de 0 a 7 años', price: 'Gratis', note: 'Sujeto a capacidad real de la habitación.' },
  { label: 'Niños de 8 a 14 años', price: '$16.50', note: 'Por noche.' },
  { label: 'Jóvenes de 15 a 17 años', price: '$22.00', note: 'Por noche.' },
  { label: 'Adulto adicional', price: '$33.00', note: 'Por noche, adicional a la pareja base.' },
  { label: 'Mascotas', price: '$15.00', note: 'Confirma condiciones antes de viajar.' },
  { label: 'Cooler chico', price: '$25.00', note: 'Consulta condiciones.' },
  { label: 'Cooler mediano', price: '$35.00', note: 'Consulta condiciones.' },
  { label: 'Descorche de botella de licor', price: '$15.00', note: 'Por botella.' },
  { label: 'Tour en lancha por las islas', price: 'Consulta la cotización del paseo', note: 'Coordinación con el operador.' },
];

export const glampingInfo = {
  cover: photosById['sm-017'].url,
  aerial: photosById['sm-016'].url,
  rateNote: 'Consulta la tarifa y qué incluye tu estancia.',
  services: ['BBQ', 'Piscina', 'Baño privado', 'Área de fogata'],
  description: 'Una estancia al aire libre en Isla Grande, con BBQ, piscina, baño privado y área de fogata. Más afuera, más cerca de la naturaleza.',
};

export const hotelInfo = {
  name: 'Hotel Sister Moon',
  location: 'Isla Grande, Colón, Panamá',
  hours: 'Todos los días de 9:00 a. m. a 6:00 p. m., hora de Panamá',
  instagram: 'https://instagram.com/hotelsistermoon',
  whatsappNumber: '50766115399',
  whatsappDisplay: '+507 6611-5399',
  whatsappLink: 'https://wa.me/50766115399',
  brandLine: 'Un rato de mar, naturaleza y vida de isla.',
};

export const faqs = [
  {
    q: '¿Cómo elijo entre habitación, villa y glamping?',
    a: 'Depende de cuántos vienen y de cómo quieren pasar la estancia. Las habitaciones tienen planes del hotel; cada villa tiene su capacidad, espacios y tarifa; el glamping es la opción al aire libre. Si no tienes claro cuál elegir, cuéntanos tu plan.',
  },
  {
    q: '¿Cómo funcionan los precios de las villas?',
    a: 'Cada villa se cotiza según el número de noches y el tamaño del grupo. Usa el buscador de disponibilidad para ver el total de tu estancia. Escríbenos para confirmar tus fechas y las condiciones aplicables.',
  },
  {
    q: '¿Puedo llevar cooler?',
    a: 'En villas está permitido sin costo adicional. En las habitaciones del hotel se aplican cargos según el tamaño del cooler. Al consultar, indica dónde quieres quedarte para confirmar lo que corresponde.',
  },
  {
    q: '¿El acceso al restaurante incluye la comida?',
    a: 'No. El acceso al restaurante y al bar no incluye los consumos.',
  },
  {
    q: '¿Cómo llego a Sister Moon?',
    a: 'La visita a Isla Grande incluye un cruce en lancha. Escríbenos antes de salir para confirmar el muelle, el traslado y las indicaciones para llegar a tu alojamiento.',
  },
  {
    q: '¿Qué ambiente tiene Sister Moon?',
    a: 'La propuesta es venir a descansar, disfrutar la naturaleza y compartir con tranquilidad. Si buscas organizar un evento, coméntalo antes con el equipo para revisar si encaja con el lugar.',
  },
];

export const homeGalleryIds = ['sm-011', 'sm-003', 'sm-071', 'sm-040', 'sm-022'];

export function photosForGroup(group: PhotoGroup | 'Todas'): Photo[] {
  if (group === 'Todas') return photos;
  return photos.filter((photo) => photo.group === group);
}
