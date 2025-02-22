const express = require("express");
const app = express();
const http = require("http");
const socket = require("socket.io");
const path = require("path");

const server = http.createServer(app);
const io = socket(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

let activeUsers = {};

io.on("connection", function (socket) {
  console.log("User connected:", socket.id);

  socket.emit("loadExistingLocations", activeUsers);

  socket.on("sendLocation", function (data) {
    activeUsers[socket.id] = { id: socket.id, ...data };
    io.emit("receiveLocation", activeUsers[socket.id]);
  });

  // When a user drags their marker
  socket.on("updateLocation", function (data) {
    if (activeUsers[socket.id]) {
      activeUsers[socket.id] = { id: socket.id, ...data };
      io.emit("receiveLocation", activeUsers[socket.id]);
    }
  });

  socket.on("disconnect", function () {
    io.emit("removeLocation", { id: socket.id });
    delete activeUsers[socket.id];
  });
});

app.get("/", function (req, res) {
  res.render("index");
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
//run command npx nodemon app.js
//open browser and type localhost:3000
//open another tab and type localhost:3000

// Triggering the ci cd
