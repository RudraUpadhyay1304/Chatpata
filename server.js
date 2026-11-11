/**
 * Standalone Local Development Server (Pure Node.js)
 * Enables running the app locally with `npm start` without requiring any build step or Vercel CLI.
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

// Import serverless API handlers
import registerHandler from './api/auth/register.js';
import loginHandler from './api/auth/login.js';
import logoutHandler from './api/auth/logout.js';
import meHandler from './api/auth/me.js';
import itemsIndexHandler from './api/items/index.js';
import itemByIdHandler from './api/items/[id].js';
import itemMatchesHandler from './api/items/[id]/matches.js';
import claimsIndexHandler from './api/claims/index.js';
import claimByIdHandler from './api/claims/[id].js';
import statsHandler from './api/stats.js';
import userMeHandler from './api/users/me.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  // Enhance res with Express/Vercel-like helper methods
  res.status = function (statusCode) {
    this.statusCode = statusCode;
    return this;
  };
  res.json = function (data) {
    this.setHeader('Content-Type', 'application/json; charset=utf-8');
    this.end(JSON.stringify(data));
    return this;
  };

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  req.query = Object.fromEntries(parsedUrl.searchParams.entries());

  // Helper to parse JSON body
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const rawBody = Buffer.concat(buffers).toString('utf8');
    try {
      req.body = rawBody ? JSON.parse(rawBody) : {};
    } catch {
      req.body = {};
    }
  }

  // --- API ROUTING ---
  if (pathname.startsWith('/api/')) {
    try {
      if (pathname === '/api/auth/register') return await registerHandler(req, res);
      if (pathname === '/api/auth/login') return await loginHandler(req, res);
      if (pathname === '/api/auth/logout') return await logoutHandler(req, res);
      if (pathname === '/api/auth/me') return await meHandler(req, res);
      if (pathname === '/api/items') return await itemsIndexHandler(req, res);

      // Matches: /api/items/:id/matches
      const itemMatchesMatch = pathname.match(/^\/api\/items\/([^/]+)\/matches\/?$/);
      if (itemMatchesMatch) {
        req.query.id = itemMatchesMatch[1];
        return await itemMatchesHandler(req, res);
      }

      // Items [id]: /api/items/:id
      const itemMatch = pathname.match(/^\/api\/items\/([^/]+)\/?$/);
      if (itemMatch) {
        req.query.id = itemMatch[1];
        return await itemByIdHandler(req, res);
      }

      if (pathname === '/api/claims') return await claimsIndexHandler(req, res);

      // Claims [id]: /api/claims/:id
      const claimMatch = pathname.match(/^\/api\/claims\/([^/]+)\/?$/);
      if (claimMatch) {
        req.query.id = claimMatch[1];
        return await claimByIdHandler(req, res);
      }

      if (pathname === '/api/stats') return await statsHandler(req, res);
      if (pathname === '/api/users/me') return await userMeHandler(req, res);

      return res.status(404).json({ error: 'API route not found' });
    } catch (err) {
      console.error('Server error on', pathname, err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // --- STATIC FILE SERVING (/public) ---
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  
  // Clean URL support (e.g. /browse -> /browse.html)
  if (!path.extname(filePath) && fs.existsSync(filePath + '.html')) {
    filePath = filePath + '.html';
  }

  // Prevent path traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.statusCode = 403;
    return res.end('Access denied');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // 404 fallback
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.end('<h1>404 Not Found</h1><p><a href="/">Return to Home</a></p>');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    fs.createReadStream(filePath).pipe(res);
  });
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`FindIt AI server running at http://localhost:${PORT}`);
  });
}

export default server;
