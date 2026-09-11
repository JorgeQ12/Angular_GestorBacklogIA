# Frontend de InterIA

Aplicación Angular para crear, consultar y planificar proyectos, administrar catálogos y trabajar
con el asistente de IA de InterIA.

## Requisitos

- Node.js compatible con Angular 21.
- npm 11, según el campo `packageManager`.
- Backend disponible en la URL configurada por el environment correspondiente.

## Ejecución local

```powershell
npm install
npm start
```

La aplicación queda disponible en `http://localhost:4200/`. La API funcional y Kong se configuran
en `src/environments`; si la API local usa HTTPS, su certificado debe ser confiable para el
navegador.

## Verificación

```powershell
npm run build
npm run build:development
npm run test:ci
npm run verify
```

Las pruebas unitarias usan Vitest mediante el builder oficial de Angular. `npm test` conserva el
modo interactivo y `npm run test:ci` ejecuta la suite una sola vez. El proyecto todavía no declara
un runner E2E; no se debe usar `ng e2e` hasta incorporar esa infraestructura explícitamente.

## Documentación

El índice completo de arquitectura, integración, interfaz, formularios y dominios se encuentra en
[Convenciones del frontend](docs/CONVENCIONES_FRONTEND.md). Toda modificación debe leer además el
documento especializado de la capacidad afectada y actualizarlo cuando cambie una decisión
estable. El estado del cierre actual y los riesgos pendientes están en la
[auditoría del frontend](docs/AUDITORIA_FRONTEND.md).
