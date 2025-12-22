import { Request, Response } from "express";
import { printSearched } from "../services/extractData.services";
import moment from "moment";
import {
  generarZPL,
  getDataFechasDadi,
  getlistDetalleImpresion,
  printZPL,
  updateFechaImpresionPalletEspecific
} from "../services/impresiones.services";
import { getDataCarton, getDataCartonEspecifico, getDataLpn } from "../services/pallet.services";
import { LPN, Pallet } from "../interfaces/hub.interface";
import { logger } from "../utils/logger";



export const impresiones = async (req: Request, res: Response) => {
  const { lpn, whse } = req.body as { lpn?: string; whse?: string };

  
  if (!lpn || !whse) {
    return res.status(400).json({ error: "Parámetros requeridos: lpn, whse" });
  }

  try {
    const printList: any = await printSearched();

    
    const ccArray = printList?.PrintZpl2 ?? printList?._doc?.PrintZpl2 ?? [];
    const ccData: any = ccArray.find(
      (la: any) => String(la?.bodega ?? la?.cc ?? "").trim() === String(whse).trim()
    );
    if (!ccData) {
      return res.status(400).json({ error: `No se encontró configuración de impresión para whse=${whse}` });
    }

    const timeNow = moment().format("DD/MM/YYYY HH:mm:ss");
    const zplData: any = {
      datoslpn: [],
      datosfechas: {},
      fecha_impresion: timeNow,
      orders: [],
    };

    const dataCartones: Pallet = await getDataCarton(lpn);
    if (!dataCartones || dataCartones.length === 0) {
      return res.status(404).json({ error: `Cartón/LPN ${lpn} no encontrado` });
    }

    const lpnByPallet = await getDataCartonEspecifico(dataCartones[0].pallet);
    const listLpn = lpnByPallet.map((el: Pallet) => el.LPN);

    zplData.datoslpn = lpnByPallet;

    
    const dateData: any = await getDataFechasDadi(JSON.stringify(listLpn), String(ccData.cc));
    zplData.datosfechas = dateData;
    zplData.fecha_impresion = timeNow;

    let orderList: any = await getDataLpn(listLpn, ccData.cc);
    orderList = orderList.map((el: LPN) => el.RESERVA);
    const uniq = new Set(orderList?.map(JSON.stringify));
    orderList = Array.from(uniq).map((a: any) => JSON.parse(a));
    zplData.orders = orderList;

    const zplObject: any = await generarZPL(zplData);
    const dataforPrint = { zpl: zplObject.zpl, printer: ccData.ip };

    const { Impresion, Errors }: any = await printZPL(dataforPrint);

    if (Impresion === "OK") {
      
      updateFechaImpresionPalletEspecific(dataCartones[0].id_pallet).catch(logger.error);
      return res.status(200).json({
        message: "Se imprimió la etiqueta de pallet",
        error: "",
      });
    } else {
      logger.error(Errors);
      return res.status(400).json({ error: Errors ?? "Error de impresión" });
    }
  } catch (error: any) {
    logger.error("impresiones error:", error);
    return res.status(500).json({ error: "Error interno" });
  }
};




export const getDetailImpresion = async (req: Request, res: Response) => {
  try {
    const { cc } = req.query as { cc?: string };

    if (!cc || !cc.trim()) {
      return res.status(400).json({ error: "Parámetro requerido: cc" });
    }

    const dataGeneral = await getlistDetalleImpresion(cc.trim());
    return res.status(200).json(dataGeneral); 
  } catch (error: any) {
    logger.error("getDetailImpresion error:", error);
    return res.status(500).json({ error: "Error interno" });
  }
};
