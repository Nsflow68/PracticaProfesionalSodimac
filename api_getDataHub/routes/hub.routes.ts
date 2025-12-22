
import { Router, json } from 'express';
import {
  getDataCarton,
  traductorGet,
  getDataReserva,
  getDataAndenController,
  getDataDestinoController,
  createAndenController,
  deleteAndenController,
  updateAndenController
} from "../controllers/hub.controllers";

import { add405ForRouter } from '../utils/add405';
import { enforceAccept } from '../middlewares/enforceAccept';
import { enforceContentType } from '../middlewares/enforceContentType';

const DEFAULT_SENSITIVE_KEYS = [
  'password', 'passwd', 'pass', 'pwd',
  'token', 'access_token', 'id_token', 'refresh_token',
  'apikey', 'api_key', 'key', 'secret', 'client_secret', 'client_id',
  'auth', 'authorization', 'cred', 'credentials'
];

function looksSensitive(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const v = value.trim();
  if (!v) return false;
  if (v.split('.').length === 3 && v.length > 20) return true; 
  if (v.length >= 24) return true; 
  return false;
}

function noSensitiveInUrlInline(req: any, res: any, next: any) {
  const keys = new Set(DEFAULT_SENSITIVE_KEYS.map(k => k.toLowerCase()));
  const offenders: Array<{ location: 'params' | 'query'; key: string }> = [];
  for (const [k, v] of Object.entries(req.params ?? {})) {
    const key = k.toLowerCase();
    if (keys.has(key) || looksSensitive(String(v))) offenders.push({ location: 'params', key });
  }
  for (const [k, v] of Object.entries(req.query ?? {})) {
    const key = k.toLowerCase();
    const val = Array.isArray(v) ? String(v[0]) : String(v);
    if (keys.has(key) || looksSensitive(val)) offenders.push({ location: 'query', key });
  }
  if (offenders.length > 0) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'No envíes credenciales o secretos en la URL. Usa el encabezado Authorization.',
      offenders,
      code: 'ERR_SENSITIVE_IN_URL'
    });
  }
  return next();
}

function nonEmptyString(x: any): x is string { return typeof x === 'string' && x.trim().length > 0; }
function isStringOrNumber(x: any): boolean { return typeof x === 'string' || typeof x === 'number'; }

const validateGetPallet = (req: any, res: any, next: any) => {
  const v = String(req.params?.pallet ?? '').trim();
  
  if (!v || v.length > 100 || !/^[a-zA-Z0-9\-_ ]+$/.test(v)) {
    return res.status(422).json({
      error: 'Unprocessable Entity',
      message: 'no puedes insertar estos caracteres',
      issues: [{ path: ['params', 'pallet'], message: 'pallet requerido, <= 100 chars, solo alfanuméricos y -_' }]
    });
  }
  next();
};

const validateGetReserva = (req: any, res: any, next: any) => {
  const v = String(req.params?.reserva ?? '').trim();
  if (!v || v.length > 100 || !/^[a-zA-Z0-9\-_ ]+$/.test(v)) {
    return res.status(422).json({
      error: 'Unprocessable Entity',
      message: 'no puedes insertar estos caracteres',
      issues: [{ path: ['params', 'reserva'], message: 'reserva requerida, <= 100 chars, solo alfanuméricos y -_' }]
    });
  }
  next();
};

const validateTraductorQuery = (req: any, res: any, next: any) => {
  const { lpn, whse } = req.query || {};
  if (!nonEmptyString(lpn) || !nonEmptyString(whse)) {
    return res.status(400).json({
      error: 'Bad Request', issues: [
        { path: ['query', 'lpn'], message: 'lpn string requerido' },
        { path: ['query', 'whse'], message: 'whse string requerido' },
      ]
    });
  }
  next();
};

const validateAndenQuery = (req: any, res: any, next: any) => {
  const { anden, whse } = req.query || {};
  if (!isStringOrNumber(anden) || !nonEmptyString(String(anden)) || !nonEmptyString(whse)) {
    return res.status(400).json({
      error: 'Bad Request', issues: [
        { path: ['query', 'anden'], message: 'anden string|number requerido' },
        { path: ['query', 'whse'], message: 'whse string requerido' },
      ]
    });
  }
  req.query.anden = String(anden).trim();
  next();
};

const validateCreateDelete = (req: any, res: any, next: any) => {
  const { destino } = req.body || {};
  if (!nonEmptyString(destino)) return res.status(400).json({ error: 'Bad Request', issues: [{ path: ['body', 'destino'], message: 'destino string requerido' }] });
  next();
};

const validateUpdate = (req: any, res: any, next: any) => {
  const { destino, nuevoDestino } = req.body || {};
  if (!nonEmptyString(destino) || !nonEmptyString(nuevoDestino)) {
    return res.status(400).json({
      error: 'Bad Request', issues: [
        { path: ['body', 'destino'], message: 'destino string requerido' },
        { path: ['body', 'nuevoDestino'], message: 'nuevoDestino string requerido' },
      ]
    });
  }
  next();
};

const router = Router();

router.use(enforceAccept({ supported: ['application/json'] }));
router.use(noSensitiveInUrlInline);




router.get(' ', validateGetPallet, getDataCarton);


router.get(' ', validateGetReserva, getDataReserva);


router.get(
  ' ',
  validateTraductorQuery,
  traductorGet
);


router.get(
  ' ',
  validateAndenQuery,
  getDataAndenController
);


router.get(
  ' ',
  getDataDestinoController
);

router.post(
  ' ',
  enforceContentType(['application/json']),
  json(),
  
  
  
  
  (req: any, res: any, next: any) => {
    const { anden, whse } = req.body || {};
    if (!isStringOrNumber(anden) || !nonEmptyString(String(anden)) || !nonEmptyString(whse)) {
      return res.status(400).json({
        error: 'Bad Request', issues: [
          { path: ['body', 'anden'], message: 'anden string|number requerido' },
          { path: ['body', 'whse'], message: 'whse string requerido' },
        ]
      });
    }
    req.body.anden = String(anden).trim();
    next();
  },
  validateCreateDelete,
  createAndenController
);

router.put(
  ' ',
  enforceContentType(['application/json']),
  json(),
  (req: any, res: any, next: any) => {
    const { anden, whse } = req.body || {};
    if (!isStringOrNumber(anden) || !nonEmptyString(String(anden)) || !nonEmptyString(whse)) {
      return res.status(400).json({
        error: 'Bad Request', issues: [
          { path: ['body', 'anden'], message: 'anden string|number requerido' },
          { path: ['body', 'whse'], message: 'whse string requerido' },
        ]
      });
    }
    req.body.anden = String(anden).trim();
    next();
  },
  validateCreateDelete,
  deleteAndenController
);

router.put(
  ' ',
  enforceContentType(['application/json']),
  json(),
  (req: any, res: any, next: any) => {
    const { anden, whse } = req.body || {};
    if (!isStringOrNumber(anden) || !nonEmptyString(String(anden)) || !nonEmptyString(whse)) {
      return res.status(400).json({
        error: 'Bad Request', issues: [
          { path: ['body', 'anden'], message: 'anden string|number requerido' },
          { path: ['body', 'whse'], message: 'whse string requerido' },
        ]
      });
    }
    req.body.anden = String(anden).trim();
    next();
  },
  validateUpdate,
  updateAndenController
);


add405ForRouter(router, ['/pallet/:pallet', '/reserva/:reserva', '/', '/anden', '/destinos'], ['GET', 'OPTIONS']);
add405ForRouter(router, ['/anden/create'], ['POST', 'OPTIONS']);
add405ForRouter(router, ['/anden/delete', '/anden/update'], ['PUT', 'OPTIONS']);

export default router;
