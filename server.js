const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let strokes = [];

io.on("connection", (socket) => {
  console.log("A user connected");

  // Send current strokes to the new user
  socket.emit("init", strokes);

  socket.on("stroke", (stroke) => {
    strokes.push(stroke);
    io.emit("stroke", stroke);
  });

  socket.on("undo", () => {
    if (strokes.length > 0) {
      strokes.pop();
      io.emit("init", strokes); // Reset canvas for all
    }
  });

  socket.on("redo", (stroke) => {
    strokes.push(stroke);
    io.emit("stroke", stroke);
  });
});

http.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
