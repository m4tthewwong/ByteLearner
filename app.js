const path = require("path");
const express = require("express");
const app = express();

require("dotenv").config()

app.set("views", path.resolve(__dirname, "pages"));
app.set("view engine", "ejs");


if (process.argv.length != 3) {
    process.stdout.write(`Invalid Arguments\n`);
    process.exit(1);
}

const port_num = process.argv[2];
app.listen(port_num);
process.stdin.setEncoding("utf8");
console.log(`Web server started and running at http://localhost:${port_num}`);
process.stdout.write("stop to shutdown the server: ");
process.stdin.on('readable', () => {

    let data = process.stdin.read();
    if (data !== null) {
        let command = data.trim();
        if (command === "stop") {
            process.stdout.write("Shutting down the server\n");
            process.exit(0);
        } else {
            process.stdout.write(`Invalid command`);
        }
        process.stdout.write("stop to shutdown the server: ");
        process.stdin.resume();
    }

});
app.get("/", (req, res) => {
    res.render("home");
});
app.get("/videoviewer", (req, res) => {
    res.render("videoviewer");
});