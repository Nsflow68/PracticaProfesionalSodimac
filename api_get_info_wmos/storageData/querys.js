const construct__ = () => {
    module.exports = {
        estadoLPN,
        detalleReserva,
        detalleGeneralFechasDadi,
        listadoReservas,
        listaGeneralCartonesPallet,
        detUbicacion,
        infoLPN,
        reservasByWmos
    }
}























const infoLPN = (lpns, whse = 221) => {
    const list = Array.isArray(lpns) ? lpns : (lpns ? [lpns] : []);
    const placeholders = list.map((_, i) => `:lpn${i}`).join(', ');
    const binds = list.reduce((acc, val, i) => { acc[`lpn${i}`] = val; return acc; }, { whse });

    const sql = `
select L.ITEM_NAME           SKU,
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
       rd.FECHA_ENTREGA,
       rd.fecha_despacho,
       rd.CC_ORIGEN
from lpn@WMS2017CDS l
         inner join ORDERS@WMS2017CDS o on l.ORDER_ID = o.ORDER_ID
         inner join reserva_dtl@dadi rd on o.EXT_PURCHASE_ORDER = rd.NUM_RESERVA
WHERE ORDER_TYPE IN ('PEC', 'POS')
  and L.INBOUND_OUTBOUND_INDICATOR = 'O'
  and rd.cc_despacha = :whse
  and l.TC_LPN_ID in (${placeholders || ':lpn0'})`;

    if (list.length === 0) {
        
        binds.lpn0 = '';
    }
    return { sql, binds };
}




const estadoLPN = (ilpn, whse) => {
    const binds = { ilpn };

    if (whse == '221') {
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
    } else if (whse == '1707') {
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
        const sql = `SELECT substr(L.CARTON_NBR,13,6) LPN_ID, L.CARTON_NBR TC_LPN_ID, L.STAT_CODE LPN_FACILITY_STATUS, O.PKT_CTRL_NBR ORDER_ID,
O.PKT_NBR DO, O.CUST_DEPT ORDER_TYPE, O.THRD_PARTY_BILL RESERVA, O.CONS_ACCT_NBR JAULA, L.SKU_ID SKU
FROM CARTON_HDR@WMOS_BC_LECTURA L
LEFT JOIN (SELECT * FROM PKT_HDR@WMOS_BC_LECTURA WHERE CUST_DEPT IN ('PEC','POS')) O
ON L.PKT_CTRL_NBR=O.PKT_CTRL_NBR
WHERE L.CARTON_NBR = :ilpn`;
        return { sql, binds };
    }
}


const detalleReserva = (reserva) => {
    const sql = `SELECT NUM_RESERVA, NUM_DETALLE, FECHA_INI_PROCESO, CC_ORIGEN,CC_DESPACHA, FECHA_ENTREGA FROM RESERVA_DTL@DADI WHERE NUM_RESERVA = :reserva`;
    return { sql, binds: { reserva } };
}

const detalleGeneralFechasDadi = (pallet, cc) =>{
    if (process.env.NODE_ENV !== 'production') {
        console.log('entra a la data dadi' + cc + pallet);
    }
    if (cc == '221') {
        const sql = `with uno as (
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
        return { sql, binds: { pallet, cc } };
    }
    else if (cc == '262') {
        const sql = `with uno as (
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
        return { sql, binds: { pallet, cc } };
    }
    else{
        const sql = `with uno as (
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
) select COUNT(DISTINCT LPN_ID) CARTONES_QTY, to_char(MIN(FECHA_INI_PROCESO), 'dd-mm-yyyy') FECHA_INI_PROCESO,
to_char(MIN(FECHA_DESPACHO), 'dd-mm-yyyy') MIN_FECHA_DESPACHO, to_char(MAX(FECHA_DESPACHO), 'dd-mm-yyyy') MAX_FECHA_DESPACHO  from uno`;
        return { sql, binds: { pallet } };
    }
}


const reservasByWmos = (lpn, cc)=>{
    if (cc == '221') {
        const list = Array.isArray(lpn) ? lpn : (lpn ? [lpn] : []);
        const placeholders = list.map((_, i) => `:lpn${i}`).join(', ');
        const binds = list.reduce((acc, val, i) => { acc[`lpn${i}`] = val; return acc; }, {});
        const sql = `select L.ITEM_NAME           SKU,
        l.tc_lpn_id,
        L.LPN_FACILITY_STATUS ESTADO_CARTON,
        O.ORDER_ID,
        O.ORDER_TYPE,
        o.RTE_TO JAULA,
        O.EXT_PURCHASE_ORDER from orders o
          inner join lpn l on o.ORDER_ID= l.ORDER_ID
          where o.ORDER_TYPE in ('PEC', 'POS') and L.INBOUND_OUTBOUND_INDICATOR = 'O' and l.TC_LPN_ID in (${placeholders || ':lpn0'})`;
        if (list.length === 0) binds.lpn0 = '';
        return { sql, binds };
    }
    
    return { sql: 'select 1 from dual where :x = :x', binds: { x: 1 } };
}

const listadoReservas = (pallet, cc) =>{
    if (cc == '221') {
        const sql = `with uno as (
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
AND R.CC_ORIGEN = :cc
) select DISTINCT RESERVA  from uno`;
        return { sql, binds: { pallet, cc } };
    } else if (cc == '262') {
        const sql = `with uno as (
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
AND R.CC_ORIGEN = :cc
) select DISTINCT RESERVA  from uno`;
        return { sql, binds: { pallet, cc } };
    }
    else{
        const sql = `with uno as (
SELECT TC.LPN, TC.FECHA_CONSOLIDACION,
substr(L.CARTON_NBR,13,6) LPN_ID, L.CARTON_NBR TC_LPN_ID, L.STAT_CODE LPN_FACILITY_STATUS, L.PKT_CTRL_NBR ORDER_ID,
O.PKT_NBR DO, O.CUST_DEPT ORDER_TYPE, O.THRD_PARTY_BILL RESERVA, O.CONS_ACCT_NBR JAULA,
R.FECHA_INI_PROCESO, R.FECHA_ENTREGA, R.FECHA_DESPACHO
FROM TRZHUB_CARTONESHUB TC
LEFT JOIN (SELECT * FROM CARTON_HDR@WMOS_BC_LECTURA) L ON L.CARTON_NBR=TC.LPN
LEFT JOIN (SELECT * FROM PKT_HDR@WMOS_BC_LECTURA WHERE CUST_DEPT IN ('PEC', 'POS')) O ON L.PKT_CTRL_NBR = O.PKT_CTRL_NBR
LEFT JOIN RESERVA_DTL@DADI R ON O.THRD_PARTY_BILL = R.NUM_RESERVA
WHERE
TC.PALLET_VIRTUAL = :pallet
) select DISTINCT RESERVA from uno`;
        return { sql, binds: { pallet } };
    }
}

const listaGeneralCartonesPallet = (pallet) =>{
    const sql = `SELECT TC.LPN, TC.FECHA_CONSOLIDACION,TC.USUARIO,
L.LPN_ID, L.TC_LPN_ID, L.LPN_FACILITY_STATUS, L.ORDER_ID,
O.TC_ORDER_ID DO, O.ORDER_TYPE, O.EXT_PURCHASE_ORDER RESERVA, O.RTE_TO JAULA,
R.FECHA_INI_PROCESO, R.FECHA_ENTREGA, R.FECHA_DESPACHO
FROM TRZHUB_CARTONESHUB TC
LEFT JOIN (SELECT * FROM LPN@WMS2017CDS WHERE INBOUND_OUTBOUND_INDICATOR='O') L ON L.TC_LPN_ID=TC.LPN
LEFT JOIN (SELECT * FROM ORDERS@WMS2017CDS WHERE ORDER_TYPE IN ('PEC', 'POS')) O ON L.ORDER_ID = O.ORDER_ID
LEFT JOIN RESERVA_DTL@DADI R ON O.EXT_PURCHASE_ORDER = R.NUM_RESERVA
WHERE
TC.PALLET_VIRTUAL = :pallet
AND R.CC_ORIGEN=221
GROUP BY 
TC.LPN,TC.FECHA_CONSOLIDACION,TC.USUARIO,L.LPN_ID, L.TC_LPN_ID, L.LPN_FACILITY_STATUS, L.ORDER_ID, O.TC_ORDER_ID, O.ORDER_TYPE, O.EXT_PURCHASE_ORDER, O.RTE_TO,R.FECHA_INI_PROCESO, R.FECHA_ENTREGA, R.FECHA_DESPACHO`;
    return { sql, binds: { pallet } };
}

const detUbicacion = (ubic, whse) => {
    if (whse === '221'){
        return { sql: `SELECT * FROM LOCN_HDR@WMS2017CDS WHERE LOCN_BRCD = :ubic`, binds: { ubic } };
    }
    if (whse === '1707'){
        return { sql: `SELECT * FROM LOCN_HDR@WMOS2017CORONEL WHERE LOCN_BRCD = :ubic AND WHSE = :whse`, binds: { ubic, whse } };
    }
    return { sql: `SELECT * FROM LOCN_HDR@WMOS_BC_LECTURA WHERE LOCN_BRCD = :ubic AND WHSE = :whse`, binds: { ubic, whse } };
}


construct__();
