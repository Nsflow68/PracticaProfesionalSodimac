
import { Request, Response, NextFunction } from 'express';
import { negotiateAccept } from '../utils/accept';

export interface EnforceAcceptOptions {
  supported?: string[];
  setContentTypeHeader?: boolean;
}

export function enforceAccept(opts?: EnforceAcceptOptions) {
  const supported = (opts?.supported ?? ['application/json']).map(s => s.toLowerCase());
  const setCT = opts?.setContentTypeHeader ?? true;

  return function (req: Request, res: Response, next: NextFunction) {
    const acceptRaw = String(req.headers['accept'] ?? '').toLowerCase();
    res.setHeader('Vary', 'Accept');

    if (!acceptRaw || acceptRaw.includes('*/*')) {
      if (setCT) res.setHeader('Content-Type', supported[0]);
      (res.locals as any).responseContentType = supported[0];
      return next();
    }

    const chosen = negotiateAccept(acceptRaw, supported);
    if (!chosen) {
      return res.status(406).json({
        error: 'Not Acceptable',
        message: 'El recurso no puede representarse en los formatos solicitados en el encabezado Accept.',
        supported,
        received: acceptRaw,
        code: 'ERR_NOT_ACCEPTABLE'
      });
    }

    if (setCT) res.setHeader('Content-Type', chosen);
    (res.locals as any).responseContentType = chosen;
    return next();
  };
}
