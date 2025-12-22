
module.exports = function methodNotAllowed(allowed = []) {
  const allow = Array.from(
    new Set(
      (Array.isArray(allowed) ? allowed : [])
        .filter(m => typeof m === 'string' && m.trim())
        .map(m => m.trim().toUpperCase())
    )
  );

  return (req, res, _next) => {
    const allowHeader = allow.length ? allow.join(', ') : 'GET, OPTIONS';
    res.set('Allow', allowHeader);
    return res.status(405).json({
      error: 'method_not_allowed',
      path: req.originalUrl,
      allowed: allow.length ? allow : ['GET', 'OPTIONS'],
    });
  };
};
