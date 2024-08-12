const express  = require("express");
const app = express()
const path = require("path")

const http = require("http")
const socketIo = require('socket.io')
const server = http.createServer(app)
const io = socketIo(server)

let waitingusers  = [];
let rooms  = {};

io.on("connection", function(socket){
    socket.on("joinroom" , function(){
        if(waitingusers.length > 0){
           let partner  =  waitingusers.shift();
           let   roomname = `${socket.id}-${partner.id}`;

           socket.join(roomname);
           partner.join(roomname);

           io.to(roomname).emit("joined" , roomname)
        }else{
            waitingusers.push(socket);
        }
        console.log("request to joinroom")
    })

    socket.on("message" , function(data){
        socket.broadcast.to(data.room).emit("message", data.message)
    })
   
    socket.on("signalingMessage" , function(data){
        socket.broadcast.to(data.room).emit("signalingMessage", data.message)

    })

    socket.on("startVideoCall" ,function({room}){
        socket.broadcast.to(room).emit("incomingCall")
})
socket.on("acceptCall" ,function({room}){
        socket.broadcast.to(room).emit("callAccepted")
})
socket.on("rejectCall" ,function({room}){
        socket.broadcast.to(room).emit("callRejected")
})

socket.on("Disconnected" , function(){
    let index = waitingusers.findIndex((waitingusers) => waitingusers === socket.id )

    waitingusers.splice(index , 1);
})

})


app.set('view engine' , "ejs");
app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(express.static(path.join(__dirname , "public")))

const indexRouter = require('./routes/index');

app.use("/" , indexRouter);

server.listen( 3000);