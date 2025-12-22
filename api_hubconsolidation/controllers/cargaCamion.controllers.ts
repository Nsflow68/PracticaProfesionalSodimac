import { Request, Response } from "express";
import {
  carga,
  getDataCarton,
  getDataPallet,
  insertAnden,
  selectIdAnden,
  updateAnden,
} from "../services/pallet.services";
import {
  FinalMessage,
  palletStatus,
  statusCarga,
} from "../interfaces/dictionary";
import {
  getDataAnden,
  validatePedStore,
} from "../services/cargaCamion.services";
import { PropsPallet, Tienda, TipoCarton } from "../interfaces/hub.interface";
import { search_last_correlative } from "../services/state.services";
import { getTipo, postData } from "../services/extractData.services";
import { logger } from "../utils/logger";

export const andenRegister = async (req: Request, res: Response) => {
  const { anden } = req.body;
  try {
    const idAnden = await insertAnden(anden);
    res.status(200).json(idAnden);
  } catch (error: any) {
    res.status(400).json({ error: 'bad_request' });
  }
};


export const cargaCamion = async (req: Request, res: Response) => {
  let { pallet, anden, usuario, whse } = req.body;
  if (typeof anden === "string") { 
    anden = anden.replace(/\D+/g, ""); 
  }

  try {
    
    const idAnden: string = await selectIdAnden(anden, whse);

    let dataPallet = await getDataPallet(pallet);
    
    if (!dataPallet) {

      let tipo: Array<TipoCarton> = await getTipo(whse.toString(), pallet);

      let hubTienda: Tienda[] = await validatePedStore(tipo[0].TIENDA); 

      let dataHub = await getDataAnden(anden, whse); 

      const isValidate = dataHub.some(
        (hub: any) => hub.destino === hubTienda[0].nombre_hub
      );
      if (!isValidate) 
                return res.status(400).json({
                    error: `Hubs disntintos, no puedes asociar un pallet con destino:${hubTienda[0].nombre_hub} al camión que va a ${dataHub.map((el:any)=> el.destino)}`,
                });
      

      const propsPallet: PropsPallet = {
        isNew: true,
        lpn: pallet.toString(),
        lpnConsolidado: pallet.toString(),
        whse: whse.toString(),
        id_anden: idAnden,
        state: palletStatus.cargado_camion,
        cage: hubTienda[0].store_number,
        usuario: usuario.toString(),
      };

      await search_last_correlative(propsPallet);

      dataPallet = await getDataCarton(pallet);
    }
    await updateAnden(pallet, idAnden);
    const popierties = {
      palletRequest: pallet,
      pallet: dataPallet,
      anden,
      usuario,
      whse
    };
    const cargado = await carga(popierties);
    logger.debug('cargado', cargado);

    res.status(200).json({ message: FinalMessage.cargaMessage });
  } catch (error: any) {
    logger.error(error.message);
    if (error.message.includes("id_jaula")) error.message = "JAULA invalida";

    res.status(400).send({ error: 'bad_request' });
  }
};

export const savePed = async (req: Request, res: Response) => {
  let { pallet } = req.query;
  const usuario: any = (res.locals as any)?.auth?.data?.usuario;
  let tipo: Array<TipoCarton>;
  try {
    if (!pallet) throw new Error("no pallet");
    let lpn: string = pallet?.toString();
    const paleta = await getDataCarton(lpn);
    if (paleta.length === 0) throw new Error(`Carton ${lpn} not found`);
    logger.debug('paleta', paleta);

    if (!paleta) throw new Error("no pallet");

    if (paleta) {
      let { whse, id_carga } = paleta[0];
      tipo = await getTipo(whse, lpn);

      if (tipo[0].ORDER_TYPE === "PED") {
        await postData(
          `insert into log_estado_carga (id_estado_carga, id_carga, user) values (?, ?, ?)`,
          [statusCarga.despachado, id_carga, usuario]
        );
        return res.status(200).json({
          message: "Despacho exitoso",
        });
      }
    }
  } catch (error) {
    logger.error(error as any);
    res.status(400).json({ error: 'bad_request' });
  }
};
