var socket = require('socket.io-client')('http://localhost:1337');
var fs = require('fs');
var path = require('path');
var connectionid = '';
var currentDir = __dirname;

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
      var cmdlower = cmd.toLowerCase();
      var data = msg.substring(space + 1);
      //console.log(space);
      //console.log(data);
      //console.log(cmd);

      // check for local commands
      switch (cmdlower) {
        case "cd":
          commandCD(data);
          break;
        case "dir":
          commandDir();
          break;
        case "share":
          commandShare(data);
          break;
        case "whisper":
          commandWhisper(data);
          break;
        default :
          socket.emit(cmd, data);
          break;
      }
    } else {
      socket.emit('chat', msg);
    }
    //rl.close();
    prompt();
  });
}

function commandCD(data) {
  if (data.length == 0) {
    console.log(currentDir);
  } else {
    // change dir
    var isDir = fs.statSync(currentDir).isDirectory();
    if (isDir) {
      if (data == '..') {
        // go up
        currentDir = path.resolve(currentDir, '..');
        console.log(currentDir);
      } else {
        currentDir = path.resolve(currentDir, data);
        console.log(currentDir);
      }
    } else {
      console.log(currentDir);
    }
  }

}

function commandDir() {
  var dircontents = fs.readdirSync(currentDir);
  dircontents.forEach(function (filename) {
    console.log(filename);
  })
}

function commandShare(data) {
  var arr = data.split(' ');
  var localpath = arr[0];
  var sharename = arr[1];

  if (!localpath || !sharename) {
    // list shares
    console.log('shares:');
    socket.emit('share', data);
  } else {
    console.log('setting share:');

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
}

function commandWhisper(data) {
  if (data) {
    var arr = data.split(' ');
    var idto = arr[0];
    var msg = arr[1];

    var secretmsg = {
      idto: idto,
      msg: msg
    };

    socket.emit('whisper', secretmsg);
  }
}

//prompt();
