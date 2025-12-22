# API Endpoints Detallados

Este documento describe de manera detallada los endpoints disponibles en el proyecto.

## Endpoints y Detalles

### 1. Obtener datos de cartón o pallet
- **GET /:pallet**
  - Retorna información relacionada a un pallet o cartón.
  - Si el parámetro incluye `THUB`, retorna datos del pallet. Si no, retorna datos del cartón, el pallet y el hub de destino.
  - **Parámetro URL:** `pallet`
  - **Respuesta:**
    - JSON con detalles del pallet/cartón, andén y hub destino.

### 2. Obtener datos de reserva
- **GET /:reserva**
  - Retorna el valor recibido como parámetro de reserva a modo demostrativo.
  - **Parámetro URL:** `reserva`
  - **Respuesta:**
    - `{ reserva: <valor> }`

### 3. Traductor/Consulta Estado LPN (externo)
- **POST /**
  - Consulta el estado de un LPN en un almacén (whse) externo mediante API.
  - **Body JSON:**
    - `lpn`: string
    - `whse`: string
  - **Respuesta:**
    - JSON con el estado del LPN consultado (respuesta directa de API externa).

### 4. Obtener información de un Andén y sus destinos
- **POST /anden**
  - Retorna todos los destinos activos asociados a un andén y whse.
  - **Body JSON:**
    - `anden`: string/number
    - `whse`: string
  - **Respuesta:**
    - JSON con los destinos y andén.

### 5. Obtener destinos activos y sus andenes asociados
- **POST /destinos**
  - Obtiene todos los destinos activos y sus andenes relacionados, ordenados descendente.
  - **Body:** (vacío)
  - **Respuesta:**
    - JSON con lista de destinos activos y andenes asociados.

### 6. Crear un Andén y asociar un destino
- **POST /anden/create**
  - Crea un andén y asocia un nuevo destino al andén creado.
  - **Body JSON:**
    - `anden`: string/number
    - `whse`: string
    - `destino`: string
  - **Respuesta:**
    - JSON con la relación creada.

### 7. Eliminar (desactivar) destino de un andén
- **PUT /anden/delete**
  - Desactiva (no borra) un destino asociado a un andén.
  - **Body JSON:**
    - `anden`: string/number
    - `whse`: string
    - `destino`: string
  - **Respuesta:**
    - Mensaje de confirmación.

### 8. Actualizar el destino de un andén
- **PUT /anden/update**
  - Cambia el destino asociado a un andén por otro nuevo.
  - **Body JSON:**
    - `anden`: string/number
    - `whse`: string
    - `destino`: string (actual)
    - `nuevoDestino`: string
  - **Respuesta:**
    - Mensaje de confirmación.

---

¿Deseas ejemplos de request/response o algún formato especial para documentación como OpenAPI/Swagger?