var longitude = "0";
var latitude = "0";
var parentID = -1; //-1 is the default value if it's a new "thread"/doesn't have a parent/isn't a reply
var cookie = "";
var autoScrollingEnabled = true;

document.getElementById("m").placeholder = "Message";

function checkAndGenerateCookie() {
  //IF the user has no cookie
  if (getCookie("userID") == "" || getCookie("userID") == null) {
    var newCookie = Math.random() //generate cookie. This produces a random string
      .toString(36)
      .slice(2);
    setCookie("userID", newCookie, 999); //save the "cookie" (ie the randomy generated string) to the user's cookies as "userID"

    //also, since the user has no cookie, it's probably their first time on the site
    //therefore we need to tell them to accept the location permission
    alert("Please allow location access when prompted in order to access Wild West");
  }
  cookie = getCookie("userID"); //set cookie variable
}

function replyToMessage(messageIDToReplyTo, messageColor) {
  $("#" + messageIDToReplyTo).children("li").show();
  //document.getElementById("replyingTo").innerHTML = "@";
  document.getElementById("input").style.background = "#" + messageColor;
  document.getElementById("m").placeholder = "Reply";
  document.getElementById("cancelReplyDiv").style.display = "block";
  document.getElementById("inputDiv").classList.replace("col-10", "col-8");
  parentID = messageIDToReplyTo;
}

function cancelReplyToMessage() {
  document.getElementById("m").placeholder = "Message";
  document.getElementById("input").style.background = "#6B979B";
  document.getElementById("cancelReplyDiv").style.display = "none";
  document.getElementById("inputDiv").classList.replace("col-8", "col-10");
  //document.getElementById("cancelReplyDiv").classList("col-1")
  parentID = -1;
}

function showChildren(messageIDToShowChildren) {
  $("#" + messageIDToShowChildren).children("li").show();
}

function hideChildren(messageIDToShowChildren) {
  $("#" + messageIDToShowChildren).children("li").hide();
}

function toggleChildren(messageIDToToggleChildren) {
  if ($("#" + messageIDToToggleChildren).children("li").is(":hidden")) {
    showChildren(messageIDToToggleChildren);
  }
  else {
    hideChildren(messageIDToToggleChildren);
  }
}

function disableOverlay() {
  $("#overlay").hide();
}

function rgb(string) {
  return string.match(/\w\w/g).map(function (b) { return parseInt(b, 16) })
}

function getRandomPostColor() {
  var rgb1 = rgb("#FFE5AE");
  var rgb2 = rgb("#FFF8EA");
  var rgb3 = [];
  for (var i = 0; i < 3; i++) rgb3[i] = rgb1[i] + Math.random() * (rgb2[i] - rgb1[i]) | 0;
  var newColor = '#' + rgb3
    .map(function (n) { return n.toString(16) })
    .map(function (s) { return "00".slice(s.length) + s }).join('');
  return newColor;
}

//check and generate cookie if it doesn't exist
checkAndGenerateCookie();

//get our coordinates. This function calls to the position scrambler function which then calls back to "connectToServer()"
fetchCoordinates();


function connectToServer() {

  //hide the overlay
  //TODO: MOVE THIS AFTER WE HAVE LOADED ALL RELEVANT POSTS...
  disableOverlay();

  //pull the location data from the div
  longitude = document.getElementById("longitudeDiv").innerHTML;
  latitude = document.getElementById("latitudeDiv").innerHTML;

  //make the socket connetion
  $(function () {
    var socket = io();

    // on start, set up our user data
    var userData = {
      userID: cookie,
      longitude: longitude,
      latitude: latitude
    };

    //and use the location data to log in to the server (this lets the server give us location-specific content)
    socket.emit('client log in', JSON.stringify(userData));

    //when the user clicks submit
    $("#sendButton").click(function () {
      var messageObj = {
        longitude: longitude,
        latitude: latitude,
        color: "",
        emoji: "",
        userID: cookie,
        messageID: "",
        parentID: parentID,
        message: $("#m").val()
      };

      var messageToUpload = JSON.stringify(messageObj);

      //emit "chat message" with the data messageToUpload
      socket.emit("client send message", messageToUpload);

      //reset the textbox, and reset the reply and end the function
      $("#m").val("");
      cancelReplyToMessage();
      return false;
    });

    //when a "chat message" is received, append the chat to the messages list
    socket.on("client receive message", function (msg) {
      var newMessageObject = JSON.parse(msg);

      //if the message is a reply AND its parent cannot be found
      if (newMessageObject.parentID != -1 && !$("#" + newMessageObject.parentID).length) {
        //TODO: Uncomment the next line if we have issues seeing "ghost" messages
        //ie messages that should have a parent but don't
        //return false;
      }

      //create div and li
      var liNode = $(
        "<li id=" + newMessageObject.messageID + "><div class='messageImageDiv' style='background-color:#" +
        newMessageObject.color +
        ";height:40px;width:40px'><div class='messageEmojiDiv'>" + newMessageObject.emoji + "</div></div>" + newMessageObject.message +
        "<br><a class='replyButton' onclick='replyToMessage(\"" + newMessageObject.messageID + "\", \"" + newMessageObject.color + "\")'>Reply</a> <a class='viewRepliesButton' onclick='toggleChildren(\"" + newMessageObject.messageID + "\")'>View Replies</a></li>"
      );

      //hide the viewRepliesButton if it isn't a thread
      if (newMessageObject.parentID != -1) {
        liNode.find(".viewRepliesButton").hide();
      }

      liNode.css('background-color', getRandomPostColor);

      //append the message to #messages
      if (newMessageObject.parentID == -1) {
        $("#messages").append(liNode);
      }
      else //(or if it's a reply append it to the parent message)
      {
        $("#" + newMessageObject.parentID).append(liNode);
      }

      //auto scroll to the bottom
      if (autoScrollingEnabled) {
        //I'm not really sure what number to put in so I just put in a really big one
        $("#messagesContainer").scrollTop(888888888);
      }

    });

    socket.on("server message", function (msg) {
      alert(msg);
    });
  });
}
