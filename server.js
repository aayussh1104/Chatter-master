const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: { origin: "*" }
});

app.use(express.static('public'));

const users = {};

io.on('connection', socket => {
  console.log(`${socket.id} connected`);

  socket.on("join", username => {
    users[socket.id] = username;

    // Notify others only
    socket.broadcast.emit("mssgtoclients", {
      user: "System",
      text: `${username} joined the chat.`
    });
  });

  socket.on("mssgfromclient", msg => {
    const username = users[socket.id] || "Unknown";

    const messageData = {
      user: username,
      text: msg
    };

    io.emit("mssgtoclients", messageData);
  });

  socket.on("typing", () => {
    const username = users[socket.id];
    if (username) {
      socket.broadcast.emit("typing", username);
    }
  });

  socket.on("disconnect", () => {
    const username = users[socket.id];
    if (username) {
      io.emit("mssgtoclients", {
        user: "System",
        text: `${username} left the chat.`
      });
    }
    delete users[socket.id];
  });
});

http.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
