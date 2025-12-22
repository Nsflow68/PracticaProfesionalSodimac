const buildChunkedWhere = (column, items, binds, prefix) => {
  if (!Array.isArray(items)) {
    binds[`${prefix}0`] = items;
    return `${column} = :${prefix}0`;
  }

  const chunks = [];
  for (let i = 0; i < items.length; i += 1000) {
    chunks.push(items.slice(i, i + 1000));
  }

  const chunkConditions = chunks.map((chunk, chunkIdx) => {
    const placeholders = chunk.map((item, itemIdx) => {
      const key = `${prefix}_${chunkIdx}_${itemIdx}`;
      binds[key] = item;
      return `:${key}`;
    });
    return `${column} IN (${placeholders.join(',')})`;
  });

  return `(${chunkConditions.join(' OR ')})`;
};

const infoLPN = (lpns, whse = '221') => {
  let binds = {};

  
  switch (whse) {
    case '20': whse = '214'; break;
    case '25': whse = '508'; break;
    case '21': whse = '367'; break;
    case '1902': whse = '257'; break;
    default: break;
  }

  let sql = '';
  
  const getCol = () => (whse === '221' || whse === '257' || whse === '262') ? 'l.TC_LPN_ID' : 'L.CARTON_NBR';
  const whereClause = buildChunkedWhere(getCol(), lpns, binds, 'lpn');

  switch (whse) {
    case '221':
      binds['whse'] = whse;
      sql = `
  select L.ITEM_NAME           SKU,
         l.tc_lpn_id,
         L.LPN_FACILITY_STATUS ESTADO_CARTON,
         O.ORDER_ID,
         O.ORDER_TYPE,
         o.RTE_TO JAULA,
         O.DO_STATUS,
         rd.NUM_PKT,
         O.EXT_PURCHASE_ORDER RESERVA,
         rd.FECHA_ENTREGA,
         rd.fecha_despacho,
         rd.FECHA_INI_PROCESO,
         rd.CC_ORIGEN,
         O.DO_STATUS,
         rd.NUM_PKT,
         rd.COD_ESTADOPKT,
         rd.COD_ESTADODET,
         rd.CC_DESPACHA
  from lpn@WMS2017CDS l
           inner join ORDERS@WMS2017CDS o on l.ORDER_ID = o.ORDER_ID
           inner join reserva_dtl@dadi rd on o.EXT_PURCHASE_ORDER = rd.NUM_RESERVA
  WHERE ORDER_TYPE IN ('PEC', 'POS')
    and L.INBOUND_OUTBOUND_INDICATOR = 'O'
    and rd.cc_despacha = :whse
    and ${whereClause} group by L.ITEM_NAME,
    l.tc_lpn_id,
    L.LPN_FACILITY_STATUS,
    O.ORDER_ID,
    O.ORDER_TYPE,
    o.RTE_TO ,
    O.DO_STATUS,
    rd.NUM_PKT,
    O.EXT_PURCHASE_ORDER ,
    rd.FECHA_ENTREGA,
    rd.fecha_despacho,
    rd.FECHA_INI_PROCESO,
    rd.CC_ORIGEN,
    O.DO_STATUS,
    rd.NUM_PKT,
    rd.COD_ESTADOPKT,
    rd.COD_ESTADODET,
    rd.CC_DESPACHA`;
      break;

    case '257':
      sql = `select L.ITEM_NAME           SKU,
        l.tc_lpn_id,
        L.LPN_FACILITY_STATUS ESTADO_CARTON,
        O.ORDER_ID,
        O.ORDER_TYPE,
        o.RTE_TO JAULA,
        O.DO_STATUS,
        rd.NUM_PKT,
        O.EXT_PURCHASE_ORDER RESERVA,
        rd.FECHA_ENTREGA,
        rd.fecha_despacho,
        rd.FECHA_INI_PROCESO,
        rd.CC_ORIGEN,
        O.DO_STATUS,
        rd.NUM_PKT,
        rd.COD_ESTADOPKT,
        rd.COD_ESTADODET,
      rd.CC_DESPACHA
      from lpn@WMSTEMPLATE_257 l
          inner join ORDERS@WMSTEMPLATE_257 o on l.ORDER_ID = o.ORDER_ID
          inner join reserva_dtl@dadi rd on o.EXT_PURCHASE_ORDER = rd.NUM_RESERVA
      WHERE ORDER_TYPE IN ('PEC', 'POS')
      and L.INBOUND_OUTBOUND_INDICATOR = 'O'
      and ${whereClause} group by L.ITEM_NAME,
      l.tc_lpn_id,
      L.LPN_FACILITY_STATUS,
      O.ORDER_ID,
      O.ORDER_TYPE,
      o.RTE_TO ,
      O.DO_STATUS,
      rd.NUM_PKT,
      O.EXT_PURCHASE_ORDER ,
      rd.FECHA_ENTREGA,
      rd.fecha_despacho,
      rd.FECHA_INI_PROCESO,
      rd.CC_ORIGEN,
      O.DO_STATUS,
      rd.NUM_PKT,
      rd.COD_ESTADOPKT,
      rd.COD_ESTADODET,
      rd.CC_DESPACHA`;
      break;

    case '262':
      binds['whse'] = whse;
      sql = `select L.ITEM_NAME           SKU,
      l.tc_lpn_id,
      L.LPN_FACILITY_STATUS ESTADO_CARTON,
      O.ORDER_ID,
      O.ORDER_TYPE,
      o.RTE_TO JAULA,
      O.DO_STATUS,
      O.EXT_PURCHASE_ORDER RESERVA,
      rd.NUM_PKT,
      rd.FECHA_ENTREGA,
      rd.fecha_despacho,
      rd.FECHA_INI_PROCESO,
      rd.CC_ORIGEN,
      O.DO_STATUS,
      rd.NUM_PKT,
      rd.COD_ESTADOPKT,
      rd.COD_ESTADODET,
      rd.CC_ORIGEN
  from lpn@WMOS2017CORONEL l
        inner join ORDERS@WMOS2017CORONEL o on l.ORDER_ID = o.ORDER_ID
        inner join reserva_dtl@dadi rd on o.EXT_PURCHASE_ORDER = rd.NUM_RESERVA
  WHERE ORDER_TYPE IN ('PEC', 'POS')
  and L.INBOUND_OUTBOUND_INDICATOR = 'O'
  and rd.cc_despacha = :whse
  and ${whereClause}`;
      break;

    default:
      binds['whse'] = whse;
      sql = `SELECT substr(L.CARTON_NBR, 13, 6) LPN_ID,
      L.CARTON_NBR                TC_LPN_ID,
      L.STAT_CODE                 LPN_FACILITY_STATUS,
      L.PKT_CTRL_NBR              ORDER_ID,
      O.PKT_NBR                   DO,
      L.SKU_ID                    SKU,
      O.CUST_DEPT                 ORDER_TYPE,
      O.THRD_PARTY_BILL           RESERVA,
      O.CONS_ACCT_NBR             JAULA,
      rd.NUM_PKT,
      rd.FECHA_ENTREGA,
      rd.fecha_despacho,
      rd.FECHA_INI_PROCESO,
      rd.CC_ORIGEN,
      rd.NUM_PKT,
      rd.COD_ESTADOPKT ESTADO_PKT,
      rd.COD_ESTADODET,
      rd.CC_DESPACHA
  FROM CARTON_HDR@WMOS_BC_LECTURA L
          left join PKT_HDR@WMOS_BC_LECTURA O on L.PKT_CTRL_NBR = O.PKT_CTRL_NBR
   inner join reserva_dtl@dadi rd on O.THRD_PARTY_BILL = rd.NUM_RESERVA
  where L.STAT_CODE > '10' and rd.CC_ORIGEN=:whse and ${whereClause} group by L.CARTON_NBR,
  L.STAT_CODE                 ,
  L.PKT_CTRL_NBR              ,
  O.PKT_NBR                   ,
  L.SKU_ID                    ,
  O.CUST_DEPT                ,
  O.THRD_PARTY_BILL,
  O.CONS_ACCT_NBR ,
  rd.NUM_PKT,
  rd.FECHA_ENTREGA,
  rd.fecha_despacho,
  rd.FECHA_INI_PROCESO,
  rd.CC_ORIGEN,
  rd.NUM_PKT,
  rd.COD_ESTADOPKT,
  rd.COD_ESTADODET,
  rd.CC_DESPACHA`;
      break;
  }
  return { sql, binds };
};




const infoGeneralLpn = (lpns, cc) => {
  let binds = {};

  
  
  
  
  
  

  
  
  
  

  
  
  
  
  
  
  
  
  
  
  
  

  
  
  

  
  
  
  
  

  
  

  const getCol = () => (cc === '221' || cc === '257' || cc === '262') ? 'l.TC_LPN_ID' : 'L.CARTON_NBR';
  const whereClause = buildChunkedWhere(getCol(), lpns, binds, 'lpn');

  let sql = '';
  switch (cc) {
    case "221":
      binds['cc'] = 221;
      sql = `with uno as (select L.ITEM_NAME           SKU,
                l.tc_lpn_id,
                L.LPN_FACILITY_STATUS ESTADO_CARTON,
                O.ORDER_ID,
                O.ORDER_TYPE,
                o.RTE_TO JAULA,
                O.DO_STATUS,
                rd.NUM_PKT,
                O.EXT_PURCHASE_ORDER,
                rd.FECHA_ENTREGA,
                rd.fecha_despacho,
                rd.FECHA_INI_PROCESO,
                rd.CC_ORIGEN,
                O.DO_STATUS,
                rd.NUM_PKT,
                rd.COD_ESTADOPKT,
                rd.COD_ESTADODET,
         rd.CC_ORIGEN
         from lpn@WMS2017CDS l
                  inner join ORDERS@WMS2017CDS o on l.ORDER_ID = o.ORDER_ID
                  inner join reserva_dtl@dadi rd on o.EXT_PURCHASE_ORDER = rd.NUM_RESERVA
         WHERE ORDER_TYPE IN ('PEC', 'POS')
           and L.INBOUND_OUTBOUND_INDICATOR = 'O'
           and rd.cc_despacha = :cc
           --and rd.PRD_LVL_NUMBER = l.item_name
           and ${whereClause}
         ) select COUNT(DISTINCT tc_lpn_id)                        CARTONES_QTY,
                to_char(MIN(FECHA_INI_PROCESO), 'dd-mm-yyyy') FECHA_INI_PROCESO,
                to_char(MIN(FECHA_DESPACHO), 'dd-mm-yyyy')    MIN_FECHA_DESPACHO,
                to_char(MAX(FECHA_DESPACHO), 'dd-mm-yyyy')    MAX_FECHA_DESPACHO
         from uno`;
      break;

    case "257":
      sql = `with uno as (select L.ITEM_NAME           SKU,
                  l.tc_lpn_id,
                  L.LPN_FACILITY_STATUS ESTADO_CARTON,
                  O.ORDER_ID,
                  O.ORDER_TYPE,
                  o.RTE_TO JAULA,
                  O.DO_STATUS,
                  rd.NUM_PKT,
                  O.EXT_PURCHASE_ORDER,
                  rd.FECHA_ENTREGA,
                  rd.fecha_despacho,
                  rd.FECHA_INI_PROCESO,
                  rd.CC_ORIGEN,
                  O.DO_STATUS,
                  rd.NUM_PKT,
                  rd.COD_ESTADOPKT,
                  rd.COD_ESTADODET,
           rd.CC_ORIGEN
           from lpn@WMSTEMPLATE_257 l
                    inner join ORDERS@WMSTEMPLATE_257 o on l.ORDER_ID = o.ORDER_ID
                    inner join reserva_dtl@dadi rd on o.EXT_PURCHASE_ORDER = rd.NUM_RESERVA
           WHERE ORDER_TYPE IN ('PEC', 'POS')
             and L.INBOUND_OUTBOUND_INDICATOR = 'O'
             --and rd.PRD_LVL_NUMBER = l.item_name
             and ${whereClause}
           ) select COUNT(DISTINCT tc_lpn_id)                        CARTONES_QTY,
                  to_char(MIN(FECHA_INI_PROCESO), 'dd-mm-yyyy') FECHA_INI_PROCESO,
                  to_char(MIN(FECHA_DESPACHO), 'dd-mm-yyyy')    MIN_FECHA_DESPACHO,
                  to_char(MAX(FECHA_DESPACHO), 'dd-mm-yyyy')    MAX_FECHA_DESPACHO
           from uno`;
      break;

    case "262":
      binds['cc'] = 262;
      sql = `with uno as (select L.ITEM_NAME           SKU,
                l.tc_lpn_id,
                L.LPN_FACILITY_STATUS ESTADO_CARTON,
                O.ORDER_ID,
                O.ORDER_TYPE,
                o.RTE_TO JAULA,
                O.DO_STATUS,
                rd.NUM_PKT,
                O.EXT_PURCHASE_ORDER,
                rd.FECHA_ENTREGA,
                rd.fecha_despacho,
                rd.FECHA_INI_PROCESO,
                rd.CC_ORIGEN,
                O.DO_STATUS,
                rd.NUM_PKT,
                rd.COD_ESTADOPKT,
                rd.COD_ESTADODET,
         rd.CC_ORIGEN
         from lpn@WMOS2017CORONEL l
                  inner join ORDERS@WMOS2017CORONEL o on l.ORDER_ID = o.ORDER_ID
                  inner join reserva_dtl@dadi rd on o.EXT_PURCHASE_ORDER = rd.NUM_RESERVA
         WHERE ORDER_TYPE IN ('PEC', 'POS')
           and L.INBOUND_OUTBOUND_INDICATOR = 'O'
           and rd.cc_despacha = :cc
           --and rd.PRD_LVL_NUMBER = l.item_name
           and ${whereClause}
         ) select COUNT(DISTINCT tc_lpn_id)                        CARTONES_QTY,
                to_char(MIN(FECHA_INI_PROCESO), 'dd-mm-yyyy') FECHA_INI_PROCESO,
                to_char(MIN(FECHA_DESPACHO), 'dd-mm-yyyy')    MIN_FECHA_DESPACHO,
                to_char(MAX(FECHA_DESPACHO), 'dd-mm-yyyy')    MAX_FECHA_DESPACHO
         from uno`;
      break;

    default:
      sql = `with uno as (SELECT substr(L.CARTON_NBR, 13, 6) LPN_ID,
                    L.CARTON_NBR                TC_LPN_ID,
                    L.STAT_CODE                 LPN_FACILITY_STATUS,
                    L.PKT_CTRL_NBR              ORDER_ID,
                    O.PKT_NBR                   DO,
                    O.CUST_DEPT                 ORDER_TYPE,
                    O.THRD_PARTY_BILL           RESERVA,
                    O.CONS_ACCT_NBR             JAULA,
                    R.FECHA_INI_PROCESO,
                    R.FECHA_ENTREGA,
                    R.FECHA_DESPACHO
                    FROM CARTON_HDR@WMOS_BC_LECTURA L
                                left join PKT_HDR@WMOS_BC_LECTURA O on L.PKT_CTRL_NBR = O.PKT_CTRL_NBR
                        inner join reserva_dtl@dadi R on O.THRD_PARTY_BILL = R.NUM_RESERVA
                    where L.STAT_CODE > '10' and ${whereClause}
                    )
                    select COUNT(DISTINCT LPN_ID)                        CARTONES_QTY,
                    to_char(MIN(FECHA_INI_PROCESO), 'dd-mm-yyyy') FECHA_INI_PROCESO,
                    to_char(MIN(FECHA_DESPACHO), 'dd-mm-yyyy')    MIN_FECHA_DESPACHO,
                    to_char(MAX(FECHA_DESPACHO), 'dd-mm-yyyy')    MAX_FECHA_DESPACHO
                    from uno `;
      break;
  }
  return { sql, binds };
}





const estadoLPN = (ilpn, whse) => {
  const binds = { ilpn };

  if (whse === '221') {
    const sql = `SELECT L.LPN_ID,
      L.TC_LPN_ID,
      L.LPN_FACILITY_STATUS,
      L.ORDER_ID,
      O.TC_ORDER_ID        DO,
      O.ORDER_TYPE,
      O.EXT_PURCHASE_ORDER RESERVA,
      O.RTE_TO             JAULA,
      ic.item_name         SKU
FROM LPN@WMS2017CDS L
        LEFT JOIN ORDERS@WMS2017CDS O ON L.ORDER_ID = O.ORDER_ID
        left join LPN_DETAIL@WMS2017CDS LD on l.lpn_id = ld.lpn_id
        left join ITEM_CBO@WMS2017CDS ic on ic.item_id = ld.item_id
WHERE L.TC_LPN_ID = :ilpn
 AND O.ORDER_TYPE IN ('PEC', 'POS')`;
    return { sql, binds };
  } else if (whse === '1902') {
    const sql = `SELECT L.LPN_ID,
    L.TC_LPN_ID,
    L.LPN_FACILITY_STATUS,
    L.ORDER_ID,
    O.TC_ORDER_ID        DO,
    O.ORDER_TYPE,
    O.EXT_PURCHASE_ORDER RESERVA,
    O.RTE_TO             JAULA,
    ic.item_name         SKU
FROM LPN@WMSTEMPLATE_257 L
      LEFT JOIN ORDERS@WMSTEMPLATE_257 O ON L.ORDER_ID = O.ORDER_ID
      left join LPN_DETAIL@WMSTEMPLATE_257 LD on l.lpn_id = ld.lpn_id
      left join ITEM_CBO@WMSTEMPLATE_257 ic on ic.item_id = ld.item_id
WHERE L.TC_LPN_ID = :ilpn
AND O.ORDER_TYPE IN ('PEC', 'POS')`;
    return { sql, binds };
  } else if (whse === '1707') {
    const sql = `SELECT L.LPN_ID,
      L.TC_LPN_ID,
      L.LPN_FACILITY_STATUS,
      L.ORDER_ID,
      O.TC_ORDER_ID        DO,
      O.ORDER_TYPE,
      O.EXT_PURCHASE_ORDER RESERVA,
      O.RTE_TO             JAULA,
      ic.item_name         SKU
FROM LPN@WMOS2017CORONEL L
        LEFT JOIN ORDERS@WMOS2017CORONEL O ON L.ORDER_ID = O.ORDER_ID
        left join LPN_DETAIL@WMOS2017CORONEL LD on l.lpn_id = ld.lpn_id
        left join ITEM_CBO@WMOS2017CORONEL ic on ic.item_id = ld.item_id
WHERE L.TC_LPN_ID = :ilpn
 AND O.ORDER_TYPE IN ('PEC', 'POS')`;
    return { sql, binds };
  } else {
    let cc;
    switch (whse) {
      case '20':
        cc = '214';
        break;
      case '25':
        cc = '508';
        break;
      case '21':
        cc = '367';
        break;
      default:
        cc = '221';
        break;
    }
    const sql = `SELECT substr(L.CARTON_NBR, 13, 6) LPN_ID,
      L.CARTON_NBR                TC_LPN_ID,
      L.STAT_CODE                 LPN_FACILITY_STATUS,
      O.PKT_CTRL_NBR              ORDER_ID,
      O.PKT_NBR                   DO,
      O.CUST_DEPT                 ORDER_TYPE,
      O.THRD_PARTY_BILL           RESERVA,
      O.CONS_ACCT_NBR             JAULA,
      L.SKU_ID                    SKU,
      rd.cod_estadodet,
       rd.cc_despacha
FROM CARTON_HDR@WMOS_BC_LECTURA L
        LEFT JOIN (SELECT * FROM PKT_HDR@WMOS_BC_LECTURA WHERE CUST_DEPT IN ('PEC', 'POS')) O
                  ON L.PKT_CTRL_NBR = O.PKT_CTRL_NBR
   left join reserva_dtl@dadi rd  on rd.num_reserva=O.THRD_PARTY_BILL
WHERE L.CARTON_NBR = :ilpn AND rd.cc_despacha=:cc`;
    return { sql, binds: { ilpn, cc } };
  }
}


const detalleReserva = (reserva) => {
  return {
    sql: `SELECT NUM_RESERVA, NUM_DETALLE, FECHA_INI_PROCESO, CC_ORIGEN,CC_DESPACHA, FECHA_ENTREGA FROM RESERVA_DTL@DADI WHERE NUM_RESERVA = :reserva`,
    binds: { reserva }
  };
}




const infoReserva221 = (reserva) => {
  return {
    sql: `
  SELECT L.LPN_ID,
  L.TC_LPN_ID,
  L.LPN_FACILITY_STATUS,
  L.ORDER_ID,
  O.TC_ORDER_ID        DO,
  O.ORDER_TYPE,
  O.EXT_PURCHASE_ORDER RESERVA,
  O.RTE_TO             JAULA,
  ic.item_name         SKU
FROM LPN@WMS2017CDS L
    LEFT JOIN ORDERS@WMS2017CDS O ON L.ORDER_ID = O.ORDER_ID
    left join LPN_DETAIL@WMS2017CDS LD on l.lpn_id = ld.lpn_id
    left join ITEM_CBO@WMS2017CDS ic on ic.item_id = ld.item_id
WHERE O.EXT_PURCHASE_ORDER  = :reserva
AND O.ORDER_TYPE IN ('PEC', 'POS')`,
    binds: { reserva }
  };
};


const infoReserva257 = (reserva) => {
  return {
    sql: `
  SELECT L.LPN_ID,
  L.TC_LPN_ID,
  L.LPN_FACILITY_STATUS,
  L.ORDER_ID,
  O.TC_ORDER_ID        DO,
  O.ORDER_TYPE,
  O.EXT_PURCHASE_ORDER RESERVA,
  O.RTE_TO             JAULA,
  ic.item_name         SKU
FROM LPN@WMSTEMPLATE_257 L
    LEFT JOIN ORDERS@WMSTEMPLATE_257 O ON L.ORDER_ID = O.ORDER_ID
    left join LPN_DETAIL@WMSTEMPLATE_257 LD on l.lpn_id = ld.lpn_id
    left join ITEM_CBO@WMSTEMPLATE_257 ic on ic.item_id = ld.item_id
WHERE O.EXT_PURCHASE_ORDER  = :reserva
AND O.ORDER_TYPE IN ('PEC', 'POS')`,
    binds: { reserva }
  };
};


const infoReserva1707 = (reserva) => {
  return {
    sql: `SELECT L.LPN_ID,
      L.TC_LPN_ID,
      L.LPN_FACILITY_STATUS,
      L.ORDER_ID,
      O.TC_ORDER_ID        DO,
      O.ORDER_TYPE,
      O.EXT_PURCHASE_ORDER RESERVA,
      O.RTE_TO             JAULA,
      ic.item_name         SKU,
      221 as CC_DESPACHA
FROM LPN@WMOS2017CORONEL L
        LEFT JOIN ORDERS@WMOS2017CORONEL O ON L.ORDER_ID = O.ORDER_ID
        left join LPN_DETAIL@WMOS2017CORONEL LD on l.lpn_id = ld.lpn_id
        left join ITEM_CBO@WMOS2017CORONEL ic on ic.item_id = ld.item_id
WHERE  O.EXT_PURCHASE_ORDER = :reserva
 AND O.ORDER_TYPE IN ('PEC', 'POS')`,
    binds: { reserva }
  };
};

const infoReservaBc = (reserva) => {
  return {
    sql: `SELECT substr(L.CARTON_NBR, 13, 6) LPN_ID,
      L.CARTON_NBR                TC_LPN_ID,
      L.STAT_CODE                 LPN_FACILITY_STATUS,
      O.PKT_CTRL_NBR              ORDER_ID,
      O.PKT_NBR                   DO,
      O.CUST_DEPT                 ORDER_TYPE,
      O.THRD_PARTY_BILL           RESERVA,
      O.CONS_ACCT_NBR             JAULA,
      L.SKU_ID                    SKU,
      rd.cod_estadodet,
       rd.cc_despacha
FROM CARTON_HDR@WMOS_BC_LECTURA L
        LEFT JOIN (SELECT * FROM PKT_HDR@WMOS_BC_LECTURA WHERE CUST_DEPT IN ('PEC', 'POS')) O
                  ON L.PKT_CTRL_NBR = O.PKT_CTRL_NBR
   left join reserva_dtl@dadi rd  on rd.num_reserva=O.THRD_PARTY_BILL
WHERE O.THRD_PARTY_BILL  = :reserva and rd.cc_despacha in ('214', '508', '367')`,
    binds: { reserva }
  };
};


const detalleGeneralFechasDadi = (pallet, cc) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log("entra a la data dadi" + cc + pallet);
  }
  let sql = '';
  const binds = { pallet, cc };

  if (cc == "221") {
    sql = `with uno as (
SELECT TC.LPN, TC.FECHA_CONSOLIDACION,
L.LPN_ID, L.TC_LPN_ID, L.LPN_FACILITY_STATUS, L.ORDER_ID,
O.TC_ORDER_ID DO, O.ORDER_TYPE, O.EXT_PURCHASE_ORDER RESERVA, O.RTE_TO JAULA,
R.FECHA_INI_PROCESO, R.FECHA_ENTREGA, R.FECHA_DESPACHO
FROM TRZHUB_CARTONESHUB TC
LEFT JOIN (SELECT * FROM LPN@WMS2017CDS WHERE INBOUND_OUTBOUND_INDICATOR='O' AND LPN_FACILITY_STATUS>'10') L ON L.TC_LPN_ID=TC.LPN
LEFT JOIN (SELECT * FROM ORDERS@WMS2017CDS WHERE ORDER_TYPE IN ('PEC', 'POS')) O ON L.ORDER_ID = O.ORDER_ID
LEFT JOIN RESERVA_DTL@DADI R ON O.EXT_PURCHASE_ORDER = R.NUM_RESERVA
WHERE
TC.PALLET_VIRTUAL = :pallet
AND R.CC_ORIGEN= :cc
) select COUNT(DISTINCT LPN_ID) CARTONES_QTY, to_char(MIN(FECHA_INI_PROCESO), 'dd-mm-yyyy') FECHA_INI_PROCESO, to_char(MIN(FECHA_DESPACHO), 'dd-mm-yyyy') MIN_FECHA_DESPACHO, to_char(MAX(FECHA_DESPACHO), 'dd-mm-yyyy') MAX_FECHA_DESPACHO  from uno`;
  } else if (cc == "257") {
    sql = `with uno as (
SELECT TC.LPN, TC.FECHA_CONSOLIDACION,
L.LPN_ID, L.TC_LPN_ID, L.LPN_FACILITY_STATUS, L.ORDER_ID,
O.TC_ORDER_ID DO, O.ORDER_TYPE, O.EXT_PURCHASE_ORDER RESERVA, O.RTE_TO JAULA,
R.FECHA_INI_PROCESO, R.FECHA_ENTREGA, R.FECHA_DESPACHO
FROM TRZHUB_CARTONESHUB TC
LEFT JOIN (SELECT * FROM LPN@WMSTEMPLATE_257 WHERE INBOUND_OUTBOUND_INDICATOR='O' AND LPN_FACILITY_STATUS<'10' and C_FACILITY_ALIAS_ID = '1707') L ON L.TC_LPN_ID=TC.LPN
LEFT JOIN (SELECT * FROM ORDERS@WMSTEMPLATE_257 WHERE ORDER_TYPE IN ('PEC', 'POS')) O ON L.ORDER_ID = O.ORDER_ID
LEFT JOIN RESERVA_DTL@DADI R ON O.EXT_PURCHASE_ORDER = R.NUM_RESERVA
WHERE
TC.PALLET_VIRTUAL = :pallet
AND R.CC_ORIGEN= :cc
) select COUNT(DISTINCT LPN_ID) CARTONES_QTY, to_char(MIN(FECHA_INI_PROCESO), 'dd-mm-yyyy') FECHA_INI_PROCESO, to_char(MIN(FECHA_DESPACHO), 'dd-mm-yyyy') MIN_FECHA_DESPACHO, to_char(MAX(FECHA_DESPACHO), 'dd-mm-yyyy') MAX_FECHA_DESPACHO  from uno`;
  } else if (cc == "262") {
    sql = `with uno as (
SELECT TC.LPN, TC.FECHA_CONSOLIDACION,
L.LPN_ID, L.TC_LPN_ID, L.LPN_FACILITY_STATUS, L.ORDER_ID,
O.TC_ORDER_ID DO, O.ORDER_TYPE, O.EXT_PURCHASE_ORDER RESERVA, O.RTE_TO JAULA,
R.FECHA_INI_PROCESO, R.FECHA_ENTREGA, R.FECHA_DESPACHO
FROM TRZHUB_CARTONESHUB TC
LEFT JOIN (SELECT * FROM LPN@WMOS2017CORONEL WHERE INBOUND_OUTBOUND_INDICATOR='O' AND LPN_FACILITY_STATUS<'10' and C_FACILITY_ALIAS_ID = '1707') L ON L.TC_LPN_ID=TC.LPN
LEFT JOIN (SELECT * FROM ORDERS@WMOS2017CORONEL WHERE ORDER_TYPE IN ('PEC', 'POS')) O ON L.ORDER_ID = O.ORDER_ID
LEFT JOIN RESERVA_DTL@DADI R ON O.EXT_PURCHASE_ORDER = R.NUM_RESERVA
WHERE
TC.PALLET_VIRTUAL = :pallet
AND R.CC_ORIGEN= :cc
) select COUNT(DISTINCT LPN_ID) CARTONES_QTY, to_char(MIN(FECHA_INI_PROCESO), 'dd-mm-yyyy') FECHA_INI_PROCESO, to_char(MIN(FECHA_DESPACHO), 'dd-mm-yyyy') MIN_FECHA_DESPACHO, to_char(MAX(FECHA_DESPACHO), 'dd-mm-yyyy') MAX_FECHA_DESPACHO  from uno`;
  } else {
    
    
    
    sql = `with uno as (
SELECT TC.LPN, TC.FECHA_CONSOLIDACION,
substr(L.CARTON_NBR,13,6) LPN_ID, L.CARTON_NBR TC_LPN_ID, L.STAT_CODE LPN_FACILITY_STATUS, L.PKT_CTRL_NBR ORDER_ID,
O.PKT_NBR DO, O.CUST_DEPT ORDER_TYPE, O.THRD_PARTY_BILL RESERVA, O.CONS_ACCT_NBR JAULA,
R.FECHA_INI_PROCESO, R.FECHA_ENTREGA, R.FECHA_DESPACHO
FROM TRZHUB_CARTONESHUB TC
LEFT JOIN (SELECT * FROM CARTON_HDR@WMOS_BC_LECTURA WHERE STAT_CODE>'10') L ON L.CARTON_NBR=TC.LPN
LEFT JOIN (SELECT * FROM PKT_HDR@WMOS_BC_LECTURA WHERE CUST_DEPT IN ('PEC', 'POS')) O ON L.PKT_CTRL_NBR = O.PKT_CTRL_NBR
LEFT JOIN RESERVA_DTL@DADI R ON O.THRD_PARTY_BILL = R.NUM_RESERVA
WHERE
TC.PALLET_VIRTUAL = :pallet
--AND R.CC_ORIGEN=:cc
) select COUNT(DISTINCT LPN_ID) CARTONES_QTY, to_char(MIN(FECHA_INI_PROCESO), 'dd-mm-yyyy') FECHA_INI_PROCESO,
to_char(MIN(FECHA_DESPACHO), 'dd-mm-yyyy') MIN_FECHA_DESPACHO, to_char(MAX(FECHA_DESPACHO), 'dd-mm-yyyy') MAX_FECHA_DESPACHO  from uno`;
  }
  return { sql, binds };
}


const detUbicacion = (ubic, whse) => {
  if (whse === '221') {
    return `SELECT * FROM LOCN_HDR@WMS2017CDS WHERE LOCN_BRCD = :ubic`;
  }
  else if (whse === '1902') {
    return `SELECT * FROM LOCN_HDR@WMSTEMPLATE_257 WHERE LOCN_BRCD = :ubic`;
  }
  else if (whse === '1707') {
    return `SELECT * FROM LOCN_HDR@WMOS2017CORONEL WHERE LOCN_BRCD = :ubic`;
  }
  else {
    return `SELECT * FROM LOCN_HDR@WMOS_BC_LECTURA WHERE LOCN_BRCD = :ubic AND WHSE = :whse`;
  }

}


const getTypeWCquery = (lpn) => {
  return {
    sql: `select l.tc_lpn_id, o.order_type,l.d_facility_alias_id tienda  from lpn l
inner join orders o on l.order_id = o.order_id  where l.TC_PARENT_LPN_ID = :lpn and  o.order_type ='PED' group by l.tc_lpn_id, o.order_type,l.d_facility_alias_id`,
    binds: { lpn }
  };
}

const getTypeBCquery = (lpn) => {
  return {
    sql: `SELECT C.PLT_ID,P.STORE_NBR tienda, P.CUST_DEPT ORDER_TYPE FROM PKT_HDR P
INNER JOIN CARTON_HDR C ON C.PKT_CTRL_NBR = P.PKT_CTRL_NBR WHERE C.PLT_ID = :lpn and P.CUST_DEPT='PED' group by C.PLT_ID,P.STORE_NBR, P.CUST_DEPT`,
    binds: { lpn }
  };
}

const getTypequery = (lpn) => {
  return {
    sql: `select l.tc_lpn_id, o.order_type,l.d_facility_alias_id tienda  from lpn l
inner join orders o on l.order_id = o.order_id  where l.TC_PARENT_LPN_ID = :lpn and  o.order_type ='PED' group by l.tc_lpn_id, o.order_type,l.d_facility_alias_id`,
    binds: { lpn }
  };
}
const getTypeTemplatequery = (lpn) => {
  return {
    sql: `select l.tc_lpn_id, o.order_type,l.d_facility_alias_id tienda  from lpn@WMSTEMPLATE_257 l
inner join orders@WMSTEMPLATE_257 o on l.order_id = o.order_id  where l.TC_PARENT_LPN_ID = :lpn and  o.order_type ='PED' group by l.tc_lpn_id, o.order_type,l.d_facility_alias_id`,
    binds: { lpn }
  };
}





const palletVirtualMax = (whse) => {
  return {
    sql: `SELECT 
CASE 
WHEN MAX(ID_PALLET_VIRTUAL) IS NULL  THEN 0 
ELSE MAX(ID_PALLET_VIRTUAL ) 
END +1 NUEVO_ID FROM TRZHUB_CONSOLIDACIONHUB WHERE CC = :whse`,
    binds: { whse }
  };
}



const getDatabyOt = (ot, origin) => {
  if (origin === 221) return {
    sql: `DECLARE 
  v_load_number VARCHAR2(50):= :ot;
BEGIN
  sp_cargastrzhub_sle(v_load_number);
END;`,
    binds: { ot }
  };
  else return {
    sql: `DECLARE 
  v_load_number VARCHAR2(50):= :ot;
BEGIN
  sp_cargastrzhub_BC(v_load_number);
END;`,
    binds: { ot }
  };

}

module.exports = {
  infoLPN,
  infoGeneralLpn,
  estadoLPN,
  detalleReserva,
  detalleGeneralFechasDadi,
  detUbicacion,
  getTypeWCquery,
  getTypeBCquery,
  getTypeTemplatequery,
  getTypequery,
  palletVirtualMax,
  infoReserva221,
  infoReserva257,
  infoReserva1707,
  infoReservaBc,
  getDatabyOt
};
