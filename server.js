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

  socket.on("join", username => {
    users[socket.id] = username;
    socket.emit("chatHistory", messageHistory);
    socket.broadcast.emit("mssgtoclients", { user: "System", text: `${username} joined the chat.` });
  });

  socket.on("mssgfromclient", msg => {
    const messageData = { user: users[socket.id], text: msg };
    messageHistory.push(messageData);
    io.emit("mssgtoclients", messageData);
  });

  socket.on("typing", user => {
    socket.broadcast.emit("typing", user);
  });

  socket.on("disconnect", () => {
    const user = users[socket.id];
    delete users[socket.id];
    io.emit("mssgtoclients", { user: "System", text: `${user} left the chat.` });
  });
});

http.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
