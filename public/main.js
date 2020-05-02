var longitude = "0";
var latitude = "0";
var parentID = -1; //-1 is the default value if it's a new "thread"/doesn't have a parent/isn't a reply
var cookie = "";
var autoScrollingEnabled = true;
var colorRange1 = "#FFE5AE";
var colorRange2 = "#FFF8EA";
colorRange1 = "#E6C195";
colorRange2 = "F2DEC1";

document.getElementById("m").placeholder = "New thread...";
hideInputBar();


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

function fixMessagesContainerMargin(){
  $("#messagesContainer").css('margin-bottom', $("#input").height() + 'px');
}

function returnTrueIfLight(color) {

  // Variables for red, green, blue values
  var r, g, b, hsp;
  
  // Check the format of the color, HEX or RGB?
  if (color.match(/^rgb/)) {

      // If HEX --> store the red, green, blue values in separate variables
      color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
      
      r = color[1];
      g = color[2];
      b = color[3];
  } 
  else {
      
      // If RGB --> Convert it to HEX: http://gist.github.com/983661
      color = +("0x" + color.slice(1).replace( 
      color.length < 5 && /./g, '$&$&'));

      r = color >> 16;
      g = color >> 8 & 255;
      b = color & 255;
  }
  
  // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
  hsp = Math.sqrt(
  0.299 * (r * r) +
  0.587 * (g * g) +
  0.114 * (b * b)
  );

  // Using the HSP value, determine whether the color is light or dark
  if (hsp>127.5) {

      return true;
  } 
  else {

      return false;
  }
}

function unfixMessagesContainerMargin(){
  $("#messagesContainer").css('margin-bottom', '0px');
}

function hideInputBar(){
  $("#input").hide();
  unfixMessagesContainerMargin();
} 

function showInputBar(){
  $("#input").show();
  fixMessagesContainerMargin();
}

function toggleInputBar(){
  if($("#input").is(":visible")){
    $("#input").hide();
  } 
  else
  {
    $("#input").show();
  }
}

function createThread(){
  document.getElementById("input").style.background = "#6B979B";
  document.getElementById("m").style.background = "#6B979B";
  document.getElementById("m").style.color = "#fff";
  document.getElementById("m").placeholder = "New thread...";
  parentID = -1;
  showInputBar();
  document.getElementById("m").focus();
}

function cancelInput(){
  hideInputBar();
}

function replyToMessage(messageIDToReplyTo, messageColor) {
  $("#" + messageIDToReplyTo).children("li").show();
  document.getElementById("input").style.background = "#" + messageColor;
  document.getElementById("m").style.background = "#" + messageColor;
  document.getElementById("m").placeholder = "Reply...";
  
  //make input text color white/black depending on background color
  if(returnTrueIfLight(messageColor))
  {
    console.log("COLOR IS LIGHT");
    document.getElementById("m").style.color = "#000";
  }
  else
  {
    document.getElementById("m").style.color = "#fff";
  }

  parentID = messageIDToReplyTo;
  showInputBar();
  document.getElementById("m").focus();
}

//I don't think this function is used anymore but we'll leave it in just in case it's critical somewhere
function cancelReplyToMessage() {
  document.getElementById("m").placeholder = "New thread...";
  document.getElementById("input").style.background = "#6B979B";
  document.getElementById("cancelReplyDiv").style.display = "none";
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
  var rgb1 = rgb(colorRange1);
  var rgb2 = rgb(colorRange2);
  var rgb3 = [];
  for (var i = 0; i < 3; i++) rgb3[i] = rgb1[i] + Math.random() * (rgb2[i] - rgb1[i]) | 0;
  var newColor = '#' + rgb3
    .map(function (n) { return n.toString(16) })
    .map(function (s) { return "00".slice(s.length) + s }).join('');
  return newColor;
}
/*
function FitToContent(id, maxHeight)
{
   var text = id && id.style ? id : document.getElementById(id);
   if ( !text )
      return;

   var adjustedHeight = text.clientHeight;
   if ( !maxHeight || maxHeight > adjustedHeight )
   {
      adjustedHeight = Math.max(text.scrollHeight, adjustedHeight);
      if ( maxHeight )
         adjustedHeight = Math.min(maxHeight, adjustedHeight);
      if ( adjustedHeight > text.clientHeight )
         text.style.height = adjustedHeight + "px";
   }
}

window.onload = function() {
    document.getElementById("m").onkeyup = function() {
      FitToContent( this, 4 )
    };
}*/

//check and generate cookie if it doesn't exist
checkAndGenerateCookie();

//get our coordinates. This function calls to the position scrambler function which then calls back to "connectToServer()"
fetchCoordinates();

//update the height of the messagesContainer
//fixMessagesContainerMargin();

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
      cancelInput();
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
