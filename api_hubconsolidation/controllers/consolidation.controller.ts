import { Request, Response } from "express";
import {
  getEstadoLPN,
  getJaula,
  lpn_detail,
  search_last_correlative,
  validateState,
} from "../services/state.services";
import { LPN, PropsPallet, PropsSellos } from "../interfaces/hub.interface";

import { asignarWhse, cargaCC, getAllDataLocal, getDataCartonEspecifico, getDataCartones, getDataLpn, getDataRecepcionada, idCargaPallet, newRoute, saveDataDespacho, updateSellosOT } from "../services/pallet.services";
import { FinalMessage, palletStatus } from "../interfaces/dictionary";
import { logger } from "../utils/logger";

const readParam = <T = any>(req: Request, key: string): T | undefined => {
  const queryValue = (req.query as any)?.[key];
  if (queryValue !== undefined) return queryValue as T;
  return (req.body as any)?.[key] as T;
};

export const consolidation = async (req: Request, res: Response) => {
  const start = process.hrtime();

  let { lpn, lpn_consolidado, whse, usuario } = req.body;
  logger.debug('consolidation input', lpn, lpn_consolidado, whse, usuario);

  
  const usuarioRegex = /^[a-zA-Z0-9\.\-_]+$/;
  if (usuario && !usuarioRegex.test(usuario)) {
    return res.status(422).json({
      error: "no puedes insertar estos caracteres"
    });
  }

  try {
    const authHeader = String(req.headers['authorization'] || '');
    let dataLpnAlone: LPN[] = await getEstadoLPN(lpn, whse, authHeader);
    let dataLpnConsolidated: LPN[] = await getEstadoLPN(lpn_consolidado, whse, authHeader);

    if (dataLpnAlone.length === 0)
      return res.status(400).json({ error: FinalMessage.errornowmos });
    let isNewVirtualPallet: boolean | undefined = await lpn_detail(
      lpn,
      lpn_consolidado,
      whse
    );

    const objectCages = await getJaula(dataLpnAlone, dataLpnConsolidated, whse);

    const exception = await validateState(
      dataLpnAlone,
      dataLpnConsolidated,
      objectCages
    );

    if (exception) return res.status(400).send(exception);

    const propsPallet: PropsPallet = {
      isNew: isNewVirtualPallet,
      lpn,
      lpnConsolidado: lpn_consolidado,
      whse,
      state: palletStatus.procesando,
      cage: objectCages.jaula1[0].num_jaula,
      usuario
    };

    let palletVirtual: string = await search_last_correlative(propsPallet);

    if (palletVirtual?.includes("No") || palletVirtual?.includes("Error"))
      return res.status(400).json({ error: palletVirtual });

    if (dataLpnAlone.length > 0) {
      let rest = {
        message: isNewVirtualPallet ? FinalMessage.incomeCreated : FinalMessage.incomeSuccessful,
        data: [
          {
            TC_LPN_ID: dataLpnAlone[0].TC_LPN_ID,
            ORDER_TYPE: dataLpnAlone[0].ORDER_TYPE,
            LPN_FACILITY_STATUS: "En proceso",
            RESERVA: dataLpnAlone[0].RESERVA,
            DO: dataLpnAlone[0].DO,
            JAULA: dataLpnAlone[0].JAULA,
            PALLET_VIRTUAL: palletVirtual,
            ESTADO: dataLpnAlone[0].LPN_FACILITY_STATUS
          },
        ],
      }
      console.log(rest);

      res.status(200).json({

        message: isNewVirtualPallet ? FinalMessage.incomeCreated : FinalMessage.incomeSuccessful,
        data: [
          {
            TC_LPN_ID: dataLpnAlone[0].TC_LPN_ID,
            ORDER_TYPE: dataLpnAlone[0].ORDER_TYPE,
            LPN_FACILITY_STATUS: "En proceso",
            RESERVA: dataLpnAlone[0].RESERVA,
            DO: dataLpnAlone[0].DO,
            JAULA: dataLpnAlone[0].JAULA,
            PALLET_VIRTUAL: palletVirtual,
            ESTADO: dataLpnAlone[0].LPN_FACILITY_STATUS
          },
        ],
      });
    }
  } catch (error: any) {
    logger.error(error);
    res.status(400).json({
      error: error.message,
      data: [
        {
          TC_LPN_ID: lpn,
          ESTADO: error?.message,
          error: error?.message
        },
      ],
    });
  }

  const end = process.hrtime(start);
  logger.debug(
    `tiempo de ejecucion del proceso ${end[0]} seg con ${end[1]} nanoseg`
  );
};



export const consultingChargedCC = async (req: Request, res: Response) => {
  const { cc } = req.query;
  const data = await cargaCC(cc);
  res.json(data);
}

export const getDataCarton = async (req: Request, res: Response) => {
  const { cc } = req.query;
  const data = await getDataCartonEspecifico(cc);
  res.json(data);
}


export const saveSellos = async (req: Request, res: Response) => {
  const { sello1, sello2, ot, pallets }: any = req.query;
  const usuario: string = (res.locals as any)?.auth?.data?.usuario;
  try {

    const correlative = await newRoute(usuario);
    const palletCargado: any = await idCargaPallet(pallets, false);

    let listPropsSellos: Array<PropsSellos> = [];
    palletCargado.map((prop: PropsSellos) => {
      listPropsSellos.push({
        sello1,
        sello2,
        OT: ot,
        pallet: prop,
        usuario,
        route: correlative.insertId,
      });
    });

    await saveDataDespacho(listPropsSellos);
    res.json("ok");
  } catch (error: any) {
    logger.error(error?.message);
    res.status(500).json({ error: 'Error interno' });
  }
};

export const getPalletvirtualRecepcionado = async (req: Request, res: Response) => {
  try {
    const pallets = readParam(req, "pallets");
    if (!pallets) {
      return res.status(400).json({ error: "Parametro 'pallets' requerido" });
    }
    const palletData: any = await getDataRecepcionada(pallets);
    res.json(palletData);
  } catch (error: any) {
    logger.error(error?.message)
    res.status(500).json({ error: 'Error interno' });
  }
}

export const getPalletvirtualRecepcionadopost = async (
  req: Request,
  res: Response
) => {
  try {
    let pallets = readParam(req, "pallets");
    let ot = readParam(req, "ot");
    let sello1 = readParam(req, "sello1");
    let sello2 = readParam(req, "sello2");
    if (!pallets) {
      return res.status(400).json({ error: "Parametro 'pallets' requerido" });
    }
    const usuario =
      ((res.locals as any)?.auth?.data?.usuario as string | undefined) ??
      readParam<string>(req, "usuario");
    if (!usuario) {
      return res.status(400).json({ error: "Parametro 'usuario' requerido" });
    }
    if (!sello1) sello1 = "1";
    if (!sello2) sello2 = "1";
    const palletDescargado: any = await idCargaPallet(pallets, true);
    let listPropsSellos: Array<PropsSellos> = [];
    palletDescargado.map((prop: PropsSellos) => {
      listPropsSellos.push({
        sello1,
        sello2,
        OT: ot,
        pallet: prop,
        usuario,
        route: 1
      });
    });
    await updateSellosOT(listPropsSellos);
    res.json("ok");
  } catch (error: any) {
    logger.error(error?.message);
    res.status(500).json({ error: 'Error interno' });
  }
};

export const getCartonesHub = async (req: Request, res: Response) => {
  try {
    let { cc, rango } = req.query;
    if (!rango) rango = '1';
    rango = rango.toString();
    let dias: number | undefined = parseInt(rango, 10);
    const resp = await getDataCartones(cc, dias);
    res.json(resp)
  } catch (error: any) {
    logger.error(error.message);

  }
}


export const getAllDataLpn = async (req: Request, res: Response) => {
  const { cc } = req.query;

  try {
    
    const whseId = asignarWhse(String(cc));

    
    const dataLpnConsolidated = await getAllDataLocal(whseId);

    if (Array.isArray(dataLpnConsolidated) && dataLpnConsolidated.length > 0) {
      const lpns = dataLpnConsolidated.map((el: any) => el.CARTON);

      
      const chunkSize = 20;
      const chunks = [];
      for (let i = 0; i < lpns.length; i += chunkSize) {
        chunks.push(lpns.slice(i, i + chunkSize));
      }

      const responses = await Promise.all(
        chunks.map((chunk) => getDataLpn(chunk, whseId))
      );

      
      let getDataLpnswmosDadi = responses.flat().filter(Boolean);

      if (!getDataLpnswmosDadi || getDataLpnswmosDadi.length === 0)
        return res.status(404).json({ error: "Sin datos desde wmos" });

      let set = new Set(getDataLpnswmosDadi?.map(JSON.stringify));
      getDataLpnswmosDadi = Array.from(set).map((a: any) => JSON.parse(a));

      if (!getDataLpnswmosDadi.length) res.send("error");

      const data = getDataLpnswmosDadi?.map((el: any) => {
        const algo = dataLpnConsolidated.find(
          (la: any) => la.CARTON === el.TC_LPN_ID
        );
        return {
          ...el,
          PALLET_VIRTUAL: algo?.PALLET_VIRTUAL,
          FECHA_CONSOLIDACION: algo?.FECHA_PALLETIZADO,
          JAULA: algo?.num_jaula,
          HUB: algo?.nombre_hub,
          UBICACION: algo?.ubication,
          ESTADO: algo?.desc_estado,
          USUARIO: algo?.user,
        };
      });
      return res.status(200).json(data);
    }
  } catch (error) {
    console.error(error);
  }
};



