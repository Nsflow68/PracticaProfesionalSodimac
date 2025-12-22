import { Request, Response, NextFunction } from 'express';

export const methodNotAllowed =
  (allowed: string[]) =>
  (req: Request, res: Response, _next: NextFunction) => {
    res.set('Allow', allowed.join(', '));
    return res.status(405).json({
      error: 'Method Not Allowed',
      path: req.originalUrl,
      allowed,
    });
  };
