const path = require("path");
const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const bodyParser = require("body-parser");
const multer = require("multer");
const readline = require('readline');

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
//const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

app.use(bodyParser.urlencoded({ extended: false }));

//if (process.argv.length != 3) {
    //process.stdout.write(`Invalid Arguments\n`);
    //process.exit(1);
//}
//
//const port_num = process.argv[2];
//app.listen(port_num);
//process.stdin.setEncoding("utf8");
//console.log(`Web server started and running at http://localhost:${port_num}`);
//process.stdout.write("stop to shutdown the server: ");
//process.stdin.on('readable', () => {
//
    //let data = process.stdin.read();
    //if (data !== null) {
        //let command = data.trim();
        //if (command === "stop") {
            //process.stdout.write("Shutting down the server\n");
            //process.exit(0);
        //} else {
            //process.stdout.write(`Invalid command`);
        //}
        //process.stdout.write("stop to shutdown the server: ");
        //process.stdin.resume();
    //}
//
//});

// Connect to MongoDB
async function connectToMongo() {
    try {
        const client = await MongoClient.connect(uri);
        //console.log('Connected to MongoDB');
        return client.db(database);
    } catch (error) {
        console.error('Could not connect to MongoDB', error);
        process.exit(1);
    }
}

// Start the server
async function startServer() {
    const db = await connectToMongo();
    const port = process.argv[2];

    const server = app.listen(port, () => {
        console.log(`Web server started and running at http://localhost:${port}`);
        console.log('Stop to shutdown the server: ');
    });

    // Create readline interface
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    // Listen for "stop" command
    rl.on('line', (input) => {
        if ((input === 'stop') || (input === 'Stop')) {
            server.close(() => {
                console.log('Shutting down the server');
                process.exit(0);
            });
        }
    });
}

app.get("/", (req, res) => {
    res.render("landing");
});

app.get("/study-sets", async (req, res) => {
    try {
        const db = await connectToMongo();
        const studySets = await db.collection(collection).find({}).toArray();
        res.render("study-sets", { studySets: studySets });
    } catch (error) {
        console.error('Error fetching study sets:', error);
        res.status(500).send('Error fetching study sets');
    }
});

app.get("/add-study-set", (req, res) => {
    res.render("add-study-set");
});

app.post("/clear-study-sets", async (req, res) => {
    try {
        const db = await connectToMongo();
        await db.collection(collection).deleteMany({});
    } catch (error) {
        console.error('Error clearing study sets:', error);
        res.status(500).send('Error clearing study sets');
    }
});

startServer();