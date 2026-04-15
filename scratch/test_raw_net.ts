
import net from 'net';

const client = net.createConnection({
  host: 'db.ilfserdwvsxpngwttmjo.supabase.co',
  port: 5432
}, () => {
  console.log('Connected to server!');
  client.write('Q'); // Send something to see if it responds
});

client.on('data', (data) => {
  console.log('Received data:', data.toString());
  client.destroy();
});

client.on('error', (err) => {
  console.error('Connection error:', err);
});

client.on('end', () => {
  console.log('Disconnected from server');
});
