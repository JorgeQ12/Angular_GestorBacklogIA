# Integración con el backend

Este documento define cómo conectar una feature con el backend sin acoplar sus componentes al
transporte HTTP ni al entorno de despliegue.

## Configuración por entorno

La autenticación y la API de negocio mantienen direcciones independientes:

```ts
export const environment = {
  production: false,
  kongUrl: 'https://konge-dev.interrapidisimo.co',
  apiBaseUrl: 'http://<host-backend>:<puerto>/api',
} as const;
```

- `kongUrl` resuelve login, sesión y logout.
- `apiBaseUrl` resuelve los endpoints funcionales.
- `npm start` utiliza explícitamente `environment.development.ts` y apunta al backend de pruebas.
- El build de producción utiliza `environment.ts`; su dirección puede mantenerse directa de forma
  temporal hasta definir la ruta definitiva en Kong.
- Ningún componente o servicio declara dominios directamente.

Si el backend local utiliza HTTPS, su certificado debe estar registrado como confiable:

```powershell
dotnet dev-certs https --trust
```

Una aplicación publicada mediante HTTPS no debe consumir una API HTTP porque el navegador
bloqueará la solicitud como contenido mixto.

## Flujo de una integración

```text
environment
    → configuración de endpoints
    → servicio HTTP de la feature
    → ResultadoApi<Dto>
    → mapper
    → modelo de interfaz
    → página
    → componentes presentacionales
```

Responsabilidades:

- `core/http/models` contiene el sobre transversal `ResultadoApi<T>`.
- `config` centraliza las rutas de la feature.
- El DTO refleja exactamente nombres, nulabilidad y estructura del backend.
- El mapper adapta el DTO sin permitir que el contrato HTTP llegue a la vista.
- El servicio consulta, valida el resultado y entrega un modelo de interfaz.
- La página coordina carga, error, reintento, sesión y navegación.
- Los componentes reciben datos y emiten acciones; no conocen `HttpClient` ni environments.

No se crea un `BaseApiService` ni un interceptor que desenvuelva automáticamente las respuestas.
Cada servicio conserva el contrato explícito de sus operaciones.

## Catálogos remotos

Los valores administrados por el backend no se replican como listas estáticas en las features.

- `core/catalogos` centraliza endpoint, DTO, mapper y servicio de consulta.
- La feature solicita el tipo mediante su nombre estable cuando el backend lo permite.
- El control trabaja con el ID del valor y usa el nombre únicamente para presentación.
- Los valores inactivos no se ofrecen en formularios nuevos.
- No se queman IDs de tipos o valores provenientes de semillas de base de datos.

## Borradores y concurrencia

Cuando una actualización exige la fotografía completa del borrador, el estado del flujo conserva
los campos todavía no editados y el mapper reemplaza únicamente la sección vigente. No se envían
objetos parciales si el endpoint no los admite.

- La revisión se toma de la última respuesta confirmada por el backend.
- Cada guardado exitoso reemplaza la fotografía y su revisión en el estado local.
- Un conflicto de revisión no se reintenta automáticamente ni sobrescribe información externa.
- El estado del recorrido se limita al inyector de su página contenedora; no se convierte en estado
  global de toda la aplicación.

### JSON internos de secciones

Cuando el backend conserva una sección como JSON, frontend y backend acuerdan una única estructura
canónica con nombres en español. El mapper de la sección es el único responsable de serializar y
deserializar ese contenido.

- No se aceptan aliases antiguos en inglés dentro del flujo normal.
- El servicio HTTP recibe modelos de dominio y no cadenas JSON construidas por la página.
- Las pruebas verifican tanto el contrato canónico como el rechazo de claves ajenas.
- Los registros históricos se corrigen mediante una migración de datos versionada en el backend;
  la compatibilidad temporal no se distribuye entre formularios y componentes.

## Resultado de la API

El backend responde mediante el contrato común:

```ts
interface ResultadoApi<T> {
  exitoso: boolean;
  tipo: number;
  datos: T | null;
  mensaje: string | null;
  codigoError: string | null;
  errores: readonly string[] | null;
}
```

Una respuesta HTTP correcta con `exitoso: false` también representa un error funcional. El servicio
debe rechazarla y la página debe diferenciarla de una colección vacía válida.

`core/http/mappers/resultado-api.mapper.ts` concentra la exigencia de datos para las operaciones
que requieren una respuesta funcional. Conserva `0`, `false` y cadenas vacías como datos válidos,
prioriza los errores o el mensaje enviados por el backend y recibe el nombre del recurso para el
mensaje de respaldo. Los servicios deciden cuándo usarla; no se desenvuelve el sobre mediante un
interceptor ni se considera que `datos: null` sea inválido para todas las operaciones.

## Carga y errores

- El interceptor de carga global cubre automáticamente las solicitudes HTTP.
- Las páginas no agregan textos o loaders locales para la misma petición.
- Una falla no se convierte en contadores en cero ni en estados vacíos engañosos.
- La página utiliza `EstadoError`, permite reintentar y oculta el contenido que depende de la
  consulta. Un shell estable puede conservar su encabezado; un encabezado derivado de la respuesta
  también debe ocultarse.
- Los detalles técnicos del backend no se muestran directamente al usuario.

## Pruebas

Cada integración incluye:

1. Prueba del mapper con un DTO representativo.
2. Prueba del servicio con `HttpTestingController` para URL, método y errores funcionales.
3. Prueba de la página con el servicio sustituido, sin depender del backend real.
4. Compilación de producción y desarrollo para verificar ambos environments.

## Migración futura a Kong

Cuando la API de negocio se publique en Kong, se modifica únicamente `apiBaseUrl`. Los endpoints,
servicios, mappers, páginas y componentes permanecen iguales. Si la URL queda bajo `kongUrl`, el
interceptor de credenciales existente incluirá automáticamente la cookie de sesión.

## Checklist para nuevas features

1. Registrar la base URL únicamente en el environment.
2. Declarar endpoints en la configuración de la feature.
3. Tipar el sobre y el DTO real, incluida su nulabilidad.
4. Crear el modelo que necesita la interfaz.
5. Mapear DTO a modelo explícitamente.
6. Encapsular HTTP en un servicio de la feature.
7. Diferenciar error, vacío y datos disponibles.
8. Probar mapper, servicio y página.
