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
            const parts = msg.split(" ");

            if (parts.length < 3) {
                socket.write(
                    "Wrong command.\nTry: /msg <username> <message>\n",
                );
                return;
            }

            const targetUsername = parts[1];
            const message = parts.slice(2).join(" ");

            const targetSocket = getSocketByUsername(targetUsername);

            if (!targetSocket) {
                socket.write("User not found.\n");
                return;
            }

            if (targetSocket === socket) {
                socket.write("You can't message yourself.\n");
                return;
            }

            targetSocket.write(`[DM] ${sender}: ${message}\n`);
            socket.write(`[DM -> ${targetUsername}] ${message}\n`);
            return;
        }

        broadcastMessage(`${sender}: ${msg}`, socket);
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

function getSocketByUsername(username) {
    for (const [socket, name] of clients) {
        if (name === username) {
            return socket;
        }
    }
    return null;
}

function broadcastMessage(msg, excludedSocket) {
    for (const [clientSocket] of clients) {
        if (clientSocket !== excludedSocket) {
            clientSocket.write(msg + "\n");
        }
    }
}

function parseMsg(data, socket) {}

server.listen(3000, () => {
    console.log("Server listening on port 3000.");
});
