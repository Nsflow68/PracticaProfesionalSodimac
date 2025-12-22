function ensureArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return [];
  return [value];
}



function expandIn(name, values) {
  const arr = ensureArray(values);
  const binds = {};
  const tokens = arr.map((v, i) => {
    const key = `${name}${i}`;
    binds[key] = v;
    return `:${key}`;
  });
  return { clause: tokens.join(', '), binds };
}

module.exports = { expandIn, ensureArray };

