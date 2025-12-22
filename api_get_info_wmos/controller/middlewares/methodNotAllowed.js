


module.exports = function methodNotAllowed(allowed = ['GET', 'OPTIONS']) {
  return function (req, res, next) {
    res.set('Allow', allowed.join(', '));

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    if (!allowed.includes(req.method)) {
      return res.status(405).json({
        error: 'method_not_allowed',
        path: req.originalUrl || req.path,
        method: req.method,
        allow: allowed
      });
    }
    return next();
  };
};
