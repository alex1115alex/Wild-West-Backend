var colorFromUserID = require("./colorFromUserID.js");
const express = require("express");
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 8080;

var startupMessage = "Wild West server has started...";

//List of socket connections. Used to update new users on recent chats
var clients = []; 

//we're keeping track of the current number of messages with a variable now because
//it's inefficient to query each time...
//(also there's an async related bug when calling the query I don't know how to fix otherwise)
var currentNumberOfMessages = 0;

var numberOfMiles = 200;

//test query
var testQuery = "SELECT * FROM posts;";

//set up database
const { Client } = require('pg');
const client = new Client({
    host: 'localhost',
    database: 'Wild-West',
    password: 'WildWest',
});
client.connect();

//sets the number of posts in the table to the variable
function getNumberOfPostsInTable(){
  query = "SELECT COUNT(*) FROM posts;";
  client.query(query, (err, res) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log("Number of posts in table: " + res.rows[0].count);
    currentNumberOfMessages = res.rows[0].count;
    return(res.rows[0].count);
  });
}

getNumberOfPostsInTable();

app.use(express.static(__dirname + "/public"));

io.on('connection', function (socket) {

  

  //adds a post to the table
  function addPostToTable(lat, long, color, userID, messageID, parentID, message){
    query = `INSERT INTO posts (lat, long, color, user_id, message_id, parent_id, message) 
    VALUES
    (
        ${lat},
        ${long},
        '${color}',
        '${userID}',
        ${messageID},
        ${parentID},
        '${message}'
    );`;

    client.query(query, (err, res) => {
      if (err) {       
          console.error(err);
          return;
      }
      for (let row of res.rows) {
          console.log(row);
      }
    });
  }  

  function addPostToTableFromMessageObject(newMessageObject){
    addPostToTable(newMessageObject.latitude, newMessageObject.longitude, newMessageObject.color, newMessageObject.userID, newMessageObject.messageID, newMessageObject.parentID, newMessageObject.message);
  }

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
   
    //on connect, send all the messages in the database to the client
    query = "SELECT * FROM posts;";
    client.query(query, (err, res) => {
      if (err) {
          console.error(err);
          return;
      }
      for (i = 0; i < res.rows.length; i++) {
          console.log(res.rows[i]);
          if(!coordinatesAreLessThanXMilesApart(newClientObject.latitude, newClientObject.longitude, res.rows[i].lat, res.rows[i].long, numberOfMiles)){
            continue;
          }

          //CREATE A NEW MESSAGEOBJECT TO SEND OUT, BUT STRIP IT OF LOCATION/USERID
          var messageObject = {
            latitude: null,
            longitude: null,
            color: res.rows[i].color,
            userID: null,
            messageID: res.rows[i].message_id,
            parentID:  res.rows[i].parent_id,
            message: res.rows[i].message
          };

          //send the message to the new client
          io.to(newClientObject.socketID).emit('client receive message', JSON.stringify(messageObject));
      }
    });
  });

  //when the server recieves a "chat message"
  socket.on('client send message', function (msg) {

    var messageObject = JSON.parse(msg); //convert the stringified object to an object
    
    //TODO: delete the following line eventually
    console.log("User: " + messageObject.userID + ": \"" + messageObject.message + "\'");
    
    //validate message
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
    messageObject.messageID = currentNumberOfMessages;

    //add the message to the database
    addPostToTableFromMessageObject(messageObject);

    //increment the number of messages
    currentNumberOfMessages++;

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
