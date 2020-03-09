const app = require('express')()
const http = require('http').createServer(app)
const fs = require('fs');

app.get('/', (req, res) => {
    res.sendFile("/root/Wild-West/placeholderHomepage.html")
})

//Socket Logic
const socketio = require('socket.io')(http)

socketio.on("connection", (userSocket) => {
    userSocket.on("send_message", (data) => {
        console.log(data)
        fs.writeFile('posts.txt', data)
        fs.appendFile("posts.html", data)
        userSocket.broadcast.emit("receive_message", data)
    })
})

http.listen(8080, "localhost")
