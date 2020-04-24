module.exports = {

    //helper function
    stringToEmojiNumber: function stringToEmojiNumber(len, s) {
        var totalNumEmojis = len;
        console.log("Total number of emojis: " + totalNumEmojis);

        var h = 0, l = s.length, i = 0;
        if (l > 0)
            while (i < l)
                h = (h << 5) - h + s.charCodeAt(i++) | 0;

        //my retarded algorithm: I call it Alex's emoji machine

        //if the hash number is negative, make it not negative
        if(h < 0){
            h *= -1;
        }

        //if the number is > the totalNumEmojis then reduce it. Probably not super efficient.
        while (h > totalNumEmojis) {
            h = h % totalNumEmojis;
        }

        return h;
    },

    //HOW THIS WORKS:
    //PARAMETERS: An array of emojis and a string
    //RETURNS: An emoji hashed from the string
    stringToEmoji: function stringToEmoji(emojiArr, s) {
        var len = emojiArr.length;
        var num = this.stringToEmojiNumber(len, s);
        return emojiArr[num];
    }
};
