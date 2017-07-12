var socket = require('socket.io-client')('http://localhost:1337');
var connectionid = '';

socket.on('connect', function(){
});

socket.on('connected', function(msg, id){
  console.log(msg);
  connectionid = id;
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

      // check for local commands
      if ("share" == cmd.toLowerCase()) {
        var arr = data.split(' ');
        var localpath = arr[0];
        var sharename = arr[1];

        if (!localpath || !sharename) {
          // list shares
          socket.emit('share', '');
        } else {
          console.log('setting share');

          // Set share

          // validate localpath
          //var myFileURL = new URL('file://C:/data'); // maybe someday
          // TODO: Add support for windows drive letters and absolute urls
          var pathname = path.join(__dirname, localpath);
          console.log(pathname);
          fs.access(pathname, (err) => {
            if (err) {
              if (err.code === 'ENOENT') {
                console.error('path does not exist');
              }
            } else {
              var share = {
                name: sharename,
                path: localpath,
                userid: id
              }; // TODO: Replace user id with more permanent user public key

              //db.get('shares').push(share).write();
              //socket.emit('returnmessage', 'share added!');
              socket.emit('share', share);
            }
          });
        }

      } else { // send remote command
        socket.emit(cmd, data);
      }
    } else {
      socket.emit('chat', msg);
    }
    //rl.close();
    prompt();
  });
}

//prompt();
