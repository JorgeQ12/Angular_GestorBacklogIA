# Asistente IA

Este documento define la capacidad de acompañamiento mediante IA durante la creación de un
proyecto. El nombre visible es **Asistente IA** y su código pertenece a
`features/inteligencia-artificial`; no se modela como un subdominio de Proyectos ni como un
asistente diferente por paso.

## Experiencia

El asistente se presenta como un botón flotante a partir de Necesidad de negocio. El avance
persistido gobierna su visibilidad, por lo que continúa disponible si el usuario vuelve a una
sección anterior después de haber alcanzado Necesidad.

- El botón utiliza `public/brand/logo.svg` como identidad de la aplicación y la insignia semántica
  `asistenteIA` del catálogo central de iconos.
- El acceso cerrado es un círculo monocromático que combina el logo con la insignia semántica de
  IA. Conserva un nombre accesible, muestra una etiqueta al interactuar y utiliza movimiento sutil
  con pausas amplias; si el usuario reduce el movimiento, las animaciones se desactivan. Se ubica
  en la esquina inferior y, al abrir el panel, desaparece para liberar esa región. El cierre
  permanece en el encabezado y restaura el foco al acceso.
- El panel es no modal: no oscurece ni bloquea el formulario y conserva el contexto de la sección
  activa.
- `Escape` cierra el panel y devuelve el foco al botón flotante.
- En móvil ocupa casi toda la ventana disponible; en escritorio mantiene un ancho de conversación.
- La conversación es única por proyecto y no se reinicia al cambiar de paso.
- Las respuestas pueden orientar, hacer preguntas o presentar una propuesta. El modelo nunca
  aplica directamente un cambio.

## Límite entre IA y Proyectos

`AsistenteIAFlotante` recibe solamente `ContextoAsistenteIA`:

```ts
interface ContextoAsistenteIA {
  proyectoId: number;
  revisionContexto: number;
  seccionActiva: string;
  nombreSeccion: string;
}
```

La capacidad IA no importa modelos, mappers ni formularios de Proyectos. La página de creación,
como anfitriona, traduce su paso vigente a ese contrato genérico. Después de aplicar una propuesta
emite `contextoActualizado` con el identificador del proyecto que originó la operación; la página
solo acepta el evento si ese proyecto continúa activo y recarga el borrador mediante
`EstadoCreacionProyectoService` y los formularios se hidratan desde la fotografía confirmada por
el backend.

```text
PaginaCreacionProyecto
  └─ ContextoAsistenteIA
       └─ AsistenteIAFlotante
            ├─ EstadoAsistenteIAService
            ├─ AsistenteIAApiService
            └─ PanelAsistenteIA (presentacional)
```

El estado de IA se proporciona en el inyector de la ruta de creación. Mantiene historial, carga,
envío y resolución de propuestas durante la vida de esa ruta, sin convertirse en estado global.
Cuando cambia el proyecto de la ruta, cancela la carga y las operaciones pendientes, limpia los
estados transitorios y descarta cualquier respuesta tardía del proyecto anterior.

## Persistencia y contratos HTTP

El backend reutiliza `ConversacionChat`, asociada uno a uno con la `ProyectoVersion` borrador. La
conversación se crea de forma perezosa al enviar la primera interacción; no se agrega una tabla de
conversaciones paralela. `MensajeChat` conserva la sección y revisión usadas como contexto y, para
mensajes del asistente, puede guardar una propuesta con estado `Pendiente`, `Aplicada` o
`Rechazada`.

Las operaciones viven bajo `/api/GeneracionIA/Asistente`:

| Operación | Método | Responsabilidad |
|---|---|---|
| `ObtenerConversacion` | GET | Recuperar el historial del borrador asociado al proyecto. |
| `EnviarMensaje` | POST | Construir contexto, consultar el modelo y persistir ambos mensajes. |
| `AplicarPropuesta` | POST | Validar revisión, actualizar una sección y marcar la propuesta. |
| `RechazarPropuesta` | POST | Marcar explícitamente que la propuesta no se utilizará. |

Todas las respuestas conservan `ResultadoApi<T>`. El frontend utiliza DTO, mapper y modelos
separados y no expone el JSON técnico directamente en el panel.
Los roles y estados recibidos se validan de forma exhaustiva; un valor externo desconocido produce
un error de integración y nunca se convierte implícitamente en una propuesta pendiente.
La respuesta de aplicar o rechazar también debe identificar el mismo proyecto que originó la
solicitud antes de modificar el historial local o pedir una recarga del borrador.

## Propuestas seguras

La primera versión permite propuestas aplicables únicamente para secciones narrativas con un
contrato canónico estable:

- `necesidad`: `situacionActual`, `problemas`, `impacto`.
- `objetivos`: `objetivoGeneral`, `objetivosEspecificos`.
- `alcance`: `incluido`, `excluido`.
- `roles`: colección de `nombre` y `descripcion`.

En Equipo, Flujo y cualquier otra sección el asistente puede orientar, pero la respuesta
estructurada debe devolver la propuesta en `null`. Ampliar esta lista exige definir primero un
contrato de aplicación seguro para la sección; no se acepta JSON arbitrario del modelo.

Antes de persistir una propuesta, el backend comprueba la sección y normaliza el JSON a su contrato
canónico. Al aplicarla vuelve a validar:

1. que el mensaje pertenece a la conversación del borrador;
2. que la propuesta continúa pendiente;
3. que la revisión del mensaje, la enviada por el cliente y la vigente coinciden;
4. que el contenido aún cumple el contrato de la sección.

La actualización reemplaza solamente la sección propuesta, conserva las demás propiedades del
borrador, incrementa `RevisionEdicion` y cambia el estado de la propuesta dentro de la misma
transacción.

## Contexto del modelo y seguridad

`AsistenteIAProyectoPrompt.md` es la instrucción estable del sistema. La aplicación entrega una fotografía
autoritativa del borrador, la sección activa, la revisión y un máximo de doce mensajes recientes.
Proyecto, historial y mensaje se serializan como datos no confiables; el prompt prohíbe seguir
instrucciones incrustadas que intenten reemplazar las reglas o revelar configuración interna.

No se envían secretos, PAT de Azure, credenciales ni configuración del proveedor. La conversación
completa permanece en SQL Server; el límite de historial enviado al modelo controla el tamaño de
contexto sin perder la trazabilidad persistida.

## Carga, error y accesibilidad

Las solicitudes del asistente usan `OMITIR_CARGA_GLOBAL` porque son operaciones largas con estado
local y no deben bloquear el formulario. El panel presenta carga inicial, mensaje pendiente y
propuesta en proceso. Los fallos se normalizan con `NotificadorErroresApiService` y los conflictos
de revisión no se reintentan ni sobrescriben automáticamente.

El panel usa un formulario reactivo tipado, límite de 4000 caracteres, región viva para nuevos
mensajes, etiquetas accesibles y botones nativos. La API del formulario deshabilita el compositor
durante carga, error, envío o resolución de propuestas, y la función de envío verifica las mismas
precondiciones para cubrir clic, submit y teclado. `Enter` envía el mensaje, `Shift + Enter` agrega
una nueva línea y el compositor se limpia al aceptar el envío porque el turno ya se representa
como pendiente en el historial. La propuesta requiere los botones visibles Aplicar o Rechazar;
cerrar el panel nunca resuelve una propuesta.

## Verificación

- Probar el interceptor con solicitudes ordinarias y con exclusión local.
- Probar URL, método, body y mapeo del servicio HTTP de IA.
- Probar envío, error funcional, aplicación, rechazo y exclusión explícita de carga global.
- Probar envío del formulario, bloqueo remoto, teclado y confirmación explícita de propuestas.
- Probar el estado ante error, reintento, operaciones superpuestas, respuestas tardías y cambio de
  proyecto.
- Probar visibilidad desde Necesidad y recarga exclusiva del borrador que aplicó la propuesta.
- Compilar frontend y backend y validar la migración de EF Core.
