# Contrato API — Solicitudes de depósito y retiro (Fase 1)

Documento de referencia para **winbit-app** y **winbit-rails**.  
Define cómo correlacionar `POST /requests` con `GET /investor/:email/history` y cómo detectar aprobaciones/rechazos en el cliente.

> **Validado con Rails:** no se requieren cambios de backend para Fase 1.

---

## Resumen ejecutivo

| Pregunta                         | Respuesta                 | Cambio Rails                  |
| -------------------------------- | ------------------------- | ----------------------------- |
| ¿Pendiente visible en `history`? | **Sí**                    | No                            |
| ¿Mismo `id` pasa a `COMPLETED`?  | **No** — es otro registro | No (no unificar modelo ahora) |
| ¿`POST` devuelve campos clave?   | **Sí**                    | No                            |

**Implicación clave para el cliente:** no tratar la solicitud como un registro que muta de estado. Tras la aprobación, el pendiente desaparece (o deja de ser relevante) y aparece un **movimiento nuevo** con otro `id` y `status: COMPLETED`.

---

## Endpoints

| Método | Ruta                                     | Uso                                  |
| ------ | ---------------------------------------- | ------------------------------------ |
| `POST` | `/api/public/v1/requests`                | Crear solicitud (depósito o retiro)  |
| `GET`  | `/api/public/v1/investor/:email/history` | Listar movimientos, incl. pendientes |

---

## 1. Crear solicitud — `POST /requests`

### Request body (app → Rails)

```json
{
  "email": "inversor@example.com",
  "type": "DEPOSIT",
  "amount": 1000.0,
  "method": "CRYPTO",
  "network": "TRC20",
  "transactionHash": null,
  "attachmentUrl": "https://storage.example/receipt.jpg",
  "walletAddress": null,
  "lemontag": null
}
```

| Campo           | Tipo           | Valores                          | Notas                             |
| --------------- | -------------- | -------------------------------- | --------------------------------- |
| `email`         | string         | email del inversor               | Requerido                         |
| `type`          | string         | `DEPOSIT`, `WITHDRAWAL`          | En history se expone como `event` |
| `amount`        | number         | > 0                              |                                   |
| `method`        | string         | `CASH_USD`, `CRYPTO`, `SWIFT`, … |                                   |
| `network`       | string \| null | Solo cripto                      |                                   |
| `attachmentUrl` | string \| null | Solo depósitos con comprobante   |                                   |
| `walletAddress` | string \| null | Solo retiro cripto               |                                   |
| `lemontag`      | string \| null | Solo Lemon Cash                  |                                   |

### Response `201 Created`

```json
{
  "data": {
    "id": 42,
    "type": "DEPOSIT",
    "amount": 1000.0,
    "method": "CRYPTO",
    "status": "PENDING",
    "createdAt": "2026-06-11T14:30:00.000Z"
  }
}
```

Campos mínimos que el cliente debe consumir:

- `id` — identificador numérico de la solicitud
- `type` — `DEPOSIT` | `WITHDRAWAL`
- `amount`, `method`, `status`
- `createdAt` (si está disponible)

---

## 2. Historial — `GET /investor/:email/history`

### Item en `data[]` (Rails → app, antes de mapeo en `api.js`)

```json
{
  "id": "request_42",
  "investorId": 8,
  "date": "2026-06-11T14:30:00.000Z",
  "event": "DEPOSIT",
  "amount": 1000.0,
  "previousBalance": null,
  "newBalance": null,
  "status": "PENDING",
  "method": "CRYPTO",
  "attachmentUrl": "https://storage.example/receipt.jpg"
}
```

### Mapeo en `getInvestorHistory` (app)

| Campo API (`history`) | Campo app (`movement`) | Notas                           |
| --------------------- | ---------------------- | ------------------------------- |
| `event`               | `movement`             | Siempre normalizar a mayúsculas |
| `id`                  | `id`                   | Pendientes: `request_{n}`       |
| `status`              | `status`               | Ver tabla de estados abajo      |

### Correlación POST ↔ history

```
POST response id: 42   ⟷   history id: "request_42"
POST type: DEPOSIT     ⟷   history event: DEPOSIT   (movement en UI)
```

Funciones de referencia: `src/utils/requestHistory.js`

---

## 3. Estados (`status`)

| Status      | Significado depósito   | Significado retiro      | Visible en history             |
| ----------- | ---------------------- | ----------------------- | ------------------------------ |
| `PENDING`   | Informado, en revisión | Solicitado, en revisión | Sí                             |
| `COMPLETED` | Acreditado             | Completado / procesado  | Sí                             |
| `REJECTED`  | Rechazado              | Rechazado               | Sí (mismo formato que PENDING) |
| `CANCELLED` | Cancelado              | Cancelado               | Sí                             |

**Regla UI:** `PENDING` y `REJECTED` comparten el mismo shape de fila; solo cambia badge y copy.

---

## 4. Ciclo de vida — ejemplo completo

### Paso A — Usuario informa depósito

**POST** `/requests` → `201`

```json
{ "data": { "id": 42, "type": "DEPOSIT", "amount": 1000, "method": "CRYPTO", "status": "PENDING" } }
```

**GET** `/history` (inmediato o tras invalidar cache):

```json
{
  "data": [
    {
      "id": "request_42",
      "event": "DEPOSIT",
      "amount": 1000,
      "status": "PENDING",
      "date": "2026-06-11T14:30:00.000Z",
      "method": "CRYPTO"
    }
  ]
}
```

**Acción app:** toast/modal de confirmación, invalidar `['investor', email, 'history']`, mostrar fila pendiente en Depósitos → Historial.

---

### Paso B — Admin aprueba en backoffice

Rails **no actualiza** `request_42`. Genera un movimiento contable nuevo.

**GET** `/history` (post-aprobación):

```json
{
  "data": [
    {
      "id": "ph-881",
      "event": "DEPOSIT",
      "amount": 1000,
      "status": "COMPLETED",
      "date": "2026-06-11T18:00:00.000Z",
      "previousBalance": 5000,
      "newBalance": 6000,
      "method": "CRYPTO"
    }
  ]
}
```

- `id` distinto (`ph-881` ≠ `request_42`)
- `request_42` puede **dejar de aparecer** en history
- El cliente debe **reemplazar** la percepción de “pendiente” por el movimiento `COMPLETED`, no hacer update in-place del mismo `id`

**Acción app (detección de aprobación):**

1. Guardar snapshot de ids pendientes conocidos (ej. `request_42` en `localStorage`).
2. En cada refetch, si `request_42` ya no está y aparece un `COMPLETED` del mismo `type` + `amount` (y fecha cercana), emitir notificación: _“Depósito acreditado”_.
3. Invalidar también `['investor', email]` para refrescar balance en dashboard.

> Si Rails expone un campo de correlación en el futuro (ej. `requestId` en el movimiento COMPLETED), simplificar el matching. Hoy: heurística por desaparición del pendiente + aparición de COMPLETED.

---

### Paso C — Admin rechaza

**GET** `/history`:

```json
{
  "data": [
    {
      "id": "request_42",
      "event": "DEPOSIT",
      "amount": 1000,
      "status": "REJECTED",
      "date": "2026-06-11T16:00:00.000Z",
      "method": "CRYPTO"
    }
  ]
}
```

Mismo `id` que el pendiente, **mismo formato de fila**, distinto `status`.

**Acción app:** detectar transición `PENDING` → `REJECTED` en el mismo `id` (aquí sí aplica comparar por id).

---

## 5. Reglas de implementación en winbit-app

### Al enviar formulario

1. `POST /requests`
2. Si OK → invalidar queries `investor` + `history`
3. Opcional: optimistically insertar fila local con `pendingHistoryId(response.id)` hasta que llegue el refetch
4. Modal/toast con monto, método, estado Pendiente, CTA “Ver historial”

### Al refrescar history

```js
// Pendientes activos
rows.filter((r) => r.status === 'PENDING' && isRequestHistoryId(r.id));

// Solicitudes rechazadas recientes
rows.filter((r) => r.status === 'REJECTED' && isRequestHistoryId(r.id));
```

### Detección de transiciones (notificaciones in-app)

| Transición                                   | Cómo detectarla                                                    |
| -------------------------------------------- | ------------------------------------------------------------------ |
| `PENDING` → `REJECTED`                       | Mismo `id` (`request_N`), cambió `status`                          |
| `PENDING` → (desaparece) + `COMPLETED` nuevo | `request_N` ausente + nuevo row `COMPLETED` mismo `event`/`amount` |
| Nueva solicitud propia                       | Respuesta POST + refetch confirma `request_N`                      |

Usar `detectRequestTransitions(prevRows, nextRows)` de `src/utils/requestHistory.js`.

### Qué NO hacer

- No esperar que `id` del POST sea el mismo que el movimiento `COMPLETED`
- No hacer merge/update in-place del registro pendiente al aprobar
- No asumir que `movement` y `type` tienen el mismo nombre de campo en JSON crudo (`event` vs `type`)

---

## 6. Tipos JSDoc (referencia)

Ver `src/utils/requestHistory.js` para typedefs y helpers exportados.

```js
/** @typedef {'DEPOSIT' | 'WITHDRAWAL'} RequestType */
/** @typedef {'PENDING' | 'COMPLETED' | 'REJECTED' | 'CANCELLED'} RequestStatus */

/**
 * @typedef {Object} CreateRequestResponse
 * @property {number} id
 * @property {RequestType} type
 * @property {number} amount
 * @property {string} method
 * @property {RequestStatus} status
 * @property {string} [createdAt]
 */

/**
 * @typedef {Object} HistoryRow
 * @property {string} id - "request_42" (pendiente) o id de portfolio history
 * @property {string} movement - DEPOSIT | WITHDRAWAL (mapeado desde event)
 * @property {number} amount
 * @property {RequestStatus} status
 * @property {string} date
 * @property {string|null} method
 */
```

---

## 7. Checklist Fase 1 (frontend)

- [ ] Invalidar `history` en `DepositForm` y `WithdrawalForm` tras POST OK
- [ ] Modal enriquecido con id de solicitud (`request_{id}`)
- [ ] Redirect / tab Historial post-envío
- [ ] Banner dashboard: contar `status === 'PENDING'`
- [ ] `detectRequestTransitions` + toast al aprobar/rechazar
- [ ] Copy i18n para estados y notificaciones
- [ ] Tests unitarios en `requestHistory.test.js`

---

## 8. Fuera de alcance Fase 1

- Endpoint dedicado `/notifications`
- WebSockets / push
- Unificar modelo request ↔ portfolio history en Rails
- Email automático (evaluar por separado; copy actual menciona email al acreditar)
