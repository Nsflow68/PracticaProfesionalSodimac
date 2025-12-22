import { URLservicesProvider } from "../configs/configs";
import { logger } from "../utils/logger";
import { helpWhseByBodega } from "../helpers";
import { DatosHub, Jaula, LPN, PropsPallet, RESERROR } from "../interfaces/hub.interface";
import { selectData } from "./extractData.services";
import { createNewPallet, searchPalletVirtual } from "./pallet.services";

const axios = require("axios");



export const lpn_detail = async (lpn1: string, lpn2: string, whse: number) => {
  try {
    
    let selectOlpnQuery = `select pallet, olpn from pallet p inner join carton c on p.id_pallet = c.id_pallet where olpn in (?, ?)`;
    const response: any = await selectData(selectOlpnQuery, [lpn1, lpn2]);
    if (response.length === 0) return true;
    if (response.length===2) throw new Error(`LPNs ya consolidados en la paleta ${response[0].pallet}`)
    
   if(response.length===1) {
    if(lpn1 === lpn2){
      throw new Error(`LPN ya esta palletizado como ${response[0].pallet}`)
    }  
    return false
  };
   
  } catch (error: any) {
    logger.error(error);
    throw new Error(error.message);
  }
};

export const search_last_correlative = async (propsPallet: PropsPallet): Promise<string> => {
  try {
    const { isNew } = propsPallet;
    const palletVirtual = isNew
      ? await createNewPallet(propsPallet)
      : await searchPalletVirtual(propsPallet);

    if (!palletVirtual) throw new Error("No se obtuvo el pallet virtual");
    return palletVirtual;
  } catch (error: any) {
    logger.error("Error en search_last_correlative:", error);
    throw new Error(error?.message || "Error interno en search_last_correlative");
  }
};

export const hub_by_lpn = (lpn: string, whse: number) => {
  return new Promise<DatosHub>((resolve, reject) => {
    let cage: string;
    getEstadoLPN(lpn, whse)
      .then((res: any) => {
        cage = res[0].JAULA;
        return hub_by_jaula(res[0].JAULA);
      })
      .then((res: Jaula[]) => {
        resolve({
          hubName: res[0].datos.tipo,
          cage,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const hub_by_jaula = (jaula: number) => {
  return new Promise<Jaula[]>((resolve, reject) => {
    let config = {
      method: "GET",
      url: `http://10.115.43.27:3099/jaulas?jaulas=${jaula}`,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    };

    axios(config)
      .then(function ({data}: any) {
        resolve(data);
      })
      .catch(function (error: Error) {
        logger.error(error);
        reject(error);
      });
  });
};

export const getEstadoLPN = (lpn: string, whse: number, authHeader?: string) => {
  return new Promise<LPN[]>((resolve, reject) => {
    const normalizedWhse = String(whse ?? "").trim();
    if (!normalizedWhse) {
      return reject(new Error("El valor de whse es obligatorio"));
    }

    let data = {
      lpn: lpn,
      whse: normalizedWhse,
    };

    let config = {
      method: "GET",
      url: `${URLservicesProvider.venv}:3052/getEstadoLPN`,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      data: data,
    };
    logger.debug("getEstadoLPN request", {
      url: config.url,
      data: config.data,
      headersSent: {
        hasAuth: Boolean(authHeader),
        accept: config.headers["Accept"],
        contentType: config.headers["Content-Type"],
      },
    });
    axios(config)
      .then(function (response: any) {
        if(response.data){
          JSON.stringify(response.data);
        resolve(response.data);
        }
      
      })
      .catch(function (error: Error) {
        reject(error);
      });
  });
};

const setJaulaValidator = async(lpnAlone: LPN[], whse:number) =>{
  const bodega:string = await helpWhseByBodega(whse)
  let queryJaula = `select j.num_jaula, j.bodega, h.nombre_hub
                         from jaula j inner join hub h on j.id_hub = h.id_hub
                          where j.num_jaula=? and j.bodega=?`;
    const responseJaula = await selectData(queryJaula, [lpnAlone[0]?.JAULA, bodega]);
    return responseJaula;
} 

export const getJaula = async (lpnAlone: LPN[], lpnCondolidate: LPN[], whse: number) => {
  try {
    if(lpnAlone[0].JAULA ==="NCR"){
      throw new Error("Reserva NCR");
    }
    if(whse == 1902) whse=25;
    const jaula1 = await setJaulaValidator(lpnAlone, whse);
    const jaula2 = await setJaulaValidator(lpnCondolidate, whse);

    return { jaula1, jaula2 };
  } catch (error: any) {
    logger.error(error);

    throw new Error(error.message)
  }
};

export const validateState = (
  dataLpnAlone: LPN[],
  dataLpnConsolidated: LPN[],
  jaulas: any,
 
) =>
  new Promise<RESERROR | undefined>((resolve) => {
    
    if (
      dataLpnAlone[0].COD_ESTADODET === 2 ||
      dataLpnAlone[0].COD_ESTADODET == 23 ||
      dataLpnAlone[0].COD_ESTADODET === 18 ||
      dataLpnConsolidated[0].COD_ESTADODET === 2 ||
      dataLpnConsolidated[0].COD_ESTADODET == 23 ||
      dataLpnConsolidated[0].COD_ESTADODET === 18
    ) {
      resolve({
        error: "RESERVA ASOCIADA CANCELADA",
        data: [
          {
            ORDER_TYPE: dataLpnConsolidated[0].ORDER_TYPE,
            DO: dataLpnConsolidated[0].DO,
            LPN_FACILITY_STATUS: dataLpnConsolidated[0].LPN_FACILITY_STATUS,
            RESERVA: dataLpnConsolidated[0].RESERVA,
            JAULA: dataLpnConsolidated[0].JAULA,
            TC_LPN_ID: dataLpnConsolidated[0].TC_LPN_ID,
            ESTADO: "",
          },
        ],
      });
    }

    if(dataLpnAlone[0].CC_DESPACHA === 367 && dataLpnConsolidated[0].CC_DESPACHA ===508 || dataLpnAlone[0].CC_DESPACHA === 508 && dataLpnConsolidated[0].CC_DESPACHA === 367 || dataLpnConsolidated[0].CC_DESPACHA === 214 && dataLpnAlone[0].CC_DESPACHA===508){
      resolve({
        error: "No es posible consolidar estos lpns",
        data: [
          {
            ORDER_TYPE: dataLpnConsolidated[0].ORDER_TYPE,
            DO: dataLpnConsolidated[0].DO,
            LPN_FACILITY_STATUS: dataLpnConsolidated[0].LPN_FACILITY_STATUS,
            RESERVA: dataLpnConsolidated[0].RESERVA,
            JAULA: dataLpnConsolidated[0].JAULA,
            TC_LPN_ID: dataLpnConsolidated[0].TC_LPN_ID,
            ESTADO: "",
          },
        ],
      });
    }
    let {jaula1,jaula2} = jaulas;
    if(!jaula2) {
      resolve({
        error: "LA JAULA NO ESTA ASOCIADA A NINGUN HUB",
        data: [
          {
            ORDER_TYPE: dataLpnConsolidated[0].ORDER_TYPE,
            DO: dataLpnConsolidated[0].DO,
            LPN_FACILITY_STATUS: dataLpnConsolidated[0].LPN_FACILITY_STATUS,
            RESERVA: dataLpnConsolidated[0].RESERVA,
            JAULA: dataLpnConsolidated[0].JAULA,
            TC_LPN_ID: dataLpnConsolidated[0].TC_LPN_ID,
            ESTADO: "",
          },
        ],
      });
    }
    if (jaula1.length === 0) {
      resolve({
        error: "LA JAULA NO ESTA ASOCIADA A NINGUN HUB",
        data: [
          {
            ORDER_TYPE: dataLpnAlone[0].ORDER_TYPE,
            DO: dataLpnAlone[0].DO,
            LPN_FACILITY_STATUS: dataLpnAlone[0].LPN_FACILITY_STATUS,
            RESERVA: dataLpnAlone[0].RESERVA,
            JAULA: dataLpnAlone[0].JAULA,
            TC_LPN_ID: dataLpnAlone[0].TC_LPN_ID,
            ESTADO: "",
          },
        ],
      });
    } else if (jaula1[0].nombre_hub !== jaula2[0].nombre_hub) {
      resolve({
        error:
          "AMBOS LPN NO PERTENECEN AL MISMO HUB. 1° " +
          jaula1[0].nombre_hub +
          " 2° " +
          jaula2[0].nombre_hub,
        data: [
          {
            ORDER_TYPE: dataLpnAlone[0].ORDER_TYPE,
            DO: dataLpnAlone[0].DO,
            LPN_FACILITY_STATUS: dataLpnAlone[0].LPN_FACILITY_STATUS,
            RESERVA: dataLpnAlone[0].RESERVA,
            JAULA: dataLpnAlone[0].JAULA,
            TC_LPN_ID: dataLpnAlone[0].TC_LPN_ID,
            ESTADO: "",
          },
        ],
      });
    }
    if (
      dataLpnConsolidated[0].JAULA === "NCR" ||
      dataLpnAlone[0].JAULA === "NCR"
    ) {
      resolve({
        error: "EL CARTON ES NCR",
        data: [
          {
            ORDER_TYPE: dataLpnAlone[0].ORDER_TYPE,
            DO: dataLpnAlone[0].DO,
            LPN_FACILITY_STATUS: dataLpnAlone[0].LPN_FACILITY_STATUS,
            RESERVA: dataLpnAlone[0].RESERVA,
            JAULA: dataLpnAlone[0].JAULA,
            TC_LPN_ID: dataLpnAlone[0].TC_LPN_ID,
            ESTADO: "",
          },
        ],
      });
    }
    else if (!["PEC", "POS"].includes(dataLpnAlone[0].ORDER_TYPE)) {
        resolve({
          error: `EL CARTON NO ES PEC NI POS`,
          data: [
            {
              ORDER_TYPE: dataLpnAlone[0].ORDER_TYPE,
              DO: dataLpnAlone[0].DO,
              LPN_FACILITY_STATUS: dataLpnAlone[0].LPN_FACILITY_STATUS,
              RESERVA: dataLpnAlone[0].RESERVA,
              JAULA: dataLpnAlone[0].JAULA,
              TC_LPN_ID: dataLpnAlone[0].TC_LPN_ID,
              ESTADO: "",
            },
          ],
        });
      }
     else resolve(undefined);
  });
