const net = require("node:net");

const client = net.createConnection({
    host: "localhost",
    port: 3000,
});

let buffer = Buffer.alloc(0);
let mySymbol;

client.on("connect", () => {
    console.log("Connected to server!");
});

client.on("data", (data) => {
    buffer = Buffer.concat([buffer, data]);

    let index = buffer.indexOf("\n");

    while (index !== -1) {
        const message = buffer.subarray(0, index).toString();
        buffer = buffer.subarray(index + 1);

        const [command, value] = message.split("|");

        if (command === "SERVER_FULL") {
            console.log("Server is full!");
            client.end();
            return;
        }

        if (command === "SYMBOL") {
            mySymbol = value;
            console.log(`You are playing as ${mySymbol}`);

            process.stdin.resume();
            process.stdin.setEncoding("utf8");
        }

        if (command === "WAITING") {
            console.log("Waiting for opponent...");
        }

        if (command === "BOARD") {
            const board = value.split(",");
            drawBoard(board);
        }

        if (command === "TURN") {
            if (value === mySymbol) {
                console.log("Your turn. Enter a cell (0-8):");
            } else {
                console.log("Waiting for opponent...");
            }
        }

        if (command === "REJECTED") {
            console.log(value);
        }

        if (command === "WIN") {
            if (value === mySymbol) {
                console.log("You win!");
            } else {
                console.log("You lose!");
            }
        }

        if (command === "DRAW") {
            console.log("Draw!");
        }

        if (command === "OPPONENT_LEFT") {
            console.log("Opponent left.");
            return;
        }

        index = buffer.indexOf("\n");
    }
});

process.stdin.on("data", (data) => {
    const message = data.toString().trim();

    if (message === "yes" || message === "no") {
        client.write(`REMATCH|${message}\n`);
        return;
    }

    client.write(`MOVE|${message}\n`);
});

function drawBoard(board) {
    board = board.map((cell) => {
        return cell === "_" ? "." : cell;
    });

    console.log(` ${board[0]} | ${board[1]} | ${board[2]} `);
    console.log("-----------");
    console.log(` ${board[3]} | ${board[4]} | ${board[5]} `);
    console.log("-----------");
    console.log(` ${board[6]} | ${board[7]} | ${board[8]} `);
}

client.on("error", (err) => {
    console.log(err.message);
});
