

const parseAccept = (acceptHeader = '') =>
  String(acceptHeader)
    .split(',')
    .map(s => s.split(';')[0].trim().toLowerCase())
    .filter(Boolean);

function chooseContentType(supported, acceptHeader) {
  const req = parseAccept(acceptHeader);
  const list = Array.from(new Set((supported || []).map(s => String(s).toLowerCase())));
  if (req.length === 0) return list[0] || null; 
    if (list.includes(a)) return a;
    if (a.endsWith('/*')) {
      const base = a.slice(0, -1);
      const found = list.find(x => x.startsWith(base));
      if (found) return found;
    }
  }
  return null;
}

module.exports = (supported = ['application/json']) => (req, res, next) => {
  const accept = req.headers['accept'] || '';
  res.setHeader('Vary', 'Accept');
  const chosen = chooseContentType(supported, accept);
  if (!chosen) {
    return res
      .status(406)
      .json({
        error: 'Not Acceptable',
        supported: supported.map(s => String(s).toLowerCase()),
        received: parseAccept(accept)
      });
  }
  res.setHeader('Content-Type', chosen);
  next();
};

