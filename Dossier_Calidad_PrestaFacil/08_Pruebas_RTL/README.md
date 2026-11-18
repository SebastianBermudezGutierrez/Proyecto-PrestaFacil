# PrestaFácil — Pruebas RTL

## 1. Objetivo

Documentar las pruebas de componentes e interfaces del frontend de PrestaFácil utilizando React Testing Library y Vitest. Estas pruebas verifican el comportamiento visible de los componentes ante las interacciones y entradas del usuario.

## 2. Entorno de pruebas

- Proyecto: PrestaFácil.
- Aplicación: frontend Next.js y React.
- Herramientas: Vitest, React Testing Library, jsdom y jest-dom.
- Comando de ejecución:

```bash
npm run test:rtl
```

Ejecutar el comando desde la carpeta `frontend`.

## 3. Casos de prueba

La suite RTL está organizada en cinco archivos y contempla 12 casos:

| Archivo | Cantidad | Área evaluada |
|---|---:|---|
| `components/login-form.test.tsx` | 3 | Formulario de inicio de sesión |
| `app/protected/objects/new/page.test.tsx` | 3 | Registro de objetos |
| `app/protected/loans/new/page.test.tsx` | 3 | Registro de préstamos |
| `app/protected/objects/page.test.tsx` | 1 | Listado de objetos |
| `app/protected/loans/page.test.tsx` | 2 | Listado y gestión de préstamos |
| **Total** | **12** | |

### RTL-01 a RTL-03 — Formulario de inicio de sesión

Archivo: `components/login-form.test.tsx`

Se evalúa el comportamiento del formulario de autenticación y sus interacciones principales.

### RTL-04 a RTL-06 — Registro de objetos

Archivo: `app/protected/objects/new/page.test.tsx`

Se evalúa la interfaz de registro de objetos, sus campos y el comportamiento del formulario ante las acciones de usuario.

### RTL-07 a RTL-09 — Registro de préstamos

Archivo: `app/protected/loans/new/page.test.tsx`

Se evalúa la interfaz de creación de préstamos y la interacción con los datos requeridos para registrar la operación.

### RTL-10 — Listado de objetos

Archivo: `app/protected/objects/page.test.tsx`

Se comprueba la presentación del módulo de inventario de objetos.

### RTL-11 a RTL-12 — Listado de préstamos

Archivo: `app/protected/loans/page.test.tsx`

Se comprueba la presentación y las interacciones principales de la interfaz de préstamos.

> Nota: los nombres anteriores agrupan los casos por archivo y funcionalidad. Para documentar el comportamiento individual exacto de cada test, se debe consultar el contenido de los archivos `.test.tsx`.

## 4. Resultado de ejecución

En una ejecución anterior reportada durante el desarrollo del proyecto, el usuario confirmó que los 12 tests RTL pasaron.

| Indicador | Resultado reportado |
|---|---:|
| Pruebas aprobadas | 12 |
| Pruebas fallidas | 0 |
| Total | 12 |

**Estado:** ejecución aprobada según el resultado previamente confirmado. Se recomienda volver a ejecutar `npm run test:rtl` y guardar una captura de la terminal para adjuntarla como evidencia de esta entrega del dossier.

## 5. Evidencia de ejecución

Guardar la captura de la terminal en esta ubicación:

![Ejecución de pruebas rtl](evidencias/ejecucion-pruebas-rtl.png)

La captura debe mostrar el comando `npm run test:rtl`, el resultado de Vitest y el total de pruebas aprobadas. No se incluye una captura en este paquete porque no se ha proporcionado una imagen de esa ejecución en esta entrega.

## 6. Conclusión

La suite RTL cubre cinco áreas principales del frontend de PrestaFácil: autenticación, registro de objetos, registro de préstamos, inventario y gestión de préstamos. El conjunto contiene 12 casos de prueba y, de acuerdo con el resultado de ejecución previamente confirmado, los 12 finalizaron satisfactoriamente.

Para cerrar la evidencia del dossier, se debe conservar una captura reciente de la ejecución de `npm run test:rtl` junto con este README.

---

