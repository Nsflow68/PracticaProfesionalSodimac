
const { Router, json } = require('express');
const add405ForRouter = require('../utils/add405ForRouter');
const { enforceContentType, enforceContentTypeFor } = require('../middlewares/enforceContentType');
const {
  validateBody,
  validateParams,
  validateQuery,
  vLpn,
  vLpnList,
  vCC,
  vUbic,
  vReserva,
  vPrinter,
  vZpl,
  vOrders,
  vDateStr,
  vNumberish,
} = require('../middlewares/validate');

const {
  getData,
  getDataGeneralLpns,
  getEstadoLPN,
  getDetalleUbication,
  getType,
  getTypeBC,
  getTypeWc,
  getPalletVirtualMaxController,
  impresion,
  printDone,
  getControllerReserva,
  sendMailCharger,
  getTypeTemplate,
} = require('../controllers/data.controllers');

const router = Router();
const copyQueryToBodyWhenEmpty = (req, res, next) => {
  if (
    (!req.body || Object.keys(req.body).length === 0) &&
    req.query &&
    Object.keys(req.query).length > 0
  ) {
    req.body = req.query;
  }
  next();
};




const requireJsonBody = [enforceContentType(['application/json']), json()];




router.get(' ', validateQuery({ pallet: vLpnList, whse: vCC }), getData);
router.post(
  ' ',
  ...requireJsonBody,
  validateBody({ pallet: vLpnList, whse: vCC }),
  getData
);
router.get(
  ' ',
  
  
  validateQuery({ pallet: vLpnList, cc: vCC }),
  getDataGeneralLpns
);
router.post(
  ' ',
  ...requireJsonBody,
  validateBody({ pallet: vLpnList, cc: vCC }),
  getDataGeneralLpns
);
router.get(' ', validateQuery({ lpn: vLpn, whse: vCC }), getEstadoLPN);
router.get(' ', validateQuery({ ubic: vUbic, whse: vCC }), getDetalleUbication);

router.get(' ', validateQuery({ lpn: vLpn }), getTypeWc);
router.get(' ', validateQuery({ lpn: vLpn }), getTypeBC);
router.get(' ', validateQuery({ lpn: vLpn }), getType);
router.get(' ', validateQuery({ lpn: vLpn }), getTypeTemplate);

router.get(' ', validateQuery({ whse: vCC }), getPalletVirtualMaxController);
router.get(
  ' ',
  validateQuery({
    hubDescription: vUbic,
    orders: vOrders, 
    cartonsQty: vNumberish,
    virtualPallet: vUbic,
    minimumDeliveryDate: vDateStr,
    maximumDeliveryDate: vDateStr,
    printDate: vDateStr,
  }),
  impresion
);
router.post(
  ' ',
  ...requireJsonBody,
  validateBody({
    hubDescription: vUbic,
    orders: vOrders,
    cartonsQty: vNumberish,
    virtualPallet: vUbic,
    minimumDeliveryDate: vDateStr,
    maximumDeliveryDate: vDateStr,
    printDate: vDateStr,
  }),
  impresion
);
router.get(' ', validateParams({ reserva: vReserva }), getControllerReserva);


router.post(
  ' ',
  ...requireJsonBody,
  validateBody({ zpl: vZpl, printer: vPrinter }),
  printDone
);

router.post(
  ' ',
  ...requireJsonBody,
  validateBody({ ot: vNumberish, origin: vUbic }),
  sendMailCharger
);



add405ForRouter(
  router,
  [
    '/getEstadoLPN',
    '/getDetUbicacion',
    '/getTypeWC',
    '/getTypeBC',
    '/getType',
    '/getTypeTemplate',
    '/getPalletVirtualMax',
    '/reserva/:reserva',
    
    '/getDetailOrders',
    '/getDetalleGeneralFechasDadi',
    '/getListadoReservas',
    '/getListaGeneralCartonesPallet',
  ],
  ['GET', 'OPTIONS']
);

add405ForRouter(
  router,
  ['/getDataLpns'],
  ['GET', 'POST', 'OPTIONS']
);


add405ForRouter(
  router,
  ['/getDataGeneralLpns', '/getLabelVirtualPalletGenerate'],
  ['GET', 'POST', 'OPTIONS']
);

add405ForRouter(
  router,
  ['/setPrintLabelVirtualPallet', '/sendReportCharged'],
  ['POST', 'OPTIONS']
);

module.exports = router;
