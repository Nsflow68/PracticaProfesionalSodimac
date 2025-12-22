import axios from "axios";
import { logger } from "../utils/logger";
import { poolObiwan } from "../configs/connection.db";
import {
  queryGetCarton,
  queryGetCartonesByPallet,
  queryGetDataPallet,
  queryGetAllData,
} from "./querys.services";
import { URLservicesProvider } from "../configs/configs";
import { postData, selectData, updateData } from "./extractData.services";
import { PropsCarga, PropsPallet, PropsSellos } from "../interfaces/hub.interface";
import { palletStatus, statusCarga } from "../interfaces/dictionary";
import { getDataAnden } from "./cargaCamion.services";


const requireStr = (v: unknown, name: string): string => {
  const s = String(v ?? "").trim();
  if (!s) throw new Error(`Parámetro requerido: ${name}`);
  return s;
};
const U = (s: string) => s.toUpperCase().trim();


const runQuery = async <T = any>(qp: string | { sql: string; params?: any[] }) => {
  const sql = typeof qp === "string" ? qp : qp.sql;
  const params = typeof qp === "string" ? [] : (qp.params ?? []);
  return await (selectData as any)(sql, params) as T;
};


export const updateStatusPallet = async (state: any, palltId: number, usuario: string) => {
  const logStateInsert = `insert into log_estado (id_estado, id_pallet, user ) values (?, ?, ?)`;
  await postData(logStateInsert, [state, palltId, usuario]);
};

export const updateStatusCarga = (state: any, cargaId: number, usuario: string) => {
  const logStateInsert = `insert into log_estado_carga (id_estado_carga, id_carga, user ) values (?, ?, ?)`;
  postData(logStateInsert, [state, cargaId, usuario]);
};


export const createNewPallet = async (props: any): Promise<string> => {
  try {
    console.time("createNewPallet");
    const { isNew, lpn, lpnConsolidado, whse, state, cage, usuario, id_anden }: PropsPallet = props;

    
    const LPN = U(requireStr(lpn, "lpn"));
    const LPNC = U(requireStr(lpnConsolidado ?? lpn, "lpnConsolidado"));

    const getJaula: any[] = await runQuery({ sql: `select * from jaula where num_jaula=?`, params: [cage] });
    const jaulaId = getJaula?.[0]?.id_jaula;
    if (!jaulaId) throw new Error("Jaula no encontrada");

    const insertPallet = id_anden
      ? { sql: `INSERT INTO trazabilidad_hub.pallet (whse, id_estado, id_jaula, id_anden) VALUES (?, ?, ?, ?)`, params: [whse, state, jaulaId, id_anden] }
      : { sql: `INSERT INTO trazabilidad_hub.pallet (whse, id_estado, id_jaula) VALUES (?, ?, ?)`, params: [whse, state, jaulaId] };

    const palletInsertado: any = await postData((insertPallet as any).sql, (insertPallet as any).params);
    const palltId = palletInsertado?.insertId;
    if (!palltId) throw new Error("No se pudo insertar el pallet");

    const palletSelected: any[] = await runQuery({ sql: `select * from pallet where id_pallet=?`, params: [palltId] });
    const pallet: string | undefined = palletSelected?.[0]?.pallet;
    if (!pallet) throw new Error("No se pudo recuperar el pallet virtual");

    await updateStatusPallet(state, palltId, usuario);

    const addCarton = (olpn: string) =>
      postData(`insert into carton (olpn, id_pallet) values (?, ?)`, [olpn, palltId]);

    if (isNew) {
      await addCarton(LPN);
      if (LPN !== LPNC) await addCarton(LPNC);
    } else {
      await addCarton(LPN);
    }

    console.timeEnd("createNewPallet");
    return pallet; 
  } catch (error: any) {
    throw new Error(error?.message || String(error));
  }
};

export const searchPalletVirtual = async (props: PropsPallet): Promise<string> => {
  let { lpnConsolidado, lpn, whse } = props;

  const LPN = U(requireStr(lpn, "lpn"));
  const LPNC = U(requireStr(lpnConsolidado ?? lpn, "lpnConsolidado"));

  try {
    const palletSelected: any[] = await runQuery({
      sql: `
      select *
      from carton o
      inner join pallet p on p.id_pallet = o.id_pallet
      where o.olpn in (?, ?)
    `,
      params: [LPNC, LPN]
    });
    if (!palletSelected?.length) throw new Error("No se encontró pallet para los LPN indicados");

    const idPallet = palletSelected[0].id_pallet;
    const pallet: string = palletSelected[0].pallet;
    const whseUsed: string = palletSelected[0].whse;

    if (String(whseUsed) !== String(whse)) {
      const res: any[] = await runQuery({ sql: `select * from app_setting where whse=? and consolidate_with=?`, params: [whse, whseUsed] });
      if (res.length === 0)
        throw new Error(`No es posible consolidar estos lpns: ${LPN} whse ${whse} y ${LPNC}, ${whseUsed}`);
    }

    if (palletSelected.length === 1) {
      if (LPN !== LPNC) {
        const addCarton = `insert into carton (olpn, id_pallet ) values (?, ?)`;
        await postData(addCarton, [LPN, idPallet]);
      }
      return pallet;
    } else if (palletSelected.length === 2) {
      return pallet;
    }

    throw new Error("No se pudo determinar el pallet virtual");
  } catch (error: any) {
    throw new Error(error?.message || String(error));
  }
};


export const getDataPallet = async (pallet: string) => {
  const qp = queryGetDataPallet(pallet) as any;
  const dataPallet: any[] = await runQuery(qp);
  if (dataPallet.length === 0) return undefined;
  if (dataPallet[0].id_estado === palletStatus.cargado_camion)
    throw new Error(`Pallet ${pallet} ya cargado a camión`);
  return dataPallet;
};

export const getDataPalletEspecific = async (pallet: string) => {
  const qp = queryGetDataPallet(pallet) as any;
  return await runQuery(qp);
};

export const getDataCarton = async (carton: string) => {
  const qp = queryGetCarton(carton) as any;
  return await runQuery(qp);
};


export const insertAnden = async (anden: number) => {
  const addAnden = `insert into anden (anden) values (?)`;
  const resp: any = await postData(addAnden, [anden]);
  return resp;
};

export const selectIdAnden = async (anden: string, whse: number) => {
  if (whse == 1902) whse = 25;
  const querys = { sql: `select id_anden from anden a where a.anden=? and a.whse=?`, params: [anden, whse] };
  const data: any[] = await runQuery(querys as any);

  if (data.length === 0) {
    const addAnden = `insert into anden (anden, whse) values (?, ?)`;
    const resp: any = await postData(addAnden, [anden, whse]);
    data.push({ id_anden: resp.insertId });
  }

  return data[0].id_anden;
};

export const updateAnden = async (pallet: string, andenId: string) => {
  const addCarton = `update pallet p set p.id_anden = ? where p.pallet = ?`;
  await updateData(addCarton, [andenId, pallet]);
};


export const updatePallet = async (infoPallet: any, usuario: string, status = palletStatus.consolidado) => {
  try {
    const addCarton = `update pallet p set p.id_estado=?  where p.pallet=?`;
    await updateData(addCarton, [status, infoPallet.pallet]);
    updateStatusPallet(status, infoPallet.id_pallet, usuario);
  } catch (error: any) {
    logger.error(error);
    throw new Error(error);
  }
};


export const carga = async (props: PropsCarga) => {
  let { palletRequest, pallet, anden, usuario, whse } = props;
  let cargaId: any;

  const bufferDataPallet = await stateCarga(anden);

  if (bufferDataPallet.length === 0) {
    const dataHub = await getDataAnden(anden, whse);
    const isValidate = dataHub.some((hub: any) => hub.destino === pallet[0].nombre_hub);

    if (dataHub.length === 0)
      throw new Error(
        `Este anden no tiene asignado ningun destino, indicar a jefatura, para agregarlo y volver a intentar`
      );

    if (!isValidate && pallet[0].nombre_hub !== "PED")
      throw new Error(
        `Hubs disntintos, no puedes asociar un pallet con destino ${pallet[0].nombre_hub} al camión que va a ${dataHub.map(
          (el: any) => el.destino
        )}`
      );

    const insertCargaQuery = `INSERT INTO trazabilidad_hub.carga (state_pallet) VALUES (?)`;
    const data: any = await postData(insertCargaQuery, [palletStatus.cargado_camion]);
    cargaId = data.insertId;
  }
  if (bufferDataPallet.length > 0 && bufferDataPallet[0].nombre_hub !== pallet[0].nombre_hub) {
    throw new Error(
      `Hubs disntintos, no puedes asociar un pallet de ${pallet[0].nombre_hub} a los pallet que van a ${bufferDataPallet[0].nombre_hub}`
    );
  }
  if (!cargaId) cargaId = bufferDataPallet[0].id_carga;

  palletRequest = palletRequest.includes("THUB") ? palletRequest : pallet[0].pallet;
  const updatePalletSql = `update pallet p set p.id_carga = ?, p.id_estado = ? where p.pallet = ?`;
  await updateData(updatePalletSql, [cargaId, palletStatus.cargado_camion, palletRequest]);

  const paletOn = await stateCarga(anden);
  updateStatusPallet(palletStatus.cargado_camion, pallet[0].id_pallet, usuario);
  return paletOn;
};

export const stateCarga = async (anden: number) => {
  const queryCarga = `select p.id_pallet, ep.desc_estado, ec.desc_estado, pallet, p.id_carga, nombre_hub
  from pallet p
           inner join anden a on a.id_anden = p.id_anden
           inner join estado_pallet ep on p.id_estado = ep.id_estado
           inner join jaula j on j.id_jaula = p.id_jaula
           inner join hub h on h.id_hub = j.id_hub
           inner join log_estado_carga lec on p.id_carga = lec.id_carga
  inner join estado_carga ec on lec.id_estado_carga = ec.id_state_carga
      where a.anden=? and p.id_estado=${palletStatus.cargado_camion} and ec.desc_estado is null`;

  const resp: any[] = await runQuery({ sql: queryCarga, params: [anden] } as any);
  return resp;
};


export const cargaCC = async (whse: any) => {
  const querySelectCarga = `select a.id_pallet,
  desc_estado,
  PALLET_VIRTUAL,
  FECHA_CC,
  HUB,
  ANDEN,
  id_carga,
  user,
  estado_carga_camion
from (select p.id_pallet,
        desc_estado,
        pallet        as                                                                        PALLET_VIRTUAL,
        c.fecha_carga as                                                                        FECHA_CC,
        (case
                  when nombre_hub = 'PED' then (select h2.nombre_hub
                                         from ped_store ps
                                                  inner join trazabilidad_hub.hub h2 on ps.id_hub = h2.id_hub
                                         inner join trazabilidad_hub.jaula j2 on h2.id_hub = j2.id_hub
                                         where ps.store_number=j.num_jaula limit 1)
                 else nombre_hub
                 end)                                                                                HUB,
        a.anden       as                                                                        ANDEN,
        p.id_carga,
        (select user from log_estado where id_pallet = p.id_pallet order by fecha DESC limit 1) user,
        (select id_estado_carga
         from log_estado_carga
         where id_carga = p.id_carga
         order by fecha DESC
         limit 1)                                                                               estado_carga_camion

 from pallet p
          inner join anden a on a.id_anden = p.id_anden
          inner join estado_pallet ep on p.id_estado = ep.id_estado
          inner join jaula j on j.id_jaula = p.id_jaula
          inner join hub h on h.id_hub = j.id_hub
          inner join carga c on c.id_carga = p.id_carga
          left join (select * from log_estado order by fecha DESC limit 1) l on l.id_pallet = p.id_pallet
 where p.whse = ?
   and p.id_estado = ${palletStatus.cargado_camion}) a
where estado_carga_camion is null group by PALLET_VIRTUAL, desc_estado, a.id_pallet, FECHA_CC, HUB,ANDEN, id_carga, user,
         estado_carga_camion`;

  const resp: any[] = await runQuery({ sql: querySelectCarga, params: [whse] } as any);
  return resp;
};


export const getDataCartonEspecifico = async (carton: any) => {
  const queryCarton = `select p.id_pallet,olpn as LPN, desc_estado,ep.id_estado, pallet,a.anden, nombre_hub from carton o 
    inner join pallet p on p.id_pallet = o.id_pallet 
    left join anden a on a.id_anden = p.id_anden 
    inner join estado_pallet ep on p.id_estado =ep.id_estado
    inner join jaula j on j.id_jaula =p.id_jaula
    inner join hub h on h.id_hub = j.id_hub
      where pallet = ?`;
  const dataCarton: any[] = await runQuery({ sql: queryCarton, params: [carton] } as any);
  if (dataCarton.length === 0) throw new Error(`Carton ${carton} not found`);
  return dataCarton;
};

export const idCargaPallet = async (pallet: any, sellos: boolean) => {
  const list = Array.isArray(pallet) ? pallet : String(pallet).split(",").map(s => s.replace(/['\s]/g, "").trim()).filter(Boolean);
  const placeholders = list.map(() => "?").join(",");
  const selectCargaQuery = { sql: `select num_sello, OT, p.id_carga from pallet p inner join sellos s on p.id_carga = s.id_carga where pallet in (${placeholders})`, params: list } as const;
  const getPallet = { sql: `select p.id_carga from pallet p where p.pallet in (${placeholders})`, params: list } as const;
  const data: any[] = await runQuery((sellos ? selectCargaQuery : getPallet) as any);
  if (data.length === 0) throw new Error(`Pallet ${pallet} not found`);
  return data;
};

export const getDataRecepcionada = async (pallet: any) => {
  const list = Array.isArray(pallet) ? pallet : String(pallet).split(",").map(s => s.replace(/['\s]/g, "").trim()).filter(Boolean);
  const placeholders = list.map(() => "?").join(",");
  const getPallet = `select p.id_pallet, ep.desc_estado, ec.desc_estado ESTADO, lec.fecha FECHA_DESP, pallet PALLET_VIRTUAL, p.id_carga, nombre_hub
  from pallet p
           inner join anden a on a.id_anden = p.id_anden
           inner join estado_pallet ep on p.id_estado = ep.id_estado
           inner join jaula j on j.id_jaula = p.id_jaula
           inner join hub h on h.id_hub = j.id_hub
           inner join log_estado_carga lec on p.id_carga = lec.id_carga
  inner join estado_carga ec on lec.id_estado_carga = ec.id_state_carga
      where p.id_estado=3 and ec.desc_estado ="Despachado" and p.pallet in (${placeholders}) group by p.id_pallet, ep.desc_estado,lec.fecha, ec.desc_estado, pallet, p.id_carga, nombre_hub`;

  const data: any[] = await runQuery({ sql: getPallet, params: list } as any);
  if (data.length === 0) throw new Error(`Pallet ${pallet} not found`);
  return data;
};


export const updateSellosOT = async (listProps: PropsSellos[]) => {
  for (let props of listProps) {
    const { sello1, sello2, OT, pallet, usuario } = props;
    const selectCargaQuery = { sql: `select num_sello, OT, p.id_carga from pallet p inner join sellos s on p.id_carga = s.id_carga where p.id_carga in (?)`, params: [pallet.id_carga] };
    const data: any[] = await runQuery(selectCargaQuery as any);
    if (!data?.[0]?.OT) {
      let updateOT = `update sellos p set num_sello=?, OT=?  where id_carga=?`;
      await updateData(updateOT, [`${sello1}, ${sello2}`, OT, pallet.id_carga]);
      await postData(
        `insert into log_estado_carga (id_estado_carga, id_carga, user, num_sello, OT) values (?, ?, ?, ?, ?)`,
        [statusCarga.recepcionado, pallet.id_carga, usuario, `${sello1}, ${sello2}`, OT]
      );
    }
  }
};

export const saveDataDespacho = async (listProps: PropsSellos[]) => {
  try {
    for (let props of listProps) {
      const { sello1, sello2, OT, pallet, usuario, route } = props;
      if (!pallet?.num_sello) {
        await insertSellosByPallet(sello1, sello2, OT, pallet, route);
        await postData(
          `insert into log_estado_carga (id_estado_carga, id_carga, user, num_sello, OT) values (?, ?, ?, ?, ?)`,
          [statusCarga.despachado, pallet.id_carga, usuario, `${sello1}, ${sello2}`, OT]
        );
      } else {
        await haveSellos(sello1, sello2, OT, pallet, route, usuario);
      }
    }
  } catch (error) {
    logger.error(error);
  }
};

const haveSellos = async (
  sello1: string,
  sello2: string,
  OT: string,
  pallet: any,
  route: number,
  usuario: string
) => {
  let queryUpdate = ``;
  if (sello1 && !sello2)
    queryUpdate = `update sellos p set num_sello=?, OT=?, route=?  where id_carga=?`;
  if (!sello1 && sello2)
    queryUpdate = `update sellos p set num_sello=?, OT=?, route=?  where id_carga=?`;
  else if (sello1 && sello2)
    queryUpdate = `update sellos p set num_sello=?, OT=?, route=? where id_carga=?`;
  if (queryUpdate.length === 0) throw new Error("Sin condicional para actualizar sellos");
  const numSello = sello1 && !sello2 ? sello1 : !sello1 && sello2 ? sello2 : `${sello1},${sello2}`;
  await updateData(queryUpdate, [numSello, OT, route, pallet.id_carga]);
  await postData(
    `insert into log_estado_carga (id_estado_carga, id_carga, user) values (?, ?, ?)`,
    [statusCarga.despachado, pallet.id_carga, usuario]
  );
};


export function asignarWhse(cc: string): string | number {
  const casos: any = {
    "214": 20,
    "508": 25,
    "257": 1902,
    "367": 21,
    "1902": 1902,
    "Todos": "'221','21','20','25','1902'",
  };
  return casos[cc] || 221;
}

export const getDataCartones = async (cc: any, diferencia: number) => {
  let whse: string | number = 0;
  switch (cc) {
    case "214":
      whse = 20;
      break;
    case "508":
      whse = 25;
      break;
    case "257":
      whse = 1902;
      break;
    case "367":
      whse = 21;
      break;
    case "Todos":
      whse = "'221','21','20','25','1902'";
      break;
    default:
      whse = 221;
      break;
  }
  let getCartones = `select CARTON,
  (case when finalStatus is null then ESTADO_PALLETs else upper(finalStatus) end) ESTADO_PALLET,
  ID_PALLET,
  FECHA_PALLETIZADO,
  UBICACION_PH,
  ID_ESTADO,
  JAULA,
  PALLET_VIRTUAL,
  ANDEN,
  HUB,
  CC_ORIGEN
from (select p.id_pallet,
        olpn         AS                                                                         CARTON,
        o.created_at as                                                                         FECHA_PALLETIZADO,
        p.ubication                                                                             UBICACION_PH,
        UPPER(desc_estado)                                                                      ESTADO_PALLETs,
        ep.id_estado,
        j.num_jaula                                                                             JAULA,
        pallet       AS                                                                         PALLET_VIRTUAL,
        a.anden,
        UPPER(nombre_hub )                                                                             HUB,
        p.whse                                                                                  CC_ORIGEN,
        (select ec.desc_estado
         from log_estado_carga
                  inner join estado_carga ec on log_estado_carga.id_estado_carga = ec.id_state_carga
         where id_carga = p.id_carga
         order by fecha desc
         limit 1)                                                                               finalStatus,
        (select user from log_estado where id_pallet = p.id_pallet order by fecha DESC limit 1) USUARIO_CC
 from carton o
          inner join pallet p on p.id_pallet = o.id_pallet
          left join anden a on a.id_anden = p.id_anden
          inner join estado_pallet ep on p.id_estado = ep.id_estado
          inner join jaula j on j.id_jaula = p.id_jaula
          inner join hub h on h.id_hub = j.id_hub
 where p.whse in (${whse}) and o.created_at >= DATE_SUB(NOW(), INTERVAL ${diferencia} day )
 group by p.id_pallet,
          olpn,
          o.created_at,
          p.ubication,
          UPPER(desc_estado),
          ep.id_estado,
          j.num_jaula,
          pallet,
          a.anden,
          nombre_hub,
          p.whse,
          (select id_estado_carga from log_estado_carga where id_carga = p.id_carga order by fecha desc limit 1),
          (select user from log_estado where id_pallet = p.id_pallet order by fecha DESC limit 1)) b`;
  const resp = await runQuery(getCartones);
  return resp;
};

export const insertSellosByPallet = async (
  sello1: string,
  sello2: string,
  OT: string,
  pallet: any,
  route: number
): Promise<void> => {
  let query = "";
  if (sello1 && !sello2) {
    query = `insert into sellos ( num_sello, OT, id_carga, route) values (?, ?, ?, ?)`;
    await postData(query, [sello1, OT, pallet.id_carga, route]);
    query = "";
  }
  if (!sello1 && sello2) {
    query = `insert into sellos ( num_sello, OT, id_carga, route) values (?, ?, ?, ?)`;
    await postData(query, [sello2, OT, pallet.id_carga, route]);
    query = "";
  } else if (sello1 && sello2) {
    query = `insert into sellos ( num_sello, OT, id_carga, route) values (?, ?, ?, ?)`;
    await postData(query, [`${sello1},${sello2}`, OT, pallet.id_carga, route]);
    query = "";
  }
  if (query) await postData(query); 
};

export const getlpnByPallet = async (pallet: string) => {
  const qp = queryGetCartonesByPallet(pallet) as any;
  const rows: any[] = await runQuery(qp);
  return rows;
};

export const getAllDataLocal = async (cc: any) => {
  try {
    const qp = queryGetAllData(cc) as any;
    const rows: any[] = await runQuery(qp);
    return rows;
  } catch (error) {
    logger.error(error);
  }
};

export const getDataLpn = async (pallet: Array<string>, bodega: any) => {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `${URLservicesProvider.venv}:3052/getDataLpns`,
    headers: {
      "Content-Type": "application/json",
    },
    params: {
      pallet,
      whse: bodega,
    },
    paramsSerializer: (params) => {
      const searchParams = new URLSearchParams();
      searchParams.append("whse", params.whse);
      params.pallet.forEach((p: string) => searchParams.append("pallet", p));
      return searchParams.toString();
    },
  } as const;
  try {
    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    logger.error(error);
  }
};

export const updateUbicacionPallet = async (pallet: string, ubicacion: string, _usuario: string) => {
  const addCarton = `update pallet p set p.ubication = ? where p.pallet = ?`;
  await poolObiwan.query(addCarton, [ubicacion, pallet]);
};

export const newRoute = async (user: string) => {
  const routeCorrelative = await postData(`insert into correlativo_route (user) values (?)`, [user]);
  return routeCorrelative;
};
