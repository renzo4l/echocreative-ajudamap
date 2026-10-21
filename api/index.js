import { app, initDb } from '../server.bundle.mjs';

let initialization;

export default async function handler(req, res) {
  const rawUrl = req.url || '/';
  const queryStart = rawUrl.indexOf('?');
  const query = new URLSearchParams(queryStart === -1 ? '' : rawUrl.slice(queryStart + 1));
  const requestedApiPath = query.get('requestPath');

  if (!requestedApiPath || requestedApiPath.startsWith('/') || requestedApiPath.split('/').includes('..')) {
    return res.sendStatus(404);
  }

  query.delete('requestPath');
  const encodedApiPath = requestedApiPath
    .split('/')
    .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
    .join('/');
  const forwardedQuery = query.toString();
  req.url = `/api/${encodedApiPath}${forwardedQuery ? `?${forwardedQuery}` : ''}`;

  initialization ??= initDb();
  await initialization;
  app(req, res);
}
