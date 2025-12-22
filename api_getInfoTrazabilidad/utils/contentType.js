
function normalize(ct) {
  return String(ct || '').toLowerCase().split(';')[0].trim();
}


function mediaTypeMatches(expected, actual) {
  const e = normalize(expected);
  const a = normalize(actual);
  if (!e || !a) return false;
  if (e === a) return true;

  
  if (e === 'application/json' && a.endsWith('+json')) return true;

  
  if (e.endsWith('+json')) return a.endsWith('+json');

  
  if (e.endsWith('/*')) return a.startsWith(e.slice(0, -1));

  return false;
}

module.exports = { normalize, mediaTypeMatches };
