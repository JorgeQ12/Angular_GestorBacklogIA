# Inicio único del panel

Este documento registra cómo se compone el inicio del panel sin duplicar una página completa por
rol.

## Decisión principal

La aplicación mantiene una sola ruta de inicio:

```text
/panel/inicio
```

Los roles no seleccionan implementaciones diferentes del panel. Cuando el backend proporcione
permisos, estos controlarán la visibilidad de acciones y secciones dentro de la misma página. El
backend seguirá siendo responsable de filtrar los datos y autorizar cada operación.

Mientras `/me` proporcione únicamente el nombre del usuario, no se crean roles, permisos ni
matrices ficticias en el frontend. Todas las secciones migradas permanecen visibles.

## Organización

```text
features/inicio-panel/
├── components/
│   ├── borradores-recientes/
│   ├── estado-proyectos/
│   ├── indicadores-proyectos/
│   ├── proyectos-atencion/
│   └── proyectos-recientes/
├── config/
│   └── endpoints-inicio-panel.config.ts
├── mappers/
│   └── resumen-inicio-panel.mapper.ts
├── models/
│   ├── resumen-administrativo.dto.ts
│   └── resumen-inicio-panel.model.ts
├── services/
│   └── resumen-inicio-panel.service.ts
└── pages/
    └── pagina-inicio-panel/
```

- `PaginaInicioPanel` conecta la sesión, los datos y la navegación.
- Los componentes reciben contratos tipados y emiten las acciones seleccionadas.
- `EncabezadoPagina`, `ui-button` y `ui-card` proporcionan la presentación compartida.
- El CSS de la página organiza dos columnas independientes para evitar espacios verticales entre
  tarjetas de alturas diferentes y conserva un orden lineal en pantallas angostas.
- El servicio consulta `ObtenerResumenAdministrativo` mediante la URL definida por el environment.
- El mapper separa el DTO del backend del modelo consumido por los componentes.
- La continuación de un borrador abre
  `/panel/proyectos/creacion?proyectoId=<id>`; la página de Creación resuelve el paso alcanzado. El
  inicio no importa configuraciones ni mappers internos del recorrido.
- Los indicadores de avance consumen el contrato público de `features/proyectos/public-api.ts`.
- “Ver proyectos” abre `/panel/proyectos`; seleccionar un estado agrega el query param `estado` y
  deja que el listado resuelva su consulta.
- Los estados compartidos se consumen desde el contrato público de Proyectos y no se vuelven a
  declarar dentro de Inicio. El resumen administrativo representa `enBorrador`, `enProgreso`,
  `finalizados` y `cerrados`, alineados con el catálogo vigente del backend.
- `enBorrador` es la única fuente para el total de borradores; no se conserva un
  `totalBorradores` duplicado. Todos los indicadores y colecciones se derivan de una misma
  fotografía de proyectos activos para evitar conteos contradictorios.

## Integraciones pendientes

La migración conserva puntos explícitos para conectar posteriormente:

- Detalle de proyectos.

El resumen vacío solo actúa como valor inicial mientras el loader global cubre la solicitud. Una
falla presenta un estado de error y no se confunde con totales en cero.

## Evolución con permisos

Cuando `/me` exponga el contrato correspondiente:

1. Los permisos se tiparán en una capacidad transversal de autorización.
2. La navegación y los guards consumirán la misma fuente.
3. `PaginaInicioPanel` decidirá qué componentes componer mediante señales.
4. Los componentes presentacionales no conocerán roles ni permisos.
5. El backend entregará únicamente datos autorizados para el usuario.

Solo se justificará otra página cuando exista una experiencia funcional sustancialmente diferente,
no por el nombre de un rol.
