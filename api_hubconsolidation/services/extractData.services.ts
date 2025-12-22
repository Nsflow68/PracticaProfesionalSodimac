import { poolObiwan } from "../configs/connection.db";
import { logger } from "../utils/logger";
import settingModel from "../models/settingModel";
import { getType, getTypeBC, getTypeTemplate, getTypeWC } from "./cargaCamion.services";



const hasPlaceholders = (sql: string) => sql.includes("?");

const normStr = (s: unknown) => (s == null ? "" : String(s)).trim();
const isDigits = (s: string) => /^[0-9]+$/.test(s);



export const printSearched = async () => {
  try {
    const data = await settingModel
      .findOne(
        { idApp: "60769ee3c2e93e5dac81ecf6" },
        {
          _id: 0,
          idApp: 0,
          MongoServer: 0,
          MongoServerSBS: 0,
          nameApp: 0,
          oracleConexion: 0,
          portApp: 0,
          PrintZpl: 0,
          RedisServer: 0,
          url: 0,
        }
      )
      .lean()
      .exec();
    return data;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};



export const selectData = async <T = any>(sql: string, params?: any[]): Promise<T[]> => {
  const usingParams = Array.isArray(params);

  
  if (!usingParams && hasPlaceholders(sql)) {
    console.warn(`[Control19] selectData SIN params pero SQL tiene "?" -> ${sql.slice(0, 120)}…`);
  }
  if (usingParams && !hasPlaceholders(sql)) {
    console.warn(`[Control19] selectData CON params pero SQL NO tiene "?" -> ${sql.slice(0, 120)}…`);
  }

  try {
    const [rows]: any = usingParams
      ? await poolObiwan.query(sql, params)
      : await poolObiwan.query(sql);
    return rows as T[];
  } catch (error: any) {
    logger.error(error);
    logger.error(error?.message);
    throw error;
  }
};

export const updateData = async (sql: string, params?: any[]): Promise<void> => {
  try {
    if (params) {
      await poolObiwan.query(sql, params);
    } else {
      await poolObiwan.query(sql);
    }
  } catch (error: any) {
    logger.error(error);
    logger.error(error?.message);
    throw error;
  }
};

export const postData = async (sql: string, params?: any[]) => {
  try {
    const [result]: any = params
      ? await poolObiwan.query(sql, params)
      : await poolObiwan.query(sql);
    return result; 
  } catch (error: any) {
    logger.error(error);
    logger.error(error?.message);
    throw error;
  }
};



export const getTipo = async (whse: string, pallet: string) => {
  const whseNorm = normStr(whse);
  const lpn = normStr(pallet).toUpperCase();

  if (!lpn || !/^[A-Z0-9][A-Z0-9\-\._]{1,60}$/.test(lpn)) {
    throw new Error("Invalid lpn");
  }
  if (!whseNorm || !isDigits(whseNorm)) {
    throw new Error("Invalid whse");
  }

  let lista: any;
  switch (whseNorm) {
    case "20":
      lista = await getTypeBC(lpn);
      break;
    case "25":
      lista = await getTypeBC(lpn);
      break;
    case "221":
      lista = await getType(lpn);
      break;
    case "1902":
      lista = await getTypeTemplate(lpn);
      break;
    default:
      lista = await getTypeWC(lpn);
      break;
  }

  if (!Array.isArray(lista) || lista.length === 0) {
    throw new Error("Invalid lpn (sin parent_lpn_id) en wmos");
  }
  return lista;
};
