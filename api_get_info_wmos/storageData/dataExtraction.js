const query =  require('./querys');
const oracle = require('./../../../Conexion/oracle/conexion').connectionPromise2;

const getOracleAlias = (whse) => {
    const normalized = `${whse ?? ''}`.trim();

    switch (normalized) {
        case '1707':
            return 'wmos_2017_sle';
        default:
            return 'leia_nuevo';
    }
};

const getOracleServer = (whse) => getOracleAlias(whse);

const logOracleConfig = (alias = getOracleAlias()) => {
    if (process.env.NODE_ENV !== 'production') {
        console.log(`[oracle] using alias ${alias}`);
    }
};

const construct__ = () => {
    module.exports = {
        getEstadoLPN,
        getDetalleReserva,
        getDetalleGeneralFechasDadi,
        getListadoReservas,
        getListaGeneralCartonesPallet,
        getDetUbicacion,
        validateReserva,
        getInfoLPNS
    }
}

const getEstadoLPN = (lpn, whse) => {
    return new Promise ( (resolve, reject) => {
        const { sql, binds } = query.estadoLPN(lpn, whse);
        const alias = getOracleAlias(whse);
        if (process.env.NODE_ENV !== 'production') {
            console.log(sql, binds);
        }
        logOracleConfig(alias);
        oracle(sql, binds, false, alias).then(res => {
            resolve(res)
        }).catch(error => {
            reject(error);
        })
    })
}

const getDetalleReserva = (reserva) => {
    return new Promise ( (resolve, reject) => {
        const { sql, binds } = query.detalleReserva(reserva);
        const alias = getOracleAlias();
        logOracleConfig(alias);
        oracle(sql, binds, false, alias).then(res => {
            resolve(res)
        }).catch(error => {
            reject(error);
        })
    })
}

const validateReserva = (reserva, sku) =>
  new Promise((resolve, reject) => {
    const sql = `select num_reserva, cod_estadodet, cc_despacha, PRD_LVL_NUMBER sku
                 from reserva_dtl@dadi
                 where num_reserva = :reserva
                   and PRD_LVL_NUMBER = :sku
                   and cod_estadodet not in (2, 23, 123)`;
    const binds = { reserva, sku };
    const alias = getOracleAlias();
    logOracleConfig(alias);
    oracle(sql, binds, false, alias)
      .then((result) => resolve(result))
      .catch((error) => {
        console.trace(error);
        reject(error);
      });
  });


const getDetalleGeneralFechasDadi = (pallet, cc) => {
    return new Promise ( (resolve, reject) => {
        const { sql, binds } = query.detalleGeneralFechasDadi(pallet, cc);
        const alias = getOracleAlias(cc);
        logOracleConfig(alias);
        oracle(sql, binds, false, alias).then(res => {
            resolve(res)
        }).catch(error => {
            reject(error);
        })
    })
}


const getListadoReservas = (pallet, cc) => {
    return new Promise ( (resolve, reject) => {
        const { sql, binds } = query.listadoReservas(pallet, cc);
        const alias = getOracleAlias(cc);
        logOracleConfig(alias);
        oracle(sql, binds, false, alias).then(res => {
            resolve(res)
        }).catch(error => {
            reject(error);
        })
    })
}

const getListaGeneralCartonesPallet = (pallet) => {
    return new Promise ( (resolve, reject) => {
        const { sql, binds } = query.listaGeneralCartonesPallet(pallet);
        const alias = getOracleAlias();
        logOracleConfig(alias);
        oracle(sql, binds, false, alias).then(res => {
            resolve(res)
        }).catch(error => {
            reject(error);
        })
    })
}

const getDetUbicacion = (ubic, whse) => {
    return new Promise ( (resolve, reject) => {
        const { sql, binds } = query.detUbicacion(ubic, whse);
        const alias = getOracleAlias(whse);
        logOracleConfig(alias);
        oracle(sql, binds, false, alias).then(res => {
            resolve(res)
        }).catch(error => {
            reject(error);
        })
    })
}

const getInfoLPNS = (lpns, whse) => {
    return new Promise( (resolve, reject) =>{
        const alias = getOracleAlias(whse);
        if (process.env.NODE_ENV !== 'production') {
            console.log(alias, typeof lpns);
        }
        const { sql, binds } = query.infoLPN(lpns, whse);
        logOracleConfig(alias);
        oracle(sql, binds, false, alias).then(res => {
            if (process.env.NODE_ENV !== 'production') {
                console.log(lpns, whse, res);
            }
            resolve(res)
        }).catch(error => {
            reject(error);
        })
    })
}



construct__();
