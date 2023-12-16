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
app.use('/script', express.static('script'));
app.set("views", path.resolve(__dirname, "pages"));
app.set("view engine", "ejs");

const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const database = process.env.MONGO_DB_NAME;
const uri = `mongodb+srv://${userName}:${password}@cluster0.dcxpb1s.mongodb.net/?retryWrites=true&w=majority`;

app.use(bodyParser.urlencoded({ extended: false }));



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

        //connect to mongoDB
        const db = await connectToMongo();

        // get a list of collections
        const collections = await db.listCollections().toArray();
        // get the list of collection's names
        const collectionNames = collections.map(collection => collection.name);

        let allSets = "";

        // loop through the list of collection's names and add 
        // all the cards associated with it to a list with all the sets
        for (const collectionName of collectionNames) {

            allSets += `<button type=submit class=studySet name="${collectionName}">${collectionName}</button>`

        }



        res.render("study-sets", { studySets: allSets});
    } catch (error) {
        console.error('Error fetching study sets:', error);
        res.status(500).send('Error fetching study sets');
    }
});

app.get("/add-study-set", (req, res) => {
    res.render("add-study-set");
});

app.post("/view-set", (req, res)=> {
    const selectedSet = req.body;


    const collectionName = Object.keys(selectedSet)[0];
    res.render("view-set", {collectionName: collectionName});
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