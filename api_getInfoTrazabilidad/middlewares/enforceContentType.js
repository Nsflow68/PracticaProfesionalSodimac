const { mediaTypeMatches } = require('../utils/contentType');



function enforceContentTypeFor(allowed, methods = ['POST', 'PUT', 'PATCH']) {
  const list = Array.from(new Set((allowed || []).map(s => String(s).toLowerCase())));
  const methodSet = new Set((methods || []).map(m => String(m || '').toUpperCase()));

  return (req, res, next) => {
    const method = String(req.method || '').toUpperCase();
    if (!methodSet.has(method)) return next();

    const ct = String(req.headers['content-type'] || '');
    let hdr = null;
    if (method === 'POST') hdr = 'Accept-Post';
    else if (method === 'PUT') hdr = 'Accept-Put';
    else if (method === 'PATCH') hdr = 'Accept-Patch';
    else if (method === 'GET') hdr = 'Accept-Get';
    if (hdr && list.length) res.setHeader(hdr, list.join(', '));

    if (!ct) {
      return res.status(415).json({
        error: 'unsupported_media_type',
        detail: 'Missing Content-Type header',
      });
    }

    const ok = list.length === 0 ? true : list.some(p => mediaTypeMatches(p, ct));
    if (!ok) {
      return res.status(415).json({
        error: 'unsupported_media_type',
        received: ct,
        allowed: list,
      });
    }

    return next();
  };
}


function enforceContentType(allowed) {
  return enforceContentTypeFor(allowed);
}

module.exports = { enforceContentType, enforceContentTypeFor };

