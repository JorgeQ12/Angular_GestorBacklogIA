import { FormControl, FormGroup } from '@angular/forms';

/** Describe los valores editables antes de validar la vinculación. */
export interface ValoresFormularioVinculacionAzure {
  urlBoard: string;
  idEpica: number | null;
  idEquipo: string;
}

/** Deriva los controles estrictamente tipados desde los valores del formulario. */
export type ControlesFormularioVinculacionAzure = {
  [TCampo in keyof ValoresFormularioVinculacionAzure]: FormControl<
    ValoresFormularioVinculacionAzure[TCampo]
  >;
};

/** Representa el formulario reactivo utilizado para consultar Azure. */
export type FormularioVinculacionAzureTipado = FormGroup<ControlesFormularioVinculacionAzure>;

/** Limita los nombres disponibles al configurar mensajes particulares. */
export type CampoFormularioVinculacionAzure = keyof ControlesFormularioVinculacionAzure;
