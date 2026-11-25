# Integración de reservas con Lobby PMS

## Estado

- **Implementación**: completa en código. Edge function desplegada. Migración aplicada.
- **Pendiente de prueba real**: requiere IP autorizada en Lobby y verificación con datos en vivo.
- **Sin cobros online**: no hay BAC ni pasarela de pago. El pago se realiza en el hotel.

## Arquitectura

```
Navegador → lobby-proxy (Edge Function) → Lobby API (api.lobbypms.com)
                ↓
        Supabase (booking_quotes, booking_attempts, booking_requests)
```

El navegador nunca toca el token de Lobby ni la API directamente. Toda la lógica de autenticación, cotización, creación de reservas y consulta pasa por la Edge Function `lobby-proxy`, que usa el service role de Supabase para persistencia y el token `pms_token_lobby` para llamadas a Lobby.

## Endpoints de Lobby implementados

| Operación | Endpoint Lobby | Método | Autenticación |
|-----------|---------------|--------|---------------|
| Catálogo | `/api/v1/rooms` | GET | `api_token` query param |
| Disponibilidad | `/api/v2/available-rooms` | GET | `api_token` query param |
| Planes | `/api/v1/rate-plans` | GET | `api_token` query param |
| Crear reserva | `/api/v1/bookings` | POST | `api_token` en body JSON |
| Consultar reserva | `/api/v1/bookings/{booking_id}` | GET | `api_token` query param |

URL base: `https://api.lobbypms.com` (configurable via `LOBBY_API_BASE`).

## Variables de entorno

| Variable | Dónde | Descripción |
|----------|-------|-------------|
| `LOBBY_API_BASE` | Edge Function secrets | URL base de Lobby (`https://api.lobbypms.com`) |
| `pms_token_lobby` | Edge Function secrets | Token de la propiedad 12934 |
| `SUPABASE_URL` | Automática | URL del proyecto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Automática | Clave de servicio para persistencia |

## Tablas de base de datos

### `booking_quotes`
Cotizaciones validadas generadas por el backend con tarifas reales de Lobby V2. Cada cotización tiene un token opaco (`quote_token`) que el navegador usa para referenciarla. Expira en 15 minutos. Se marca como consumida al crear una reserva.

### `booking_attempts`
Control de idempotencia y estado de intentos de reserva. Clave única por `idempotency_key`. Estados: `requested` → `processing` → `created` / `unknown` / `failed`. Guarda todos los `lobby_booking_ids` (incluyendo `distributed[]`).

### `booking_requests`
Tabla de auditoría. Solo el backend (service_role) escribe. Sin acceso público.

## Mapeo de categorías

Propiedad 12934. IDs del motor de Lobby:

| Slug interno | category_id | Tipo |
|-------------|-------------|------|
| glamping | 17459 | Glamping |
| sm-1 a sm-11 | 17460–17470 | Habitaciones |
| villa-1 a villa-5 | 17471–17475 | Villas |

**Pendiente**: confirmar mapeo real leyendo `GET /api/v1/rooms` con el token en vivo.

## Flujo de reserva

1. **Búsqueda**: el navegador envía fechas y ocupación a `lobby-proxy` (operación `search`). El backend consulta `GET /api/v2/available-rooms` con paginación, agrupa por categoría, valida cupo en todas las noches, aplica restricciones (min_stay, max_stay) y devuelve planes con precios por noche.

2. **Cotización**: al seleccionar un alojamiento y plan, el navegador pide operación `quote`. El backend revalida tarifas en tiempo real, persiste la cotización con token opaco y devuelve el detalle.

3. **Datos del huésped**: el navegador recopila nombre, apellido, correo, teléfono y notas.

4. **Creación**: el navegador envía `quoteToken`, datos del huésped e `idempotencyKey`. El backend:
   - Recupera y valida la cotización (no expirada, no consumida)
   - Reclama atomically el `idempotency_key` en `booking_attempts`
   - Construye `rates_per_day` con una `{date, price}` por noche revalidada
   - POST a `/api/v1/bookings` con `category_id`, `start_date`, `end_date`, `total_adults`, `holder_name`, `rates_per_day`, `plan_id`, `note`
   - Timeout de 30s → marca como `unknown` (no reenvía a ciegas)
   - Éxito → guarda todos los `booking_booking_ids` (incluyendo `distributed[]`), marca cotización como consumida, intenta GET del detalle para `estatus` y `policies`

5. **Confirmación**: el navegador muestra referencia real de Lobby, estado (`created` o `unknown`) y datos de contacto.

## Idempotencia

- El `idempotency_key` se genera en el navegador y se envía con la creación.
- El backend hace INSERT con UNIQUE en `booking_attempts.idempotency_key`.
- Si la clave ya existe con el mismo `payload_hash` y estado `created`, devuelve el resultado existente.
- Si está `processing` o `unknown`, devuelve mensaje de verificación.
- Si está `failed`, permite reintentar.
- No se mantiene transacción SQL abierta durante la llamada de red.
- Lobby no documenta idempotencia nativa; la referencia local se incluye en `note` para conciliación humana.

## Estados de reserva

| Estado interno | Significado |
|---------------|-------------|
| `pending` | En proceso, no se ha llamado a Lobby |
| `created` | Lobby confirmó la creación, hay `booking_id` |
| `unknown` | Timeout o error de red; no se sabe si Lobby recibió la solicitud |
| `confirmed` | Detalle de Lobby confirma la reserva |
| `cancelled` | Cancelada en Lobby |
| `expired` | La cotización expiró antes de crear |

El estado crudo de Lobby (`estatus`) se conserva en `lobby_raw_status`.

## Seguridad

- Token `pms_token_lobby` solo se lee en la Edge Function, nunca en el navegador.
- `LOBBY_API_BASE` es URL de configuración pública, no secreto.
- Propiedad 12934 fijada en el servidor, no viene del cliente.
- RLS habilitada en todas las tablas. `booking_quotes` y `booking_attempts` solo accesibles por `service_role`.
- `booking_requests`: INSERT público revocado; solo `service_role` escribe.
- Respuestas de Lobby filtradas: no se devuelven facturación, documentos ni datos de otros huéspedes al navegador.
- Recuperación de reserva por token opaco, no por ID numérico.
- CORS configurado en la Edge Function.

## Dependencias externas bloqueantes

1. **IP autorizada en Lobby**: Lobby exige IP de origen autorizada. Supabase Edge Functions pueden no tener IP de salida estática. **Acción requerida**: verificar la IP de salida actual de las Edge Functions. Si no es fija, contratar/desplegar infraestructura con IP estática o solución compatible, y autorizar esa IP en la configuración de seguridad de Lobby.

2. **Reglas fiscales ITBMS**: confirmar con el hotel/Lobby si el impuesto está incluido o excluido en las tarifas de disponibilidad V2. Actualmente se muestra "los impuestos se confirman al llegar al hotel" hasta que se confirme.

3. **Canal web correcto**: leer `GET /api/v1/channels` con token en vivo para identificar el canal web real. No se envía `channel` en el POST hasta confirmar el ID.

4. **Mapeo de categorías**: confirmar IDs reales leyendo `GET /api/v1/rooms` con token en vivo. Confirmar si CAMPING (17459) mapea a glamping y si se vende unidad/cama.

5. **Tabla completa de estados**: mapear todos los valores de `estatus` de Lobby más allá del ejemplo `fin`.

6. **Políticas de cancelación previas**: la API expone `policies` solo después de crear. Definir mecanismo para mostrar condiciones antes de confirmar.

7. **Conciliación tras timeout**: confirmar con Lobby si hay mecanismo de reconciliación automática.

8. **Prueba real controlada**: definir datos, fechas y procedimiento para ejecutar una reserva de prueba con aprobación específica. No crear reservas reales sin autorización.

## Archivos modificados

- `src/booking/types.ts` — contratos de Lobby, estados de reserva, eliminación de tipos de pago
- `src/booking/config.ts` — verificación real de configuración
- `src/booking/utils.ts` — helpers de fecha, generación de idempotencia key
- `src/booking/BookingService.ts` — usa LobbyReservationAdapter
- `src/booking/LobbyAdapters.ts` — transformaciones reales de respuesta de Lobby
- `src/components/BookingContext.tsx` — planId en lugar de planSlug
- `src/components/BookingModule.tsx` — planes dinámicos desde búsqueda
- `src/pages/Checkout.tsx` — desglose por noche, estados created/unknown, sin pago
- `src/pages/BookingResults.tsx` — planId en lugar de planSlug
- `src/pages/Glamping.tsx`, `RoomPageView.tsx`, `VillaPage.tsx` — sin prop availablePlans
- `supabase/functions/lobby-proxy/index.ts` — endpoints reales de Lobby, cotización, idempotencia
- `supabase/migrations/20261110180000_create_booking_quotes_and_attempts.sql` — tablas backend

## Archivos eliminados

- `src/booking/BacAdapter.ts` — sin cobros online
- `src/booking/MockPaymentProvider.ts` — sin cobros online
- `src/booking/MockReservationProvider.ts` — reemplazado por LobbyReservationAdapter
- `src/booking/SupabaseReservationProvider.ts` — reemplazado por backend en Edge Function
- `src/booking/MockInventoryProvider.ts` — reemplazado por LobbyInventoryAdapter
- `src/booking/fixtures.ts` — sin respaldo de fixtures en producción
