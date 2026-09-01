import {
  FlujoProyecto,
  NodoFlujoProyecto,
  RolFlujoProyecto,
  TipoBloqueFlujo,
} from '../../secciones/flujo/models/flujo-proyecto.model';
import { RolesProyecto } from '../../secciones/roles/models/roles-proyecto.model';

/**
 * Incorpora al editor los roles definidos previamente y conserva sus identidades ya persistidas.
 */
export function sincronizarRolesDelFlujo(
  flujo: FlujoProyecto,
  rolesProyecto: RolesProyecto,
  fechaCreacion: string,
): FlujoProyecto {
  const rolesExistentes = new Map(
    flujo.roles.map((rol) => [normalizarNombreRol(rol.nombre), rol] as const),
  );
  const idsOcupados = new Set(flujo.roles.map((rol) => rol.id));
  const nombresAgregados = new Set<string>();
  const roles: RolFlujoProyecto[] = [];

  for (const rolProyecto of rolesProyecto.roles) {
    const nombre = rolProyecto.nombre.trim();
    const nombreNormalizado = normalizarNombreRol(nombre);
    if (!nombreNormalizado || nombresAgregados.has(nombreNormalizado)) continue;

    const rolExistente = rolesExistentes.get(nombreNormalizado);
    const rol = rolExistente
      ? { ...rolExistente, nombre }
      : {
          id: crearIdRol(nombreNormalizado, idsOcupados),
          nombre,
          fechaCreacion,
        };

    nombresAgregados.add(nombreNormalizado);
    idsOcupados.add(rol.id);
    roles.push(rol);
  }

  const idsRolesVigentes = new Set(roles.map((rol) => rol.id));
  return {
    ...flujo,
    roles,
    nodos: flujo.nodos.map((nodo) => sincronizarAsignacionesNodo(nodo, idsRolesVigentes)),
  };
}

function sincronizarAsignacionesNodo(
  nodo: NodoFlujoProyecto,
  idsRolesVigentes: ReadonlySet<string>,
): NodoFlujoProyecto {
  const idsRoles = nodo.idsRoles.filter((idRol) => idsRolesVigentes.has(idRol));
  if (nodo.tipo !== TipoBloqueFlujo.Modulo) return { ...nodo, idsRoles };

  return {
    ...nodo,
    idsRoles,
    datos: {
      ...nodo.datos,
      permisosRoles: nodo.datos.permisosRoles.filter((permiso) =>
        idsRolesVigentes.has(permiso.idRol),
      ),
    },
  };
}

function crearIdRol(nombreNormalizado: string, idsOcupados: ReadonlySet<string>): string {
  const base = `rol-proyecto-${calcularHash(nombreNormalizado)}`;
  let id = base;
  let sufijo = 2;

  while (idsOcupados.has(id)) {
    id = `${base}-${sufijo}`;
    sufijo += 1;
  }

  return id;
}

function calcularHash(valor: string): string {
  let hash = 2166136261;
  for (const caracter of valor) {
    hash ^= caracter.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function normalizarNombreRol(nombre: string): string {
  return nombre.trim().toLocaleLowerCase('es');
}
