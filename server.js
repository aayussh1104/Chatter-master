const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "*"
  }
});

app.use(express.static('public'));

const users = {};
let messageHistory = [];

io.on('connection', socket => {
  console.log(`${socket.id} connected`);

  // Save username when joining
  socket.on("join", username => {
    users[socket.id] = username;
    socket.broadcast.emit("mssgtoclients", {
      user: "System",
      text: `${username} joined the chat.`
    });
  });

  // Handle new messages
  socket.on("mssgfromclient", msg => {
    const messageData = {
      user: users[socket.id] || "Unknown",
      text: msg
    };
    messageHistory.push(messageData);
    io.emit("mssgtoclients", messageData);
  });

  // Typing notification
  socket.on("typing", () => {
    const user = users[socket.id];
    if (user) {
      socket.broadcast.emit("typing", user);
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    const user = users[socket.id];
    delete users[socket.id];
    if (user) {
      io.emit("mssgtoclients", {
        user: "System",
        text: `${user} left the chat.`
      });
    }
  });
});

http.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
