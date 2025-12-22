
export function parseAcceptHeader(acceptRaw?: string): Array<{ type: string; q: number }> {
  if (!acceptRaw || !acceptRaw.trim()) return [{ type: '**') return true;
  if (requested.endsWith('/*')) {
    const prefix = requested.split('/')[0] + '/';
    return supported.startsWith(prefix);
  }
  return requested === supported;
}

export function negotiateAccept(acceptRaw: string | undefined, supported: string[]): string | null {
  const parsed = parseAcceptHeader(acceptRaw);
  for (const pref of parsed) {
    for (const s of supported) {
      if (mimeMatch(pref.type, s.toLowerCase())) return s;
    }
  }
  return null;
}
