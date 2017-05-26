var socket = require('socket.io-client')('http://localhost:1337');

socket.on('connect', function(){
  console.log('connected');
});

socket.on('chat', function(msg){
  console.log(msg);
});

socket.on('disconnect', function(){
  console.log('disconnected');
});

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt() {
  rl.question('> ', (msg) => {
    socket.emit('chat', msg);
    rl.close();
    prompt();
  });
}

prompt();
