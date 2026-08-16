// Serves a built directory over HTTP, for the visual run.
//
// Storybook's static output cannot be opened over `file://` — the preview loads ES modules, and a
// module fetched from a file URL is blocked as cross-origin — so the screenshots need a real
// server. Twenty lines of `node:http` rather than a dependency, because a dependency added to
// serve a directory is a dependency that has to be reviewed, updated and justified forever.
//
// Usage: node scripts/serve-static.mjs <directory> <port>

import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import process from 'node:process';
import { URL } from 'node:url';

const [, , root = 'storybook-static', port = '6007'] = process.argv;

const TYPES = {
  '.css': 'text/css',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.map': 'application/json',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

const server = createServer((request, response) => {
  const { pathname } = new URL(request.url ?? '/', 'http://localhost');

  // `normalize` collapses any `..` before the path is joined, so a request cannot climb out of the
  // directory being served.
  const relative = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
  const path = join(root, relative === '/' ? 'index.html' : relative);

  stat(path)
    .then((info) => {
      if (!info.isFile()) throw new Error('not a file');
      response.writeHead(200, {
        'content-type': TYPES[extname(path)] ?? 'application/octet-stream',
      });
      createReadStream(path).pipe(response);
    })
    .catch(() => {
      response.writeHead(404, { 'content-type': 'text/plain' });
      response.end('Not found\n');
    });
});

server.listen(Number(port), () => {
  process.stdout.write(`Serving ${root} on http://localhost:${port}\n`);
});
