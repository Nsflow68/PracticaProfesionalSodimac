const express = require('express');
const router = express.Router();

const pick = (req, key) => req.query?.[key];
const bodyParser = require('body-parser');
const cors = require('cors');
const dataExtraction = require('../../storageData/dataExtraction');
const enforceAccept = require('../../middlewares/enforceAccept');
const methodNotAllowed = require('../../middlewares/methodNotAllowed');
const validateInput = require('../../middlewares/validateInput');


router
  .route(' ')
  .options((req, res) => { res.set('Allow', 'GET, HEAD, OPTIONS'); return res.sendStatus(204); })
  .head(enforceAccept(['application/json']), (_req, res) => res.status(204).end())
  .get(enforceAccept(['application/json']), validateInput(['lpn', 'whse']), async (req, res) => {
    const lpn = pick(req, 'lpn');
    const whse = pick(req, 'whse');
    try {
      const detalle = await dataExtraction.getEstadoLPN(lpn, whse);
      return res.status(200).json(detalle);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  })
  .all(methodNotAllowed(['GET', 'HEAD', 'OPTIONS']));

router
  .route(' ')
  .options((req, res) => { res.set('Allow', 'GET, HEAD, OPTIONS'); return res.sendStatus(204); })
  .head(enforceAccept(['application/json']), (_req, res) => res.status(204).end())
  .get(enforceAccept(['application/json']), validateInput(['reserva', 'sku']), async (req, res) => {
    const reserva = pick(req, 'reserva');
    const sku = pick(req, 'sku');
    try {
      const detail = await dataExtraction.validateReserva(reserva, sku);
      return res.status(200).json(detail);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  })
  .all(methodNotAllowed(['GET', 'HEAD', 'OPTIONS']));

router
  .route(' ')
  .options((req, res) => { res.set('Allow', 'GET, HEAD, OPTIONS'); return res.sendStatus(204); })
  .head(enforceAccept(['application/json']), (_req, res) => res.status(204).end())
  .get(enforceAccept(['application/json']), validateInput(['pallet', 'cc']), async (req, res) => {
    const pallet = pick(req, 'pallet');
    const cc = pick(req, 'cc');
    try {
      const detalle = await dataExtraction.getDetalleGeneralFechasDadi(pallet, cc);
      return res.status(200).json(detalle);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  })
  .all(methodNotAllowed(['GET', 'HEAD', 'OPTIONS']));

router
  .route(' ')
  .options((req, res) => { res.set('Allow', 'GET, HEAD, OPTIONS'); return res.sendStatus(204); })
  .head(enforceAccept(['application/json']), (_req, res) => res.status(204).end())
  .get(enforceAccept(['application/json']), validateInput(['pallet', 'cc']), async (req, res) => {
    const pallet = pick(req, 'pallet');
    const cc = pick(req, 'cc');
    try {
      const detalle = await dataExtraction.getListadoReservas(pallet, cc);
      return res.status(200).json(detalle);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  })
  .all(methodNotAllowed(['GET', 'HEAD', 'OPTIONS']));

router
  .route(' ')
  .options((req, res) => { res.set('Allow', 'GET, HEAD, OPTIONS'); return res.sendStatus(204); })
  .head(enforceAccept(['application/json']), (_req, res) => res.status(204).end())
  .get(enforceAccept(['application/json']), validateInput(['pallet']), async (req, res) => {
    const pallet = pick(req, 'pallet');
    try {
      const detalle = await dataExtraction.getListaGeneralCartonesPallet(pallet);
      return res.status(200).json(detalle);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  })
  .all(methodNotAllowed(['GET', 'HEAD', 'OPTIONS']));

router
  .route(' ')
  .options((req, res) => { res.set('Allow', 'GET, HEAD, OPTIONS'); return res.sendStatus(204); })
  .head(enforceAccept(['application/json']), (_req, res) => res.status(204).end())
  .get(enforceAccept(['application/json']), validateInput(['ubic', 'whse']), async (req, res) => {
    const ubic = pick(req, 'ubic');
    const whse = pick(req, 'whse');
    try {
      const detalle = await dataExtraction.getDetUbicacion(ubic, whse);
      return res.status(200).json(detalle);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  })
  .all(methodNotAllowed(['GET', 'HEAD', 'OPTIONS']));

router
  .route(' ')
  .options((req, res) => { res.set('Allow', 'GET, POST, HEAD, OPTIONS'); return res.sendStatus(204); })
  .head(enforceAccept(['application/json']), (_req, res) => res.status(204).end())
  .get(enforceAccept(['application/json']), validateInput(['lpn', 'whse']), async (req, res) => {
    let lpn = req.query?.lpn; 
    const whse = pick(req, 'whse');
    try {
      const respuesta = await dataExtraction.getInfoLPNS(lpn, whse);
      return res.status(200).json(respuesta);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  })
  .post(enforceAccept(['application/json']), validateInput(['pallet', 'whse']), async (req, res) => {
    const lpn = req.body.pallet;
    const whse = req.body.whse;
    try {
      const respuesta = await dataExtraction.getInfoLPNS(lpn, whse);
      return res.status(200).json(respuesta);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  })
  .all(methodNotAllowed(['GET', 'POST', 'HEAD', 'OPTIONS']));


module.exports = router;
