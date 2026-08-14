const fs = require("node:fs");
const filename = process.argv[2];
const stream = fs.createReadStream(filename);

let count = 0;
let bytes = 0;
let lastFragment = "";

stream.on("data", (chunk) => {
    bytes += chunk.length;

    const text = lastFragment + chunk.toString();
    const words = text.split(/\s+/);
    lastFragment = words.pop();
    count += words.length;
});

stream.on("end", () => {
    if (lastFragment.length > 0) {
        ++count;
    }
    console.log(`Words: ${count}`);
    console.log(`Bytes processed: ${bytes}`);
});