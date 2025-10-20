const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Serve static files from this folder
app.use(express.static(path.join(__dirname)));

let users = {};

io.on('connection', (socket) => {
  // Expect 'join' event with username
  socket.on('join', (username) => {
    socket.username = username || 'Anonymous';
    users[socket.id] = socket.username;
    io.emit('users', Object.values(users));
    socket.broadcast.emit('message', { from: 'System', text: `${socket.username} joined the chat` });
  });

  socket.on('message', (msg) => {
    const payload = { from: socket.username || 'Anonymous', text: msg, time: Date.now() };
    io.emit('message', payload);
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      const name = socket.username;
      delete users[socket.id];
      io.emit('users', Object.values(users));
      socket.broadcast.emit('message', { from: 'System', text: `${name} left the chat` });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Chat server running at http://localhost:${PORT}`);
});
