import { Request, Response } from 'express';

import Pallet from '../models/pallet.db';
import Carton from '../models/carton.db';
import LogEstatus from '../models/log.db';
import Anden from '../models/anden.db';
import axios from 'axios';
import Destiny from '../models/destiny.db';
import { Model } from 'sequelize';
import Hub from '../models/hub.db';
import Jaula from '../models/jaula.db';



const __isProd = process.env.NODE_ENV === 'production';
const __debug = (...args: any[]) => { if (!__isProd) console.log(...args); };
const __send500 = (res: Response, err: unknown, msg = 'Internal Server Error') => {
  console.error(err);
  return res.status(500).json({
    error: msg,
    ...(!__isProd && { details: (err as Error)?.message || String(err) })
  });
};

export const getDataCarton = async (req: Request, res: Response): Promise<any> => {
  const { pallet } = req.params;

  if (pallet.includes("THUB")) {
    const palleta = await Pallet.findOne({
      where: { pallet },
      attributes: ["pallet", "whse"],
      include: [
        { model: Carton, attributes: ["olpn", "created_at"] },
        { model: LogEstatus },
        { model: Anden, attributes: ["anden"] }
      ],
    });
    if (!palleta) return res.status(404).json({ msg: "No pallet found for THUB" });
    res.json(palleta);
  } else {
    const palleta: any = await Carton.findOne({
      where: { olpn: pallet },
      include: [{ model: Pallet, include: [{ model: Anden }] }, { model: LogEstatus }]
    });
    if (!palleta) return res.status(404).json({ msg: "No pallet" });
    __debug("paletaaaa", palleta?.toJSON());
    __debug("jaula", palleta.toJSON().pallet);

    const jaula: any = await Jaula.findOne({
      where: { id: palleta?.toJSON().pallet.id_jaula },
      include: [{ model: Hub }]
    });

    palleta.setDataValue("destino", jaula.hubs[0].nombre_hub);
    res.json(palleta);
  }

}

export const getDataReserva = async (req: Request, res: Response) => {
  const { reserva } = req.params
  res.json({ reserva });
}








export const traductorGet = async (req: Request, res: Response) => {
  const { lpn, whse } = req.query; 
  if (process.env.NODE_ENV !== 'production') {
    console.log(lpn, whse);
  }


  const headers: any = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  const authHeader = req.headers['authorization'];
  if (authHeader) headers['Authorization'] = String(authHeader);

  const config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: 'https://hansolo.dda.sodimac.cl:3052/getEstadoLPN',
    headers,
    data: JSON.stringify({
      "lpn": lpn,
      "whse": whse
    })
  };

  try {
    const response = await axios.request(config);
    res.json((response.data));
  } catch (error: any) {
    
    return res.status(500).json({
      error: 'Error al consultar API externa',
      ...(process.env.NODE_ENV !== 'production' && { details: error?.message || 'Unknown error' })
    });
  }


}

export const getDataAndenController = async (req: Request, res: Response) => {
  const { anden, whse } = req.query; 
  try {
    const response = await Anden.findAll({
      where: { anden, whse },
      include: [
        { model: Destiny, attributes: ["id", "destino", "active"] }
      ],
      
      
    } as any);
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Internal Server Error',
      ...(process.env.NODE_ENV !== 'production' && { details: (error as Error).message })
    });
  }
}

export const getDataDestinoController = async (req: Request, res: Response) => {
  
  try {
    const response = await Destiny.findAll({
      where: { active: true },
      include: [
        { model: Anden }
      ],
      order: [[Anden, "anden", "DESC"]]
    });
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Internal Server Error',
      ...(process.env.NODE_ENV !== 'production' && { details: (error as Error).message })
    });
  }
}


interface Andenes extends Model {
  id: Number,

}


export const createAndenController = async (req: Request, res: Response) => {
  try {
    const { anden, whse, destino } = req.body;
    if (process.env.NODE_ENV !== 'production') console.log(anden, whse, destino);
    const response = await Anden.create({
      anden, whse
    })
    if (process.env.NODE_ENV !== 'production') console.log(response);
    const newAnden: any = await Anden.findOne({
      where: { anden, whse }
    });
    if (!newAnden) return res.status(404).json({ msg: "Anden no encontrado después de la creación" });

    const id_anden = newAnden.id;

    const newRoutes = await Destiny.create({
      destino,
      id_anden

    });

    res.status(200).json(newRoutes);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Internal Server Error',
      ...(process.env.NODE_ENV !== 'production' && { details: (error as Error).message })
    });
  }
}



export const deleteAndenController = async (req: Request, res: Response) => {
  try {
    const { anden, whse, destino } = req.body;

    const andenModel: any = await Anden.findOne({
      where: { anden, whse }
    });
    if (!andenModel) return res.status(404).json({ msg: "Anden no encontrado" });

    const id_anden: any = andenModel.id;
    const deleteCandidate = await Destiny.update({ active: false }, {
      where: {
        destino,
        id_anden
      }

    });
    if (process.env.NODE_ENV !== 'production') console.log(deleteCandidate);

    return res.status(200).json({ msg: `Se elimino ruta ${destino} del anden ${id_anden} para instalación ${whse}` });

  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      ...(process.env.NODE_ENV !== 'production' && { details: (error as Error).message })
    });
  }
}


export const updateAndenController = async (req: Request, res: Response) => {
  try {
    const { anden, whse, destino, nuevoDestino } = req.body;

    const andenModel: any = await Anden.findOne({
      where: { anden, whse }
    });
    if (!andenModel) return res.status(404).json({ msg: "Anden no encontrado" });

    const id_anden: any = andenModel.id;
    const updateCandidate = await Destiny.update({ destino: nuevoDestino }, {
      where: {
        destino,
        id_anden
      }

    });
    if (process.env.NODE_ENV !== 'production') console.log(updateCandidate);

    return res.status(200).json({ msg: `Se elimino ruta ${destino} del anden ${id_anden} para instalación ${whse}` });

  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      ...(process.env.NODE_ENV !== 'production' && { details: (error as Error).message })
    });
  }
}
