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

var numberOfMiles = 200;

app.use(express.static(__dirname + "/public"));

io.on('connection', function (socket) {

  

  //returns true if the message is valid
  function isValidMessage(message) {
    if (message == "" || message.trim() == "") {
      return false;
    }
    return true;
  }

  //Sanitizes user input so they can't cross site script
  function sanitizeMessage(message) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      "/": '&#x2F;',
      "`": '&grave;',
    };
    const reg = /[&<>"'/`]/ig;
    return message.replace(reg, (match) => (map[match]));
  }

  function coordinatesAreLessThanXMilesApart(lat1, long1, lat2, long2, maxMiles) {
    var coordThreshold = maxMiles/69;
    var x_dist = long2 - long1;
    var y_dist = lat2 - lat1;
    if (x_dist < 0) {
      x_dist *= -1;
    }
    if (y_dist < 0) {
      y_dist *= -1;
    }

    console.log("=== NEW COORDINATE CHECK ===");
    console.log("Coord theshold: " + coordThreshold);
    console.log("User lat: " + lat1 + "\nUser long: " + long1);
    console.log("Post lat: " + lat2 + "\nPost long: " + long2);
    console.log("Post from user is (x): " + x_dist + "\nPost from user(y): " + y_dist);
    console.log(">>> USER IS WITHIN COORDINATE RANGE?: " + (x_dist < coordThreshold && y_dist < coordThreshold));
    console.log("=== END COORDINATE CHECK ===");
    if(x_dist < coordThreshold && y_dist < coordThreshold)
    {
      return true;
    }
    return false;
  }

  function checkIfUserIDAlreadyExists(userID){
    for(i = 0; i < clients.length; i++)
    {
      if(clients[i].userID == userID)
      {
        console.log("USER ID ALREADY EXISTS IN CLIENTS ARRAY")
        return true;
      }
    }
    console.log("NEW USER ID FOUND")
    return false;
  }

  function getSocketIDFromUserID(userID){
    for(i = 0; i < clients.length; i++)
    {
      if(clients[i].userID == userID)
      {
        return clients[i].socketID;
      }
    }
    return "-1";
  }

  function updateSocketIDFromUserID(userID, newSocketID)
  {
    for(i = 0; i < clients.length; i++)
    {
      if(clients[i].userID == userID)
      {
        clients[i].socketID = newSocketID;
        return true;
      }
    }
    return false;
  }

  //push the socket's ID to the clients array
  //clients.push(socket.id);

  //when the client logs in
  socket.on('client log in', function (msg) {

    console.log("client log in with json: " + msg);
    userData = JSON.parse(msg);
    newClientObject = {
      socketID: socket.id,
      userID: userData.userID,
      latitude: userData.latitude,
      longitude: userData.longitude,
    }


    console.log("NEW SOCKET CONNECTION: \n" + JSON.stringify(newClientObject));

    if(!checkIfUserIDAlreadyExists(newClientObject.userID))
    {
      clients.push(newClientObject);
    }
    else //if it already exists
    {
      console.log(">>>UPDATING USER'S SOCKET ID");
      updateSocketIDFromUserID(newClientObject.userID, newClientObject.socketID);
    }
   

    //on connect, send all the messages in memory to the client
    for (var i = 0; i < messageArr.length; i++) {
      
      //check if message is nearby
      if(!coordinatesAreLessThanXMilesApart(newClientObject.latitude, newClientObject.longitude, messageArr[i].latitude, messageArr[i].longitude, numberOfMiles)){
        continue;
      }

      //STRIP MESSAGES OF LOCATION/USERID
      var messageObject = { ...messageArr[i]};
      messageObject.userID = null;
      messageObject.longitude = null;
      messageObject.latitude = null;

      //send the message to the latest client
      //TODO : THIS IS INCORERECT: WE MUST SEND IT TO THE RIGHT SOCKET ID
      //io.to(clients[clients.length - 1].socketID).emit('client receive message', JSON.stringify(messageObject));
      io.to(newClientObject.socketID).emit('client receive message', JSON.stringify(messageObject));
    }


  });

  //when the server recieves a "chat message"
  socket.on('client send message', function (msg) {

    var messageObject = JSON.parse(msg); //convert the stringified object to an object
    
    //TODO: delete the following line eventually
    console.log("User: " + messageObject.userID + ": \"" + messageObject.message + "\'");

    
    //validate message
    //TODO: Make these io.emits io.to the socketID of the offending user
    if (messageObject.longitude == 0 && messageObject.latitude == 0) //IF there isn't a location THEN deny their message
    {
      io.to(getSocketIDFromUserID(messageObject.userID)).emit('server message', "You can't post without a location");
      return false;
    }
    else if (messageObject.userID == "") {
      //we should probably notify them but if they don't have a userID... whacha gonna do?
      return false;
    }

    //Replace the message with a sanitized version
    messageObject.message = sanitizeMessage(messageObject.message);

    //validate the newly sanitized message
    if (!isValidMessage(messageObject.message)) {
      return false;
    }

    //set the message's color
    messageObject.color = colorFromUserID.stringToRGB(colorFromUserID.hashCode(messageObject.userID));

    //set the messageID
    messageObject.messageID = "message" + messageArr.length;

    //add the message's data to the array
    messageArr.push(messageObject);

    //STRIP THE MESSAGEOBJECT OF IT'S LOCATION/USERID BEFORE EMITTING
    var messageObjectToSend = { ...messageObject};
    messageObjectToSend.userID = null;
    messageObjectToSend.latitude = null;
    messageObjectToSend.longitude = null;

    //create a JSON string we can emit
    messageString = JSON.stringify(messageObjectToSend);

    //for all clients, check which ones are nearby and send to them
    for(i = 0; i < clients.length; i++)
    {
      if(coordinatesAreLessThanXMilesApart(clients[i].latitude, clients[i].longitude, messageObject.latitude, messageObject.longitude, numberOfMiles))
      {
        //TODO: eventually remove this line
        console.log("Sending message -> UserID: " + clients[i].userID + " in range!");
        io.to(clients[i].socketID).emit('client receive message', messageString);
      }
    }

    
  });
});

http.listen(port, function () {
  console.log('listening on *:' + port);
});
