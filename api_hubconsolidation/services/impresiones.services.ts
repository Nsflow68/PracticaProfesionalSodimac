import axios from "axios";
import { logger } from "../utils/logger";
import { poolObiwan } from "../configs/connection.db";
import { URLservicesProvider } from "../configs/configs";
import { selectData } from "./extractData.services";




export const getDataFechasDadi = (pallet: string, cc: string) => {
  return new Promise((resolve, reject) => {
    const config = {
      method: "GET",
      url: `${URLservicesProvider.venv}:3052/getDataGeneralLpns`,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      params: {
        pallet,
        cc,
      },
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

export const generarZPL = (datos: any) => {

    return new Promise((resolve, reject) => {

        let data = {
            "hubDescription": datos.datoslpn[0].nombre_hub,
            "orders": datos.orders,
            "cartonsQty": datos.datosfechas[0].CARTONES_QTY,
            "virtualPallet" : datos.datoslpn[0].pallet,
            "minimumDeliveryDate" : datos.datosfechas[0].MIN_FECHA_DESPACHO,
            "maximumDeliveryDate" : datos.datosfechas[0].MAX_FECHA_DESPACHO,
            "startDateProcess" : datos.datosfechas[0].FECHA_INI_PROCESO,
            "printDate" : datos.fecha_impresion
        }

        let config = {
            method: 'POST',
            url: `${URLservicesProvider.venv}:3052/getLabelVirtualPalletGenerate`,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
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


export const printZPL = (datos: any) => {
    return new Promise((resolve, reject) => {

        let data = {
            "zpl": datos.zpl,
            "printer": datos.printer
        }

        let config = {
            method: 'POST',
            url: `${URLservicesProvider.venv}:3052/setPrintLabelVirtualPallet`,
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

export const updateFechaImpresionPalletEspecific = async( idPallet: string) => {


       try {
        const logState = `insert into impresiones ( id_pallet ) values (?)`;
         await poolObiwan.query(logState, [idPallet]);
      
       } catch (error) {
        logger.error(error)

       }
}


export const getlistDetalleImpresion = async(cc: any) => {
    try {
        let queryDetailImpresion: string = `select o.id_pallet,
        olpn         AS                                                                              LPN,
        o.created_at as                                                                              FECHA_CREACION,
        (select max(fecha) from log_estado lp where lp.id_pallet = p.id_pallet and lp.id_estado = 2) FECHA_CONSOLIDACION,
        i.fecha_impresion                                                                            FECHA_IMPRESION,
 
        (case when ((select ec.desc_estado
            from log_estado_carga
                     inner join estado_carga ec on log_estado_carga.id_estado_carga = ec.id_state_carga
            where id_carga = p.id_carga
            order by fecha desc
            limit 1)) is null then UPPER(ep.desc_estado) else upper((select ec.desc_estado
            from log_estado_carga
                     inner join estado_carga ec on log_estado_carga.id_estado_carga = ec.id_state_carga
            where id_carga = p.id_carga
            order by fecha desc
            limit 1)) end) ESTADO,
        j.num_jaula,
        pallet       AS                                                                              PALLET_VIRTUAL,
         p.whse cc,
        nombre_hub                                                                                   HUB,
        (select user from log_estado where id_pallet = p.id_pallet order by fecha DESC limit 1)      USUARIO
 from carton o
          inner join pallet p on p.id_pallet = o.id_pallet
          left join anden a on a.id_anden = p.id_anden
          inner join estado_pallet ep on p.id_estado = ep.id_estado
          inner join jaula j on j.id_jaula = p.id_jaula
          inner join hub h on h.id_hub = j.id_hub
          left JOIN impresiones i on p.id_pallet = i.id_pallet where p.whse = ? order by FECHA_CREACION desc limit 1000`;
        const resp = await selectData(queryDetailImpresion, [cc]);
        return resp;
    } catch (error: any) {
        throw new Error(error)
    }
}
