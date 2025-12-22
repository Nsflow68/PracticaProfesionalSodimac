const {
  getInfoLPNS,
  getInfoGeneralLPNS,
  getEstadoLPNServices,
  getDetUbicacion,
  getTypeWC,
  getTypeServices,
  getTypeWCServices,
  getTypeBCServices,
  createFile,
  queuePrintJob,
  getTrzHubCartonesEspecif,
  getTrzHubConsolidacionMax,
  getReservaServices,
  mailerClosedCharger,
  getTypeServicesTemplate,
} = require("../services/dataExtraction.services");
const { infoReserva221, infoReserva1707, infoReservaBc, infoReserva257 } = require("../services/query");
const isProd = process.env.NODE_ENV === 'production';
const debug = (...args) => { if (!isProd) console.log(...args); };

const normalizeLpnInput = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        
      }
    }
  }
  return value;
};



const sendMailCharger = async (req, res) => {
  try {
    let { ot, origin } = req.body;
    if (typeof ot === "undefined" || typeof ot === "string" || typeof origin === "undefined") return res.status(400)
    await mailerClosedCharger(ot, origin);
    return res.json({ msg: "ok" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al enviar correo" });
  }
};


const getControllerReserva = async (request, response) => {
  let { reserva } = request.params;
  const query221 = infoReserva221(reserva);
  const query257 = infoReserva257(reserva);
  const query1707 = infoReserva1707(reserva);
  const queryBc = infoReservaBc(reserva);
  try {
    let [cds, nueva508, coronel, farfana] = await Promise.all([
      getReservaServices(query221),
      getReservaServices(query257),
      getReservaServices(query1707),
      getReservaServices(queryBc),
    ]);
    debug({ coronel });
    let todo = cds.concat(farfana);
    if (nueva508.length > 0) todo.concat(nueva508);
    if (todo.length === 0) return response.status(404).json({
      msg: "Not found"
    })
    response.json(todo)
    response.json();
  } catch (error) {
    console.error({ error: error });
    response.status(500).json({ msg: "Error interno del servidor" });
  }

}

const getDataCartonesEspecifico = async (request, response) => {
  let detalle = request.body;
  try {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    let detalleCartonesPalletVirtual = await getTrzHubCartonesEspecif(detalle.carton, detalle.whse)
      .catch((error) => {
        if (!isProd) console.log(error);
      });

    response.status(200).send(detalleCartonesPalletVirtual);
  } catch (error) {
    console.error(error);
    response.status(500).json({ msg: "Error interno del servidor" });
  }
}
const getData = async (request, response) => {
  const { pallet, whse } = request.method === 'POST' ? request.body : request.query;
  debug(request.method === 'POST' ? request.body : request.query);
  try {
    const respuesta = await getInfoLPNS(pallet, whse);

    response.json(respuesta);
  } catch (error) {
    console.error(error);
    response.status(500).json({ msg: "Error interno del servidor" });
  }
};

const getDataGeneralLpns = async (request, response) => {
  const payload = request.method === 'POST' ? request.body : request.query;
  const pallet = normalizeLpnInput(payload.pallet);
  const cc = payload.cc;
  debug(payload);
  try {
    const respuesta = await getInfoGeneralLPNS(pallet, cc);

    response.json(respuesta);
  } catch (error) {
    console.error(error);
    response.status(500).json({ msg: "Error interno del servidor" });
  }
};

const getEstadoLPN = async (request, response) => {
  let lpnEspecific = request.query;

  try {
    let detalleLPN = await getEstadoLPNServices(
      lpnEspecific.lpn,
      lpnEspecific.whse
    );

    response.status(200).send(detalleLPN);
  } catch (error) {
    console.error(error);
    response.status(500).json({ msg: "Error interno del servidor" });
  }
};

const getDetalleUbication = async (request, response) => {
  let { ubic, whse } = request.query;
  try {
    let detalle = await getDetUbicacion(ubic, whse);
    response.status(200).send(detalle);
  } catch (error) {
    console.error(error);
    response.status(500).json({ msg: "Error interno del servidor" });
  }
};

const getType = async (request, response) => {
  let pallet = request.query.lpn;
  debug(pallet);
  try {
    let tipo = await getTypeServices(pallet).catch((error) => {
      if (!isProd) console.log(error);
    });

    debug(tipo);
    response.status(200).send(tipo);
  } catch (error) {
    console.error(error);
    response.status(500).json({ msg: "Error interno del servidor" });
  }
};

const getTypeTemplate = async (request, response) => {
  let pallet = request.query.lpn;
  debug(pallet);
  try {
    let tipo = await getTypeServicesTemplate(pallet).catch((error) => {
      if (!isProd) console.log(error);
    });

    debug(tipo);
    response.status(200).send(tipo);
  } catch (error) {
    console.error(error);
    response.status(500).json({ msg: "Error interno del servidor" });
  }
};
const getTypeBC = async (request, response) => {
  let pallet = request.query.lpn;
  debug(pallet);
  try {
    let tipo = await getTypeBCServices(pallet).catch((error) => {
      if (!isProd) console.log(error);
    });

    debug(tipo);
    response.status(200).send(tipo);
  } catch (error) {
    console.error(error);
    response.status(500).json({ msg: "Error interno del servidor" });
  }
};

const getTypeWc = async (request, response) => {
  let { lpn } = request.query;
  try {
    let tipo = await getTypeWCServices(lpn);

    debug(tipo);
    response.status(200).send(tipo);
  } catch (error) {
    console.error(error);
    response.status(500).json({ msg: "Error interno del servidor" });
  }
};


const getPalletVirtualMaxController = async (request, response) => {

  let detalle = request.query;
  debug(detalle.whse);
  try {

    let palletVirtualMax = await getTrzHubConsolidacionMax(detalle.whse).catch(error => {
      if (!isProd) console.log(error);
    });

    debug(palletVirtualMax);

    

    response.status(200).send(palletVirtualMax);

  } catch (error) {
    console.error(error);
    response.status(500).json({ msg: "Error interno del servidor" });
  }

}



const impresion = async (request, response) => {

  try {
    const payload = request.method === 'POST' ? request.body : request.query;
    let hubDescription = payload.hubDescription
    let orders = payload.orders
    let cartonsQty = payload.cartonsQty

    
    if (!Array.isArray(orders)) {
      orders = [orders];
    }

    let ordersQty = orders.length
    let virtualPallet = payload.virtualPallet
    let minimumDeliveryDate = payload.minimumDeliveryDate
    let maximumDeliveryDate = payload.maximumDeliveryDate

    let printDate = payload.printDate

    let limitOrders = 3
    let zplOrdersGenerate = ""
    let zplTop = 550
    let zplLeft = 40
    for (let i = 1; i <= orders.length; i++) {
      zplOrdersGenerate += `^CF0,25 
          ^FO${zplLeft},${zplTop}^FDReserva: ${orders[i - 1]}^FS`
      zplLeft += 240
      if (i % limitOrders == 0) {
        zplTop += 30
        zplLeft = 40
      }
    }

    let zpl = `^XA
      ^CF0,25
      ^FO200,15^FD Fecha Impresion: ${printDate} ^FS
      
      ^FX 
      ^CF0,70
      ^FO330,50^FDDESPACHO PEC^FS
      
      ^CF0,150
      ^FO0,50^FD HUB ^FS
      
      ^CF0,75
      ^FO20,180^FD ${hubDescription}^FS
      
      ^FX Codigo Barra
      ^BY3,2,200
      ^FO45,280^BC^FD${virtualPallet}^FS
      ^FX Reservas
      ${zplOrdersGenerate}
      
      ^FX Cantidad de reservas y cartones
      ^CF0,40
      ^FO480,1070^FD Nro Cartones: ${cartonsQty} ^FS
      ^CF0,40
      ^FO480,1120^FD Nro Reservas: ${ordersQty} ^FS
      
      ^FX Fechas Compromiso Cliente
      ^CF0,25
      ^FO30,1070^FD Fecha Minima de Despacho: ${minimumDeliveryDate}^FS
      ^CF0,25
      ^FO30,1100^FD Fecha Maxima de Despacho: ${maximumDeliveryDate}^FS
      
      ^FX Desarrollo De Aplicaciones
      ^CF0,25
      ^FO250,1170^FD #Desarrollo De Aplicaciones CDS  ^FS
      
      ^XZ`

    response.status(200).send({ "zpl": zpl.replace(/(\r\n|\n|\r)/gm, "") });

  } catch (error) {
    console.error(error);
    response.status(500).json({ msg: "Error interno del servidor" });
  }

}



const printDone = async (request, response) => {
  try {
    if ((request.body).hasOwnProperty('zpl') && (request.body).hasOwnProperty('printer')) {
      if (request.body.zpl == "") {
        response.status(400).json({ "Error": "ZPL no encontrado!" });
      } else if (request.body.printer == "") {
        response.status(400).json({ "Error": "Printer no encontrado!" });
      }
      else {
        debug("aqui vamos a imprimir");
        
        let zpl = request.body.zpl
        let printer = request.body.printer
        const path = await createFile(zpl);
        debug(path);
        await queuePrintJob(path, printer);
      }
    } else {
      response.status(400).json({ "Error": "ZPL y/o Printer no recibidos!" });
    }

    return response.status(200).send({ "Impresion": "OK" });

  } catch (error) {
    console.error(error);
    response.status(500).json({ msg: "Error interno del servidor" });
  }
}

module.exports = {
  getData,
  getDataCartonesEspecifico,
  getDataGeneralLpns,
  getEstadoLPN,
  getDetalleUbication,
  getType,
  getTypeBC,
  getTypeWc,
  getTypeTemplate,
  getPalletVirtualMaxController,
  impresion,
  printDone,
  getControllerReserva,
  sendMailCharger
};
