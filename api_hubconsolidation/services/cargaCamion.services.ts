import axios from "axios";
import { Tienda, TipoCarton } from "../interfaces/hub.interface";
import { selectData } from "./extractData.services";
import { URLservicesProvider } from "../configs/configs";
import { logger } from "../utils/logger";



export const validatePedStore = async(store: string): Promise<Tienda[]> =>{
    let query = `select store_number, nombre_hub from ped_store inner join hub h on ped_store.id_hub = h.id_hub where store_number=?`;
    let response = await selectData(query, [store]);
    if(response.length === 0) throw new Error("NO SE PUDO CARGAR EL PALLET. TIENDA NO ESTA CONFIGURADA AL FLUJO HUB PED, FAVOR CONTACTAR A DESARROLLO DE SER NECESARIO");
    return response;
}


export const getHubAnden = async(anden: string) =>{
    let selectHubquery =`select nombre_hub, anden
    from pallet p
             inner join anden a on p.id_anden = a.id_anden
             inner join jaula j on p.id_jaula = j.id_jaula
            inner join hub h on j.id_hub = h.id_hub where p.id_estado=3 and nombre_hub<>'PED' and anden=? order by id_pallet desc limit 1`;
    let response = selectData(selectHubquery, [anden]);
    return response;
}

export const getDataAnden =async(anden: any, whse: number)=>{
    if(whse==1902) whse=25; 
    const query = `SELECT t.*, a.anden
    FROM trazabilidad_hub.destino t join anden a on a.id_anden = t.id_anden
    where active=1 and a.anden=? and a.whse=?
    LIMIT 501`;
    let response = selectData(query, [anden, whse]);
    return response;
}

export const getTypeWC= (pallet: string) : Promise<TipoCarton[]>=> {


    return new Promise((resolve, reject) => {

        let data = {
            "lpn": pallet
        }

        logger.debug(data);

        let config = {
            method: 'GET',
            url: `${URLservicesProvider.venv}:3052/getTypeWC`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };
        axios(config)
            .then(function (response) {
                JSON.stringify(response.data);
                resolve(response.data);

            })
            .catch(function (error) {
                reject(error)

            });

    })
}

export const getTypeBC= (pallet: string) : Promise<TipoCarton[]> => {


    return new Promise((resolve, reject) => {

        let data = {
            "lpn": pallet
        }

        logger.debug(data);

        let config = {
            method: 'GET',
            url: `${URLservicesProvider.venv}:3052/getTypeBC`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };
        axios(config)
            .then(function (response) {
                JSON.stringify(response.data);
                resolve(response.data);

            })
            .catch(function (error) {
                reject(error)

            });

    })
}
export const saveNewConsolidation = (
  pallet: string,
  id: any,
  hub: string,
  anden: number,
  usuario: string,
  whse: string
) => {
  return new Promise((resolve, reject) => {
    let data = {
      pallet_virtual: pallet,
      id: id[0].NUEVO_ID,
      hub: hub,
      anden: anden,
      usuario_anden: usuario,
      cc: whse,
    };

    logger.debug(data);

    let config = {
      method: "PUT",
      url: "${}:3052/saveNewConsolidation",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };
    axios(config)
      .then(function (response) {
        JSON.stringify(response.data);
        resolve(response.data);
      })
      .catch(function (error) {
        reject(error);
      });
  });
};


export const getTypeTemplate= (pallet: string): Promise<TipoCarton[]> => {


    return new Promise((resolve, reject) => {

        let data = {
            "lpn": pallet
        }

        logger.debug(data);

        let config = {
            method: 'GET',
            url: `${URLservicesProvider.venv}:3052/getTypeTemplate`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };
        axios(config)
            .then(function (response) {
                logger.debug(response.data);
                resolve(response.data);

            })
            .catch(function (error) {
                reject(error)

            });

    })
}
export const getType= (pallet: string): Promise<TipoCarton[]> => {


    return new Promise((resolve, reject) => {

        let data = {
            "lpn": pallet
        }

        logger.debug(data);

        let config = {
            method: 'GET',
            url: `${URLservicesProvider.venv}:3052/getType`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };
        axios(config)
            .then(function (response) {
                logger.debug(response.data);
                resolve(response.data);

            })
            .catch(function (error) {
                reject(error)

            });

    })
}
export const getPalletVirtualMax = (whse: string) => {
    return new Promise((resolve, reject) => {
        let data = {
            "whse": whse
        }
        logger.debug(data);

        logger.debug("ingreso la funcion para obtener el maximo del pallet virtual");

        const config = {
            method: 'GET',
            url: `${URLservicesProvider.venv}:3052/getPalletVirtualMax`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };
        axios(config)
            .then(function (response) {
                JSON.stringify(response.data);
                resolve(response.data);

            })
            .catch(function (error) {
                reject(error)

            });

    })
}


export const sendMail = (ot: number, origin: number) : Promise<TipoCarton[]> => {


    return new Promise((resolve, reject) => {

        let data = {
            ot, origin
        }

        logger.debug(data);

        let config = {
            method: 'POST',
            url: `${URLservicesProvider.venv}:3052/sendReportCharged`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };
        axios(config)
            .then(function (response) {
                JSON.stringify(response.data);
                resolve(response.data);

            })
            .catch(function (error) {
                reject(error)

            });

    })
}


