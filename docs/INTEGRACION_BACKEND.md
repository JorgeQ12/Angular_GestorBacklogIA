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

## Carga y errores

- El interceptor de carga global cubre automáticamente las solicitudes HTTP.
- Las páginas no agregan textos o loaders locales para la misma petición.
- Una falla no se convierte en contadores en cero ni en estados vacíos engañosos.
- La página utiliza `EstadoError`, permite reintentar y oculta el contenido que depende de la
  consulta, incluido su encabezado.
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
