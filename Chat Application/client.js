const net = require('net');
 
const client = net.createConnection({ port: 3000 }, function() {
  console.log('connected to server');
});
 
client.on('data', function(data) {
  process.stdout.write(data.toString());
});
 
client.on('error', function(err) {
  console.log('connection error: ' + err.message);
  process.exit(1);
});
 
client.on('end', function() {
  console.log('disconnected from server');
  process.exit(0);
});
 
process.stdin.setEncoding('utf8');
 
let inputBuffer = '';
 
process.stdin.on('data', function(chunk) {
  inputBuffer += chunk;
  let lines = inputBuffer.split('\n');
  inputBuffer = lines.pop();
 
  for (let i = 0; i < lines.length; i++) {
    client.write(lines[i] + '\n');
  }
});
 
