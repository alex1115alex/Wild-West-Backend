var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const fs = require("fs");

app.get("/", (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on("connection", function(socket) {
    console.log("connection!");
  socket.on("chat message", function(msg) {
    io.emit("chat message", msg);
  });
});

http.listen(8080, "localhost");
