

function normalize(mt) {
  return String(mt || '').toLowerCase().split(',').map(s => s.split(';')[0].trim()).filter(Boolean);
}

function mediaTypeAccepted(allowed, acceptHeader) {
  const accepted = normalize(acceptHeader);
  if (!accepted.length) return true; 
    if (allowed.includes(a)) return true;
    
    if (a.endsWith('/*')) {
      const base = a.slice(0, -1);
      return allowed.some((al) => al.startsWith(base));
    }
    return false;
  });
}

function enforceAccept(allowed = ['application/json']) {
  const list = Array.from(new Set((allowed || []).map(String).map(s => s.toLowerCase())));
  return (req, res, next) => {
    const accept = req.headers['accept'];
    const ok = mediaTypeAccepted(list, accept);
    if (!ok) {
      return res.status(406).json({
        error: 'not_acceptable',
        detail: 'El servidor solo puede responder en: ' + list.join(', '),
      });
    }
    return next();
  };
}

module.exports = { enforceAccept };

