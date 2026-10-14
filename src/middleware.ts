import { defineMiddleware } from 'astro:middleware';
import { setGlobalD1 } from './lib/db';

export const onRequest = defineMiddleware((context, next) => {
  const d1 = (context.locals as any)?.runtime?.env?.DB;
  if (d1) {
    setGlobalD1(d1);
  }
  return next();
});
