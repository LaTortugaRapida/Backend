const net = require("node:net");

const clients = new Map();
const usernames = new Set();

const server = net.createServer((socket) => {
    console.log("Client connected!");

    clients.set(socket, null);

    let noUsername = true;

    socket.write("Enter your username: ");

    socket.on("data", (data) => {
        const msg = data.toString().trim();

        if (msg === "") {
            return;
        }

        console.log("Received:", msg);

        if (noUsername) {
            if (usernames.has(msg)) {
                socket.write("Username already taken. Choose another: ");
                return;
            }

            usernames.add(msg);
            clients.set(socket, msg);
            noUsername = false;

            socket.write(`Welcome ${msg}!\n`);
            broadcastSysMsg(`${msg} joined the chat!`, socket);
            return;
        }

        const sender = clients.get(socket);

        if (msg.startsWith("/msg")) {
            socket.write("DM:")
        }
    });

    socket.on("end", () => {
        console.log("Client disconnected.");

        const username = clients.get(socket);

        if (username) {
            usernames.delete(username);
            broadcastSysMsg(`${username} left the chat!`, socket);
        }

        clients.delete(socket);
    });

    socket.on("error", (err) => {
        console.log("Socket error:", err.message);

        const username = clients.get(socket);

        if (username) {
            usernames.delete(username);
            broadcastSysMsg(`${username} disconnected unexpectedly.`, socket);
        }

        clients.delete(socket);
    });
});

function broadcastSysMsg(msg, excludedSocket) {
    for (const [clientSocket] of clients) {
        if (clientSocket !== excludedSocket) {
            clientSocket.write(`*** ${msg}\n`);
        }
    }
}

function parseMsg(data, socket) {

}

server.listen(3000, () => {
    console.log("Server listening on port 3000.");
});