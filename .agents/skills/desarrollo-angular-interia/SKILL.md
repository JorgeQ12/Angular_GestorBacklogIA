---
name: desarrollo-angular-interia
description: Implementa funcionalidades nuevas o extensiones funcionales en el frontend Angular de InterIA con auditoria horizontal, contratos, estado, formularios, interfaz, pruebas y documentacion. Usar cuando se agregue comportamiento nuevo que atraviese una o varias capas; para una migracion o refactorizacion sin capacidad nueva usar migracion-angular-interia, y para un cambio exclusivamente visual usar diseno-interia.
---

# Desarrollo Angular InterIA

Construir una funcionalidad completa y coherente con el frontend vigente. No limitarse a crear el
componente visible: revisar el flujo desde la ruta y la pagina anfitriona hasta el estado, HTTP,
contratos, presentacion, pruebas y documentacion que correspondan.

## 1. Delimitar el cambio

1. Leer por completo `docs/CONVENCIONES_FRONTEND.md`.
2. Revisar `git status`, `git diff` y los archivos sin seguimiento antes de editar. Conservar los
   cambios del usuario y separar cualquier hallazgo preexistente.
3. Expresar el comportamiento solicitado como escenarios observables y determinar que capas son
   realmente necesarias.
4. Si el trabajo es solo visual, usar `$diseno-interia`. Si consiste en trasladar, modernizar o
   refactorizar comportamiento existente sin agregar una capacidad, usar
   `$migracion-angular-interia`.
5. Cuando la funcionalidad nueva incluya interfaz, aplicar tambien `$diseno-interia` a esa parte.

No crear abstracciones, rutas, servicios, estados o documentos por anticipado. Cada pieza debe
tener un consumidor y una responsabilidad estable dentro del alcance actual.

## 2. Cargar la documentacion propietaria

Leer completo cada documento aplicable antes de implementar:

| Alcance | Documento |
|---|---|
| Interfaz, responsive, accesibilidad visual, iconos o CSS | `docs/ESTILOS_FRONTEND.md` |
| Formularios, validaciones o controles | `docs/FORMULARIOS_REACTIVOS.md` |
| Endpoints, DTO, mappers, errores o environments | `docs/INTEGRACION_BACKEND.md` |
| Carga HTTP global o local | `docs/CARGA_GLOBAL.md` |
| Sesion, guards, permisos o Kong | `docs/AUTENTICACION_KONG.md` |
| Inicio del panel | `docs/INICIO_PANEL.md` |
| Creacion y borrador de proyectos | `docs/CREACION_PROYECTOS.md` |
| Consulta, edicion o versiones de proyectos | `docs/INFORMACION_PROYECTOS.md` |
| Portafolio, filtros o paginacion | `docs/LISTADO_PROYECTOS.md` |
| Asistente conversacional y propuestas | `docs/ASISTENTE_IA.md` |

Si no existe un documento especifico, localizar primero el documento del dominio o de la
infraestructura que sera propietario de la nueva decision. No asumir que la ausencia de una regla
autoriza una convencion paralela.

## 3. Auditar horizontalmente antes de diseñar

Recorrer la capacidad vecina completa, no solo la carpeta donde parece caer el cambio:

- rutas, providers y pagina anfitriona;
- modelos de UI, DTO, configuracion, mappers, servicios HTTP y estado;
- componentes presentacionales, formularios, estilos y primitivas compartidas;
- interceptores, errores, carga, fechas, iconos y autenticacion que atraviesen la feature;
- pruebas existentes, `public-api.ts`, documentacion y contrato real del backend o Swagger.

Buscar primero comportamientos, nombres y contratos equivalentes con `rg`. Identificar el dueño de
cada responsabilidad:

- `core`: infraestructura unica de toda la aplicacion;
- `shared`: piezas reutilizables sin reglas de un dominio;
- `layouts`: composicion estructural de navegacion;
- `features`: comportamiento y contratos de negocio;
- `styles`: tokens, bases y primitivas globales.

Mantener dependencias dirigidas hacia contratos publicos. Una feature no debe importar detalles
internos de otra cuando su `public-api.ts` ya define el limite. El estado que pertenece a un flujo
de ruta se proporciona en esa ruta; no se convierte en singleton global por comodidad.

## 4. Diseñar el flujo y sus estados

Antes de editar, definir como minimo:

- entrada, salida y propietario de los datos;
- fuente autoritativa y diferencia entre dato persistido, optimista y pendiente;
- estados de carga, datos, vacio, error y reintento;
- bloqueo durante operaciones remotas y todos los caminos de activacion: clic, submit, teclado y
  llamadas programaticas;
- comportamiento al cambiar de ruta, proyecto, consulta o contexto mientras existe una solicitud;
- politica ante respuestas tardias, solicitudes superpuestas, cancelacion y destruccion;
- foco, nombres accesibles, anuncios y operacion completa por teclado;
- efecto de un fallo: que informacion se conserva, que se revierte y que puede reintentarse.

Usar identidad o secuencias para impedir que una respuesta antigua modifique el contexto nuevo. No
confiar solamente en un boton deshabilitado: la funcion que ejecuta la accion tambien valida sus
precondiciones.

## 5. Implementar por responsabilidades

### Angular y composicion

- Usar componentes standalone, `ChangeDetectionStrategy.OnPush`, signals y formularios tipados.
- La pagina orquesta ruta, servicios, estado y navegacion. El componente presentacional recibe
  datos y emite eventos; no inyecta HTTP, sesion o router.
- Preferir composicion y contratos discriminados. No crear clases base para paginas o formularios.
- Usar enums de string cuando una identidad estable gobierne comparaciones, configuracion o mapeo.
- Eliminar ramas, imports, tipos y metodos obsoletos dentro del alcance modificado.

### Integracion HTTP y estado

- Seguir el flujo `environment -> endpoint -> servicio HTTP -> ResultadoApi/DTO -> mapper -> modelo
  de UI -> estado/pagina -> componente`.
- Tipar nulabilidad y nombres reales del contrato. Verificar el backend o Swagger; no inventar
  respuestas ni endpoints temporales.
- Mapear explicitamente enumeraciones, fechas y formas externas. Un valor desconocido no debe
  convertirse por defecto en una accion permitida.
- Normalizar y comunicar fallos mediante la infraestructura de `core`; no exponer
  `HttpErrorResponse` a la presentacion.
- Usar la carga global para solicitudes ordinarias. `OMITIR_CARGA_GLOBAL` solo es valido si la
  feature presenta estados locales completos y mantiene utilizable el resto de la pagina.
- Proteger el estado contra respuestas de un contexto anterior y restablecer flags transitorios al
  cambiar de identidad o finalizar cada operacion.

### Formularios y presentacion

- Seguir `docs/FORMULARIOS_REACTIVOS.md`: validadores compartidos, mensajes configurados,
  `appMensajesFormulario`, `appErrorCampo`, etiquetas e identificadores accesibles cuando
  correspondan.
- Sincronizar el bloqueo remoto mediante `FormGroup.disable()` y `enable()`, no mediante atributos
  aislados en los controles.
- Aplicar tokens, primitivas `ui-*`, BEM, catalogo `ICONOS_APLICACION` y `app-icono`.
- Usar `FechaPipe`, `TiempoRelativoPipe` y formatos semanticos registrados; no formatear fechas en
  componentes.
- Verificar escritorio, movil, foco visible, `prefers-reduced-motion`, hover, active, disabled y
  error.

## 6. Probar la rebanada completa

Agregar pruebas en la capa propietaria del comportamiento:

- **mapper:** DTO representativo, nulabilidad, valores limite y externos desconocidos;
- **servicio HTTP:** cada endpoint afectado, metodo, URL, query/body, contexto HTTP, sobre
  `ResultadoApi` y error funcional;
- **estado:** exito, error, reintento, bloqueo, respuestas tardias, operaciones superpuestas y
  cambio de identidad durante una solicitud;
- **formulario/componente:** envio valido e invalido, mensajes, limite, deshabilitacion remota,
  clic, Enter, combinaciones de teclado y foco;
- **pagina anfitriona:** visibilidad, adaptacion del contrato, ruta/provider, recarga e integracion
  con servicios sustituidos;
- **infraestructura compartida:** comportamiento nuevo y regresion del comportamiento ordinario.

Toda correccion de un defecto descubierto durante la implementacion incluye primero o junto con
ella una prueba que falle por el mismo camino de interaccion que lo reprodujo.

## 7. Documentar codigo y decisiones

La documentacion forma parte de la implementacion y se actualiza en el mismo cambio. Aplicar tanto
la documentacion dentro del codigo como los documentos funcionales de `docs`.

### Documentacion dentro del codigo

- Documentar brevemente toda clase, directiva, pipe, servicio, token o contrato publico nuevo que
  se exporte fuera de su archivo propietario.
- Documentar metodos publicos cuando sus precondiciones, efectos laterales, errores, concurrencia o
  relacion con el backend no sean evidentes por la firma.
- Explicar el motivo de una decision no obvia: propiedad del estado, alcance de un provider,
  cancelacion, proteccion contra respuestas tardias, normalizacion o excepcion de carga global.
- Mantener comentarios de interfaces y modelos en el nivel que aporta contexto de dominio. No
  comentar cada propiedad cuando su nombre y tipo ya son suficientes.
- Usar `TODO` solo para una integracion real pendiente e indicar concretamente que falta. No dejar
  comentarios de historial, codigo comentado ni explicaciones que hayan quedado obsoletas.
- Revisar los simbolos expuestos por `public-api.ts` y confirmar que el comentario describe el
  contrato vigente, no los detalles internos de su implementacion.
- Nombrar las pruebas por el comportamiento observable y el escenario protegido, de modo que
  documenten la regla y no una llamada interna accidental.

No agregar comentarios que repitan literalmente el codigo. Si una explicacion extensa representa
una regla estable de varias piezas, moverla al documento propietario en `docs` y dejar en el codigo
solo el contexto necesario.

### Documentacion funcional y arquitectonica

Evaluar despues de implementar si el cambio crea o modifica una convencion, contrato o flujo:

- actualizar el documento especializado existente que sea dueño de la decision;
- actualizar el documento del dominio cuando cambie su experiencia, limites, persistencia, estados
  o integracion;
- no crear un `.md` por componente, defecto o decision local de una feature;
- crear un documento especializado solo para un tema estable que atraviese varios archivos o
  equipos y no encaje en la documentacion actual;
- agregar cualquier documento especializado nuevo al indice de
  `docs/CONVENCIONES_FRONTEND.md`;
- describir el criterio vigente y el resultado esperado, no el historial de la conversacion ni una
  copia extensa del codigo.

Antes de cerrar, contrastar codigo, pruebas y documentacion: los nombres, rutas, endpoints, estados,
limites y comandos documentados deben existir y coincidir con la implementacion actual. No
documentar como terminada una capacidad que conserve integraciones pendientes.

## 8. Verificar antes de cerrar

Ejecutar las pruebas focalizadas durante el desarrollo y, al terminar, como minimo:

```powershell
npm run build
npm test -- --watch=false
git diff --check
```

Si hubo endpoints o environments, ejecutar tambien:

```powershell
npx ng build --configuration development
```

Si hubo CSS en una feature:

```powershell
rg "font-family|#[0-9a-fA-F]{3,8}|!important|::ng-deep" src/app/features -g "*.css"
```

Si hubo interfaz, comprobar que no existan imports directos de `lucide-angular` fuera del catalogo
ni formateo local de fechas. Revisar el diff final, archivos sin seguimiento y referencias muertas.
Una busqueda sin coincidencias puede devolver codigo de salida 1 y representa el resultado esperado.

Revisar tambien los exports y comentarios del codigo modificado, los enlaces de los documentos y el
indice general. Buscar nombres, rutas o contratos anteriores para no dejar documentacion obsoleta.

No declarar completado el trabajo si falta una validacion aplicable. Si una comprobacion falla,
indicar si la causa pertenece al cambio o era preexistente y conservar la evidencia necesaria.

## 9. Entrega

Resumir:

1. comportamiento integrado y decisiones principales;
2. archivos y documentacion propietarios actualizados;
3. pruebas y builds ejecutados con su resultado;
4. riesgos o pendientes reales, sin ocultarlos entre mejoras opcionales.
