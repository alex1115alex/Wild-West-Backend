var colorFromUserID = require("./colorFromUserID.js");
const express = require("express");
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 8080;

var startupMessage = "Wild West server has started...";

var clients = []; //List of socket connections. Used to update new users on recent chats
var messageArr = []; //List of messags objects
var threadArr = []; //list of thread objects

app.use(express.static(__dirname + "/public"));

io.on('connection', function (socket) {

  //push the socket's ID to the clients array
  clients.push(socket.id);

  function isValidMessage(message){
    if(message == "" || message.trim() == "")
    {
      return false;
    }
    return true;
  }
  
  function sanitizeMessage(message) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        "/": '&#x2F;',
    };
    const reg = /[&<>"'/]/ig;
    return message.replace(reg, (match)=>(map[match]));
  }

  //when the client logs in
  socket.on('client log in', function (msg) {

    console.log("New connection from: " + msg);

    //on connect, send all the messages in memory to the client
    for (var i = 0; i < messageArr.length; i++) {
      //STRIP MESSAGES OF LOCATION/USERID
      var messageObject = messageArr[i];
      messageObject.userID = null;
      messageObject.longitude = null;
      messageObject.latitude = null;

      //send the message to the latest client
      io.to(clients[clients.length - 1]).emit('client receive message', JSON.stringify(messageObject));
    }


  });

  //when the server recieves a "chat message"
  socket.on('client send message', function (msg) {

    var messageObject = JSON.parse(msg); //convert the stringified object to an object

    //validate message
    if (messageObject.longitude == 0 && messageObject.latitude == 0) //IF there isn't a location THEN deny their message
    {
      io.emit('server message', "You can't post without a location");
      //return false;
    }
    else if (messageObject.userID == "") {
      io.emit('server message', "You can't post without a userID");
      return false;
    }

    //Replace the message with a sanitized version
    messageObject.message = sanitizeMessage(messageObject.message);

    //validate the newly sanitized message
    if(isValidMessage(messageObject.message)){
      return false;
    }

    //set the message's color
    messageObject.color = colorFromUserID.stringToRGB(colorFromUserID.hashCode(messageObject.userID));

    //set the messageID
    messageObject.messageID = "message" + messageArr.length;

    //add the message's data to the array
    messageArr.push(messageObject);

    //STRIP THE MESSAGEOBJECT OF IT'S LOCATION/USERID BEFORE EMITTING
    messageObject.userID = null;
    messageObject.latitude = null;
    messageObject.longitude = null;

    //emit a "chat message" with the data msg
    messageString = JSON.stringify(messageObject);
    io.emit('client receive message', messageString);
  });
});

http.listen(port, function () {
  console.log('listening on *:' + port);
});
