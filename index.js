var colorFromUserID = require("./colorFromUserID.js");
const express = require("express");
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 8080;

var startupMessage = "Wild West sever has started...";

var userArr = [];
var messageArr = [];

//app.get('/', function(req, res){
//  res.sendFile(__dirname + '/index.html');
//});

app.use(express.static(__dirname));

io.on('connection', function(socket){

  //on connect, send all the messages in memory to the client
  for(var i = 0; i < messageArr.length; i++)
  {
    io.emit('chat message', messageArr[i].message);
  }
  
  socket.on('chat message', function(msg){ //when the server recieves a "chat message"

    var messageObject = JSON.parse(msg); //convert the stringified object to an object

    //validate message
    if(messageObject.longitude == 0 && messageObject.latitude == 0) //IF there isn't a location THEN deny their message
    {
      io.emit('server message', "You can't post without a location"); 
      return false;
    }
    else if(messageObject.userID == "")
    {
      io.emit('server message', "You can't post without a userID"); 
      return false;
    }

    //set the message's color
    messageObject.color = colorFromUserID.stringToRGB(colorFromUserID.hashCode(messageObject.userID));

    //add the message's data to the array
    messageArr.push(messageObject); 

    //STRIP THE MESSAGEOBJECT OF IT'S COLOR/LOCATION/USERID BEFORE EMITTING

    //emit a "chat message" with the data msg
    io.emit('chat message', JSON.stringify(messageObject));
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
