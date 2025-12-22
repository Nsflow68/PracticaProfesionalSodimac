
import { Router } from 'express';
import { methodNotAllowed } from '../middlewares/methodNotAllowed';

type RouteLayer = {
  route?: {
    path: string | RegExp | (string | RegExp)[];
    methods: Record<string, boolean>;
  };
};

function toStringPaths(p: string | RegExp | (string | RegExp)[]): string[] {
  const arr = Array.isArray(p) ? p : [p];
  return arr.filter((x): x is string => typeof x === 'string');
}

function enabledMethods(flags: Record<string, boolean>): string[] {
  return Object.entries(flags)
    .filter(([, v]) => v)
    .map(([k]) => k.toUpperCase());
}

export function add405ForRouter(router: Router): void {
  const seen = new Map<string, Set<string>>();
  const stack = (router as unknown as { stack?: RouteLayer[] }).stack ?? [];

  stack.forEach((layer) => {
    const r = layer.route;
    if (!r) return;

    const methods = enabledMethods(r.methods);
    toStringPaths(r.path).forEach((path) => {
      const set = seen.get(path) ?? new Set<string>();
      methods.forEach((m) => set.add(m));
      seen.set(path, set);
    });
  });

  seen.forEach((set, path) => {
    if (set.has('GET')) set.add('HEAD');
    set.add('OPTIONS');
    const allowed = [...set].sort();
    const ALL_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'];
    const notAllowed = ALL_METHODS.filter(
      (m) => !allowed.includes(m) && !(m === 'HEAD' && allowed.includes('GET'))
    );

    
    notAllowed.forEach((m) => {
      const fn = (router as any)[m.toLowerCase()];
      if (typeof fn === 'function') {
        fn.call(router, path, methodNotAllowed(allowed));
      }
    });
    
    router.options(path, (req, res) => {
      res.set('Allow', allowed.join(', '));
      return res.sendStatus(204);
    });

    
    router.all(path, (req, res, next) => {
      const m = String(req.method || '').toUpperCase();
      if (allowed.includes(m)) return next();
      if (m === 'HEAD' && allowed.includes('GET')) return next();
      return methodNotAllowed(allowed)(req, res, next);
    });
  });

  
  router.all(' ', (req, res, next) => {
    const m = String(req.method || '').toUpperCase();

    
    const allowedSet = new Set<string>();
    const stackNow = (router as unknown as { stack?: RouteLayer[] }).stack ?? [];
    stackNow.forEach((layer) => {
      const r = layer.route;
      if (!r) return;
      const methods = enabledMethods(r.methods);
      toStringPaths(r.path).forEach((p) => {
        if (typeof p === 'string' && p === req.path) {
          methods.forEach((mm) => allowedSet.add(mm));
        }
      });
    });

    if (allowedSet.size === 0) return next(); 

    if (allowedSet.has('GET')) allowedSet.add('HEAD');
    allowedSet.add('OPTIONS');

    const allowed = [...allowedSet].sort();
    if (allowed.includes(m)) return next();
    if (m === 'HEAD' && allowed.includes('GET')) return next();
    return methodNotAllowed(allowed)(req, res, next);
  });
}




export function add405EarlyGuard(router: Router): void {
  router.use((req, res, next) => {
    const reqPath = req.path;

    
    const set = new Set<string>();
    const stack = (router as unknown as { stack?: RouteLayer[] }).stack ?? [];

    stack.forEach((layer) => {
      const r = layer.route;
      if (!r) return;
      const methods = enabledMethods(r.methods);
      toStringPaths(r.path).forEach((p) => {
        if (typeof p === 'string' && p === reqPath) {
          methods.forEach((m) => set.add(m));
        }
      });
    });

    if (set.size === 0) return next(); 

    if (set.has('GET')) set.add('HEAD');
    set.add('OPTIONS');
    const allowed = [...set].sort();

    const method = String(req.method || '').toUpperCase();
    if (method === 'OPTIONS') {
      res.set('Allow', allowed.join(', '));
      return res.sendStatus(204);
    }
    if (allowed.includes(method)) return next();
    if (method === 'HEAD' && allowed.includes('GET')) return next();
    return methodNotAllowed(allowed)(req, res, next);
  });
}
