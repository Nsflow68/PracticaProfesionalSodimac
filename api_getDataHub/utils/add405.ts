
import { Router } from 'express';
import { methodNotAllowed } from '../middlewares/methodNotAllowed';


export function add405ForRouter(
  router: Router,
  paths: string[] = [],
  allowedMethods: string[] = ['GET']
): void {
  const ALL_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'];

  const allowed = Array.from(
    new Set(
      (Array.isArray(allowedMethods) ? allowedMethods : [])
        .filter((m) => typeof m === 'string' && m.trim())
        .map((m) => m.trim().toUpperCase())
    )
  );

  
  if (allowed.includes('GET') && !allowed.includes('HEAD')) allowed.push('HEAD');
  
  if (!allowed.includes('OPTIONS')) allowed.push('OPTIONS');

  const notAllowed = ALL_METHODS.filter((m) => !allowed.includes(m));

  paths.forEach((p) => {
    
    router.options(p, (req, res) => {
      res.set('Allow', allowed.join(', '));
      return res.sendStatus(204);
    });

    
    notAllowed.forEach((m) => {
      const fn = (router as any)[m.toLowerCase()];
      if (typeof fn === 'function') {
        fn.call(router, p, methodNotAllowed(allowed));
      }
    });
  });
}
