const isProd = process.env.NODE_ENV === 'production';

type AnyFn = (...args: any[]) => void;

const debug: AnyFn = (...args) => {
  if (!isProd) console.log(...args);
};

const info: AnyFn = (...args) => console.log(...args);
const warn: AnyFn = (...args) => console.warn(...args);
const error: AnyFn = (...args) => console.error(...args);

export const logger = { debug, info, warn, error };

