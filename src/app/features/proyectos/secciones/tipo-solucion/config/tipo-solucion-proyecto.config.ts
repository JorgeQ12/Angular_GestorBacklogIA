import { OpcionSelectorTarjeta } from '../../../../../shared/forms/controles/selector-tarjetas/models/opcion-selector-tarjeta.model';
import { MensajesFormulario } from '../../../../../shared/forms/errores-validacion';
import { CampoTipoSolucionProyecto } from '../models/formulario-tipo-solucion-proyecto.model';

/** Presenta las alternativas disponibles para el canal de interacción. */
export const OPCIONES_INTERFAZ_SOLUCION = [
  {
    valor: true,
    etiqueta: 'Con interfaz',
    descripcion: 'Las personas interactuarán con pantallas durante el uso de la solución.',
    icono: 'aplicacionWeb',
  },
  {
    valor: false,
    etiqueta: 'Sin interfaz',
    descripcion: 'Funcionará como servicio, integración o automatización sin pantallas.',
    icono: 'tipoSinInterfaz',
  },
] as const satisfies readonly OpcionSelectorTarjeta[];

/** Presenta las plataformas principales disponibles para soluciones con interfaz. */
export const OPCIONES_PLATAFORMA_SOLUCION = [
  {
    valor: 'Web',
    etiqueta: 'Web',
    categoria: 'Navegador',
    descripcion: 'Disponible desde distintos equipos sin instalación local.',
    icono: 'aplicacionWeb',
  },
  {
    valor: 'Escritorio',
    etiqueta: 'Escritorio',
    categoria: 'Operación interna',
    descripcion: 'Orientada a puestos fijos o entornos de trabajo controlados.',
    icono: 'aplicacionEscritorio',
  },
  {
    valor: 'Móvil',
    etiqueta: 'Móvil',
    categoria: 'Trabajo en campo',
    descripcion: 'Pensada para consultar o capturar información desde celulares.',
    icono: 'aplicacionMovil',
  },
] as const satisfies readonly OpcionSelectorTarjeta[];

/** Proporciona mensajes propios del lenguaje de Tipo de solución. */
export const MENSAJES_TIPO_SOLUCION_PROYECTO = {
  tieneInterfaz: {
    required: 'Debes indicar si la solución tendrá interfaz.',
  },
  plataforma: {
    required: 'Debes seleccionar la plataforma principal.',
  },
} satisfies MensajesFormulario<CampoTipoSolucionProyecto>;
