const http = require('http');

const port = process.env.PORT || 8080;

try {
  console.log('wrapper.js: Attempting to require /app/dist/main.js');
  require('/app/dist/main.js');
  console.log('wrapper.js: Successfully loaded /app/dist/main.js');
} catch (err) {
  console.error('\\n\\n=== FATAL STARTUP CRASH ===\\n\\n');
  console.error(err);
  console.error('\\n\\n===========================\\n\\n');
  
  // Start server to prevent Cloud Run from failing the deployment
  // and to serve the error to the user
  http.createServer((req, res) => {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('RELEASE GUARD STARTUP CRASH:\\n\\n' + (err.stack || err));
  }).listen(port, '0.0.0.0', () => {
    console.log(`⚠️ FALLBACK ERROR SERVER RUNNING ON PORT ${port}`);
  });
}
