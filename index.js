const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the 'public' and 'Client' directories
app.use(express.static(path.join(__dirname, 'Client/public')));
app.use('/images', express.static(path.join(__dirname, 'Client/images')));


// Explicitly serve the images folder
app.use('/images', express.static(path.join(__dirname, 'images')));

console.log(__dirname);  // Outputs the directory where the script is located

// Define a route for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Client/public', 'index.html')); // Ensure 'index.html' is in the 'public' directory
});

io.on('connection', (socket) => {
    console.log('A user connected');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
