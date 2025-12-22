
export const normalize = (ct?: string) =>
  (ct || '').toLowerCase().split(';')[0].trim();

export function mediaTypeMatches(expected: string, got: string) {
  const e = normalize(expected);
  const a = normalize(got);
  if (!e || !a) return false;
  if (e === a) return true;

  
  if (e.endsWith('+json')) return a.endsWith('+json');
  if (e.endsWith('/*')) return a.startsWith(e.slice(0, -1)); 

  return false;
}
