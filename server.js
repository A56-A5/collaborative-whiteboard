const fs = require("fs");
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const path = require("path");

const STROKES_FILE = path.join(__dirname, "strokes.json");

app.use(express.static("public"));

// Load strokes from file at startup
let strokes = [];
try {
  if (fs.existsSync(STROKES_FILE)) {
    strokes = JSON.parse(fs.readFileSync(STROKES_FILE, "utf8"));
  }
} catch (err) {
  console.error("Failed to load strokes:", err);
}

function saveStrokes() {
  fs.writeFileSync(STROKES_FILE, JSON.stringify(strokes, null, 2));
}

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.emit("init", strokes);

  socket.on("stroke", (stroke) => {
    strokes.push(stroke);
    saveStrokes();
    io.emit("stroke", stroke);
  });

  socket.on("undo", () => {
    if (strokes.length > 0) {
      strokes.pop();
      saveStrokes();
      io.emit("init", strokes);
    }
  });

  socket.on("redo", (stroke) => {
    strokes.push(stroke);
    saveStrokes();
    io.emit("stroke", stroke);
  });
});

http.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
