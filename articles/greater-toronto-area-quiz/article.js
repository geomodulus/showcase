// establish empty objects for data
const answerList = [];
const coordinates = {};
const correctGuesses = [];

// add each location in the geojson source to the answer list
// and to the list of coordinates for flyTo on correct guess
function buildData() {
  const sourceData = module.map.getSource("municipal-centres");
  sourceData._data.features.forEach((centre) => {
    answerList.push(centre.properties.MUNICIPAL_NAME_SHORTFORM);
    coordinates[centre.properties.MUNICIPAL_NAME_SHORTFORM] =
      centre.geometry.coordinates;
  });
}

// build a mapbox filter that includes the correct guesses so far
function getFilter(type) {
  const filterArray = [type === "fill" ? "all" : "any"];
  correctGuesses.forEach((answer) => {
    filterArray.push([
      type === "fill" ? "!=" : "==",
      ["get", "MUNICIPAL_NAME_SHORTFORM"],
      answer,
    ]);
  });
  return filterArray;
}

// fly through each missed answer after quiz is complete
function showRemaining() {
  guessLabel.innerText = "Here's what you missed...";
  const remaining = answerList.filter(
    (municipality) => !correctGuesses.includes(municipality)
  );
  remaining.forEach((municipality, index) => {
    setTimeout(() => {
      correctGuesses.push(municipality);
      correctGuess(municipality);
    }, index * 2000);
  });
}

// handles different end of quiz conditions
function endQuiz(outcome) {
  quizForm.removeEventListener("submit", handleSubmit);
  quizForm.addEventListener("submit", (e) => e.preventDefault());
  if (outcome === "lose") {
    window.alert("Time's up!");
    // show and lock in score
    guessLabel.innerText = "You can keep guessing...";
    // offer to reveal rest of answers
    startButton.innerText = "Show Remaining";
    startButton.addEventListener("click", showRemaining, { once: true });
  }
  if (outcome === "win") {
    quizTimer("stop");
    window.alert("Well done, you go them all!");
    // prompt to share visual: 25/25 + time remaining (bars background?)
  }
}

// remove fill and flyTo region on successful guess
function correctGuess(answer) {
  module.map
    .easeTo({
      center: coordinates[answer],
      duration: 1500,
      offset: [-150, 0],
      zoom: 5,
    })
    .setFilter("boundary-fills", getFilter("fill"))
    // add label with region name
    .setFilter("labels", getFilter("label"));
}

// grab guess and answer visual elements
const totalCorrect = document.getElementById("correct");
const guessLabel = document.getElementById("guessLabel");
const scoreBar = document.getElementById("scoreBar");
const timeBar = document.getElementById("timeBar");

function checkBarZindex() {
  const scoreWidth = +scoreBar.style.width.slice(0, -1);
  const timeWidth = +timeBar.style.width.slice(0, -1);
  if (scoreWidth > timeWidth) {
    timeBar.style.zIndex = "10";
  }
}

// checks the guess against available answers
function checkGuess() {
  const theGuess = userInput.value.trim().toUpperCase();
  if (answerList.includes(theGuess)) {
    if (correctGuesses.includes(theGuess)) {
      guessLabel.innerText = "Already got that one!";
    } else {
      correctGuesses.push(theGuess);
      // fly to region, reveal
      correctGuess(theGuess);
      guessLabel.innerText = "Nice work, you got one!"; // random list of encouragment? dependent on progress?
      totalCorrect.textContent = correctGuesses.length;
      scoreBar.style.width = `${Math.round(
        (correctGuesses.length / 25) * 100
      )}%`;
      checkBarZindex();
      if (correctGuesses.length === 25) endQuiz("win");
    }
    // reset user input
    userInput.value = "";
  }
}

// grab guess input and listen to input
const userInput = document.getElementById("guesses");
userInput.addEventListener("input", checkGuess);

// caclulate the time remaining as a percentage
function timeLeftPercentage({ minutes, seconds }) {
  const secLeft = minutes * 60 + seconds;
  const percentage = Math.round((secLeft / 180) * 100);
  return percentage;
}

// run a timer and display on screen
function quizTimer(startStop) {
  if (startStop === "stop") {
    if (timer) clearInterval(timer);
    return;
  }
  const time = {
    minutes: 3,
    seconds: 0,
  };
  const timer = setInterval(() => {
    const minutes = document.getElementById("minutes");
    const seconds = document.getElementById("seconds");
    if (time.seconds === 0) {
      if (time.minutes === 0) {
        clearInterval(timer);
        endQuiz("lose");
      } else {
        time.minutes--;
        time.seconds = 59;
      }
    } else {
      time.seconds--;
    }
    minutes.innerText = time.minutes;
    if (time.seconds < 10) seconds.innerText = `0${time.seconds}`;
    else seconds.innerText = time.seconds;
    timeBar.style.width = `${timeLeftPercentage(time)}%`;
    checkBarZindex();
  }, 1000);
  // stop timer if user leaves the article
  window.addEventListener("flexWindowReset", () => clearInterval(timer));
}

// enables user to start the quiz
function startQuiz() {
  // build quiz data
  buildData();
  // start timer
  quizTimer();
  // enable input and give focus
  userInput.classList.add("bg-gray-600");
  userInput.disabled = false;
  userInput.focus();
}

// handles the user clicking the button during the quiz
function handleSubmit(e) {
  e.preventDefault();
  guessLabel.innerText = "Nope, that ain't right.";
  userInput.value = "";
}
const quizForm = document.querySelector("form.quiz");
quizForm.addEventListener("submit", handleSubmit);

// allows the user to start the quiz
const startButton = document.getElementById("startQuiz");
startButton.addEventListener(
  "click",
  (e) => {
    e.preventDefault();
    startQuiz();
    startButton.innerText = "Submit";
  },
  { once: true }
);
