
# API Hub Consolidation — Endpoints Detallados

## 1. Consolidación (`consolidation.routes.ts`)

### `POST /inicioLogicaConsolidado_`
- **Descripción:** Inicia el proceso de consolidación de carga.
- **Parámetros (body):**
  - `lpn`: Código logístico a consolidar
  - `lpn_consolidado`: Código destino de consolidación
  - `whse`: Código de bodega
  - `usuario`: Usuario que ejecuta la operación
- **Respuesta:** Estado del proceso, datos consolidados, mensajes de éxito o error.
- **Protección:** Requiere autenticación.

---

### `GET /getPalletVirtualProcesoCC`
- **Descripción:** Consulta información de pallets virtuales en proceso de consolidación.
- **Parámetros (query):**
  - `cc`: Identificador de consolidación
- **Respuesta:** Lista de pallets en proceso.

---

### `GET /getDataCartonesEspecific`
- **Descripción:** Obtiene información específica de un cartón.
- **Parámetros (query):**
  - `cc`: Código de cartón
- **Respuesta:** Detalle del cartón solicitado.

---

### `GET /getCartones`
- **Descripción:** Lista todos los cartones relacionados con un hub.
- **Parámetros (query):**
  - `cc`: Hub o consolidado
  - `rango` (opcional): Días de intervalo
- **Respuesta:** Array de cartones y sus estados.

---

### `PUT /saveDataDespacho`
- **Descripción:** Guarda datos asociados al despacho (sellos/precintos).
- **Parámetros (query):**
  - `sello1`, `sello2`, `ot`, `pallets`, `usuario`
- **Respuesta:** Resultado del guardado.

---

### `POST /getPalletVirtualRecepCompleto`
- **Descripción:** Obtiene información completa de recepción de pallets virtuales.
- **Parámetros (query/body):**
  - `pallets`, `ot`, `sello1`, `sello2`, `usuario`
- **Respuesta:** Resultado de la consulta/actualización.

---

### `POST /getDataInforme_admGuia`
- **Descripción:** Genera informe administrativo/detallado de un proceso de consolidación.
- **Parámetros (query):**
  - `cc`: Código del consolidado
- **Respuesta:** Detalles administrativos y movimientos asociados.

---

## 2. Carga de Camión (`cargaCamion.routes.ts`)

### `POST /inicioLogicaCargaCamion`
- **Descripción:** Inicia la lógica de carga de camión.
- **Parámetros:** En body según proceso.
- **Respuesta:** Resultado del inicio de carga.

---

### `PUT /saveDespachoTienda`
- **Descripción:** Guarda información de despacho a tienda.
- **Parámetros:** Body/query con datos de tienda y despacho.
- **Respuesta:** Resultado.

---

### `POST /anden`
- **Descripción:** Registra la ubicación de carga en andén.
- **Parámetros:** Body/query con detalles de registro.
- **Respuesta:** Estado del registro.

---

## 3. Impresiones (`impresiones.routes.ts`)

### `POST /inicioLogicaImpresion`
- **Descripción:** Inicia el proceso de impresión.
- **Parámetros:** Body con datos específicos de impresión.
- **Respuesta:** Estado o resultado.

---

### `POST /getlistDetalleImpresion`
- **Descripción:** Obtiene el detalle de lo impreso o pendiente de impresión.
- **Parámetros:** Body con info relevante.
- **Respuesta:** Datos de impresiones.

---

## 4. Validaciones (`validation.routes.ts`)

### `POST /inicioLogicaValidacion`
- **Descripción:** Inicia la lógica de validación PH.
- **Parámetros:** Body con datos de validación.
- **Respuesta:** Resultado de la validación.

---

## 5. Ubicaciones (`ubication.routes.ts`)

### `POST /inicioLogicaPh`
- **Descripción:** Gestiona/actualiza ubicaciones de PH.
- **Parámetros:** Body con datos de ubicación.
- **Respuesta:** Resultado del proceso.

---

## 6. Login de Usuario (`userLogin.routes.ts`)

### `POST /login`
- **Descripción:** Autenticación de usuarios.
- **Parámetros:** Credenciales de usuario en el body.
- **Respuesta:** Token y/o datos de sesión.

---

## 7. Hubs (`hubs.routes.ts`)

### `GET /getHubs`
- **Descripción:** Devuelve la lista de hubs disponibles.
- **Parámetros:** Ninguno.
- **Respuesta:** Array/lista de hubs.

---
