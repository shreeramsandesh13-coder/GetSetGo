const localtunnel = require('localtunnel');

async function startPersistentTunnel() {
  try {
    const tunnel = await localtunnel({
      port: 5173,
      subdomain: 'getsetgo-test-app'
    });

    console.log('TUNNEL_ONLINE:' + tunnel.url);

    tunnel.on('close', () => {
      console.log('Tunnel closed. Reconnecting in 2 seconds...');
      setTimeout(startPersistentTunnel, 2000);
    });

    tunnel.on('error', (err) => {
      console.error('Tunnel error:', err && err.message);
      try { tunnel.close(); } catch (_) {}
      setTimeout(startPersistentTunnel, 2000);
    });
  } catch (err) {
    console.error('Connection failed:', err && err.message);
    setTimeout(startPersistentTunnel, 3000);
  }
}

startPersistentTunnel();

