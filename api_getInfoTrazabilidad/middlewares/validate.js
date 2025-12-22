
const SAFE_STR = /^[A-Za-z0-9\-\.]{1,64}$/;
const SAFE_UBIC_STR = /^[\p{L}0-9\-\. ]{1,64}$/u;
const SAFE_WAREHOUSE = new Set(['20', '21', '25', '1902', '214', '221', '257', '262', '367', '508']);

function fail(res, field, reason) {
  return res.status(422).json({ error: 'invalid_input', field, reason });
}

function isSafeString(v, max = 64) {
  return typeof v === 'string' && v.length > 0 && v.length <= max && SAFE_STR.test(v);
}

function isSafeStringArray(arr, maxLenEach = 64) {
  if (!Array.isArray(arr) || arr.length === 0) return false;
  return arr.every((v) => isSafeString(v, maxLenEach));
}

function isWhse(v) {
  const s = String(v || '').trim();
  return SAFE_WAREHOUSE.has(s);
}

function validateParams(schema) {
  return (req, res, next) => {
    for (const [key, validator] of Object.entries(schema || {})) {
      const val = (req.params || {})[key];
      if (!validator(val)) return fail(res, key, 'param_invalid');
    }
    next();
  };
}

function validateBody(schema) {
  return (req, res, next) => {
    for (const [key, rule] of Object.entries(schema || {})) {
      const val = (req.body || {})[key];
      if (!rule(val)) return fail(res, key, 'body_invalid');
    }
    next();
  };
}

function validateQuery(schema) {
  return (req, res, next) => {
    for (const [key, rule] of Object.entries(schema || {})) {
      const val = (req.query || {})[key];
      if (!rule(val)) return fail(res, key, 'query_invalid');
    }
    next();
  };
}


const parseJsonArrayString = (value) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) return null;
  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const vLpn = (v) => isSafeString(v, 64);
const vLpnList = (v) => {
  if (typeof v === 'string') {
    if (vLpn(v)) return true;
    const parsed = parseJsonArrayString(v);
    return parsed ? isSafeStringArray(parsed, 64) : false;
  }
  return isSafeStringArray(v, 64);
};
const vUbic = (v) => {
  if (typeof v !== 'string') return false;
  const trimmed = v.trim();
  if (!trimmed || trimmed.length > 64) return false;
  return SAFE_UBIC_STR.test(trimmed);
};
const vCC = (v) => isWhse(v);
const vReserva = (v) => isSafeString(String(v), 32);
const vPrinter = (v) => isSafeString(v, 64); 
const vZpl = (v) => typeof v === 'string' && v.length > 0 && v.length <= 200000; 
const vOrders = (v) => {
  if (Array.isArray(v)) return v.length > 0 && v.every((x) => isSafeString(String(x), 64));
  return isSafeString(String(v), 64);
};
const vDateStr = (v) => typeof v === 'string' && v.length > 0 && v.length <= 32;
const vNumberish = (v) => /^(?:\d){1,20}$/.test(String(v || ''));

module.exports = {
  validateParams,
  validateBody,
  validateQuery,
  
  vLpn,
  vLpnList,
  vUbic,
  vCC,
  vReserva,
  vPrinter,
  vZpl,
  vOrders,
  vDateStr,
  vNumberish,
};

