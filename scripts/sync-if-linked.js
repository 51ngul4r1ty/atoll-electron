const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const fileContents = fs.readFileSync(path.resolve("./package.json"));

const isWindows = () => {
    return process.platform === "win32";
};

const getNpmCmd = () => {
    return isWindows ? "npm.cmd" : "npm";
};

if (fileContents.includes("file:.yalc/")) {
    console.log("package.json has a yalc file reference, sync'ing from @atoll/shared");
    const p = spawn(getNpmCmd(), ["run", "sync-quick"]);
    p.on("exit", function(code) {
        if (code !== 0) {
            console.error("`npm run sync-quick` failed with error code: " + code);
            process.exit(code);
        } else {
            console.info("`npm run sync-quick` successful.");
            process.exit(0);
        }
    });
    p.stdout.on("data", (data) => {
        console.info(data.toString("ascii"));
    });
    p.stderr.on("data", (data) => {
        console.error(data.toString("ascii"));
    });
    p.on("error", (error) => {
        console.error(error.message);
    });
    p.on("close", (code) => {
        console.log("process exiting with code: " + code);
    });
} else {
    console.info(
        "package.json has no yalc file reference, use sync to link to @atoll/shared repo\nfor improved development experience"
    );
    process.exit(0);
}
