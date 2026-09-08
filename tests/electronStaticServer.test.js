import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { request } from 'node:http';

const require = createRequire(import.meta.url);
const { createStaticServer } = require('../electron/staticServer.cjs');

let root;
let server;

function rawRequest(urlPath, method = 'GET') {
  return new Promise((resolve, reject) => {
    const { hostname, port } = new URL(server.url);
    const req = request({ hostname, port, path: urlPath, method }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve({
        status: res.statusCode,
        headers: res.headers,
        body: Buffer.concat(chunks).toString('utf8'),
      }));
    });
    req.on('error', reject);
    req.end();
  });
}

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'chess-summon-static-'));
  await writeFile(path.join(root, 'index.html'), '<!doctype html><body>Hello</body>');
  await writeFile(path.join(root, 'app.js'), 'console.log("hello");');
  await writeFile(path.join(root, 'sound.ogg'), Buffer.from([0x4f, 0x67, 0x67, 0x53]));
  server = await createStaticServer(root);
});

afterEach(async () => {
  await server.close();
  await rm(root, { recursive: true, force: true });
});

describe('staticServer', () => {
  it('serves index.html at root with its HTML MIME type', async () => {
    const response = await rawRequest('/');
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/text\/html/);
    expect(response.body).toContain('Hello');
  });

  it('serves JavaScript and OGG files with explicit MIME types', async () => {
    const script = await rawRequest('/app.js');
    const audio = await rawRequest('/sound.ogg');
    expect(script.status).toBe(200);
    expect(script.headers['content-type']).toMatch(/javascript/);
    expect(audio.status).toBe(200);
    expect(audio.headers['content-type']).toMatch(/audio\/ogg/);
  });

  it('rejects encoded and backslash traversal attempts', async () => {
    for (const target of ['/..%2Fsecret', '/%2e%2e%2fsecret', '/..\\secret']) {
      expect((await rawRequest(target)).status).toBe(403);
    }
  });

  it('returns 404 for missing files and 405 for unsupported methods', async () => {
    expect((await rawRequest('/missing.html')).status).toBe(404);
    expect((await rawRequest('/', 'POST')).status).toBe(405);
  });
});
