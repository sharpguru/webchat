var socket = require('socket.io-client')('http://localhost:1337');

socket.on('connect', function(){
});

socket.on('connected', function(msg){
  console.log(msg);
  prompt();
});

socket.on('chat', function(msg){
  console.log(msg);
  prompt();
});

socket.on('returnmessage', function(msg){
    console.log(msg);
    prompt();
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

    if (msg.startsWith('.')) {
      // find first space
      var space = msg.indexOf(' ');
      if (space == -1) space = msg.length;
      var cmd = msg.substring(1, space);
      var data = msg.substring(space + 1);
      //console.log(space);
      //console.log(data);
      //console.log(cmd);
      socket.emit(cmd, data);
    } else {
      socket.emit('chat', msg);
    }
    //rl.close();
    prompt();
  });
}

//prompt();
