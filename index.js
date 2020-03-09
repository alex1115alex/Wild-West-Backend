var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 8080;

var MOTD = "Hello guys! This is the MOTD!";
var messageArr = [MOTD, "yoloswag69"];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  
  for(var i = 0; i < messageArr.length; i++)
  {
    io.emit('chat message', messageArr[i]);
  }

  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
