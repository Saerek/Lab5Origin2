// This code was assisted by ChatGPT

const http = require('http');
const url = require('url');
const Database = require('./db');

class APIServer {
  constructor(port) {
    this.port = port || 3000;
    this.db = new Database();
    this.server = http.createServer(this.requestListener.bind(this));
  }

  // Start the HTTP server
  start() {
    this.server.listen(this.port, () => {
      console.log(`API Server is running on port ${this.port}`);
    });
  }

  // Listener for incoming HTTP requests
  async requestListener(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Set CORS headers to allow cross-origin requests
    this.setCORSHeaders(res);

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // Route handling
    if (pathname === '/api/v1/sql') {
      if (req.method === 'POST') {
        this.handlePostRequest(req, res);
      } else if (req.method === 'GET') {
        this.handleGetRequest(req, res, parsedUrl.query.q);
      } else {
        this.sendResponse(res, 405, { error: 'Method not allowed.' });
      }
    } else {
      this.sendResponse(res, 404, { error: 'Not found.' });
    }
  }

  // Set CORS headers
  setCORSHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*'); // For testing purposes only. Specify origin in production.
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  // Handle POST requests (INSERT queries)
  handlePostRequest(req, res) {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString(); // Convert Buffer to string
    });
    req.on('end', async () => {
      const query = body.trim();

      // Allow only INSERT queries
      if (!query.toLowerCase().startsWith('insert')) {
        this.sendResponse(res, 400, { error: 'Only INSERT queries are allowed via POST.' });
        return;
      }

      try {
        const results = await this.db.executeQuery(query);
        this.sendResponse(res, 200, { message: 'Data inserted successfully.', results });
      } catch (err) {
        this.sendResponse(res, 400, { error: err.message });
      }
    });
  }

  // Handle GET requests (SELECT queries)
  async handleGetRequest(req, res, queryParam) {
    if (!queryParam || !queryParam.toLowerCase().startsWith('select')) {
      this.sendResponse(res, 400, { error: 'Only SELECT queries are allowed via GET.' });
      return;
    }

    const query = queryParam.trim();

    try {
      const results = await this.db.executeQuery(query);
      this.sendResponse(res, 200, results);
    } catch (err) {
      this.sendResponse(res, 400, { error: err.message });
    }
  }

  // Utility method to send JSON responses
  sendResponse(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }
}

// Instantiate and start the API server
const PORT = process.env.PORT || 3000;
const apiServer = new APIServer(PORT);
apiServer.start();
