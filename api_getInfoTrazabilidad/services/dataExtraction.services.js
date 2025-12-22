const query = require('./query');
const { infoLPN, estadoLPN, detUbicacion, infoGeneralLpn, getTypeWCquery, getTypeBCquery, getTypequery, palletVirtualMax, getDatabyOt, getTypeTemplatequery } = query;
const oracle = require('./../../../Conexion/oracle/conexion').connectionPromise2;
const { spawn } = require("child_process");
const { randomUUID } = require("crypto");
const fs = require("fs");
const DEFAULT_ALIAS = 'leia_nuevo';
const isProduction = process.env.NODE_ENV === 'production';

const normalizeQueryResult = (result, fallbackBinds = []) => {
    if (!result) {
        throw new Error('Invalid query builder result');
    }
    if (typeof result === 'string') {
        return { sql: result, binds: fallbackBinds };
    }
    const { sql, binds = fallbackBinds } = result;
    return { sql, binds: binds ?? fallbackBinds };
};

const getEstadoLPNServices = (lpn, whse) => {
    return new Promise((resolve, reject) => {
        const { sql, binds } = normalizeQueryResult(estadoLPN(lpn, whse));
        if (!isProduction) {
            console.log(sql, binds);
        }
        oracle(sql, binds, false, DEFAULT_ALIAS).then(res => {
            resolve(res)
        }).catch(error => {
            reject(error);
        })
    })
}
const getDetalleReserva = (reserva) => {
    return new Promise((resolve, reject) => {
        const { sql, binds } = normalizeQueryResult(query.detalleReserva(reserva));
        oracle(sql, binds, false, DEFAULT_ALIAS).then(res => {
            resolve(res)
        }).catch(error => {
            reject(error);
        })
    })
}

const validateReserva = (reserva, sku) =>
    new Promise((resolve, reject) => {
        const sql = `select num_reserva,
                        cod_estadodet,
                        cc_despacha,
                        PRD_LVL_NUMBER sku
                 from reserva_dtl@dadi
                 where num_reserva = :reserva
                   and PRD_LVL_NUMBER = :sku
                   and cod_estadodet not in (2, 23, 123)`;
        oracle(sql, { reserva, sku }, false, DEFAULT_ALIAS)
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                console.trace(error);
                reject(error);
            });
    });


const getDetalleGeneralFechasDadi = (pallet, cc) => {
    return new Promise((resolve, reject) => {
        const { sql, binds } = normalizeQueryResult(query.detalleGeneralFechasDadi(pallet, cc));
        oracle(sql, binds, false, DEFAULT_ALIAS).then(res => {
            resolve(res)
        }).catch(error => {
            reject(error);
        })
    })
}


const getListadoReservas = (pallet, cc) => {
    return new Promise((resolve, reject) => {
        const { sql, binds } = normalizeQueryResult(query.listadoReservas(pallet, cc));
        oracle(sql, binds, false, DEFAULT_ALIAS).then(res => {
            resolve(res)
        }).catch(error => {
            reject(error);
        })
    })
}

const getListaGeneralCartonesPallet = (pallet) => {
    return new Promise((resolve, reject) => {
        const { sql, binds } = normalizeQueryResult(query.listaGeneralCartonesPallet(pallet));
        oracle(sql, binds, false, DEFAULT_ALIAS).then(res => {
            resolve(res)
        }).catch(error => {
            reject(error);
        })
    })
}

const getDetUbicacion = (ubic, whse) => {
    return new Promise((resolve, reject) => {
        const { sql } = normalizeQueryResult(detUbicacion(ubic, whse));
        const binds = { ubic, whse };
        oracle(sql, binds, false, DEFAULT_ALIAS)
            .then((res) => {
                resolve(res);
            })
            .catch((error) => {
                reject(error);
            });
    });
};

const getInfoLPNS = (lpns, whse) => {
    return new Promise((resolve, reject) => {
        const { sql, binds } = normalizeQueryResult(infoLPN(lpns, whse));
        oracle(sql, binds, false, DEFAULT_ALIAS).then(res => {
            if (!isProduction) {
                console.log(sql);
                console.log(lpns, whse, res);
            }
            resolve(res)
        }).catch(error => {
            reject(error);
        })
    })
}
const getInfoGeneralLPNS = (lpns, whse) => {
    return new Promise((resolve, reject) => {
        const { sql, binds } = normalizeQueryResult(infoGeneralLpn(lpns, whse));
        oracle(sql, binds, false, DEFAULT_ALIAS).then(res => {
            if (!isProduction) {
                console.log(lpns, whse, res);
            }
            resolve(res)
        }).catch(error => {
            reject(error);
        })
    })
}


const getTypeWCServices = (lpn) => {
    return new Promise((resolve, reject) => {
        const { sql, binds } = normalizeQueryResult(getTypeWCquery(lpn));
        oracle(sql, binds, false, "wmos_2017_coronel").then(res => {
            resolve(res)
        }).catch(error => {
            reject(error);
        })
    })
}
const getTypeBCServices = (lpn) => {
    return new Promise((resolve, reject) => {
        const { sql, binds } = normalizeQueryResult(getTypeBCquery(lpn));
        oracle(sql, binds, false, "wmos_bc_lectura").then(res => {
            resolve(res)
        }).catch(error => {
            reject(error);
        })
    })
}
const getTypeServices = (lpn) => {
    return new Promise((resolve, reject) => {
        const { sql, binds } = normalizeQueryResult(getTypequery(lpn));
        oracle(sql, binds, false, "wmos_2017").then(res => {
            resolve(res)
        }).catch(error => {
            reject(error);
        })
    })
}

const getTypeServicesTemplate = (lpn) => {
    return new Promise((resolve, reject) => {
        const { sql, binds } = normalizeQueryResult(getTypeTemplatequery(lpn));
        if (!isProduction) console.log(sql, binds)
        oracle(sql, binds, false, DEFAULT_ALIAS).then(res => {
            resolve(res)
        }).catch(error => {
            reject(error);
        })
    })
}

const getTrzHubConsolidacionMax = (whse) => {
    return new Promise((resolve, reject) => {
        const { sql, binds } = normalizeQueryResult(palletVirtualMax(whse));
        oracle(sql, binds, false, DEFAULT_ALIAS).then(res => {
            resolve(res)
        }).catch(error => {
            reject(error);
        })
    })
}

const getTrzHubCartonesEspecif = (carton, whse) => {
    return new Promise((resolve, reject) => {
        oracle(cartonPalletVirtualEspecifNew(carton, whse), [], false, DEFAULT_ALIAS).then(res => {
            resolve(res)
        }).catch(error => {
            reject(error);
        })
    })
}

const getReservaServices = (sqlStatement) => {
    return new Promise((resolve, reject) => {
        
        const { sql, binds } = normalizeQueryResult(sqlStatement);
        oracle(sql, binds, false, DEFAULT_ALIAS).then(res => {
            resolve(res)
        }).catch(error => {
            reject(error);
        })
    })
}
const queuePrintJob = (labelPath, printerHost) => {
    return new Promise((resolve, reject) => {
        
        if (!/^[A-Za-z0-9_.-]{1,64}$/.test(String(printerHost || ''))) {
            return reject(new Error('printer_invalid'));
        }
        const args = ['-h', 'HIZUREN.DDA.SODIMAC.CL:631', '-d', String(printerHost), '-o', 'raw', String(labelPath)];
        const child = spawn('lp', args, { stdio: 'ignore' });
        child.on('error', (error) => {
            console.error(error, `Error al enviar la etiqueta a CUPS ${labelPath}`);
            reject(false);
        });
        child.on('close', (code) => {
            if (code !== 0) {
                console.error(`lp exited with code ${code}`);
                return reject(false);
            }
            if (process.env.NODE_ENV !== 'production') {
                console.log(`Se envio a CUPS el archivo ${labelPath}`);
            }
            resolve(true);
        });
    });
};


const createFile = (content) => {
    return new Promise((resolve, reject) => {
        const path = `/var/impresiones/${randomUUID()}.zpl`;
        fs.writeFile(path, content, (error) => {
            if (error) {
                console.error(error, `ERROR al crear la etiqueta ${path}`);
                return reject(false);
            }
            if (process.env.NODE_ENV !== 'production') {
                console.log(`Se creo el archivo ${path}`);
            }
            resolve(path);
        });
    });
};




const mailerClosedCharger = (ot, origin) => {
    return new Promise((resolve, reject) => {
        const { sql, binds } = normalizeQueryResult(getDatabyOt(ot, origin));
        if (!isProduction) console.log(sql, binds)
        oracle(sql, binds, false, DEFAULT_ALIAS).then(res => {
            resolve(res)
        }).catch(error => {
            reject(error);
        })
    });
}



module.exports = {
    getEstadoLPNServices,
    getDetalleReserva,
    getDetalleGeneralFechasDadi,
    getListadoReservas,
    getListaGeneralCartonesPallet,
    getDetUbicacion,
    validateReserva,
    getInfoLPNS,
    getInfoGeneralLPNS,
    getTypeWCServices,
    getTypeBCServices,
    getTypeServices,
    getTypeServicesTemplate,
    getTrzHubConsolidacionMax,
    queuePrintJob,
    createFile,
    getTrzHubCartonesEspecif,
    getReservaServices,
    mailerClosedCharger
};


