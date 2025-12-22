import { RowDataPacket } from "mysql2";

export interface Jaula{
    datos: Datos
    jaula: string
}

export interface Datos {
    activate: boolean,
    bloque: number,
    cc: number,
    consolidado: boolean,
    tipo: string
}

export interface DatosHub{
    hubName: string,
    cage: string
}


export interface LPN  {

    ORDER_TYPE: string
    DO: string,
    LPN_FACILITY_STATUS: number,
    RESERVA: string,
    JAULA: string,
    SKU?: string,
    TC_LPN_ID: string,
    ESTADO: string,
    PALLET_VIRTUAL?: string,
    CC_DESPACHA?:number,
    COD_ESTADODET?:number,
  }

export interface RESERROR {
    error: string,
    data: LPN[]

}

export interface Pallet extends RowDataPacket {
    id_pallet?: string,
    pallet: string,
    whse: number,
    id_estado?: number,
    jaulas_id_jaulas?: number
}

export interface Carton extends RowDataPacket {
    olpn: string,
    id_pallet: string,
    id_carga: number
}

export interface PropsPallet {
  isNew?: boolean;
  lpn?: string;
  lpnConsolidado?: string;
  whse?: string;
  state?: number;
  id_anden?: number | string;
  cage?: number;
  usuario: string;
}

export interface PropsSellos {
    sello1: string;
    sello2: string;
    OT: string;
    pallet: any;
    usuario: string;
    route: number;
}
export interface PropsCarga {
  palletRequest: string;
  pallet: any;
  anden: number;
  usuario: string;
  whse: number;
}



export interface TipoCarton {
    TC_LPN_ID: string;
    ORDER_TYPE:string,
    TIENDA: string
}


export interface Tienda {
    nombre_hub: string;
    store_number:number;
}