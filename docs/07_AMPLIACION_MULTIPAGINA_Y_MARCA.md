# Sister Moon · Ampliación multipágina y marca

17/10/2026. Continuación del proyecto existente en Bolt. Implementar esta ampliación sobre lo ya construido; no iniciar una web nueva. El maestro 01 sigue siendo la fuente comercial. Este documento sustituye su alcance de navegación de una sola página y su paleta provisional azul/turquesa cuando entren en conflicto. No sustituye precios ni inventa servicios.

## Resultado obligatorio

El visitante debe poder explorar todos los alojamientos documentados, abrir una página individual, recorrer sus fotografías, comparar opciones y llevar su elección al formulario de consulta. Una tarjeta que abre un resumen genérico no satisface este encargo. Las fotografías deben ser accesibles y tener una función real en páginas y galerías.

Revisión de la web publicada, 17/10: inicio con fotos reales y logo ya integrado; navegación por botones de secciones; la tarjeta Villas abre un modal general con cinco nombres/capacidades y una imagen. No se verificó el código ni una versión no publicada de Bolt. Inspeccionar el proyecto antes de editar y conservar las funciones que ya estén resueltas allí. El logo oscuro sobre la portada pierde contraste. El inicio incluye lenguaje interno como «Tres formas confirmadas» y «servicios confirmados»: retirarlo del texto público.

## 1. Arquitectura de páginas y navegación

Usar el enrutador y framework existentes. Son URLs reales que deben abrirse directamente, recargarse y poder compartirse; no anclas ni únicamente modales. Reutilizar plantillas y datos, no duplicar una implementación por habitación.

| Ruta | Contenido y función |
|---|---|
| `/` | Inicio editorial: marca, foto real, introducción, selector de estancias, selección de fotos y enlaces a páginas completas |
| `/alojamientos` | Catálogo conjunto: habitaciones, villas y glamping; filtros de tipo y orientación por tamaño de grupo |
| `/habitaciones` | Dos planes generales, tabla de adicionales, galería de exteriores y las 10 habitaciones documentadas |
| `/habitaciones/sm-1`, `/sm-2`, `/sm-3`, `/sm-5`, `/sm-6`, `/sm-7`, `/sm-8`, `/sm-9`, `/sm-10`, `/sm-11` bajo `/habitaciones` | Fichas por identificador, únicamente con datos atribuibles a cada unidad y consulta con número preseleccionado |
| `/villas` | Cinco tarjetas individuales y comparación de capacidades, servicios documentados y paquetes |
| `/villas/villa-1` a `/villas/villa-5` | Cinco páginas completas con galerías propias, información comercial y CTA contextual |
| `/glamping` | Servicios documentados, dos imágenes del área, tarifa de referencia y consulta específica |
| `/experiencias` | Áreas comunes, mar, descanso, bar/restaurante y consulta por tour; sin actividades inventadas |
| `/isla-grande` | Contexto de Isla Grande y fotografías del entorno; información de llegada cuando exista fuente confirmada |
| `/galeria` | Acceso a las 80 fotografías, filtradas por categoría, sin logos como fotos de alojamiento |
| `/contacto` | Consulta estructurada, horario, canales reales configurados y preguntas frecuentes útiles |
| Ruta no encontrada | Página 404 con enlace a alojamientos/inicio; nunca pantalla vacía |

Son 24 páginas de contenido incluyendo las 10 fichas de habitaciones y las cinco villas, más 404. No crear SM 4: no figura en los documentos. No convertir el inventario documental en disponibilidad real.

Cabecera compartida: logo enlaza al inicio; «Alojamientos» despliega Habitaciones / Villas / Glamping / Ver todos; «Experiencias», «La isla», «Galería» y CTA «Consultar». En móvil, menú accesible con las mismas opciones. Desplegable usable con clic y teclado, no solo hover. Pie con accesos completos, marca y contactos reales.

Usar enlaces para navegar y botones para acciones. Breadcrumbs en fichas; estado activo en menú; atrás/adelante del navegador coherentes; al cambiar página llevar el foco/título y scroll al inicio, al volver a un listado recuperar filtros/posición cuando sea posible. Mantener enlaces antiguos de secciones si ya se utilizan. Configurar el hosting para que recargar una ruta interior no dé 404 de servidor. No cambiar el dominio.

## 2. Diseño ligado al logo suministrado

Referencia del propietario: `Logo Sister Moon - Temporal.png`, adjunto el 17/10. Presenta verde luminoso en HOTEL, verde oscuro en SisterMoon, contraste entre letras sans serif gruesas y serif, y emblema tropical con verde, amarillo y turquesa. No se ha identificado la fuente exacta del logotipo ni se entregó manual de marca. Las siguientes son decisiones de diseño propuestas basadas en esa referencia, no colores Pantone ni tipografías oficiales.

### Paleta funcional propuesta

| Variable | Color | Uso |
|---|---|---|
| `brand-forest` | `#173E29` | Títulos, CTA principales, enlaces y pie |
| `brand-green` | `#4FA65C` | Acentos, líneas, selección visual e ilustraciones pequeñas |
| `brand-leaf` | `#E8F1E4` | Fondos secundarios y etiquetas |
| `brand-cream` | `#FAF8F0` | Fondo principal y superficie detrás del logo |
| `brand-ink` | `#20382B` | Texto de lectura |
| `brand-sun` | `#E8D66C` | Acento cálido limitado, con texto oscuro |
| `brand-water` | `#217F83` | Acento secundario muy puntual |

Reemplazar el azul marino como color protagonista por verde bosque. Verde brillante no debe llevar texto blanco pequeño sin verificar contraste; CTA oscuro con texto crema. No convertir toda la web en verde saturado ni pintar las fotografías. Distribución orientativa: 70% superficies neutras/fotos, 20% verdes oscuros y 10% acentos.

### Tipografía y composición

Conservar el logo como imagen: no intentar recrear sus letras con texto HTML. Para títulos, usar una serif de contraste con peso firme y formas cercanas al carácter de SisterMoon: preferir la serif existente si encaja, o `Georgia, 'Times New Roman', serif` como solución inmediata sin dependencias. Para navegación, párrafos y formularios, usar la sans existente si es legible, con fallback `Arial, sans-serif`. Dos familias máximo. No declarar que estas son las fuentes exactas del logo. Evitar convertir todos los titulares en cursiva fina; reservar énfasis para alguna frase breve.

Títulos fluidos: H1 `clamp(2.4rem,5vw,5rem)`; H2 `clamp(1.8rem,3.4vw,3.2rem)`; cuerpo 16-18 px, interlineado 1.55-1.7; ancho de texto 60-70 caracteres. Contenido máximo 1200-1280 px, márgenes móviles 20 px, espacios consistentes de 8/16/24/32/48/64 px. Tarjetas con radios 12-16 px, bordes discretos y sombra suave; no todas las secciones deben ser tarjetas idénticas.

Cabecera crema o blanca cálida con logo verde legible; puede ser fija sin tapar contenido. No poner logo verde oscuro directamente sobre vegetación oscura. Usar `object-fit: contain`, sin recorte, filtros de color ni deformación. Respetar el área transparente del archivo: ajustar el contenedor al dibujo visible, evitando un logo minúsculo. En móvil no comprimir la marca hasta hacerla ilegible; cambiar a símbolo + nombre accesible si falta espacio. No ampliar la pequeña imagen adjunta como si fuera de alta resolución; usar los assets existentes de ImageKit indicados en el mapa.

Marca: sm-027 logo completo en cabecera/pie, sm-028 emblema en favicon/iconos, sm-029 versión de texto en contextos secundarios. sm-026 es la variante temporal suministrada, conservada como alternativa de referencia. No mostrar cuatro logos distintos en una galería solo para incrementar el conteo. Si el propietario decide usar exactamente la variante temporal, intercambiar el asset central; no recolorear ni redibujar el emblema.

## 3. Alojamientos que realmente se puedan explorar

### Catálogo

Tarjetas con fotografía pertinente, nombre, categoría, capacidad solo donde se conoce, precio de referencia con unidad y botón «Ver alojamiento». Separar visualmente «Ver fotos» de «Consultar». Las tarjetas de villas deben llevar a su villa, no al modal genérico de la categoría.

Filtros por tipo y personas; no llamar «disponibles» a resultados sin inventario conectado. Si falta capacidad de habitaciones/glamping, mantenerlas como opciones de consulta, no descartarlas ni afirmar que encajan en cualquier grupo. Botón para restablecer filtros y estado sin resultados útil. Conservar filtros en URL cuando lo soporte el proyecto.

### Plantilla de villa

1. Breadcrumbs, nombre, descripción factual breve y capacidad ideal/máxima condicionada.
2. Foto principal, miniaturas y botón «Ver todas las fotos (N)». En escritorio mosaico, en móvil carrusel controlable.
3. Servicios exactos del maestro con texto además de iconos; omitir servicios no documentados.
4. Tabla de paquetes normales de 1/2/3 noches, claramente como totales por estancia; feriados diferenciados sin inventar vigencia.
5. Condiciones de colchón propio, supervisión de menores y acceso al hotel; aclarar que bar/restaurante no significa consumo incluido.
6. Consulta con la villa seleccionada y fechas/personas conservadas. Bloque lateral fijo solo en escritorio si no tapa información; barra móvil compacta sin ocultar botones.
7. Otras villas relacionadas enlazadas a sus páginas reales.

Distribuciones de imágenes: Villa 1 tiene 13; Villa 2, 14; Villa 3, 9; Villa 4, 3; Villa 5, 16. Usar todas en sus galerías, con la atribución por carpeta recibida y la comprobación de Villa 3/4 pendiente. No intercambiar interiores para rellenar la Villa 4. No inferir servicios nuevos de una fotografía.

### Habitaciones: visibilidad sin inventar detalles

Mostrar las diez referencias SM del documento con enlaces individuales. No bloquear su navegación porque no existe ficha técnica completa. No inventar nombres temáticos, vistas, camas, A/C, capacidad ni disponibilidad.

En la página general mostrar los planes de $82.50 sin desayuno y $110 con desayuno americano, por pareja/noche e ITBMS incluido, con alcance del maestro. En fichas individuales se pueden presentar como «Planes generales del hotel; consulta aplicación a esta habitación», sin asignar inventario o un precio final personalizado. Las tarifas de feriado por SM sí están identificadas en la fuente, pero deben mantener el contexto de Fiestas Patrias/Año Nuevo y fechas por confirmar.

sm-018 procede de carpetas SM 1 y 2; sm-019 está compartida entre 8, 9 y 10; sm-024 entre 8 y 9. No repetirlas con etiquetas de interior exclusivo. El mapa entrega IDs relacionados por carpeta y un fallback general. Mostrar «Vista exterior del hotel» o «Galería de exteriores» donde corresponda. SM 5, 6, 7 y 11 no tienen fotos individuales identificadas: pueden tener ficha y consulta, acompañadas de galería general claramente rotulada. La ausencia de fotos específicas no justifica un botón muerto ni usar stock.

### Glamping

Página con ambas fotos del área, servicios documentados y consulta. Capacidad no confirmada: no inventar límite ni prometer camas. No usar la fotografía de una villa como si fuera una tienda. Descripción propuesta: «Una opción para disfrutar la naturaleza de Isla Grande, con BBQ, piscina, baño privado y área de fogata. Consulta las condiciones de tu estancia».

## 4. Uso completo de imágenes y galerías

`08_MAPA_PAGINAS_Y_GALERIAS.json` asigna cada una de las 80 fotografías a una categoría y a una página principal, con URL real. También contiene los cuatro assets de marca y su función. Es el archivo de implementación de esta ampliación: sustituye las selecciones parciales anteriores cuando entren en conflicto.

Requisito: **80/80 fotografías accesibles en `/galeria`**, no 80 cargadas al abrir inicio. Galerías por categoría: áreas comunes 15, habitaciones 8, glamping 2 y villas 55. Filtros: Todas / Hotel y entorno / Habitaciones / Glamping / Villa 1 / Villa 2 / Villa 3 / Villa 4 / Villa 5. Mostrar conteo real del filtro. Deduplicar por ID; conservar tomas parecidas como alternativas dentro de galería. Las 5 copias exactas originales ya fueron eliminadas del paquete.

Inicio presenta selección editorial de 6-10 fotos y enlaza a la biblioteca completa. Experiencias y La isla reutilizan fotos de entorno con intención; no necesitan imágenes artificiales de gastronomía. Las 80 se pueden descubrir mediante paginación o «Cargar más», por ejemplo 16 por tanda; el botón debe funcionar hasta alcanzar el total. Los logos no se cuentan como habitaciones ni fotos de experiencia.

Al abrir una foto: visor accesible con anterior/siguiente, contador «3 de 14», miniaturas si caben, descripción breve y cierre. Teclas izquierda/derecha/Escape; foco atrapado dentro y devuelto al elemento original; swipe móvil además de controles visibles. Visor limitado a la galería/filtrado abierto. Sin autoplay. Nunca depender solo de arrastrar o pasar el cursor.

Todas las imágenes enlazan a su `imagekit_url`; no subirlas otra vez ni convertirlas en base64. Previsualizaciones con tamaños adecuados; originales/variantes grandes solo al abrir visor. Portada con carga prioritaria; demás con carga diferida, dimensiones reservadas y proporción estable. No descargar 52 MB al inicio. Evitar precargar el álbum completo: solo imagen activa y vecina cuando sea necesario. Al fallar una imagen, mostrar mensaje y acción de reintento sin reemplazarla por stock ni engañar el contador. Describir escenas reales con los alt existentes; no asumir unidad exacta en vistas compartidas.

## 5. Formularios y navegación funcional

Fechas y número de personas seleccionados en inicio deben llegar al catálogo y al formulario; al consultar Villa 2, el resumen debe decir Villa 2. Pedir adultos y edades de menores en la consulta, no solo total de personas. Validar fechas en hora de Panamá. Permitir cambiar alojamiento sin perder fechas. No calcular totales para reglas todavía incompletas.

Si WhatsApp oficial está configurado, abrir el mensaje codificado con selección, fechas y personas; abrir WhatsApp no confirma envío ni reserva. Si aún falta, la página de consulta debe permitir ver y copiar el resumen, con texto honesto «La consulta aún no se ha enviado». No mostrar «WhatsApp null», «configuración pendiente», «datos por confirmar en documento» ni estados internos. No presentar un botón «Enviar» que no envía. Esta limitación del canal se reporta al propietario, sin impedir explorar alojamientos/fotos.

No crear cuentas, pagos, CRM ni administración en esta ampliación. «Que se pueda mover» se traduce aquí en navegación entre páginas, filtros, galerías y selección de alojamiento; no en un editor visual ni en inventario en vivo.

## 6. Textos, contacto y contenido público

Eliminar «Tres formas confirmadas», «servicios confirmados», «dato pendiente», «null» y listas internas de verificación de todas las pantallas públicas. Sustituciones: «Habitaciones, villas y glamping para vivir Isla Grande a tu manera»; «Conoce nuestras cinco villas»; «Explora el hotel en imágenes».

No eliminar información útil solo porque falte otra parte: publicar los precios/condiciones documentados con alcance correcto, sin una cotización final falsa. Usar «Consulta la tarifa para tus fechas» cuando corresponda. La vigencia, Villa 5 feriado y estado de Villa 4 siguen conforme al maestro. Faltantes técnicos se quedan en configuración/documentación privada.

Experiencias: espacios comunes, vistas, descanso, bar/restaurante y consulta por tour en lancha. No inventar menús, excursiones incluidas o playas privadas. La isla: texto breve y visual con ubicación confirmada; mapa solo si ya hay pin validado. No crear una página vacía de Cómo llegar. Contacto incluye horario real, preguntas frecuentes y canal disponible; no inventar teléfono o correo.

## 7. Calidad requerida y comprobación final en Bolt

- Las 24 rutas existen; navegación, enlaces directos, recarga y atrás/adelante funcionan. Ruta desconocida muestra 404 útil.
- Diez fichas SM navegables y cinco villas con sus propios datos; ningún «Ver villa» abre una ficha genérica.
- 80 fotos únicas accesibles en galería; conteos 15/8/2/13/14/9/3/16 por categoría. Cada ID del mapa se usa; los cuatro logos tienen rol explícito, no se fuerzan como fotos.
- Probar «Cargar más» hasta el final; aplicar cada filtro; abrir primera/última foto y recorrer; cierre por teclado y tacto; no galería que solo muestra su primera imagen.
- Verificar logo y textos a 360, 390, 768 y 1440 px. Menú, tablas de precios y barra de consulta no desbordan ni se superponen.
- Contraste del texto normal al menos 4.5:1; foco visible y controles táctiles cómodos. Nada de texto blanco pequeño sobre verde claro sin verificar. Respetar movimiento reducido.
- Todos los CTA tienen acción real. Probar consulta desde una villa y desde una habitación; selección/fechas se mantienen. Ningún envío ficticio ni reserva automática.
- Cero fotos de ejemplo restantes; ninguna foto identificada como interior de una unidad cuando solo es exterior compartido. Consultar la duda de correspondencia Villa 3/4 sin inventar reasignación.
- Títulos/meta únicos, un H1 por página, canonical según URL real y enlaces internos rastreables. No generar reseñas/estrellas falsas. Si el proyecto permite sitemap, incluir rutas públicas reales.
- Abrir inicio no carga las 80 imágenes grandes. Verificar solicitudes y tamaño real en herramientas del navegador del proyecto, no afirmar rendimiento sin medir.
- No dejar botones «próximamente» como sustituto de galerías o páginas pedidas. Lo que depende de datos externos se resuelve con consulta honesta; lo navegable se implementa completo.

## 8. Orden de ejecución

1. Inspeccionar proyecto y guardar punto de restauración si la plataforma lo permite. Detectar rutas/componentes/datos ya existentes.
2. Aplicar variables de marca y componentes compartidos de cabecera/pie, manteniendo contenido comercial.
3. Crear rutas y plantillas reutilizables; enlazar catálogo, fichas y contexto de consulta.
4. Integrar el mapa completo de galerías y sus URLs; comprobar cobertura de 80 fotos.
5. Ajustar móvil, accesibilidad, textos públicos y SEO; ejecutar comprobaciones anteriores.
6. Entregar resumen breve: rutas creadas, cobertura de fotos, comprobaciones hechas y bloqueos externos concretos. No detenerse después de cambiar solo la portada.

Esta es una especificación lista para implementar en el proyecto de Bolt, no una afirmación de cambios ya aplicados al sitio publicado.
