import { Request, Response } from "express";
import { selectData } from "../services/extractData.services";

export const getHubs = async (_req: Request, res: Response) => {
  
  const sql = "SELECT nombre_hub FROM hub";
  const responseHubs = await selectData(sql, []);
  return res.json({ data: responseHubs });
};
