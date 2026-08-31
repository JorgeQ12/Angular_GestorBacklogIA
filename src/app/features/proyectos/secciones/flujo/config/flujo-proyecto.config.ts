import type { NombreIconoAplicacion } from '../../../../../shared/components/icono/iconos-aplicacion';
import { MensajesFormulario } from '../../../../../shared/forms/errores-validacion';
import { CampoFormularioNodoFlujo } from '../models/formulario-nodo-flujo-proyecto.model';
import { TipoBloqueFlujo } from '../models/flujo-proyecto.model';

/** Relaciona los tipos funcionales del lienzo con la iconografía compartida. */
export const ICONOS_TIPO_BLOQUE_FLUJO = {
  [TipoBloqueFlujo.Modulo]: 'proyectos',
  [TipoBloqueFlujo.Pagina]: 'aplicacionWeb',
  [TipoBloqueFlujo.Accion]: 'continuar',
  [TipoBloqueFlujo.Decision]: 'flujo',
  [TipoBloqueFlujo.Componente]: 'contextoProyecto',
} as const satisfies Record<TipoBloqueFlujo, NombreIconoAplicacion>;

/** Proporciona el nombre visible correspondiente a cada tipo de bloque. */
export const ETIQUETAS_TIPO_BLOQUE_FLUJO: Record<TipoBloqueFlujo, string> = {
  [TipoBloqueFlujo.Modulo]: 'Módulo',
  [TipoBloqueFlujo.Pagina]: 'Página',
  [TipoBloqueFlujo.Accion]: 'Acción',
  [TipoBloqueFlujo.Decision]: 'Decisión',
  [TipoBloqueFlujo.Componente]: 'Componente',
};

/** Explica el propósito funcional de cada tipo de bloque. */
export const DESCRIPCIONES_TIPO_BLOQUE_FLUJO: Record<TipoBloqueFlujo, string> = {
  [TipoBloqueFlujo.Modulo]: 'Agrupa una capacidad funcional del proyecto.',
  [TipoBloqueFlujo.Pagina]: 'Representa una página que el usuario utiliza.',
  [TipoBloqueFlujo.Accion]: 'Describe una acción que el usuario ejecuta.',
  [TipoBloqueFlujo.Decision]: 'Expresa una bifurcación por criterio de negocio.',
  [TipoBloqueFlujo.Componente]:
    'Representa un componente que captura o presenta información dentro del flujo.',
};

/** Establece el orden de presentación de los tipos disponibles en la paleta. */
export const TIPOS_BLOQUE_FLUJO_DISPONIBLES = [
  TipoBloqueFlujo.Modulo,
  TipoBloqueFlujo.Pagina,
  TipoBloqueFlujo.Componente,
  TipoBloqueFlujo.Accion,
  TipoBloqueFlujo.Decision,
] as const satisfies readonly TipoBloqueFlujo[];

/** Proporciona mensajes de validación propios del editor de nodos. */
export const MENSAJES_FORMULARIO_NODO_FLUJO = {
  titulo: { required: 'El nombre del bloque es obligatorio.' },
  descripcion: { required: 'La descripción del bloque es obligatoria.' },
  criteriosAceptacion: { required: 'Escribe un criterio válido o elimina esta fila.' },
  nombresRoles: { required: 'Selecciona al menos un rol para el bloque.' },
  usuariosConcurrentes: {
    required: 'Los usuarios concurrentes proyectados son obligatorios.',
  },
  datosCapturados: { required: 'La información que captura el componente es obligatoria.' },
  camposObligatorios: { required: 'Describe los campos obligatorios del componente.' },
  resultadoCompletado: { required: 'El resultado al completarse es obligatorio.' },
} satisfies MensajesFormulario<CampoFormularioNodoFlujo>;
