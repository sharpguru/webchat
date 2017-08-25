var socket = require('socket.io-client')('http://localhost:1337');
var fs = require('fs');
var path = require('path');
var connectionid = '';
var currentDir = __dirname;
var currentUser;
var low = require('lowdb');
var config;

// database
const db = low('clientdb.json');

// database init stuff
db.defaults({ config: [{}] }).write();

socket.on('connect', function(){
});

socket.on('connected', function(msg, id){
  if (msg) console.log(msg);
  connectionid = id;

  var config = db.get('config[0]').value();

  console.log("registering as: ");
  console.log(config.user);
  socket.emit('register', config.user);

  //prompt();
});

socket.on('chat', function(msg){
  if (msg) console.log(msg);
  prompt();
});

socket.on('registered', function(registeredUser){
  currentUser = registeredUser;

  //console.log(currentUser);

  console.log('Registered as ' + currentUser.name);



  db.get('config[0]')
    .assign({user: currentUser})
    .write();

    prompt();
});

socket.on('returnmessage', function(msg){
    if (msg) console.log(msg);
    prompt();
});

socket.on('disconnect', function(message){
  console.log(message);
  console.log('disconnected');
  if (message == "exit") process.exit();
});

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt() {
  var prompttext = (currentUser && currentUser.name) ? currentUser.name : '';
  prompttext += '> ';

  console.log(currentUser);

  rl.question(prompttext, (msg) => {

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

module.exports = socket;
