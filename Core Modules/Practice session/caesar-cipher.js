const fs = require("node:fs");
const file = process.argv[2];
const shifts = Number(process.argv[3]);

const buffer = fs.readFileSync(file);

function caesarCipher(buffer, shift) {
    for (let i = 0; i < buffer.length; ++i) {
        const byte = buffer[i];

        if (byte >= 65 && byte <= 90) {
            buffer[i] = ((byte - 65 + shift) % 26 + 26) % 26 + 65;
        } else if (byte >= 97 && byte <= 122) {
            buffer[i] = ((byte - 97 + shift) % 26 + 26) % 26 + 97;
        }
    }
    return buffer;
}

caesarCipher(buffer, shifts)

fs.writeFileSync("output.txt", buffer);
