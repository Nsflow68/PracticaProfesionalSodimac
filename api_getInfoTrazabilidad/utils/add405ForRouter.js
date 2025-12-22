
const methodNotAllowed = require('../middlewares/methodNotAllowed');


module.exports = function add405ForRouter(router, paths = [], allowedMethods = ['GET']) {
  const ALL_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'];
  const allowed = Array.from(
    new Set(
      (Array.isArray(allowedMethods) ? allowedMethods : [])
        .filter(m => typeof m === 'string' && m.trim())
        .map(m => m.trim().toUpperCase())
    )
  );
  const notAllowed = ALL_METHODS.filter(m => !allowed.includes(m));

  paths.forEach((p) => {
    
    router.options(p, (req, res) => {
      res.set('Allow', allowed.join(', '));
      return res.sendStatus(204);
    });

    
    notAllowed.forEach((m) => {
      const methodFn = router[m.toLowerCase()];
      if (typeof methodFn === 'function') {
        methodFn.call(router, p, methodNotAllowed(allowed));
      }
    });

    
    router.all(p, (req, res, next) => {
      const reqMethod = String(req.method || '').toUpperCase();
      if (allowed.includes(reqMethod)) return next();
      return methodNotAllowed(allowed)(req, res, next);
    });
  });
};
