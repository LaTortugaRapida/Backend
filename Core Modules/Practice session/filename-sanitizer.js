const path = require("node:path");
const fs = require("node:fs");

const srcFolder = process.argv[2];
const destFolder = "./result";

if (!fs.existsSync(destFolder)) {
    fs.mkdirSync(destFolder, { recursive: true });
}

function sanitizeFilename(filname) {
    const parsed = path.parse(filname);
    const cleanName = parsed.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

    const cleanExt = parsed.ext.toLowerCase();
    return cleanName + cleanExt;
}

const files = fs.readdirSync(srcFolder);

files.forEach((file) => {
    const newName = sanitizeFilename(file);
    fs.copyFileSync(
        path.join(srcFolder, file),
        path.join(destFolder, newName)
    );
    console.log(`${file} -> ${newName}`);
});
