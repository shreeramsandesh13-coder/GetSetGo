const localtunnel = require('localtunnel');

(async () => {
  try {
    const tunnel = await localtunnel({ port: 5173 });
    console.log('TUNNEL_URL:' + tunnel.url);

    tunnel.on('close', () => {
      console.log('Tunnel was closed');
    });

    tunnel.on('error', (err) => {
      console.error('Tunnel error:', err);
    });

    // Keep process alive
    setInterval(() => {}, 10000);
  } catch (err) {
    console.error('Failed to start tunnel:', err);
  }
})();

