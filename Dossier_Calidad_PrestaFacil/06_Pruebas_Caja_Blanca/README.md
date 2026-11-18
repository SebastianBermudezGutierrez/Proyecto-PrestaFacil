# PrestaFácil — Pruebas de caja blanca

## 1. Objetivo

Documentar la revisión de la lógica interna del backend de PrestaFácil mediante pruebas automatizadas sobre métodos de `AppService`. Se evalúan validaciones, condiciones, caminos alternativos y operaciones de persistencia simuladas mediante mocks de Prisma.

## 2. Entorno de ejecución

- Proyecto: PrestaFácil.
- Backend: NestJS y TypeScript.
- Framework de pruebas: Jest.
- Archivo principal de pruebas del servicio: `backend/src/app.service.spec.ts`.
- Archivo adicional de pruebas del controlador: `backend/src/app.controller.spec.ts`.
- Comando ejecutado desde la carpeta `backend`:

```bash
npm test -- --runInBand
```

## 3. Bloques de lógica seleccionados

Para la actividad de caja blanca se documentan tres bloques principales:

### WB-01 — Crear objeto (`createItem`)

**Propósito:** comprobar las condiciones de validación y normalización antes de guardar un objeto.

Caminos cubiertos por las pruebas existentes:

- UT-01: rechazar un nombre vacío o compuesto por espacios.
- UT-02: rechazar un nombre de más de 120 caracteres.
- UT-03: crear el objeto y normalizar espacios en nombre, descripción y categoría.

**Resultado esperado:** las entradas inválidas generan una excepción y no inician la operación de persistencia; una entrada válida se normaliza y se guarda.

### WB-02 — Actualizar objeto (`updateItem`)

**Propósito:** comprobar las condiciones que controlan la actualización de un objeto.

Caminos cubiertos por las pruebas existentes:

- UT-04: rechazar una actualización sin campos.
- UT-05: rechazar un nombre vacío.
- UT-09: rechazar una categoría de más de 80 caracteres.
- UT-10: actualizar un objeto y normalizar los campos.
- UT-11: informar cuando el objeto no existe o no pertenece al usuario.

**Resultado esperado:** se rechazan solicitudes inválidas, se actualizan los campos válidos y se controla el caso en que no se encuentra un objeto autorizado.

### WB-03 — Crear préstamo (`createLoan`)

**Propósito:** comprobar las validaciones y decisiones necesarias para crear un préstamo y cambiar el estado del objeto.

Caminos cubiertos por las pruebas existentes:

- UT-06: rechazar un nombre de prestatario vacío.
- UT-07: rechazar una fecha de devolución inválida.
- UT-08: crear el préstamo y cambiar el estado del objeto de disponible a prestado.

**Resultado esperado:** las entradas inválidas generan una excepción; si los datos son válidos y el objeto está disponible, se registra el préstamo y se actualiza su estado.

## 4. Cobertura adicional presente en `app.service.spec.ts`

El archivo también contiene pruebas de otros métodos del servicio. Se documentan como cobertura complementaria, sin contarlas como uno de los tres bloques principales seleccionados:

- **Desactivar objeto (`deactivateItem`):** UT-12 a UT-15. Incluye objeto inexistente, préstamo activo, desactivación válida y objeto que ya no está disponible.
- **Registrar devolución (`returnLoan`):** UT-16 a UT-19. Incluye préstamo no activo, préstamo no encontrado, devolución correcta y fallo al actualizar la disponibilidad del objeto.

El archivo `app.service.spec.ts` contiene 19 casos identificados. La ejecución general también incluye `app.controller.spec.ts`.

## 5. Resultado de ejecución

La ejecución reportó:

| Indicador | Resultado |
|---|---:|
| Suites aprobadas | 2 de 2 |
| Pruebas aprobadas | 20 de 20 |
| Pruebas fallidas | 0 |
| Snapshots | 0 |
| Tiempo reportado | 1.261 segundos |

Archivos ejecutados:

- `src/app.controller.spec.ts` — PASS.
- `src/app.service.spec.ts` — PASS.

**Veredicto de ejecución:** satisfactoria. Las dos suites finalizaron correctamente y no se reportaron pruebas fallidas.

## 6. Evidencia

La siguiente captura corresponde a la ejecución del comando `npm test -- --runInBand` desde la carpeta `backend`. En ella se observan las dos suites aprobadas y el resultado de 20 pruebas aprobadas.

![Ejecución de pruebas unitarias](evidencias/ejecucion-pruebas-unitarias.png)

## 7. Observaciones

- La terminal muestra un aviso de Node.js relacionado con la característica experimental de VM Modules. El aviso no impidió la ejecución: Jest terminó con 2 suites aprobadas y 20 pruebas aprobadas.
- Estas pruebas son automatizadas y ejercitan la lógica del servicio con dependencias de Prisma simuladas. El resultado acredita la ejecución satisfactoria de los casos definidos; no equivale por sí solo a demostrar cobertura total de todas las ramas del código.
- Durante las pruebas manuales de caja negra se observó que la aplicación permitió registrar un nombre de más de 120 caracteres. Esa incidencia exploratoria permanece pendiente de análisis, aunque el caso UT-02 del servicio pasa en la ejecución unitaria. Debe investigarse por separado por qué el comportamiento observado en la interfaz no coincide con la validación probada en el servicio.

## 8. Conclusión

Las pruebas automatizadas de PrestaFácil finalizaron satisfactoriamente: se aprobaron las dos suites y los 20 casos ejecutados. Los tres bloques principales seleccionados —creación de objetos, actualización de objetos y creación de préstamos— cuentan con casos que ejercitan entradas inválidas y válidas, además de verificaciones sobre las operaciones esperadas. La evidencia de terminal se adjunta para respaldar el resultado de ejecución.

---
