// // setup file reader
// var reader = new FileReader();

// // file reading finished successfully
// reader.addEventListener('load',function(e){
//     //contents of ASCII file
//     var ASCII_text = e.target.result;
//     console.log(ASCII_text);
// });

// // file reading failed
// reader.addEventListener('error',function() {
//     console.log('---FILE READ ERROR---')
// });

// // file read progress 
// reader.addEventListener('progress', function(e) {
//     if(e.lengthComputable == true) {
//         var percent_read = Math.floor((e.loaded/e.total)*100);
//         console.log(percent_read + '% read');
//     }
// });

// // read ASCII
// reader.readAsText(//idk what to put here bruh);

var fs = require('fs');


//setup emoji aray
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
      messageID: "localMessage",
      parentID: parentID,
      message: $("#m").val()
    };


    //if the message is a reply AND its parent cannot be found
    if (messageObj.parentID != -1 && !$("#" + messageObj.parentID).length) {
        //TODO: Uncomment the next line if we have issues seeing "ghost" messages
        //ie messages that should have a parent but don't
        //return false;
    }
    
    //create div and li
    // this version uses the css script at the beginning of UI_testing_index.html, doesn't quite align
    // var liNode = $(
        //     "<li id=" + messageObj.messageID +
        //      "><div class='messageImageDiv' style='background-color:#" + messageObj.color +
        //     ";height:40px;width:40px'><div class='messageEmojiDiv'>" + messageObj.emoji + "</div></div>" + messageObj.message +
        //     "<br> <button class='btn'><i class='fa fa-arrow-up'></i></button> <button class='btn'><i class='fa fa-arrow-down'></i></button> <button class='btn' onclick='replyToMessage(\"" +
        //      messageObj.messageID + "\", \"" + messageObj.color + "\")'>Reply</button> <button class='btn' onclick='toggleChildren(\"" + messageObj.messageID + "\")'>View Replies</button>" + 
        //      "<div class='dropdown'><button onclick='dropdownFunc()' class='dropbtn'>Sort replies by</button> <div id='replySortDropdown' class='dropdown-content'>" + 
        //      "<a>New</a> <a>Hot</a> <a>Popular</a> <a>Controversial</a> </div></div> </li>"
        // );
        

    // dropdown works, but the menu is 'chunky'; white with boxes around each option
    // important detail here is "class='btn dropbtn dropdown-toggle'", I think
    // var liNode = $(
    //     "<li id=" + messageObj.messageID + ">"+
    //     "<div class='messageImageDiv' style='background-color:#" + messageObj.color + ";height:40px;width:40px'>"+
    //     "<div class='messageEmojiDiv'>" + messageObj.emoji + "</div></div>" + messageObj.message +
    //     "<br> <button class='btn'><i class='fa fa-arrow-up'></i></button>" + 
    //     "<button class='btn'><i class='fa fa-arrow-down'></i></button>" + 
    //     "<button class='btn' onclick='replyToMessage(\"" + messageObj.messageID + "\", \"" + messageObj.color + "\")'>Reply</button>" + 
    //     "<button class='btn' onclick='toggleChildren(\"" + messageObj.messageID + "\")'>View Replies</button>" + 
    //     "<div class='dropdown'><button onclick = showDropdown() class='btn dropbtn dropdown-toggle' type='button' data-toggle='dropdown'>Sort replies by<span class='caret'></span></button>" + 
    //     "<ul class='dropdown-menu' id='replyDropdown'>" + 
    //     "<li><a>New</a></li> <li><a>Hot</a></li> <li><a>Popular</a></li> <li><a>Controversial</a></li> </ul></div>"
    // );

    // more recently tried the above version without <li> </li> in the second-to-last line

    // something to fix: each option's 'hitbox' is the size of the word itself (long/short words are different)
    //          at least, judging by the grey area that shows when you hover over it
    // =====================================================================================
    var liNode = $(
        "<li id=" + messageObj.messageID + ">"+
        "<div class='messageImageDiv' style='background-color:#" + messageObj.color + ";height:40px;width:40px'>"+
        "<div class='messageEmojiDiv'>" + messageObj.emoji + "</div></div>" + messageObj.message +
        "<br> <button class='btn'><i class='fa fa-arrow-up'></i></button>" + 
        "<button class='btn'><i class='fa fa-arrow-down'></i></button>" + 
        "<button class='btn' onclick='replyToMessage(\"" + messageObj.messageID + "\", \"" + messageObj.color + "\")'>Reply</button>" + 
        "<button class='btn' onclick='toggleChildren(\"" + messageObj.messageID + "\")'>View Replies</button>" + 
        "<div class='dropdown'><button onclick = showDropdown() class='btn dropbtn dropdown-toggle' type='button' data-toggle='dropdown'>Sort replies by<span class='caret'></span></button>" + 
        "<div class='dropdown-menu' id='replyDropdown'>" + 
        "<a>New<br></a> <a>Hot<br></a> <a>Popular<br></a> <a>Controversial<br></a> </div> </div>"
    );

    // =====================================================================================

    //hide the viewRepliesButton if it isn't a thread
    if (messageObj.parentID != -1) {
        liNode.find(".viewRepliesButton").hide();
    }

    liNode.css('background-color', getRandomPostColor);

    //append the message to #messages
    if (messageObj.parentID == -1) {
        $("#messages").append(liNode);
    }
    else //(or if it's a reply append it to the parent message)
    {
        $("#" + messageObj.parentID).append(liNode);
    }

    //auto scroll to the bottom
    if (autoScrollingEnabled) {
        //I'm not really sure what number to put in so I just put in a really big one
        $("#messagesContainer").scrollTop(888888888);
    }
}

// show dropdown menu when user clicks on it
function showDropdown() {
    document.getElementById("replyDropdown").classList.toggle("show");
}

// send message when user hits "Enter"
function enterKeyCheck(keyCode) {
    if (keyCode == 13) {
        // option A (might not work on actual webpage)
        sendLocalMessage();
        // option B
        // document.getElementById("sendButton").click();
    }
}