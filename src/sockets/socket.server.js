const { Server } = require("socket.io");

function initSocketServer(httpServer) {
    const io = new Server(httpServer, {})

    io.on("connection", (socket)=> {
        console.log("The socket connection:",socket.id);
    })

} 

module.exports = initSocketServer;