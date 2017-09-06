# webchat
Opens command line client to communicate with a webmirror server.

## Typical Features:
- chat
- file services
(whatever else the webmirror host supports)

## Usage
Starting client:
~~~
Command Line: npm start <hosturl>
e.g.
npm start
-or-
npm start http://localhost:1337
~~~

## Client connectivity
Clients connect using socket.io to the host. Checkout webmirror for
an example of a host server.

## Command list (varies by server)
Prefix all commands with "."
- .cd [path] view or change directory
- .copy [source] [dest] copy files
- .dir: List share contents
- .help: Display command list
- .hello: Returns system greeting
- .name [name]: Get or set your name
- .share:  [localpath] [sharename] Get or set drive share
- .users: List users online
- .version: Returns system greeting
- .whoami: Returns who you are

# System greeting
- displays date and time, version and current channel
