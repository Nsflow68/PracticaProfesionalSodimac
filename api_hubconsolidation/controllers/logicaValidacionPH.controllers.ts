import { Request, Response } from "express";
import { getDataCarton, updatePallet } from "../services/pallet.services";

import { FinalMessage, palletStatus } from "../interfaces/dictionary";
import { logger } from "../utils/logger";



export const logicaValidacionPH = async (req: Request, res: Response) => {
  let { pallet, lpn, usuario } = req.body;
  logger.debug("Inicio Logica Validacion", pallet);
  try {
    

    let palletsegunLPN = await getDataCarton(lpn);
    if (palletsegunLPN.length === 0) throw new Error(`Carton ${lpn} not found`);
    if (palletsegunLPN[0].id_estado === 3) throw new Error(`Carton ${lpn} ya cargado a camión`);
    if (palletsegunLPN[0].pallet !== pallet) {
      return res.status(400).json({
        message: "",
        error: FinalMessage.inconguenciaEtiqueta,
      });
    }
    await updatePallet(palletsegunLPN[0], usuario, palletStatus.consolidado);
    return res.status(200).json({
      message: FinalMessage.congurnciaEtiqueta,
    });
  } catch (error: any) {
    logger.error(error);
    res.status(400).json({
      message: error.message,
      error: FinalMessage.errorValidacion,
    });
  }
};



