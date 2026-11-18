# PrestaFácil — Pruebas de caja negra

## 1. Objetivo

Documentar la ejecución manual de diez pruebas funcionales de caja negra sobre PrestaFácil, registrando el resultado observado y la evidencia gráfica correspondiente.

## 2. Entorno de ejecución

- Aplicación: PrestaFácil.
- Frontend: Next.js, ejecutado localmente en `http://localhost:3001`.
- Backend: NestJS, ejecutado localmente en el puerto `3000`.
- Autenticación: sesión de usuario mediante Supabase.
- Tipo de prueba: funcional, manual y de caja negra.
- Fecha de ejecución: 18 de noviembre de 2026.

## 3. Resumen de resultados

| Código | Prueba | Resultado |
|---|---|---|
| CB-01 | Inicio de sesión con credenciales válidas | Aprobada |
| CB-02 | Inicio de sesión con contraseña incorrecta | Aprobada |
| CB-03 | Acceso al panel sin autenticación | Aprobada |
| CB-04 | Registro de un objeto válido | Aprobada |
| CB-05 | Registro de objeto sin nombre | Aprobada con observación |
| CB-06 | Búsqueda de un objeto en el inventario | Aprobada con observación |
| CB-07 | Creación de un préstamo válido | Aprobada |
| CB-08 | Creación de préstamo sin seleccionar objeto | Aprobada |
| CB-09 | Registro de devolución | Aprobada |
| CB-10 | Consulta del historial de préstamos | Aprobada |

**Balance:** 10 pruebas ejecutadas satisfactoriamente: 8 aprobadas sin observaciones y 2 aprobadas con observaciones.

## 4. Detalle de las pruebas y evidencias

### CB-01 — Inicio de sesión con credenciales válidas

- **Objetivo:** comprobar que un usuario registrado pueda iniciar sesión.
- **Procedimiento:** ingresar correo y contraseña correctos y seleccionar Login.
- **Resultado esperado:** acceso al panel principal.
- **Resultado observado:** se visualizó el dashboard de PrestaFácil con el mensaje de bienvenida.
- **Veredicto:** **Aprobada**.

![Evidencia CB-01](evidencias/CB-01-inicio-sesion-exitoso.png)

### CB-02 — Inicio de sesión con contraseña incorrecta

- **Objetivo:** comprobar que el sistema rechace credenciales inválidas.
- **Procedimiento:** ingresar el correo registrado y una contraseña incorrecta.
- **Resultado esperado:** impedir el acceso y mostrar un mensaje de error.
- **Resultado observado:** el formulario mostró `Invalid login credentials` y permaneció en la pantalla de Login.
- **Veredicto:** **Aprobada**.

![Evidencia CB-02](evidencias/CB-02-credenciales-incorrectas.png)

### CB-03 — Acceso al panel sin autenticación

- **Objetivo:** comprobar la protección de las rutas privadas.
- **Procedimiento:** intentar abrir directamente `http://localhost:3001/protected` sin iniciar sesión.
- **Resultado esperado:** redirección al formulario de autenticación.
- **Resultado observado:** el navegador terminó en `/auth/login`.
- **Veredicto:** **Aprobada**.

![Evidencia CB-03](evidencias/CB-03-acceso-sin-autenticacion.png)

### CB-04 — Registro de un objeto válido

- **Objetivo:** comprobar que se pueda registrar un objeto con información válida.
- **Datos utilizados:**
  - Nombre: `Prueba-Caja-Negra-01`
  - Categoría: `Tecnología`
  - Descripción: `Objeto creado para validar el registro`
- **Resultado esperado:** guardar el objeto y mostrarlo en el inventario.
- **Resultado observado:** el objeto apareció en el inventario; el contador pasó de 18 a 19 objetos.
- **Veredicto:** **Aprobada**.

![Evidencia CB-04](evidencias/CB-04-registro-objeto.png)

### CB-05 — Registro de objeto sin nombre

- **Objetivo:** comprobar que el nombre del objeto sea obligatorio.
- **Procedimiento:** dejar vacío el campo Nombre del objeto e intentar guardar.
- **Resultado esperado:** impedir el envío del formulario.
- **Resultado observado:** el navegador mostró la validación `Please fill out this field`.
- **Veredicto:** **Aprobada con observación**.
- **Observación:** en la captura también aparece un mensaje verde de registro correcto. No se confirmó en esa misma evidencia si dicho mensaje era residual ni se documentó una comparación posterior del contador. Conviene repetir la comprobación del inventario si se requiere cerrar la observación.

![Evidencia CB-05](evidencias/CB-05-nombre-obligatorio.png)

### CB-06 — Búsqueda de un objeto en el inventario

- **Objetivo:** comprobar que el buscador filtre los objetos por nombre.
- **Dato utilizado:** `Prueba-Caja-Negra-01`.
- **Procedimiento:** escribir el nombre en el campo de búsqueda del inventario.
- **Resultado esperado:** mostrar los registros que coincidan con el texto buscado.
- **Resultado observado:** aparecieron dos objetos con ese nombre y no se observaron otros nombres en los resultados.
- **Veredicto:** **Aprobada con observación**.
- **Observación:** aparecen dos registros con el mismo nombre, creados durante las pruebas. Esto no impide comprobar la búsqueda, pero conviene tenerlo presente al interpretar el resultado.

![Evidencia CB-06](evidencias/CB-06-busqueda-inventario.png)

### CB-07 — Creación de un préstamo válido

- **Objetivo:** comprobar que se pueda crear un préstamo para un objeto disponible.
- **Datos observados:**
  - Objeto: `Prueba-Caja-Negra-01`
  - Prestatario: `Carlos Prueba`
  - Contacto: `3001234567`
  - Observaciones: `Prueba de creación de préstamo.`
- **Resultado esperado:** registrar el préstamo, mostrarlo como activo y cambiar el objeto a prestado.
- **Resultado observado:** el préstamo apareció en el listado con estado `Activo`; el contador de préstamos activos pasó de 8 a 9.
- **Veredicto:** **Aprobada**.
- **Observación adicional:** la fecha prevista que aparece en pantalla es 19 de noviembre de 2026. Se documenta el valor visible en la evidencia.

![Evidencia CB-07](evidencias/CB-07-crear-prestamo.png)

### CB-08 — Creación de préstamo sin seleccionar objeto

- **Objetivo:** comprobar que no se pueda crear un préstamo sin seleccionar un objeto.
- **Procedimiento:** completar los datos del prestatario y la fecha, dejando el selector de objeto sin selección.
- **Resultado esperado:** impedir el envío.
- **Resultado observado:** el navegador mostró `Please select an item in the list`.
- **Veredicto:** **Aprobada**.

![Evidencia CB-08](evidencias/CB-08-prestamo-sin-objeto.png)

### CB-09 — Registro de devolución

- **Objetivo:** comprobar que se pueda registrar la devolución de un préstamo activo.
- **Procedimiento:** seleccionar Registrar devolución para el préstamo de `Prueba-Caja-Negra-01`.
- **Resultado esperado:** cambiar el préstamo a devuelto y dejar disponible el objeto.
- **Resultado observado:** la aplicación confirmó que el objeto fue registrado como devuelto y que ya estaba disponible en el inventario.
- **Veredicto:** **Aprobada**.

![Evidencia CB-09](evidencias/CB-09-devolucion.png)

### CB-10 — Consulta del historial de préstamos

- **Objetivo:** comprobar que el historial muestre los préstamos finalizados.
- **Procedimiento:** abrir el módulo Historial y localizar el préstamo de `Prueba-Caja-Negra-01`.
- **Resultado esperado:** visualizar el préstamo, prestatario y estado final.
- **Resultado observado:** el historial mostró el objeto, el prestatario `Carlos Prueba` y el estado `Devuelto`. La fecha de devolución visible fue 18 de noviembre de 2026.
- **Veredicto:** **Aprobada**.

![Evidencia CB-10](evidencias/CB-10-historial.png)

## 5. Conclusión

Las diez pruebas de caja negra documentadas permitieron comprobar los flujos principales de autenticación, protección de rutas, gestión de inventario, préstamos, devoluciones e historial. Todas las pruebas de la matriz finalizaron satisfactoriamente, aunque CB-05 y CB-06 conservan observaciones documentadas.

La incidencia relacionada con el límite de 120 caracteres permanece pendiente y debe tratarse de manera independiente. Las capturas incluidas corresponden a la evidencia visual recopilada durante la ejecución manual.

---

