const app = require('express')()
const http = require('http').createServer(app)
const fs = require('fs');

app.get('/', (req, res) => {
    res.send("Node Server is running. Yay!!")
})

//Socket Logic
const socketio = require('socket.io')(http)

socketio.on("connection", (userSocket) => {
    userSocket.on("send_message", (data) => {
        console.log(data)
        fs.appendFile("posts.html", data)
        userSocket.broadcast.emit("receive_message", data)
    })
})

http.listen(process.env.PORT)