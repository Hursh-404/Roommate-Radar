/**
 * server.js - NodeJS HTTP Server with Server-Side Validation
 * Practical No. 04 (Server-Side Development: NodeJS - CO3)
 * MIT Academy of Engineering (MIT-AOE)
 */

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const { validateRoommateInput } = require('./validator');
const dataStore = require('./dataStore');

const PORT = process.env.PORT || 4000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

/**
 * Utility: Sends JSON response with status code and CORS headers
 */
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'X-Powered-By': 'NodeJS-HTTP-Server'
  });
  res.end(JSON.stringify(data, null, 2));
}

/**
 * Utility: Parses incoming request body stream with size limit
 */
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    const MAX_SIZE = 1e6; // 1 MB limit

    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > MAX_SIZE) {
        reject(new Error('Payload Too Large: Request body exceeds 1 MB'));
      }
    });

    req.on('end', () => {
      if (!body) {
        return resolve({});
      }
      try {
        const parsed = JSON.parse(body);
        resolve(parsed);
      } catch (err) {
        reject(new Error('Malformed JSON syntax in request body'));
      }
    });

    req.on('error', err => reject(err));
  });
}

/**
 * Serves static files from the public/ directory
 */
function serveStaticFile(req, res, pathname) {
  let relativePath = pathname === '/' ? 'index.html' : pathname;
  const filePath = path.join(PUBLIC_DIR, relativePath);

  // Security check: prevent path traversal attacks
  if (!filePath.startsWith(PUBLIC_DIR)) {
    return sendJSON(res, 403, { error: 'Forbidden: Path traversal blocked' });
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      return sendJSON(res, 404, {
        error: { code: 'NOT_FOUND', message: `Route or file ${pathname} not found.` }
      });
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
}

/**
 * Main HTTP Server Request Listener
 */
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  // Handle CORS pre-flight requests
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  try {
    // ----------------------------------------------------
    // API Route: GET /api/health
    // ----------------------------------------------------
    if (pathname === '/api/health' && method === 'GET') {
      return sendJSON(res, 200, {
        status: 'HEALTHY',
        service: 'RoommateRadar Server-Side Validation API',
        nodeVersion: process.version,
        uptimeSeconds: Math.round(process.uptime()),
        timestamp: new Date().toISOString()
      });
    }

    // ----------------------------------------------------
    // API Route: GET /api/roommates
    // ----------------------------------------------------
    if (pathname === '/api/roommates' && method === 'GET') {
      const query = parsedUrl.query.query || '';
      const area = parsedUrl.query.area || 'all';
      const results = dataStore.getAll({ query, area });

      return sendJSON(res, 200, {
        success: true,
        count: results.length,
        data: results
      });
    }

    // ----------------------------------------------------
    // API Route: POST /api/roommates (Server-Side Validation)
    // ----------------------------------------------------
    if (pathname === '/api/roommates' && method === 'POST') {
      const rawData = await parseRequestBody(req);
      const validation = validateRoommateInput(rawData);

      if (!validation.isValid) {
        // Log validation rejection on server
        dataStore.logValidation({
          status: 'REJECTED',
          inputName: rawData.name || 'Anonymous',
          errorCount: Object.keys(validation.errors).length,
          errors: validation.errors
        });

        return sendJSON(res, 400, {
          success: false,
          statusCode: 400,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Server-side validation failed. Please correct the highlighted errors.'
          },
          errors: validation.errors
        });
      }

      // Input is strictly valid: commit to DataStore
      const newRoommate = dataStore.add(validation.sanitized);

      // Log successful server validation
      dataStore.logValidation({
        status: 'ACCEPTED',
        id: newRoommate.id,
        name: newRoommate.name,
        email: newRoommate.email
      });

      return sendJSON(res, 201, {
        success: true,
        statusCode: 201,
        message: `Profile successfully validated and created for ${newRoommate.name}!`,
        data: newRoommate
      });
    }

    // ----------------------------------------------------
    // API Route: POST /api/validate-only (Test Validation Dry-Run)
    // ----------------------------------------------------
    if (pathname === '/api/validate-only' && method === 'POST') {
      const rawData = await parseRequestBody(req);
      const validation = validateRoommateInput(rawData);

      return sendJSON(res, validation.isValid ? 200 : 400, {
        success: validation.isValid,
        statusCode: validation.isValid ? 200 : 400,
        isValid: validation.isValid,
        errors: validation.errors,
        sanitizedPreview: validation.sanitized
      });
    }

    // ----------------------------------------------------
    // API Route: GET /api/logs
    // ----------------------------------------------------
    if (pathname === '/api/logs' && method === 'GET') {
      return sendJSON(res, 200, {
        success: true,
        logs: dataStore.getLogs()
      });
    }

    // ----------------------------------------------------
    // API Route: POST /api/reset
    // ----------------------------------------------------
    if (pathname === '/api/reset' && method === 'POST') {
      const count = dataStore.reset();
      return sendJSON(res, 200, {
        success: true,
        message: `Database successfully reset to initial ${count} seed records.`
      });
    }

    // ----------------------------------------------------
    // Serve Static UI (Frontend)
    // ----------------------------------------------------
    if (method === 'GET' && !pathname.startsWith('/api/')) {
      return serveStaticFile(req, res, pathname);
    }

    // Catch-all 404 for unknown API paths
    return sendJSON(res, 404, {
      error: { code: 'ROUTE_NOT_FOUND', message: `Cannot ${method} ${pathname}` }
    });

  } catch (err) {
    console.error(`[Server Error] ${method} ${pathname}:`, err.message);
    return sendJSON(res, 500, {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: err.message || 'An unexpected server error occurred.'
      }
    });
  }
});

// Start listening if run directly
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(` [Practical 4] NodeJS Server Running`);
    console.log(` URL: http://localhost:${PORT}`);
    console.log(` Server-Side Validation: ACTIVE`);
    console.log(` Mode: Standard Library (Zero External Dependencies)`);
    console.log(`================================================================`);
  });
}

module.exports = server;
