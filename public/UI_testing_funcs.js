//setup emoji array
var emojiArr = fs.readFileSync('HashEmoji.txt').toString().split("\n");
document.getElementById('emoji').innerHTML = emojiArr[33]; //ayyyy lmao

//pull the location data from the div
longitude = document.getElementById("longitudeDiv").innerHTML;
latitude = document.getElementById("latitudeDiv").innerHTML;

// set up our user data
var userData = {
    userID: cookie,
    longitude: longitude,
    latitude: latitude
    };

//send message to local page only
function sendLocalMessage() {
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
}