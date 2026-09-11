# Planificación de proyectos

La planificación transforma la especificación aprobada de un proyecto en un backlog navegable y
versionado. La capacidad vive en `features/proyectos/planificacion` y se carga de forma diferida
desde la ruta `/panel/proyectos/:proyectoId/planificacion`.

## Responsabilidades

- La página obtiene el identificador de ruta, compone las vistas y conecta sus eventos.
- Los servicios `estado-*` mantienen ciclos de carga, selección, edición, generación, historial,
  eliminación, Gantt y publicación. Se proporcionan en la ruta para aislar el estado por proyecto.
- Los servicios HTTP son stateless y consumen únicamente los endpoints centralizados en
  `config/endpoints-planificacion-proyecto.config.ts`.
- Los DTO representan el contrato remoto; los mappers validan o adaptan esos datos antes de que
  lleguen a los modelos de interfaz.
- Los componentes del árbol, controles, editor, historial y publicación reciben datos tipados y
  emiten intenciones. La lista de requisitos actúa como contenedor funcional de su subflujo.

## Flujo principal

1. `EstadoPlanificacionProyectoService` carga la versión solicitada y protege la respuesta vigente
   cuando cambia el proyecto o la versión.
2. El árbol representa la jerarquía épica, característica, historia de usuario y tarea sin mutar
   el modelo recibido.
3. La página delega creación, edición, consulta histórica y eliminación en el estado especializado
   correspondiente.
4. Una mutación exitosa invalida o actualiza el estado afectado y conserva la selección coherente.
5. Los errores técnicos y funcionales se normalizan con la infraestructura HTTP de `core`; el
   estado o contenedor aporta solamente el contexto funcional del mensaje.

Las peticiones HTTP ordinarias usan el cargador global. Solo se presenta estado local cuando la
interacción necesita conservar contexto propio, como una operación de edición o publicación.

## Lista de requisitos

La lista agrupa requisitos por área y sección. Permite revisar cumplimiento, aplicabilidad,
transversalidad y responsable, además de crear registros en una ubicación existente o nueva.

- El catálogo remoto se adapta a `OpcionSelector` antes de llegar al formulario.
- Los textos obligatorios se validan después de aplicar `trim` mediante el validador compartido.
- Los errores de campo usan las directivas compartidas y relaciones accesibles de etiqueta/error.
- El formulario completo se deshabilita mientras se crea un requisito.
- Un reintento cancela la carga anterior para impedir que una respuesta obsoleta reemplace la
  información vigente.
- Los errores de carga se muestran inline con reintento; las mutaciones fallidas se comunican una
  sola vez mediante el notificador global.
- Una actualización sin datos sigue validando `ResultadoApi.exitoso`; un HTTP 200 con error
  funcional no se interpreta como guardado exitoso.

## Versiones e historial

La versión seleccionada forma parte del estado de la planificación. Una vista histórica es de solo
lectura y no habilita mutaciones. El historial de un elemento se carga y selecciona de forma
independiente, cancelando solicitudes anteriores cuando cambia la selección.

## Generación con IA

La generación recibe opciones tipadas y no modifica el árbol hasta confirmar una respuesta válida.
El estado especializado bloquea operaciones superpuestas, comunica errores normalizados y solicita
la recarga de la planificación cuando el backend persiste nuevos elementos.

## Gantt

El Gantt deriva filas, escalas, dependencias y rangos desde el modelo de planificación. Los colores
de entidades Azure son tokens globales; el componente no define decisiones cromáticas locales. La
búsqueda y la escala son estado local tipado y la obtención de datos se coordina desde su servicio
de estado.

## Azure DevOps

La publicación del proyecto y la sincronización de la épica principal tienen estados independientes
para evitar operaciones solapadas. Las credenciales y reglas de autorización pertenecen al backend;
el frontend envía únicamente los identificadores y opciones definidos por el contrato.

## Códigos de tipos de item de trabajo

Los campos `tipo` y `tipoEntidad`, y el parámetro de consulta `Tipo`, usan exclusivamente el código
técnico del catálogo. Los alias cortos y los nombres PascalCase no forman parte del contrato HTTP.

| Tipo                   | Código técnico                   |
| ---------------------- | -------------------------------- |
| Épica                  | `item_azure_epica`               |
| Característica         | `item_azure_caracteristica`      |
| Historia de usuario    | `item_azure_historia_usuario`    |
| Tarea                  | `item_azure_tarea`               |
| Lista de requisitos    | `item_azure_lista_requisitos`    |
| Actividad de requisito | `item_azure_actividad_requisito` |
| Tarea de requisito     | `item_azure_tarea_requisito`     |
| Actividad              | `item_azure_actividad`           |
| Requisito              | `item_azure_requisito`           |

El enum interno de presentación conserva identidades semánticas propias. El mapper de
planificación es el único responsable de traducirlas al enum DTO y de rechazar discriminadores
desconocidos recibidos desde el backend.

En `ObtenerBacklog`, épicas, características, historias y tareas incluyen el discriminador
`tipo`. Los nodos estructurales de requisitos (`listaRequisitos`, actividades y tareas de
requisito) no lo incluyen en la respuesta vigente: el mapper determina su identidad por la
posición tipada que ocupan dentro de la jerarquía.

## Pruebas y verificación

Los cambios en esta capacidad deben cubrir, según su alcance:

- adaptación DTO/modelo y agrupación;
- URL, método, parámetros, cuerpo y errores funcionales de los servicios HTTP;
- protección frente a respuestas obsoletas en servicios de estado;
- validación, bloqueo y normalización de formularios;
- composición y eventos relevantes de página y componentes.

Antes de integrar se ejecutan `npm run build`, `npm test -- --watch=false` y las búsquedas estáticas
definidas por la skill de desarrollo Angular.
