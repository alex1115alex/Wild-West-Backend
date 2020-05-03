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
}
