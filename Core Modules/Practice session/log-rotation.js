const fs = require("node:fs");
const path = require("node:path");
const limit = 1000;

const filename = process.argv[2];

async function rotateLog(filename) {
    let stats;
    try {
        stats = await fs.promises.stat(filename);
    } catch (err) {
        if (err.code === "ENOENT") {
            console.log("Log file doesn't exist");
            return;
        }

        throw err;
    }

    if (stats.size < limit) {
        console.log(
            `${filename} size is ${stats.size}, no rotation is needed.`,
        );
        return;
    } else {
        const timeStamp = new Date().toISOString().replace(/:/g, "-");
        const parsedName = path.parse(filename);
        const oldName = `${parsedName.name}-${timeStamp}${parsedName.ext}`;

        await fs.promises.rename(filename, oldName);
        await fs.promises.writeFile(filename, "");

        console.log(`Roatated: ${filename} -> ${oldName}`);
    }
}

rotateLog(filename);
