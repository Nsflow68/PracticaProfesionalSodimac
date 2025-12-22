



const normCode = (s: string) => String(s ?? "").trim().toUpperCase();

export const queryGetCarton = (carton: string) => {
  const c = normCode(carton);
  return {
    sql: `
      SELECT
        p.id_pallet,
        o.olpn,
        ep.desc_estado,
        ep.id_estado,
        p.pallet,
        a.anden,
        p.whse,
        p.id_carga,
        h.nombre_hub
      FROM carton o
      INNER JOIN pallet p     ON p.id_pallet = o.id_pallet
      LEFT  JOIN anden a      ON a.id_anden  = p.id_anden
      INNER JOIN estado_pallet ep ON p.id_estado = ep.id_estado
      INNER JOIN jaula j      ON j.id_jaula  = p.id_jaula
      INNER JOIN hub h        ON h.id_hub    = j.id_hub
      WHERE o.olpn = ?
    `,
    params: [c],
  };
};

export const queryGetCartonesByPallet = (pallet: string) => {
  const p = normCode(pallet);
  return {
    sql: `
      SELECT o.olpn
      FROM carton o
      INNER JOIN pallet p ON p.id_pallet = o.id_pallet
      WHERE p.pallet = ?
    `,
    params: [p],
  };
};

export const queryGetDataPallet = (pallet: string) => {
  const p = normCode(pallet);
  return {
    sql: `
      SELECT
        p.id_pallet,
        o.olpn,
        p.whse,
        ep.desc_estado,
        ep.id_estado,
        p.pallet,
        a.anden,
        h.nombre_hub
      FROM carton o
      INNER JOIN pallet p      ON p.id_pallet = o.id_pallet
      LEFT  JOIN anden a       ON a.id_anden  = p.id_anden
      INNER JOIN estado_pallet ep ON p.id_estado = ep.id_estado
      INNER JOIN jaula j       ON j.id_jaula  = p.id_jaula
      INNER JOIN hub h         ON h.id_hub    = j.id_hub
      WHERE p.pallet = ?
    `,
    params: [p],
  };
};

export const queryGetAllData = (cc: number) => {
  
  const bodega = normCode(String(cc));
  return {
    sql: `
      SELECT
        p.id_pallet,
        o.olpn AS CARTON,
        o.created_at AS FECHA_PALLETIZADO,
        p.ubication,
        (
          CASE
            WHEN (
              SELECT ec.desc_estado
              FROM log_estado_carga
              INNER JOIN estado_carga ec ON log_estado_carga.id_estado_carga = ec.id_state_carga
              WHERE id_carga = p.id_carga
              ORDER BY fecha DESC
              LIMIT 1
            ) IS NULL
            THEN UPPER(ep.desc_estado)
            ELSE UPPER((
              SELECT ec.desc_estado
              FROM log_estado_carga
              INNER JOIN estado_carga ec ON log_estado_carga.id_estado_carga = ec.id_state_carga
              WHERE id_carga = p.id_carga
              ORDER BY fecha DESC
              LIMIT 1
            ))
          END
        ) AS desc_estado,
        ep.id_estado,
        j.num_jaula,
        p.pallet AS PALLET_VIRTUAL,
        a.anden,
        h.nombre_hub,
        (SELECT "user" FROM log_estado WHERE id_pallet = p.id_pallet ORDER BY fecha DESC LIMIT 1) AS "user"
      FROM carton o
      INNER JOIN pallet p      ON p.id_pallet = o.id_pallet
      INNER JOIN bodega b      ON p.whse      = b.whse
      LEFT  JOIN anden a       ON a.id_anden  = p.id_anden
      INNER JOIN estado_pallet ep ON p.id_estado = ep.id_estado
      INNER JOIN jaula j       ON j.id_jaula  = p.id_jaula
      INNER JOIN hub h         ON h.id_hub    = j.id_hub
      WHERE b.bodega = ?
      ORDER BY FECHA_PALLETIZADO DESC
      LIMIT 5000
    `,
    params: [bodega],
  };
};
