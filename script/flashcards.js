const { MongoClient } = require('mongodb');
const path = require('path');
require("dotenv").config({ path: path.resolve(__dirname, 'credentials/.env') });

const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const database = process.env.MONGO_DB_NAME;
const uri = `mongodb+srv://${userName}:${password}@cluster0.dcxpb1s.mongodb.net/?retryWrites=true&w=majority`;

async function connectToMongo() {
    try {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        return client.db(database);
    } catch (error) {
        console.error('Could not connect to MongoDB', error);
        process.exit(1);
    }
}

async function getCollection(collectionName) {
    const db = await connectToMongo();

    try {
        const collection = db.collection(collectionName);
        const documents = await collection.find({}).toArray();
        console.log(`Documents from ${collectionName}:`, documents);
        return documents;
    } finally {
        await db.close();
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    const collectionName = document.querySelector("#collectionName").innerHTML;
    let cards = await getCollection(collectionName);

    console.log(cards);
    flashcards = cards;

    let currentCardIndex = 0;
    const flashcardContent = document.getElementById("flashcard-content");
    flashcardContent.textContent = flashcards[currentCardIndex];
    const prevButton = document.getElementById("prevButton");
    const nextButton = document.getElementById("nextButton");
    const learnedButton = document.getElementById("learnedButton");
    let learned = false;

    prevButton.addEventListener('click', function () {
        showFlashCard('prev');
    });

    nextButton.addEventListener('click', function () {
        showFlashCard('next');
    });

    learnedButton.addEventListener('click', function () {
        if (learned) {
            learnedButton.style.backgroundColor = "red";
            learnedButton.innerText = "not learned";
            learned = false;
        } else {
            learnedButton.style.backgroundColor = "#4caf50";
            learnedButton.innerText = "learned!";
            learned = true;
        }
    });

    function showFlashCard(direction) {
        if (direction === "next") {
            currentCardIndex = (currentCardIndex + 1) % flashcards.length;
        } else if (direction === "prev") {
            currentCardIndex = (currentCardIndex - 1 + flashcards.length) % flashcards.length;
        }

        flashcardContent.textContent = flashcards[currentCardIndex];
    }
});
