const net = require("node:net");

const board = Array(9).fill("_");
const players = new Map();

let turn = "X";
let gameOver = false;

const server = net.createServer((socket) => {
    let buffer = Buffer.alloc(0);

    if (!players.size) {
        players.set(socket, "X");
        socket.username = "X";
        socket.write("SYMBOL|X\n");
        socket.write("WAITING\n");

        console.log("Client connected!");
    } else if (players.size === 1) {
        players.set(socket, "O");
        socket.username = "O";
        socket.write("SYMBOL|O\n");

        console.log("Client connected!");

        broadcast(`BOARD|${board.join(",")}\n`);
        broadcast("TURN|X\n");
    } else {
        socket.write("SERVER_FULL\n");
        socket.end();
        console.log("Client connection rejected!");
        return;
    }

    socket.on("data", (data) => {
        buffer = Buffer.concat([buffer, data]);

        let index = buffer.indexOf("\n");

        while (index !== -1) {
            const message = buffer.subarray(0, index).toString();
            buffer = buffer.subarray(index + 1);
            const [command, value] = message.split("|");

            if (command !== "MOVE" || gameOver) {
                index = buffer.indexOf("\n");
                continue;
            }

            if (turn !== socket.username) {
                socket.write("REJECTED|not your turn\n");
                index = buffer.indexOf("\n");
                continue;
            }

            const cell = Number(value);

            if (!Number.isInteger(cell) || cell < 0 || cell > 8) {
                socket.write("REJECTED|invalid cell\n");
                index = buffer.indexOf("\n");
                continue;
            }

            if (board[cell] !== "_") {
                socket.write("REJECTED|cell occupied\n");
                index = buffer.indexOf("\n");
                continue;
            }

            board[cell] = socket.username;

            const winner = checkWinner();

            if (winner) {
                gameOver = true;
                broadcast(`BOARD|${board.join(",")}\n`);
                broadcast(`WIN|${winner}\n`);
                return;
            }

            if (!board.includes("_")) {
                gameOver = true;
                broadcast(`BOARD|${board.join(",")}\n`);
                broadcast("DRAW\n");
                return;
            }

            turn = turn === "X" ? "O" : "X";

            broadcast(`BOARD|${board.join(",")}\n`);
            broadcast(`TURN|${turn}\n`);

            index = buffer.indexOf("\n");
        }
    });

    socket.on("close", () => {
        players.delete(socket);

        for (const [player] of players) {
            player.write("OPPONENT_LEFT\n");
            player.end();
        }

        players.clear();
        board.fill("_");
        turn = "X";
        gameOver = false;
    });
});

server.listen(3000, () => {
    console.log("Server listening on 3000");
});

function checkWinner() {
    const wins = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    for (const [a, b, c] of wins) {
        if (
            board[a] !== "_" &&
            board[b] === board[a] &&
            board[c] === board[a]
        ) {
            return board[a];
        }
    }

    return null;
}

function broadcast(msg) {
    for (const player of players.keys()) {
        player.write(msg);
    }
}
