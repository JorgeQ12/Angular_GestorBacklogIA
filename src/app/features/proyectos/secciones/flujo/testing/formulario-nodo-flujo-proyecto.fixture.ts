import { FormArray, FormControl, FormGroup } from '@angular/forms';
import {
  ControlesFranjaActividadModulo,
  ControlesFormularioNodoFlujo,
  FormularioNodoFlujoProyecto,
} from '../models/formulario-nodo-flujo-proyecto.model';

/** Construye el formulario completo requerido por los componentes del editor en pruebas. */
export function crearFormularioNodoFlujoPrueba(): FormularioNodoFlujoProyecto {
  return new FormGroup<ControlesFormularioNodoFlujo>({
    titulo: new FormControl('', { nonNullable: true }),
    descripcion: new FormControl('', { nonNullable: true }),
    criteriosAceptacion: new FormArray([new FormControl('', { nonNullable: true })]),
    nombresRoles: new FormControl('', { nonNullable: true }),
    permisosRoles: new FormControl([], { nonNullable: true }),
    usuariosConcurrentes: new FormControl('', { nonNullable: true }),
    horariosMayorActividad: new FormArray([
      new FormGroup<ControlesFranjaActividadModulo>({
        dias: new FormControl([], { nonNullable: true }),
        horaInicio: new FormControl('08:00', { nonNullable: true }),
        horaFin: new FormControl('17:00', { nonNullable: true }),
      }),
    ]),
    datosCapturados: new FormControl('', { nonNullable: true }),
    camposObligatorios: new FormControl('', { nonNullable: true }),
    resultadoCompletado: new FormControl('', { nonNullable: true }),
  });
}
