import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import {readFileSync} from 'node:fs';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const certificate = {
    private: readFileSync(path.join(__dirname, "./cert/localhost.key")),
    cert: readFileSync(path.join(__dirname, "./cert/localhost.crt")),
};

const PORT = 8000;

// Options for HTTPS server
const options = {
  key: certificate?.private,
  cert: certificate?.cert
};

const server = https.createServer(options, (req, res) => {
  // Construct file path
  let filePath = path.join(__dirname, '../../', req.url ?? '');

  // Determine content type (a simplified version; you might need a more robust solution for all file types)
  const extname = path.extname(filePath);
  let contentType = 'text/html';
  switch (extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpg':
      contentType = 'image/jpeg';
      break;
  }

  // Read and serve the file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found!');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`HTTPS Server running.`);
  console.log(`Now open https://localhost:${PORT}/examples/typescript_webtransport/client.html`);
});