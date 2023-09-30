const http = require("http");
const express = require("express");
const path = require("path");
const {
    Server
} = require("socket.io");
const cors = require('cors')

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});


// Socket.io

let id = 1;
let full = 1;

io.on("connection", (socket) => {

    socket.join(`room-${id}`)

    //io.sockets.in(`room-${id}`).emit('roomdata', { chance : full , id : `room-${id}` })

    if (full == 2) {
        console.log(socket.id);
        io.sockets.in(`room-${id}`).emit('connectedroom', 'ROOM IS CONNECTED')
        io.to(socket.id).emit('roomdata', {
            chance: full,
            id: `room-${id}`
        });
        //socket.to(`room-${id}`).emit('connectedroom', 'ROOM IS CONNECTED' )
        id++
        full = 1
    } else {
        console.log(socket.id);
        io.to(socket.id).emit('roomdata', {
            chance: full,
            id: `room-${id}`
        });
        full++
    }

    socket.on("user-message", ({
        roomid,
        temp,
        i,
        j
    }) => {
        //console.log(roomid, message);
        socket.to(roomid).emit('message', {
            temp,
            i,
            j
        })
    });

    socket.on('winner', ({
        winner,
        roomid
    }) => {
        io.sockets.in(roomid).emit('getwinner', winner)
    })
});


app.use(express.static(path.resolve("./public")));

app.get("/", (req, res) => {
    return res.sendFile("/public/index.html");
});

server.listen(9000, () => console.log(`Server Started at PORT:9000`));