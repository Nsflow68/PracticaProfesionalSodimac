import { connect, set } from "mongoose";
import { PoolOptions } from "mysql2";
import mysql from "mysql2/promise";
import { selectData } from "../services/extractData.services";
import { logger } from "../utils/logger";


const uri = process.env.MONGO_URI;
set("strictQuery", false);

export const dbConnection = async () => {
  try {
    if (!uri) throw new Error("MONGO_URI environment variable is required");
    await connect(uri);
  } catch (error) {
    logger.error(error);
    throw new Error("Error al iniciar base de datos");
  }
};


const normLpn = (v: string) => String(v ?? "").trim().toUpperCase();

export const detailConsolidate = async (olpn1: string, olpn2: string) => {
  const a = normLpn(olpn1);
  const b = normLpn(olpn2);

  
  
  const sql = `
    SELECT *
    FROM trazabilidad_hub.carton
    WHERE olpn IN (?, ?)
  `;
  const response: any[] = await selectData(sql, [a, b]);

  if (response.length === 0) {
    return response; 
  } else if (response.length > 1) {
    throw Error("LPN ya consolidado");
  } else if (b !== normLpn(response[0].olpn)) {
    
    throw Error(`LPN ${response[0].olpn} ya esta consolidado`);
  } else {
    return response;
  }
};

const config: PoolOptions = {
  host: process.env.SQLHOST ?? "Obiwankenobi.sodimac.cl",
  port: 3306,
  user: process.env.SQLUSER ?? "trazabilidadhub",
  database: process.env.SQLDB ?? "trazabilidad_hub",
  password: process.env.SQLPASS ?? "e5f3b0d88a9ad2895f6d387a68d86aa7",
  rowsAsArray: false,
};


export const poolObiwan = mysql.createPool(config);
