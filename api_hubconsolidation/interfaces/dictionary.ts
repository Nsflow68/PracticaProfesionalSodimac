export class FinalMessage {
  static incomeSuccessful: string = "El LPN SE INGRESO CON EXITO";
  static incomeCreated: string =
    "El LPN SE INGRESO CON EXITO Y SE CREO EL PALLET VIRTUAL";
  static errornowmos: string = "LPN no figura en wmos";
  static inconguenciaEtiqueta: string =
    "LA ETIQUETA DE PALLET NO CORRESPONDE SEGUN LPN INGRESADO";
  static congurnciaEtiqueta: string =
    "LA ETIQUETA DE PALLET ES CORRECTA SEGUN LPN INGRESADO";
  static errorValidacion: string =
    "UPS! OCURRIO UN INCONVENIENTE, NO CAMBIO DE ESTADO EL PALLET";
  static locationDistinct: string =
    "NO ES POSIBLE ASOCIAR EL PALLET A LA UBICACION, ES UN HUB DIFERENTE";
  static locationsucces: string = "El PALLET SE ASOCIO A UNA UBICACION";
  static locationDontExist: string =   "LA UBICACION NO ES VALIDA, NO EXISTE EN WMOS";
  static locationError: string =
    "UPS! OCURRIO UN INCONVENIENTE, EL PALLET NO QUEDO ASOCIADO A LA UBICACION";
  static cargaMessage: string = "Pallet cargado correctamente!";
}

export const palletStatus = {

    procesando: 1,
    consolidado: 2,
    cargado_camion: 3,
    despachado: 4
}

export const statusCarga = {
    transito:1,
    recepcionado:2,
    despachado:3
};