const path = require("path");
const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const bodyParser = require("body-parser");

require("dotenv").config({ path: path.resolve(__dirname, 'credentials/.env') }) 
const apiKey = process.env.API_KEY;
// middleware to get styles sheet 
app.use('/styles', express.static('styles'));
app.set("views", path.resolve(__dirname, "pages"));
app.set("view engine", "ejs");

const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const database = process.env.MONGO_DB_NAME;
const collection = process.env.MONGO_COLLECTION;
const database_and_collection = { db: database, collection: collection };
const uri = `mongodb+srv://${userName}:${password}@cluster0.t8eetqo.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

app.set("views", path.resolve(__dirname, "pages"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));

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
    res.render("getting", {apiKey: apiKey});
});


app.post("/home", async (req, res) => {

    const link = req.body;

    res.render("home", {
        link: link
    });
    try {
        await client.connect();
        await client.db(database_and_collection.db).collection(database_and_collection.collection).insertOne({ link: link });

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }

});


app.get("/videoviewer", (req, res) => {
    res.render("videoviewer");

});

function extractVideoCode(link) {
    let parts = link.split('=');
    return parts[parts.length - 1];
}

function isValidYouTubeUrl(url) {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(embed\/|v\/|watch\?v=)|youtu\.be\/)/;

    return youtubeRegex.test(url);
}

app.post("/videoviewer", async (req, res) => {
    let link = req.body.link;
    let error = "";
    if (!isValidYouTubeUrl(link)) {
        return res.render("videoviewer", { error: "Invalid YouTube URL format. Please enter a valid YouTube URL.", link: link });
    }
    let videoCode = extractVideoCode(link);

    let embedUrl = `https://www.youtube.com/embed/${videoCode}`;

    res.render("videoviewer", {
        link: embedUrl,
        error: error
    });
});
