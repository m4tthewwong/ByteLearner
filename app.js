const path = require("path");
const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion } = require("mongodb");
const bodyParser = require("body-parser");
const multer = require("multer");
const readline = require("readline");
const axios = require('axios');

require("dotenv").config({ path: path.resolve(__dirname, "credentials/.env") });
const apiKey = process.env.API_KEY;
// middleware to get styles sheet
app.use("/styles", express.static("styles"));
app.use("/script", express.static("script"));
app.set("views", path.resolve(__dirname, "pages"));
app.set("view engine", "ejs");

const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const database = process.env.MONGO_DB_NAME;
const uri = `mongodb+srv://${userName}:${password}@cluster0.dcxpb1s.mongodb.net/?retryWrites=true&w=majority`;

app.use(bodyParser.urlencoded({ extended: false }));

let current = "";
// Connect to MongoDB
async function connectToMongo() {
  try {
    const client = await MongoClient.connect(uri);

    return client.db(database);
  } catch (error) {
    console.error("Could not connect to MongoDB", error);
    process.exit(1);
  }
}

// Start the server
async function startServer() {
  const db = await connectToMongo();
  const port = process.argv[2];

  const server = app.listen(port, () => {
    console.log(`Web server started and running at http://localhost:${port}`);
    console.log("Stop to shutdown the server: ");
  });

  // Create readline interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Listen for "stop" command
  rl.on("line", (input) => {
    if (input === "stop" || input === "Stop") {
      server.close(() => {
        console.log("Shutting down the server");
        process.exit(0);
      });
    }
  });
}

app.get("/", (req, res) => {
  res.render("landing");
});

// sender.js
const myVariable = "Hello from sender.js!";
module.exports = myVariable;

app.get("/study-sets", async (req, res) => {
  try {
    //connect to mongoDB
    const db = await connectToMongo();

    // get a list of collections
    const collections = await db.listCollections().toArray();
    // get the list of collection's names
    const collectionNames = collections.map((collection) => collection.name);

    let allSets = "";

    let dropDownOptions ="";

    // loop through the list of collection's names and add
    // all the cards associated with it to a list with all the sets
    for (const collectionName of collectionNames) {
      allSets += `<button type=submit class=studySet name="${collectionName}">${collectionName}</button>`;
      dropDownOptions += `<option value="${collectionName}">${collectionName}</option>`
    }



    console.log(allSets);
    res.render("study-sets", { studySets: allSets, dropDownOptions: dropDownOptions});
  } catch (error) {
    console.error("Error fetching study sets:", error);
    res.status(500).send("Error fetching study sets");
  }
});

app.get("/add-study-set", (req, res) => {
  res.render("add-study-set");
});

app.post("/view-set", async (req, res) => {
  const db = await connectToMongo();
  const collectionName = await req.body;
  const propertyNames = Object.keys(collectionName);
  const collectionN = propertyNames[0];

  current = collectionN;
  
  const flashcardsCollection = await db.collection(collectionN);
  const flashcardsCursor = await flashcardsCollection.find({});
  const flashcards = await flashcardsCursor.toArray();


 
    let content = `<ul>`;
    for (const item in flashcards){
        let word = flashcards[item].Word;
        let desc = flashcards[item].Definition;

        content += `<li><strong> ${word} </strong> <ul> <li> ${desc} </li> </ul></li><br>`
    }
    content += '</ul>'
    



  res.render("view-set", { collectionName: collectionN, contents: content });
});

app.post("/clear-study-sets", async (req, res) => {
  try {
    const db = await connectToMongo();
    await db.collection(collection).deleteMany({});
  } catch (error) {
    console.error("Error clearing study sets:", error);
    res.status(500).send("Error clearing study sets");
  }
});

app.get("/cats", async (req, res) => {
    try {
        const url = `https://api.thecatapi.com/v1/images/search?limit=24`;
        const api_key = "live_BxEp9x6RH3P06X4X8tW1USaywaralRADMVBmi3mcjQCeyDr3hcqb3w5tzuXvG9AG";

        const response = await axios.get(url, {
            headers: { 'x-api-key': api_key }
        });

        const catImages = response.data.map(imageData => imageData.url);

        res.render("cats", { catImages: catImages });
    } catch (error) {
        console.error("Error fetching cat images:", error);
        res.status(500).send("Error fetching cat images");
    }
});

app.post("/createSet", async (req,res) => {
    // leave try catch here, im catching bugs >:)
    try {
        const newSetName = req.body.newSetName;

        const db = await connectToMongo();

        console.log("new set name " + newSetName)
        const existingCollections = await db.listCollections().toArray();
        const existingCollectionNames = existingCollections.map(collection => collection.name);

        if (existingCollectionNames.includes(newSetName)) {
 
            res.status(400).send("A set with the same name already exists.");
            return;
        }
  
        await db.createCollection(newSetName);

        res.redirect("/study-sets");

    } catch (error) {
        console.error("Error creating study set:", error);
        res.status(500).send("Error creating study set");
    }
})
app.post("/addToSet", async (req,res) => {
    // leave try catch here, im catching bugs >:)

    try {
        const name = req.body.dropdown;
        const Word =  req.body.word;
        const Definition = req.body.definition;
        const Bool = false;

        const db = await connectToMongo();

        const collection = db.collection(name);

        console.log("word, definiton,bool", Word, Definition, Bool)
        await collection.insertOne({ Word, Definition, Bool});

        res.redirect("/study-sets");

    } catch (error) {
        console.error("Error creating a definiton:", error);
        res.status(500).send("Error creating a definiton");
    }
})

app.post("/deleteSet", async (req, res) => {
    try {
        const db = await connectToMongo();

        const collectionName = req.body.dropdown;
        await db.collection(collectionName).drop();
        res.redirect("/study-sets");
    } catch (error) {
        console.error("Error deleting collection", error);
        res.status(500).send("Error deleting collection");
    }
});

//inside of set

app.post("/deleteDefinition", async (req, res) => {
    try {
        const db = await connectToMongo();

        const definition = req.body.definition;
        const name = req.body.collectionName;

        const result = await db.collection(name).deleteOne({ Definition: definition });

        if (result.deletedCount === 1) {
            console.log("Definition deleted successfully");
        } else {
            console.log("Definition not found or not deleted");
        }

        res.redirect("/view-set");
    } catch (error) {
        console.error("Error deleting definition", error);
        res.status(500).send("Error deleting definition");
    }
});

app.get("/view-set", async (req, res) => {

   
    const collectionN = current;
    const db = await connectToMongo();
    console.log("yo yo yoyo" ,current);
  
    
    const flashcardsCollection = await db.collection(collectionN);
    const flashcardsCursor = await flashcardsCollection.find({});
    const flashcards = await flashcardsCursor.toArray();
  
  
   
      let content = `<ul>`;
      for (const item in flashcards){
          let word = flashcards[item].Word;
          let desc = flashcards[item].Definition;
  
          content += `<li><strong> ${word} </strong> <ul> <li> ${desc} </li> </ul></li><br>`
      }
      content += '</ul>'

  
  
    res.render("view-set", { collectionName: collectionN, contents: content });
  });



startServer();
