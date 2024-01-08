const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const users = {};

io.on("connection", (socket) => {
  console.log("User connected:");

  socket.on("join", (data) => {
    const { username, key } = data;
    if (key === "1234") {
      users[socket.id] = { username, color: 'green' }; // Green color for online users
      io.emit("message", { text: `${username} has joined the chat.`, color: 'green' });
      io.emit("userList", Object.values(users));
    } else {
      socket.emit("errorMessage", "Invalid Key");
      socket.disconnect(true);
    }
  });

  socket.on("disconnect", () => {
    const { username } = users[socket.id] || {};
    delete users[socket.id];
    io.emit("userList", Object.values(users));
    if (username) {
      io.emit("message", { text: `${username} has left the chat.`, color: 'red' }); // Red color for disconnected users
    }
  });

  socket.on("chatMessage", (message) => {
    const { username, color } = users[socket.id] || {};
    if (username) {
      io.emit("message", { text: `<span style="color:${color}">${username}: ${message}</span>` });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
