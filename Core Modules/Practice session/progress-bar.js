const { EventEmitter } = require("node:stream");

class Downloader extends EventEmitter {
    download() {
        let progress = 0;

        const interval = setInterval(() => {
            progress += 10;
            this.emit("progress", progress);

            if (progress === 100) {
                clearInterval(interval);
                this.emit("done");
            }
        }, 500);
    }
}

const downloader = new Downloader();

downloader.on("progress", (progress) => {
    const completed = progress / 5;
    const remaining = 20 - completed;

    const bar = "#".repeat(completed) + "-".repeat(remaining);
    process.stdout.write(`\r[${bar}] ${progress}%`);
});

downloader.on("done", () => {
    console.log("\nDownload complete");
});

downloader.download();