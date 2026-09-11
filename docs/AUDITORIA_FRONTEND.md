# Auditoría de cierre del frontend

Fecha de corte: 11 de septiembre de 2026.

## Alcance

La revisión cubre arquitectura Angular, contratos con backend, formularios, estados de interfaz,
accesibilidad, estilos, documentación, pruebas, compilación y dependencias del frontend.

La administración de usuarios queda expresamente fuera de este corte porque su implementación se
mantiene en otra rama. La sección Equipo sí conserva el contrato funcional del proyecto con
`perfilTecnicoId`; esto no agrega rutas, menús ni un CRUD de usuarios.

## Resultado por frente

| Frente | Estado | Evidencia o decisión |
| --- | --- | --- |
| Arquitectura | Conforme | Las capacidades permanecen separadas en `core`, `shared`, `layouts` y `features`; no se introdujeron dependencias hacia administración de usuarios. |
| Contrato de Equipo | Conforme | El perfil técnico usa el ID del catálogo remoto `identidad_perfil_tecnico`. La sincronización puede proponer el perfil del usuario, pero prevalece la asignación ya guardada en el proyecto. |
| Catálogos | Conforme | El servicio compartido admite catálogos de gestión e identidad sin duplicar clientes HTTP ni opciones locales. |
| Estados de interfaz | Conforme | Los errores de carga de página reemplazan encabezado y contenido; los errores locales permanecen dentro de su región y no se duplican con modales. |
| Navegación | Conforme | La selección de un proyecto reciente abre su ruta canónica de información. |
| Accesibilidad | Conforme | El editor de flujo permite operar tarjetas, conectores y conexiones con teclado; los estados de carga y error mantienen nombres accesibles válidos. |
| Sistema visual | Conforme | El Gantt usa tokens semánticos y las búsquedas no encontraron colores hexadecimales, fuentes locales, `!important` ni `::ng-deep` dentro de las capacidades. |
| Documentación | Conforme | README, Inicio y Creación reflejan las rutas, comandos, contratos y reglas vigentes. Las 655 declaraciones exportadas y los 668 miembros declarados `public` tienen JSDoc. |
| Pruebas directas | Conforme | Los 80 componentes, 32 servicios inyectables y 34 mappers tienen un archivo `*.spec.ts` asociado. |
| Regresión | Conforme | 159 archivos de prueba y 683 pruebas superadas. TypeScript de pruebas compila sin errores. |
| Dependencias de producción | Conforme | `npm audit --omit=dev` no reporta vulnerabilidades. |
| Dependencias de desarrollo | Conforme | `qs` se actualizó a 6.16.0 y `npm audit` no reporta vulnerabilidades. |

## Cambios de cierre aplicados

- Se eliminó el listado local de perfiles técnicos y se conectó Equipo al catálogo remoto.
- Se normalizó la serialización de Equipo con `perfilTecnicoId` y se validan IDs positivos al leer
  JSON externo.
- Se preserva el perfil del proyecto durante una sincronización; el guardado no actualiza el perfil
  global de un usuario existente.
- Se completaron pruebas directas que faltaban en Catálogos, Inicio y el editor de Flujo.
- Se corrigieron operación por teclado y semántica ARIA del editor de Flujo.
- Se unificó el error principal de Planificación con el patrón de página completa.
- Se agregaron comandos reproducibles para compilación de desarrollo, pruebas CI y verificación
  integral.

## Verificación reproducible

```powershell
npm run verify
npm audit
git diff --check
```

La compilación de producción termina correctamente, pero conserva una advertencia de presupuesto:
el paquete inicial pesa 524,16 kB frente al umbral de aviso de 500 kB. No se elevó el umbral para
ocultar el hallazgo. Debe abordarse con un trabajo de rendimiento que mida qué dependencias del
shell pueden cargarse de forma diferida.

## Trabajo posterior no bloqueante

- Incorporar un runner E2E y definir recorridos críticos antes de declarar una cobertura de
  navegador. Actualmente el proyecto no configura uno y el README lo indica expresamente.
- Establecer una línea base de cobertura y un límite en CI. La cobertura directa está completa, pero
  el repositorio aún no declara el proveedor de cobertura de Vitest.
- Reducir el paquete inicial por debajo del presupuesto mediante medición y carga diferida; no se
  debe resolver aumentando el límite sin una decisión de arquitectura documentada.
