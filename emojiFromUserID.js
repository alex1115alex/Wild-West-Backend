module.exports = {

    //helper function
    stringToEmojiNumber: function stringToEmojiNumber(len, s) {
        var totalNumEmojis = len;

        var h = 0, l = s.length, i = 0;
        if (l > 0)
            while (i < l)
                h = (h << 5) - h + s.charCodeAt(i++) | 0;

        //my retarded algorithm
        while (h > totalNumEmojis) {
            h = h % totalNumEmojis;
        }
        if (h == 0) {
            h = 1;
        }

        return h;
    },

    //HOW THIS WORKS:
    //PARAMETERS: An array of emojis and a string
    //RETURNS: An emoji hashed from the string
    stringToEmoji: function stringToEmoji(emojiArr, s) {
        var num = this.stringToEmojiNumber(emojiArr.length, s);
        return emojiArr[num];
    }
};
