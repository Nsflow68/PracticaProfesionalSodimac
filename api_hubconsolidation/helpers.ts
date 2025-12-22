import { selectData } from "./services/extractData.services";

export const helpWhseByBodega = async(whse: number | string) => {
  const queryString:string = `SELECT bodega
  FROM trazabilidad_hub.bodega t
  where t.whse = ?
  LIMIT 501`;
  const data:any = await selectData(queryString, [whse]);
  return data[0].bodega.toString();
}
