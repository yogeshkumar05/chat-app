const express = require('express');
const path = require('path');
const socketio = require('socket.io');
const http = require('http');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require('./utils/users');

const app = express();
const server = http.createServer(app);

const port = process.env.PORT || 3000;

const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));


io.on('connection', (socket) => {
  console.log('New web socket connection');

  // socket.emit('countUpdated', count) // sends an event

  // socket.on('increment', () => {
  //     count++;
  //     // socket.emit('countUpdated', count) // emit only to single client
  //     // io.emit('countUpdated', count) // emit to every client
  // })

  // io.to.emit() - emits an event to every client in the room
  // socket.broadcast.to.emit() - emits an event to every client in the room except the current client

  

  socket.on('join', ({username, room}, callback) => {
    const {error, user} = addUser({id: socket.id, username, room});
    if(error) {
      return callback(error);
    }
    socket.join(user.room);
    socket.emit('message', generateMessage('Admin', `Welcome ${user.username} to chat room ${user.room}`));
    // socket.broadcast.emit('message', generateMessage('A new user has joined'));// emits event to all the users except current user
    socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined`));// emits event to all the users except current user

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    callback();
  })

  

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed');
    }
    io.to(user.room).emit('message', generateMessage(user.username, message));
    callback('Message delivered');
  })

  socket.on('sendLocation', (location, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`));
    callback();
  })



  socket.on('disconnect', () => {
    const user = removeUser(socket.id);
    console.log('leaving.... ', user);
    if(user) {
      io.to(user.room).emit('message', generateMessage(`${user.username} has left`));
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }

  })
})
server.listen(port, () => {
  console.log(`Server is up on port: ${port}`);
})