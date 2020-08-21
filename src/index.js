//Server side JS

// Server emits => client receives => countUpdated
// Client emits => server listens => incremented


const path = require('path')
const http = require('http')
const express = require('express')
const  app = express()
const socketio = require('socket.io')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const {addUser,removeUser,getUser , getUsersInRoom} = require('./utils/user')
const Filter = require('bad-words')
const server = http.createServer(app)

//Configure the socketio to associate with the server
const io = socketio(server)

const port = 3000 || process.env.port
const publicDirectoryPath = path.join(__dirname,'../public')
app.use(express.static(publicDirectoryPath))


// socket.emit => only that particular client will get this
// io.emit => all the clients will receive


// on event is fired when we get a new connection
io.on('connection', (socket) => {
    console.log('New Connection established')

    socket.on('join', ({ username, room }, callback) => {

        //We get either of them 
        const { user, error } = addUser({ id: socket.id, username, room })
        if (error) {
            return callback(error)
        }

        //After filtering is done by the addUser () , use "user"
        socket.join(user.room)
        socket.emit('message', generateMessage('Admin','Welcome'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined!`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users:getUsersInRoom(user.room)
        })

        callback()
    })

    // socket.emit('message', "Welcome")
    socket.on('sendMessage', (message, callback) => {
        
        const user = getUser(socket.id)
        

        const filter = new Filter()
        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed')
        }

        io.to(user.room).emit('message', generateMessage(user.username,message))
        
        //In order to acknowledge 
        callback('Delivered')
    })

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id)
        
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback('Location sent')
    })

    //No need to receive in client side
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left the room`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users : getUsersInRoom(user.room)
            })
        }

    })

})



server.listen(port, () => {
    console.log('Server up on port '+ port)
})

