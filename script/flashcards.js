
document.addEventListener('DOMContentLoaded', async function () {

console.log(window.myVariable);
    let flashcards = ["1","2", "3"];

    const myVariable = require('./sender.js');
    console.log(myVariable); // Outputs: Hello from sender.js!
    console.log(flashcards);
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
            learned = true;

        } else {
            learnedButton.style.backgroundColor = "#4caf50";
            learnedButton.innerText = "learned!";
            learned = false;
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
