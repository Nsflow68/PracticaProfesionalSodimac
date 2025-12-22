import { Request, Response } from "express";
import { Pallet } from "../interfaces/hub.interface";
import { getDataPalletEspecific, updateUbicacionPallet } from "../services/pallet.services";
import { getDetUbicacion, getHubUbic } from "../services/ubication.services";
import { FinalMessage } from "../interfaces/dictionary";
import { logger } from "../utils/logger";


export const putUbication = async (req: Request, res: Response)  =>{
    let {ubic, whse, pallet} = req.body;

    try {
      logger.debug('putUbication input', ubic, whse, pallet)
      const dataubicacion: any = await getDetUbicacion(ubic, whse);

      if (dataubicacion.length === 0)
        return res.status(400).json({
          message: "",
          error: FinalMessage.locationDontExist,
        });

      
        
      
       
      const dataHub: any =  await getHubUbic(ubic, whse);
      const dataPAllet: Pallet = await getDataPalletEspecific(pallet);
      logger.debug('putUbication data', { dataPAllet, dataHub });

      if (dataHub.length > 0 || dataPAllet.length > 0 && dataPAllet[0].whse != whse)
         return res.status(400).json({
           message: "",
           error: FinalMessage.locationDistinct,
         });

      await updateUbicacionPallet(pallet, ubic, "");
      return res.status(200).json({
        "message":FinalMessage.locationsucces,
        "error": ""
    })
    } catch (error: any) {
        logger.error(error);
        return res.status(400).json({
          message: "",
          error: FinalMessage.locationError,
        });
    } 
}
