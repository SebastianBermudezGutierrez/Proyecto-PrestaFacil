# Gestión de hallazgos, registros (logs) y Shift Right --- PrestaFácil

**Proyecto:** PrestaFácil\
**Etapa:** Calidad de software\
**Fecha de documentación:** 18 de noviembre de 2026\
**Alcance:** clasificación de hallazgos identificados durante las
pruebas y propuesta de observabilidad y Shift Right.

> **Nota sobre el estado de implementación:** este documento separa los
> resultados que ya se observaron en las pruebas de las actividades
> propuestas. No se afirma que los logs estructurados o la
> monitorización Shift Right estén implementados hasta verificar el
> código y su ejecución.

------------------------------------------------------------------------

## 1. Objetivo

Documentar los hallazgos encontrados en PrestaFácil, clasificarlos
correctamente y establecer un esquema de registro de eventos que permita
observar el comportamiento del sistema durante su ejecución. También se
definen escenarios de Shift Right para detectar errores y facilitar su
diagnóstico.

## 2. Diferencia entre error, defecto, falla e incidente

  -----------------------------------------------------------------------
  Término                 Definición para el      Ejemplo
                          proyecto                
  ----------------------- ----------------------- -----------------------
  **Error**               Acción o equivocación   Omitir una validación
                          humana que puede        al programar una regla
                          introducir un problema. de negocio.

  **Defecto**             Imperfección en un      La validación de
                          requisito, diseño,      longitud del nombre no
                          código o configuración. se aplica correctamente
                                                  en el flujo de
                                                  registro.

  **Falla**               Comportamiento          La aplicación acepta y
                          observable en el que el guarda un nombre de
                          sistema no cumple lo    objeto de 121
                          esperado.               caracteres, aunque el
                                                  límite definido es 120.

  **Incidente**           Evento que interrumpe o Una indisponibilidad
                          degrada el servicio o   del backend que impide
                          afecta al usuario y     registrar préstamos.
                          requiere atención.      
  -----------------------------------------------------------------------

Un error humano puede introducir un defecto; cuando el defecto se
ejecuta bajo ciertas condiciones puede producir una falla; si esa falla
afecta el servicio o a los usuarios, puede gestionarse como incidente.

## 3. Matriz de hallazgos de PrestaFácil

La matriz recoge los resultados observados durante las pruebas
funcionales y de seguridad. Los controles que funcionaron correctamente
se registran como resultados positivos, no como defectos.

  ---------------------------------------------------------------------------------------
  ID             Hallazgo / observación    Clasificación   Estado         Acción
                                                                          recomendada
  -------------- ------------------------- --------------- -------------- ---------------
  H-01           En la prueba de caja      Defecto con     Abierto /      Revisar la
                 negra, el sistema         falla           pendiente de   validación en
                 permitió guardar un       observable      corrección     frontend, DTO y
                 objeto con un nombre de                                  servicio;
                 121 caracteres, aunque el                                repetir la
                 límite esperado era 120.                                 prueba después
                                                                          del ajuste.

  H-02           Durante las búsquedas se  Anomalía de     Por investigar Verificar si
                 observaron dos registros  datos                          son registros
                 con el nombre             observada;                     de pruebas
                 `Prueba-Caja-Negra-01`.   causa sin                      creados por
                                           determinar                     separado o si
                                                                          existe un
                                                                          problema de
                                                                          duplicación. No
                                                                          asumir que es
                                                                          un defecto del
                                                                          sistema sin
                                                                          investigar.

  H-03           El formulario impidió     Control         Aprobado en el Conservar la
                 enviar un préstamo sin    correcto        escenario      captura como
                 seleccionar un objeto y                   probado        evidencia de
                 mostró la validación del                                 validación.
                 campo obligatorio.                                       

  H-04           El endpoint `GET /items`  Control de      Aprobado en el Conservar la
                 rechazó solicitudes sin   seguridad       escenario      respuesta como
                 token y devolvió HTTP     correcto        probado        evidencia de
                 401.                                                     autenticación
                                                                          requerida.

  H-05           Al seleccionar la opción  Control         Verificado     Conservar la
                 de eliminar un objeto, la preventivo      parcialmente   captura y
                 interfaz mostró una       correcto                       comprobar
                 confirmación antes de                                    aparte que el
                 continuar.                                               backend impida
                                                                          eliminar
                                                                          objetos con
                                                                          préstamos
                                                                          activos.
  ---------------------------------------------------------------------------------------

### 3.1 Priorización recomendada

  -----------------------------------------------------------------------
  Hallazgo                Prioridad sugerida      Justificación
  ----------------------- ----------------------- -----------------------
  H-01                    Alta                    La aplicación aceptó un
                                                  dato que incumple una
                                                  regla de validación
                                                  documentada.

  H-02                    Media / por determinar  Se requiere identificar
                                                  el origen de los
                                                  registros repetidos
                                                  antes de asignar
                                                  severidad.

  H-03                    No aplica               El control funcionó
                                                  correctamente.

  H-04                    No aplica               El control de
                                                  autenticación funcionó
                                                  correctamente.

  H-05                    Pendiente               La confirmación reduce
                                                  eliminaciones
                                                  accidentales, pero
                                                  falta probar la regla
                                                  de préstamos activos.
  -----------------------------------------------------------------------

## 4. Gestión de los hallazgos

Para cada defecto o incidente se recomienda registrar:

-   Identificador único.
-   Fecha y hora.
-   Módulo afectado.
-   Descripción del comportamiento observado.
-   Pasos para reproducirlo.
-   Resultado esperado y resultado obtenido.
-   Severidad y prioridad.
-   Evidencia (captura, respuesta HTTP o fragmento de log).
-   Responsable.
-   Estado: abierto, en análisis, corregido, listo para retest o
    cerrado.
-   Resultado de la prueba de regresión.

### 4.1 Ciclo de atención

1.  **Detectar:** identificar el comportamiento inesperado mediante
    pruebas o monitoreo.
2.  **Registrar:** crear el hallazgo con evidencia reproducible.
3.  **Clasificar:** determinar si se trata de error humano, defecto,
    falla o incidente.
4.  **Priorizar:** estimar impacto y urgencia.
5.  **Corregir:** realizar el cambio correspondiente.
6.  **Verificar:** repetir el caso que encontró el problema.
7.  **Regresión:** comprobar que el cambio no afectó otras funciones.
8.  **Cerrar:** documentar el resultado y conservar la evidencia.

------------------------------------------------------------------------

## 5. Logs y observabilidad

Los logs son registros cronológicos de eventos que ayudan a conocer qué
ocurrió en la aplicación. En PrestaFácil se propone registrar eventos
importantes del backend NestJS, como autenticaciones, creación de
objetos, préstamos, devoluciones y errores.

### 5.1 Eventos que se deben registrar

  -----------------------------------------------------------------------
  Código                  Evento                  Información mínima
  ----------------------- ----------------------- -----------------------
  LOG-01                  Inicio de sesión        Fecha/hora, resultado y
                          exitoso o fallido       código de evento.

  LOG-02                  Registro de objeto      Fecha/hora,
                                                  identificador de
                                                  usuario y resultado.

  LOG-03                  Creación de préstamo    Fecha/hora,
                                                  identificadores del
                                                  objeto y préstamo,
                                                  resultado.

  LOG-04                  Devolución de objeto    Fecha/hora,
                                                  identificador del
                                                  préstamo y resultado.

  LOG-05                  Solicitud sin           Fecha/hora, ruta,
                          autenticación           método y código HTTP
                                                  401.

  LOG-06                  Error interno           Fecha/hora, ruta,
                                                  código de error y
                                                  detalle técnico
                                                  controlado.
  -----------------------------------------------------------------------

### 5.2 Formato recomendado

Se recomienda utilizar logs estructurados en JSON para que puedan
buscarse y analizarse fácilmente. Ejemplo ilustrativo:

``` json
{
  "timestamp": "2026-11-18T21:00:00.000Z",
  "level": "info",
  "event": "loan.created",
  "module": "loans",
  "status": "success",
  "userId": "identificador-no-sensible",
  "loanId": "identificador-del-prestamo",
  "requestId": "id-de-solicitud"
}
```

Ejemplo de solicitud rechazada:

``` json
{
  "timestamp": "2026-11-18T21:01:00.000Z",
  "level": "warn",
  "event": "authentication.required",
  "module": "items",
  "method": "GET",
  "path": "/items",
  "statusCode": 401,
  "requestId": "id-de-solicitud"
}
```

**Estos ejemplos muestran el formato propuesto; no son logs extraídos
del sistema ni evidencian por sí mismos que la instrumentación ya esté
implementada.**

### 5.3 Buenas prácticas de registro

-   No registrar contraseñas, tokens JWT, claves de Supabase ni
    secretos.
-   Evitar almacenar datos personales innecesarios.
-   Registrar fecha y hora, nivel, evento, módulo y resultado.
-   Usar un identificador de solicitud para relacionar eventos de una
    misma operación.
-   Diferenciar niveles `info`, `warn` y `error`.
-   No guardar el contenido completo de solicitudes que pueda incluir
    datos sensibles.
-   Definir retención y acceso a los logs según las necesidades del
    proyecto.

### 5.4 Estado de implementación

  -----------------------------------------------------------------------
  Actividad                           Estado
  ----------------------------------- -----------------------------------
  Backend NestJS ejecutándose y       Observado durante las pruebas.
  mostrando mensajes de inicio        

  Respuesta HTTP 401 al consultar     Verificado.
  `/items` sin token                  

  Logs estructurados JSON para los    Propuestos; implementación
  cinco flujos                        pendiente de verificar.

  Identificador de correlación        Pendiente de implementar/verificar.
  (`requestId`)                       

  Política de retención y protección  Pendiente de definir.
  de logs                             
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 6. Shift Right en PrestaFácil

Shift Right consiste en observar el software mientras se ejecuta en un
entorno operativo o similar al real. Complementa las pruebas previas al
despliegue con monitoreo, análisis de logs, seguimiento de errores y
verificación de los flujos reales.

Para PrestaFácil se plantean cinco escenarios de observación.

### 6.1 Escenarios Shift Right

  -----------------------------------------------------------------------
  ID                Escenario         Qué observar      Resultado
                                                        esperado
  ----------------- ----------------- ----------------- -----------------
  SR-01             Inicio de sesión  Éxito, rechazo de Registrar el
                                      credenciales y    resultado sin
                                      errores de        exponer
                                      autenticación.    contraseñas ni
                                                        tokens.

  SR-02             Registro de       Solicitud,        Registrar
                    objeto            validaciones y    creación exitosa
                                      respuesta del     o motivo
                                      servicio.         controlado del
                                                        rechazo.

  SR-03             Creación de       Objeto            Registrar el
                    préstamo          seleccionado,     préstamo y
                                      usuario, fecha y  confirmar la
                                      cambio de estado. transición del
                                                        objeto a
                                                        prestado.

  SR-04             Devolución        Identificador del Registrar la
                                      préstamo y        devolución y
                                      actualización de  confirmar que el
                                      estados.          objeto vuelva a
                                                        disponible.

  SR-05             Solicitud sin     Ruta, método y    Registrar el
                    token             respuesta HTTP.   intento no
                                                        autenticado y
                                                        devolver 401 sin
                                                        revelar
                                                        información
                                                        sensible.
  -----------------------------------------------------------------------

### 6.2 Procedimiento de ejecución

1.  Iniciar frontend y backend en el entorno de pruebas.
2.  Ejecutar cada escenario desde la aplicación o mediante una solicitud
    HTTP.
3.  Observar la salida de logs del backend.
4.  Verificar que cada evento tenga fecha/hora, nivel, nombre de evento
    y resultado.
5.  Confirmar que no se registren tokens, contraseñas ni secretos.
6.  Registrar cualquier error o comportamiento inesperado como hallazgo.
7.  Repetir el escenario después de una corrección y conservar la
    evidencia.

### 6.3 Registro de ejecución Shift Right

Completar esta tabla cuando se hayan ejecutado y observado los logs
reales:

  ---------------------------------------------------------------------------------
  ID             Ejecutado      Log observado  Resultado      Evidencia
  -------------- -------------- -------------- -------------- ---------------------
  SR-01          Pendiente      Pendiente      Pendiente      Por adjuntar

  SR-02          Pendiente      Pendiente      Pendiente      Por adjuntar

  SR-03          Pendiente      Pendiente      Pendiente      Por adjuntar

  SR-04          Pendiente      Pendiente      Pendiente      Por adjuntar

  SR-05          Parcialmente   Log interno    Respuesta HTTP Captura de
                 verificado:    por confirmar  401            Postman/PowerShell,
                 respuesta 401                                si se adjunta
                 comprobada                                   
  ---------------------------------------------------------------------------------

> Una respuesta HTTP observada no demuestra por sí sola que el evento se
> haya escrito en un sistema de logs. Para marcar un escenario como
> completado debe observarse el registro correspondiente.

## 7. Evidencias disponibles

Las evidencias visuales recopiladas durante las pruebas de PrestaFácil
que se relacionan con este apartado son:

  -----------------------------------------------------------------------
  Evidencia                           Qué respalda
  ----------------------------------- -----------------------------------
  Prueba de caja negra del nombre de  H-01: comportamiento de validación
  121 caracteres                      incorrecto observado.

  Captura del inventario con          H-02: observación de datos
  registros de prueba repetidos       repetidos.

  Validación del objeto obligatorio   H-03: control correcto.
  en el formulario de préstamo        

  Respuesta del endpoint `/items` sin H-04 y escenario SR-05: control de
  token con HTTP 401                  autenticación.

  Ventana de confirmación antes de    H-05: control preventivo.
  eliminar                            

  Captura de terminal del backend     Evidencia de arranque del servicio;
  iniciado                            no demuestra por sí sola la
                                      implementación de logs de negocio.
  -----------------------------------------------------------------------

Las capturas deben adjuntarse en la carpeta de evidencias del dossier.
No se deben presentar ejemplos de logs propuestos como si fueran
registros reales.

## 8. Conclusión

Durante las pruebas de PrestaFácil se identificó un defecto con falla
observable relacionado con el límite de 120 caracteres, además de una
observación de registros repetidos que requiere investigación. También
se comprobaron controles correctos, como la validación del objeto
obligatorio en los préstamos y el rechazo de solicitudes sin token
mediante HTTP 401.

Para fortalecer la observabilidad, se definieron eventos de log para
autenticación, registro de objetos, creación de préstamos, devoluciones
y errores de acceso. Asimismo, se establecieron cinco escenarios Shift
Right para observar el comportamiento del sistema durante su ejecución.

La clasificación de hallazgos está documentada con base en las pruebas
realizadas. La instrumentación de logs estructurados y la ejecución
completa de los cinco escenarios Shift Right quedan pendientes de
implementación o verificación con evidencia real.
