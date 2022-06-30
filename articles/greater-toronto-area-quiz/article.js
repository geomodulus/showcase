function isMobile() {
  if (window.innerWidth < 1024) return true;
  else if (window.innerWidth >= 1024) return false;
  else return `Width not determined: ${window.innerWidth}`;
}

if (isMobile()) module.map.setMinZoom(7.5);
else module.map.setMinZoom(9);

setTimeout(() => {
  if (isMobile()) {
    module.map.easeTo({
      center: [-79.482, 43.788],
      duration: 1500,
      zoom: 8,
    });
  }
}, 0);

const quiz = {
  // establish objects for data
  answerList: [],
  borderBox: {},
  coordinates: {},
  correctAnswers: [],
  giveUp: () => quiz.end("giveUp"),
  missedAnswers: [],
  time: {
    minutes: 3,
    seconds: 0,
  },
  timer: null, // stores interval timer later
  totalAnswers: 0,
  result: {
    score: 0,
    time: {},
  },
};

quiz.comments = {
  result: {
    best: "You’re the Greater-est. Drake should write a song about you.", // 21–25 correct
    better: "Well played. You get the GTHA — just not, like, all of it.", // 11–20 correct
    worse: "Don’t feel so bad. The GTHA is a large and mysterious place.", // 1–10 correct
    worst:
      "Which is weird, because “Toronto” and “Hamilton” are right there in the name.", // 0 correct
  },
  correct: [
    "Nice work — you got one!",
    "Hey, you're good at this!",
    "Been studying, huh?",
    "That's a good one.",
    "Bingo.",
  ],
  incorrect: [
    "Nope, that ain't right.",
    "Never heard of it.",
    "Sorry, try again.",
    "Afraid not.",
    "It sounded right, but no.",
  ],
  repeated: [
    "Already got that one!",
    "No points for doubles.",
    "You're repeating yourself.",
    "It's nice, but you named it twice.",
    "Maybe try something different.",
  ],
};

/* INITIALIZE QUIZ */

quiz.init = () => {
  // grab visual elements
  quiz.form = document.querySelector("form.quiz");
  quiz.endButton = document.getElementById("giveUp");
  quiz.siienComment = document.getElementById("commentText");
  quiz.minutes = document.getElementById("minutes");
  quiz.scoreBar = document.getElementById("scoreBar");
  quiz.seconds = document.getElementById("seconds");
  quiz.siien = document.getElementById("siien");
  quiz.startButton = document.getElementById("startQuiz");
  quiz.introSection = document.getElementById("introduction");
  quiz.quizSection = document.getElementById("quizSection");
  quiz.timeBar = document.getElementById("timeBar");
  quiz.totalAnswers = document.getElementById("totalAnswers");
  quiz.totalCorrect = document.getElementById("correct");
  quiz.userInput = document.getElementById("guesses");

  if (isMobile()) {
    quiz.quizSection.classList.add("flex-col-reverse");
    quiz.quizSection.classList.remove("flex-col");
  }

  // handle submit in form element
  quiz.form.addEventListener("submit", quiz.handleSubmit);
  // listen for user gueses
  quiz.userInput.addEventListener("input", quiz.checkGuess);
  // listen for the user giving up
  quiz.endButton.addEventListener("click", quiz.giveUp);
  // allow the user to start the quiz
  quiz.startButton.addEventListener(
    "click",
    (e) => {
      e.preventDefault();
      quiz.start();
      quiz.startButton.innerText = "Submit";
    },
    { once: true }
  );
  // remove timeouts on article close
  window.addEventListener(
    "flexWindowReset",
    () => {
      if (quiz.timeouts) {
        for (const municipality in quiz.timeouts) {
          clearTimeout(quiz.timeouts[municipality]);
        }
      }
    },
    { once: true }
  );
};

quiz.getRandom = (array) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

// handles the user clicking the button during the quiz
quiz.handleSubmit = (e) => {
  e.preventDefault();
  quiz.animateSiien("turn");
  quiz.siienComment.innerText = quiz.getRandom(quiz.comments.incorrect);
  quiz.userInput.value = "";
};

// starts the quiz
quiz.start = () => {
  if (isMobile()) quiz.introSection.classList.add("hidden");
  // build quiz data
  quiz.buildData();
  // start timer
  quiz.startTimer();
  // enable input and give focus
  quiz.siienComment.innerText = "Go!";
  quiz.userInput.disabled = false;
  quiz.userInput.focus();
};

/* START OF QUIZ */

// add each location in the geojson source to the answer list
// and to the list of coordinates for flyTo on correct guess
quiz.buildData = () => {
  if (!quiz.answerList.length) {
    const sourceData = module.map.getSource("municipal-centres");
    sourceData._data.features.forEach((centre) => {
      quiz.answerList.push(centre.properties.MUNICIPAL_NAME_SHORTFORM);

      quiz.coordinates[centre.properties.MUNICIPAL_NAME_SHORTFORM] =
        centre.geometry.coordinates;
      quiz.borderBox[centre.properties.MUNICIPAL_NAME_SHORTFORM] =
        centre.properties._bbox;
    });
    quiz.answerList.sort();
  }
  quiz.masterTotals = {
    answers: quiz.answerList.length,
    time: quiz.time.minutes * 60 + quiz.time.seconds,
  };
  quiz.totalAnswers.innerText = quiz.masterTotals.answers;
};

// run a timer and display on screen
quiz.startTimer = () => {
  quiz.timer = setInterval(() => {
    if (quiz.time.seconds === 0) {
      if (quiz.time.minutes === 0) {
        clearInterval(quiz.timer);
        quiz.end("lose");
      } else {
        quiz.time.minutes--;
        quiz.time.seconds = 59;
      }
    } else {
      quiz.time.seconds--;
    }

    quiz.minutes.innerText = quiz.time.minutes;
    if (quiz.time.seconds < 10)
      quiz.seconds.innerText = `0${quiz.time.seconds}`;
    else quiz.seconds.innerText = quiz.time.seconds;
    quiz.timeBar.style.width = `${quiz.timeLeftPercentage(quiz.time)}%`;
    quiz.checkBarZindex();
  }, 1000);
  // stop timer if user leaves the article
  window.addEventListener("flexWindowReset", () => clearInterval(quiz.timer));
};

// checks the guess against available answers
quiz.checkGuess = () => {
  const guess = quiz.userInput.value.trim().toUpperCase();
  if (quiz.answerList.includes(guess)) {
    if (quiz.correctAnswers.includes(guess)) {
      quiz.siienComment.innerText = quiz.getRandom(quiz.comments.repeated);
    } else quiz.correctGuess(guess);
    // reset user input
    quiz.userInput.value = "";
  }
};

// remove fill and flyTo region on successful guess
quiz.correctGuess = (answer) => {
  // add to array of correct answers
  quiz.correctAnswers.push(answer);
  // random list of encouragment? dependent on progress?
  quiz.siienComment.innerText = quiz.getRandom(quiz.comments.correct);
  // add to total correct on screen & adjust var visual
  quiz.totalCorrect.textContent = quiz.correctAnswers.length;
  quiz.scoreBar.style.width = `${Math.round(
    (quiz.correctAnswers.length / 25) * 100
  )}%`;
  quiz.checkBarZindex();
  quiz.revealAnswer(answer);
  if (quiz.correctAnswers.length === quiz.masterTotals.answers) {
    setTimeout(() => quiz.end("win"), 1000);
  } else quiz.animateSiien("bounce");
};

quiz.animateSiien = (animation) => {
  if (animation === "bounce") {
    quiz.siien.classList.add("-translate-y-1/4");
    setTimeout(() => {
      quiz.siien.classList.add("animate-bounce");
    }, 700);
    setTimeout(() => {
      quiz.siien.classList.remove("animate-bounce");
      quiz.siien.classList.remove("-translate-y-1/4");
    }, 3200);
  }
  if (animation === "turn") {
    quiz.siien.classList.add("scale-x-[-1]");
    setTimeout(() => {
      quiz.siien.classList.remove("scale-x-[-1]");
    }, 1000);
  }
};

quiz.revealAnswer = (answer) => {
  // fly to region, reveal
  if (isMobile()) {
    const bearing = module.map.getBearing();
    module.map.fitBounds(quiz.borderBox[answer], {
      bearing: bearing,
      duration: 1500,
      linear: true,
    });
  } else {
    module.map.easeTo({
      center: quiz.coordinates[answer],
      duration: 1500,
      zoom: 10,
    });
  }
  module.map
    .setFilter("boundary-fills", quiz.getFilter("fill"))
    // add label with region name
    .setFilter("labels", quiz.getFilter("label"));
};

// build a mapbox filter that includes the correct guesses so far
quiz.getFilter = (type) => {
  const filterArray = [type === "fill" ? "all" : "any"];
  quiz.correctAnswers.forEach((answer) => {
    filterArray.push([
      type === "fill" ? "!=" : "==",
      ["get", "MUNICIPAL_NAME_SHORTFORM"],
      answer,
    ]);
  });
  return filterArray;
};

// caclulate the time remaining as a percentage
quiz.timeLeftPercentage = ({ minutes, seconds }) => {
  const secLeft = minutes * 60 + seconds;
  const percentage = Math.round((secLeft / 180) * 100);
  return percentage;
};

quiz.checkBarZindex = () => {
  const scoreWidth = +quiz.scoreBar.style.width.slice(0, -1);
  const timeWidth = +quiz.timeBar.style.width.slice(0, -1);
  if (scoreWidth > timeWidth) {
    quiz.timeBar.style.zIndex = "10";
  }
};

/* END OF QUIZ */

// handles different end of quiz conditions
quiz.end = (outcome) => {
  // lock in score and time remaining
  quiz.result = {
    score: quiz.correctAnswers.length,
    time: { ...quiz.time },
  };

  quiz.form.removeEventListener("submit", quiz.handleSubmit);
  quiz.form.addEventListener("submit", (e) => e.preventDefault());
  quiz.endButton.removeEventListener("click", quiz.giveUp);
  quiz.endButton.innerText = "Reset Quiz";
  quiz.endButton.addEventListener("click", quiz.reset);

  if (outcome === "win") {
    // stop the timer
    clearInterval(quiz.timer);
    quiz.siienComment.innerText = "Well done, you got them all!";
    // prompt to share visual: 25/25 + time remaining (bars background?)
  }

  if (outcome === "giveUp") {
    // stop the timer
    clearInterval(quiz.timer);
    quiz.siienComment.innerText =
      "Better luck next time! Keep guessing if you like.";
  }

  if (outcome === "lose")
    quiz.siienComment.innerText = "Time's up! Keep guessing if you like.";

  if (outcome === "lose" || outcome === "giveUp") {
    quiz.startButton.focus();
    quiz.userInput.value = "";
    // offer to reveal rest of answers
    quiz.startButton.innerText = "Show Remaining";
    quiz.startButton.addEventListener("click", quiz.showRemaining, {
      once: true,
    });
  }
  // show result and comment
  quiz.showResult();
};

// show result and comment (to share?)
quiz.showResult = () => {
  // compile result info
  const { score, time } = quiz.result;
  let timeLeft;
  if (time.minutes === 0 && time.seconds === 0) {
    timeLeft = "no time left";
  } else {
    timeLeft = `${time.minutes}:${
      time.seconds > 9 ? time.seconds : `0${time.seconds}`
    } remaining`;
  }
  let comment = quiz.comments.result.worst;
  if (score > 0) comment = quiz.comments.result.worse;
  if (score > 10) comment = quiz.comments.result.better;
  if (score > 20) {
    comment = quiz.comments.result.best;
    quiz.highScore();
  }

  // replace with score and comment
  const results = [
    // "Game Over!",
    `You got ${score} out of ${quiz.answerList.length} municipalities with ${timeLeft}.`,
    comment,
    "Thanks for playing!",
  ];
  quiz.resultScroll = setInterval(() => {
    quiz.siienComment.innerText = results[0];
    results.push(results[0]);
    results.shift();
  }, 2500);
};

// make it look fun and exciting
quiz.highScore = () => {
  const siienBox = document.getElementById("siienBox");
  const colors = ["#7C3AED", "#00B073", "#00C1D4", "#EB6894"];
  siienBox.style.borderTopColor = colors[0];
  siienBox.style.borderLeftColor = colors[1];
  siienBox.style.borderBottomColor = colors[2];
  siienBox.style.borderRightColor = colors[3];
  quiz.rainbow = setInterval(() => {
    colors.push(colors[0]);
    colors.shift();
    siienBox.style.borderTopColor = colors[0];
    siienBox.style.borderLeftColor = colors[1];
    siienBox.style.borderBottomColor = colors[2];
    siienBox.style.borderRightColor = colors[3];
  }, 1000);
  quiz.siien.classList.add("animate-bounce");
};

// fly through each missed answer after quiz is complete
quiz.showRemaining = () => {
  quiz.siienComment.innerText = "Here's what you missed...";
  const remaining = quiz.answerList.filter(
    (municipality) => !quiz.correctAnswers.includes(municipality)
  );
  quiz.timeouts = {};
  remaining.forEach((municipality, index) => {
    const timeoutInfo = setTimeout(() => {
      quiz.missedAnswers.push(municipality);
      quiz.revealMissed(municipality);
    }, index * 2500);
    quiz.timeouts[municipality] = timeoutInfo;
  });
};

quiz.revealMissed = (answer) => {
  // fly to region, reveal
  if (isMobile()) {
    const bearing = module.map.getBearing();
    module.map.fitBounds(quiz.borderBox[answer], {
      bearing: bearing,
      duration: 1500,
      linear: true,
    });
  } else {
    module.map.easeTo({
      center: quiz.coordinates[answer],
      duration: 1500,
      zoom: 10,
    });
  }
  module.map
    .setFilter("boundary-fills", quiz.getMissedFilter("fill"))
    // add label with region name
    .setFilter("missedLabels", quiz.getMissedFilter("label"));
};

// build a mapbox filter that includes the correct guesses so far
quiz.getMissedFilter = (type) => {
  const filterArray = [type === "fill" ? "all" : "any"];
  if (type === "fill") {
    quiz.correctAnswers.forEach((answer) => {
      filterArray.push(["!=", ["get", "MUNICIPAL_NAME_SHORTFORM"], answer]);
    });
  }
  quiz.missedAnswers.forEach((answer) => {
    filterArray.push([
      type === "fill" ? "!=" : "==",
      ["get", "MUNICIPAL_NAME_SHORTFORM"],
      answer,
    ]);
  });
  return filterArray;
};

/* RESET QUIZ */
quiz.reset = () => {
  quiz.userInput.disabled = true;

  if (quiz.timeouts) {
    for (const municipality in quiz.timeouts) {
      clearTimeout(quiz.timeouts[municipality]);
    }
  }

  if (quiz.rainbow) {
    clearInterval(quiz.rainbow);
    quiz.siien.classList.remove("animate-bounce");
  }

  clearInterval(quiz.timer);
  quiz.correctAnswers = [];
  quiz.missedAnswers = [];
  quiz.time = {
    minutes: 3,
    seconds: 0,
  };
  quiz.result = { score: 0, time: {} };

  // reset mapbox filters
  module.map
    .setFilter("boundary-fills", quiz.getFilter("fill"))
    .setFilter("labels", quiz.getFilter("label"))
    .setFilter("missedLabels", quiz.getFilter("label"));

  // reset buttons elements (innerText)
  clearInterval(quiz.resultScroll);
  quiz.siienComment.innerText = "Click 'Start Quiz' to begin. Good luck!";
  quiz.startButton.innerText = "Start Quiz";
  quiz.endButton.innerText = "Give Up";

  // reset button triggers
  quiz.startButton.removeEventListener("click", quiz.showRemaining);
  quiz.startButton.addEventListener(
    "click",
    (e) => {
      e.preventDefault();
      quiz.start();
      quiz.startButton.innerText = "Submit";
    },
    { once: true }
  );
  quiz.endButton.removeEventListener("click", quiz.reset);
  quiz.endButton.addEventListener("click", quiz.giveUp);
  quiz.form.removeEventListener("submit", (e) => e.preventDefault());
  quiz.form.addEventListener("submit", quiz.handleSubmit);

  // reset time/score elements
  quiz.minutes.innerText = quiz.time.minutes;
  if (quiz.time.seconds < 10) quiz.seconds.innerText = `0${quiz.time.seconds}`;
  else quiz.seconds.innerText = quiz.time.seconds;
  quiz.timeBar.style.width = "100%";
  quiz.totalCorrect.textContent = quiz.correctAnswers.length;
  quiz.scoreBar.style.width = "0%";
  quiz.checkBarZindex();
};

/* EXECUTE QUIZ */
quiz.init();
