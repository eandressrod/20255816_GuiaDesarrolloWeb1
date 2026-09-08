const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', 'dist');
const types = { '.css': 'text/css', '.js': 'text/javascript', '.html': 'text/html', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.jfif': 'image/jpeg', '.ico': 'image/x-icon' };
http.createServer((req, res) => {
  const clean = decodeURIComponent((req.url || '/').split('?')[0]).replace(/^\/+/, '');
  let file = path.join(root, clean || 'index.html');
  if (!path.extname(file)) file = path.join(file, 'index.html');
  if (!file.startsWith(root)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(file, (error, content) => {
    if (error) {
      fs.readFile(path.join(root, '404.html'), (fallbackError, fallback) => {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fallbackError ? 'Página no encontrada' : fallback);
      });
      return;
    }
    res.writeHead(200, { 'Content-Type': `${types[path.extname(file).toLowerCase()] || 'application/octet-stream'}; charset=utf-8` });
    res.end(content);
  });
}).listen(4173, () => console.log('CONSTRUPRE disponible en http://localhost:4173'));
