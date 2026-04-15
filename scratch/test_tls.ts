
import tls from 'tls';

const options = {
  host: 'db.ilfserdwvsxpngwttmjo.supabase.co',
  port: 5432,
  servername: 'db.ilfserdwvsxpngwttmjo.supabase.co',
  rejectUnauthorized: false // We'll try with false first to see if it connects at all
};

const socket = tls.connect(options, () => {
  console.log('client connected', socket.authorized ? 'authorized' : 'unauthorized');
  process.stdin.pipe(socket);
  process.stdin.resume();
});

socket.setEncoding('utf8');

socket.on('data', (data) => {
  console.log('Received:', data);
});

socket.on('error', (err) => {
  console.error('TLS error:', err);
});

socket.on('end', () => {
  console.log('Connection ended');
});

setTimeout(() => {
  console.log('Timing out...');
  socket.destroy();
  process.exit(0);
}, 5000);
