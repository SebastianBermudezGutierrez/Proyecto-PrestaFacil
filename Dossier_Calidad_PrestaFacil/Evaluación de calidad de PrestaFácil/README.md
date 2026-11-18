# Evaluación de calidad de PrestaFácil — ISO/IEC 25010:2023

**Proyecto:** PrestaFácil — plataforma de gestión de préstamos  
**Fecha de ejecución de las evidencias:** 18 de noviembre de 2026  
**Alcance:** evaluación práctica de las nueve características del modelo de calidad del producto ISO/IEC 25010:2023.

## 1. Objetivo

Documentar las verificaciones realizadas sobre PrestaFácil, relacionando cada característica de calidad con pruebas observables y capturas de evidencia. Esta evaluación es académica y funcional; no representa una certificación ISO.

## 2. Resumen de resultados

| Característica | Resultado | Evidencia / observación |
|---|---|---|
| Adecuación funcional | Con evidencia | Inventario, búsqueda, formulario de préstamo, pendientes e historial visibles y operativos. |
| Eficiencia de desempeño | Con evidencia inicial | Cinco solicitudes a `GET /` respondieron HTTP 200. Promedio: **22,88 ms**. Medición local, sin prueba de carga. |
| Compatibilidad | Con evidencia | Frontend Next.js en `localhost:3001` y backend NestJS en `localhost:3000` iniciados; las vistas protegidas muestran datos del sistema. |
| Capacidad de interacción | Con evidencia | Búsqueda de inventario e historial, estado sin resultados, formularios y validación de campo obligatorio. Vista móvil de 400 × 824. |
| Fiabilidad | Con evidencia automatizada | 20 pruebas unitarias backend aprobadas, 12 pruebas RTL aprobadas y 5 pruebas E2E aprobadas, según resultados comunicados durante el proyecto. |
| Seguridad | Con evidencia | Ruta protegida redirige a login sin sesión; `GET /items` devuelve HTTP 401 sin token. |
| Mantenibilidad | Evidencia parcial | Estructura backend separada por módulos (`items`, `loans`) y carpetas `dto`; pruebas automatizadas disponibles. La revisión de arquitectura/código no es exhaustiva. |
| Flexibilidad | Evidencia inicial | Vista móvil emulada a 400 × 824: el menú pasa a navegación inferior y las tarjetas se muestran en columna. No se probaron todos los dispositivos/navegadores. |
| Seguridad operacional | Parcial | Se observó confirmación antes de eliminar un objeto. No se comprobó que el sistema bloquee la eliminación de un objeto con préstamo activo. |

## 3. Detalle por característica

### 3.1 Adecuación funcional

Se verificaron las funciones principales de gestión:
- Visualización del inventario y contadores de objetos disponibles y prestados.
- Búsqueda por nombre y presentación de un mensaje cuando no existen coincidencias.
- Carga del formulario para registrar préstamos y de las opciones de objetos disponibles.
- Validación del selector obligatorio al intentar enviar el formulario vacío.
- Consulta de préstamos pendientes y del historial de préstamos devueltos.
- Búsqueda de registros en el historial.

**Resultado:** las funciones observadas respondieron de acuerdo con el flujo esperado durante las verificaciones realizadas.

**Evidencias:** `ISO03` a `ISO10`.

![Inventario cargado](evidencias/ISO03_Inventario_Cargado.png)

![Buscador del inventario](evidencias/ISO04_Buscador_Inventario.png)

![Búsqueda sin resultados](evidencias/ISO05_Buscador_Sin_Resultados.png)

![Formulario de préstamo](evidencias/ISO06_Formulario_Nuevo_Prestamo.png)

![Validación de objeto obligatorio](evidencias/ISO07_Validacion_Objeto_Obligatorio.png)

![Préstamos pendientes](evidencias/ISO08_Prestamos_Pendientes.png)

![Historial de préstamos](evidencias/ISO09_Historial_Prestamos.png)

![Búsqueda en historial](evidencias/ISO10_Buscador_Historial.png)

### 3.2 Eficiencia de desempeño

Se ejecutaron cinco solicitudes locales al endpoint `GET http://localhost:3000/`. Todas respondieron con HTTP 200.

| Ejecución | Tiempo |
|---|---:|
| 1 | 38,16 ms |
| 2 | 23,84 ms |
| 3 | 21,34 ms |
| 4 | 15,68 ms |
| 5 | 15,36 ms |
| **Promedio** | **22,88 ms** |

**Resultado:** evidencia inicial favorable de tiempo de respuesta local. No debe interpretarse como rendimiento bajo carga ni como medición de producción.

**Evidencia:** `ISO14_Rendimiento_Cinco_Mediciones.png`.

![Cinco mediciones de rendimiento](evidencias/ISO14_Rendimiento_Cinco_Mediciones.png)

### 3.3 Compatibilidad

Se observó el backend NestJS iniciado en el puerto 3000 y el frontend Next.js en el puerto 3001. Después de iniciar sesión, el inventario, los préstamos y el historial cargaron información.

**Resultado:** evidencia de integración entre los componentes en el entorno local. No se realizó una matriz completa de compatibilidad entre navegadores o sistemas operativos.

**Evidencias:** `ISO01`, `ISO03`, `ISO08` y `ISO09`.

![Backend iniciado](evidencias/ISO01_Backend_Iniciado.png)

### 3.4 Capacidad de interacción

Se verificaron controles y respuestas de la interfaz: búsqueda del inventario, mensaje de ausencia de resultados, formulario de préstamo, validación del objeto obligatorio, búsqueda del historial y navegación móvil.

**Resultado:** los elementos observados permiten realizar las tareas y comunican el resultado de las búsquedas y validaciones.

**Evidencias:** `ISO04` a `ISO10` e `ISO15`.

![Vista móvil de PrestaFácil](evidencias/ISO15_Vista_Movil_400px.png)

### 3.5 Fiabilidad

Durante el proyecto se reportaron los siguientes resultados de pruebas automatizadas:
- Backend: 20 pruebas unitarias aprobadas.
- Frontend: 12 pruebas RTL aprobadas.
- Playwright: 5 pruebas E2E aprobadas.

Estas pruebas cubren reglas del servicio, componentes y flujos de usuario. Los resultados se registran como evidencia comunicada durante el trabajo; deben acompañarse con sus reportes/capturas originales del proyecto si se requiere auditoría reproducible.

**Resultado:** evidencia favorable de fiabilidad en los escenarios probados; no demuestra ausencia total de defectos.

### 3.6 Seguridad

Se comprobó que el acceso directo a una ruta protegida sin sesión redirige al formulario de login. También se comprobó que `GET /items` sin token responde `401 Unauthorized` con el mensaje de token requerido.

**Resultado:** los controles de autenticación observados funcionan en los escenarios probados. No se realizó una auditoría de seguridad completa.

**Evidencias:** `ISO11_Redireccion_Login_Sin_Sesion.png` e `ISO12_Backend_401_Sin_Token.png`.

![Redirección al login sin sesión](evidencias/ISO11_Redireccion_Login_Sin_Sesion.png)

![Backend responde 401 sin token](evidencias/ISO12_Backend_401_Sin_Token.png)

### 3.7 Mantenibilidad

La estructura observada del backend separa funcionalidades en módulos, incluyendo `items` y `loans`, con carpetas `dto`. El proyecto también cuenta con pruebas unitarias, RTL y E2E.

**Resultado:** la modularidad y la automatización aportan evidencia favorable de mantenibilidad. No se realizó un análisis completo de complejidad, duplicación, cobertura o deuda técnica.

**Evidencia:** `ISO13_Estructura_Backend.png`.

![Estructura modular del backend](evidencias/ISO13_Estructura_Backend.png)

### 3.8 Flexibilidad

Se abrió la aplicación en Chrome DevTools con una emulación de pantalla de 400 × 824 píxeles. En la captura, la navegación aparece en la parte inferior y el contenido se reorganiza en una columna.

**Resultado:** evidencia inicial de adaptación a una pantalla móvil. Se recomienda complementar con otros tamaños, navegadores y dispositivos reales.

**Evidencia:** `ISO15_Vista_Movil_400px.png`.

![PrestaFácil en vista móvil](evidencias/ISO15_Vista_Movil_400px.png)

### 3.9 Seguridad operacional

Al seleccionar la opción de eliminar un objeto, la aplicación presentó una ventana de confirmación preguntando si el usuario estaba seguro de realizar la eliminación.

**Resultado:** se verificó un mecanismo preventivo frente a eliminaciones accidentales. La captura correspondía a un objeto con estado disponible. Queda pendiente comprobar que el backend impida eliminar objetos con préstamos activos.

**Estado:** parcial.

**Evidencia:** `ISO16_Confirmacion_Eliminar.png`.

![Confirmación antes de eliminar](evidencias/ISO16_Confirmacion_Eliminar.png)

## 4. Conclusión general

Las pruebas realizadas aportan evidencia favorable sobre las funciones principales, la interacción, la autenticación, la integración local y la adaptación inicial a una pantalla móvil de PrestaFácil. Las mediciones de rendimiento registraron un promedio de 22,88 ms para cinco solicitudes locales a la ruta principal.

La evaluación no debe interpretarse como certificación ISO/IEC 25010:2023. Se identifican verificaciones pendientes, especialmente la restricción de eliminación de objetos con préstamos activos, además de ampliar las mediciones de rendimiento y las pruebas de compatibilidad.

## 5. Inventario de evidencias

Las capturas se encuentran en la carpeta `evidencias/`. Sus nombres identifican la característica o prueba que respaldan.


