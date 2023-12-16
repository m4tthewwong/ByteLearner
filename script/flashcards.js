// flashcards.js

document.addEventListener('DOMContentLoaded', function () {
  const flashcards = [
    "Flash card content 1",
    "Flash card content 2",
    "Flash card content 3",
    // Add more flash card content as needed
  ];

  let currentCardIndex = 0;
  const flashcardContent = document.getElementById("flashcard-content");
  const prevButton = document.getElementById("prevButton");
  const nextButton = document.getElementById("nextButton");

  prevButton.addEventListener('click', function () {
    showFlashCard('prev');
  });

  nextButton.addEventListener('click', function () {
    showFlashCard('next');
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
