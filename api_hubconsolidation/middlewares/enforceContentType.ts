
import { Request, Response, NextFunction } from 'express';
import { mediaTypeMatches } from '../utils/contentType';

type BodyMethod = 'POST' | 'PUT' | 'PATCH';

export function enforceContentType(allowed: string[]) {
  const list = [...new Set(allowed.map(s => s.toLowerCase()))];

  return (req: Request, res: Response, next: NextFunction) => {
    const method = req.method.toUpperCase() as BodyMethod;
    if (!['POST', 'PUT', 'PATCH'].includes(method)) return next();

    const ct = (req.headers['content-type'] || '') as string;

    
    const hdr = method === 'POST' ? 'Accept-Post'
              : method === 'PUT'  ? 'Accept-Put'
              :                     'Accept-Patch';
    res.setHeader(hdr, list.join(', '));

    if (!ct) {
      return res.status(415).json({
        error: 'Unsupported Media Type',
        detail: `Falta Content-Type. Permitidos: ${list.join(', ')}`
      });
    }
    const ok = list.some(p => mediaTypeMatches(p, ct));
    if (!ok) {
      return res.status(415).json({
        error: 'Unsupported Media Type',
        received: ct,
        allowed: list
      });
    }
    next();
  };
}
