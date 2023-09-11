// hide the article window
function goFullScreen() {
  const fullscreen = document.querySelector(".mapctrl-fullscreen");
  if (fullscreen) fullscreen.click();
  else setTimeout(goFullScreen, 0);
}
goFullScreen();

// show a popup for the intro or instructions
function showPopup(content) {
  module.clearPopups();
  module.showPopup(
    new mapboxgl.Popup({
      anchor: "center",
      closeButton: false,
      closeOnClick: false,
      maxWidth: window.innerWidth < 1024 ? "325px" : "425px",
    })
      .setLngLat(module.map.getCenter())
      .setHTML(module.defaultPopupHTML(content.innerHTML)),
  );
}

// initialize data to be used throughout the quiz
const quiz = {
  // establish objects for data
  answerList: [],
  borderBox: {},
  coordinates: {},
  correctAnswers: [],
  currentPrompt: "",
  giveUp: () => quiz.end("giveUp"),
  missedAnswers: [],
  time: {
    minutes: 3,
    seconds: 0,
  },
  timer: null, // stores interval timer later
  // totalAnswers: 0,
  totalCount: 0,
  rainbow: null, // stores interval timer later
  result: {
    score: 0,
    time: {},
  },
};

// initialize comments for responses and end of quiz
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
    "Got your glasses on?", // "Never heard of it.",
    "Sorry, try again.",
    "Afraid not.",
    "You're in the right province.", // "It sounded right, but no.",
  ],
  repeated: [
    "Already got that one!",
    "No points for doubles.",
    "You're repeating yourself.",
    "It's nice, but you clicked it twice.",
    "Maybe try something different.",
  ],
};

// return a random index of an array
quiz.getRandom = (array) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

// show the intro popup
quiz.showIntro = () => {
  const container = document.createElement("div");
  const content = document.createElement("div");
  content.className =
    "max-h-[400px] md:max-h-[500px] pb-2 pr-1 lg:pr-2 overflow-y-scroll space-y-2";

  content.innerHTML = `
    <h2 class="text-base lg:text-lg">The great Greater Toronto and Hamilton Area municipality quiz</h2>
    <h3 class="text-sm lg:text-base">How many GTHA municipalities can you name in three minutes?</h3>

    <div class="byline text-xs space-y-2">
      <div>
        <div class="inline-block text-map-800 dark:text-gray-100 uppercase author bg-gray-300 dark:bg-gray-700 px-1.5 py-1 shadow-emboss">
        Torontoverse Staff</div>
        <div class="inline-block uppercase author text-gray-900 font-semibold bg-purple-100 px-1.5 py-1 shadow-emboss">
        Fun</div>
      </div>
      <div class="pubdate text-xxs"><span class="text-gray-600 dark:text-gray-400 font-bold">Published</span> 2022-06-07</div>
    </div>
    
    <figure>
      <img src="https://media.geomodul.us/img/GTA-highway.jpg" alt="A view of highway signs in the Greater Toronto Area" style="width: 100%" />
      <figcaption class="pl-5 -indent-[14px] pr-2 py-1 text-gray-900 dark:text-gray-400 bg-map-200 dark:bg-gray-800 before:content-chevron text-xs">
      No hints. (Photo illustration by Torontoverse Staff;
      <a href="https://commons.wikimedia.org/wiki/File:Ontario_Highway_401_(27023911124).jpg" target="_blank">Wikimedia Commons</a>)
      </figcaption>
    </figure>
    
    <p>You’ve come to a site called Torontoverse, so you must have at least <i>some</i> knowledge of the place. Or you came by mistake. Whatever.</p>
    <p> The point is: The Greater Toronto and Hamilton Area is made up of 26 distinct places — a mix of urban, suburban, and rural municipalities. How many of them can you pick out on a map? </p>
    <div>
      <button class="bg-gray-300 dark:bg-gray-700 mt-2 py-2 shadow-emboss text-center text-map-800 dark:text-gray-100 w-full" id="start-quiz">Take the Torontoverse quiz to find out!</button>
    </div>
    
    <div class="embed text-sm py-4 space-x-1">
      <a class="bg-[#4267B2] p-1 hover:bg-blue-700 shadow-emboss no-underline text-white white-link visited:text-white" href="https://www.facebook.com/dialog/share?app_id=3608853232681502&amp;display=page&amp;href=http%3A%2F%2Flocalhost%3A8100%2Farticles%2FmhGVGtCQEeydZAJCrBIAAg%2Fthe-great-greater-toronto-and" target="_blank"><img src="/img/icons/brand/fb-dark.svg" class="inline h-4 mx-0.5" alt="facebook logo">Share</a>
      <a class="bg-[#1DA1F2] p-1 hover:bg-blue-300 shadow-emboss no-underline text-white white-link align-baseline visited:text-white" href="https://twitter.com/intent/tweet?text=%22The%20great%20Greater%20Toronto%20and%20Hamilton%20Area%20municipality%20quiz%22%20from%20%40torontoverse%0A%0A&amp;url=http%3A%2F%2Flocalhost%3A8100%2Farticles%2FmhGVGtCQEeydZAJCrBIAAg%2Fthe-great-greater-toronto-and" target="_blank"><img src="/img/icons/brand/twitter-dark.svg" class="inline h-4 mx-0.5" alt="twitter logo">Share</a>
    </div>

    <p class="text-xxs text-gray-700 dark:text-gray-400">Code and markup by Kyle Duncan. ©Torontoverse, 2023</p>
  `;

  container.appendChild(content);

  showPopup(container);
  document
    .getElementById("start-quiz")
    .addEventListener("click", quiz.showInstructions);
};

// show in instruction popup
quiz.showInstructions = () => {
  const container = document.createElement("div");
  container.innerHTML = `
    <div class="space-y-2">
      <h2 class="text-base lg:text-lg">Instructions</h2>
      <p class="text-sm lg:text-base">We’ll give you the names of the <span class="font-bold">municipalities</span> — just click or tap on the map where you think they can be found.</p>
      <p class="text-sm lg:text-base">You’ve got three minutes, and can skip any municipality if you get stuck. Click “Start Quiz” below to begin. Good luck!</p>
      <button class="bg-gray-300 dark:bg-gray-700 mt-2 p-2 shadow-emboss text-center text-map-800 dark:text-gray-100 w-full" id="start-quiz">Start Quiz</button>
    </div>
  `;
  showPopup(container);
  document
    .getElementById("start-quiz")
    .addEventListener("click", quiz.showPrompt);
};

// create a persistent element at the bottom center of the map that shows:
// - the next municipality to guess
// - the time remaining
// - the number of correct answers
// - a button to skip to the next municipality
// - a button to end the quiz
quiz.showPrompt = () => {
  module.clearPopups();
  const prompt = document.createElement("div");
  prompt.className =
    "absolute bg-map-100 dark:bg-map-800 bottom-14 lg:bottom-10 cursor-default default-popoup flex flex-col inset-x-2.5 md:inset-x-1/4 lg:inset-x-1/3 items-center justify-center";
  prompt.id = "promptPopup";
  const content = document.createElement("div");
  content.className =
    "bg-map-50 dark:bg-map-900 border-2 lg:border-4 border-map-100 dark:border-map-800 p-1 space-y-1 window-content";
  content.innerHTML = `
    <div class="flex items-center justify-center min-h-[56px] w-full" id="commentContainer">
      <p class="px-3 text-center text-sm" id="commentText">You're up!</p>
    </div>

    <div class="text-center w-full">
      <p>Where is <span class="font-bold" id="prompt">${quiz.currentPrompt}</span>?</p>
    </div>

    <div class="bg-map-200 dark:bg-map-600 flex flex-row items-center h-6 justify-evenly relative text-sm w-full">
      <div class="absolute bg-green-400 dark:bg-green-600 duration-500 ease-linear h-6 left-0 top-0 transition-[width] w-full" id="timeBar"></div>
      <div class="absolute bg-purple-200 dark:bg-purple-400 duration-500 ease-linear h-6 left-0 top-0 transition-[width] w-0" id="scoreBar"></div>
      <p class="mb-0 text-sm z-20">Time Left: <span id="minutes">3</span>:<span id="seconds">00</span></p>
      <p class="mb-0 text-sm z-10"><span id="correct">0</span> / <span id="totalAnswers">26</span></p>
    </div>

    <div class="bg-map-200 dark:bg-map-700 flex justify-between mt-1 w-full">
      <button class="hover:bg-map-100 dark:hover:bg-map-800 shadow-emboss py-2 w-1/2" id="skipPrompt" type="button">Skip</button>
      <button class="hover:bg-map-100 dark:hover:bg-map-800 shadow-emboss py-2 w-1/2" id="giveUp" type="button">Give Up</button>
    </div>
  `;
  prompt.appendChild(content);
  module.map.getContainer().appendChild(prompt);
  window.addEventListener("flexWindowReset", () => {
    document.getElementById("promptPopup").remove();
  });
  quiz.start();
};

quiz.newPrompt = () => {
  quiz.currentPrompt = quiz.getRandom(quiz.answerList);
  quiz.prompt.innerText = quiz.currentPrompt;
};

/* INITIALIZE QUIZ */
quiz.start = () => {
  // grab visual elements
  // text
  quiz.siienComment = document.getElementById("commentText");
  quiz.prompt = document.getElementById("prompt");
  quiz.minutes = document.getElementById("minutes");
  quiz.seconds = document.getElementById("seconds");
  quiz.totalCorrect = document.getElementById("correct");
  quiz.totalAnswers = document.getElementById("totalAnswers");
  // elements
  quiz.scoreBar = document.getElementById("scoreBar");
  quiz.timeBar = document.getElementById("timeBar");
  // buttons
  quiz.endButton = document.getElementById("giveUp");
  quiz.skipButton = document.getElementById("skipPrompt");
  // listen for responses and other elements
  module.handleCursor("boundary-fills", quiz.checkAnswer);
  quiz.skipButton.addEventListener("click", quiz.newPrompt);
  quiz.endButton.addEventListener("click", quiz.giveUp);
  // load and start the quiz
  quiz.buildData();
  quiz.newPrompt();
  quiz.startTimer();
};

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
      quiz.totalCount++;
    });
    quiz.answerList.sort();
  }
  quiz.masterTotals = {
    answers: quiz.answerList.length,
    time: quiz.time.minutes * 60 + quiz.time.seconds,
  };
  quiz.totalAnswers.innerText = quiz.totalCount;
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

quiz.checkAnswer = (e) => {
  const guess = e.features[0].properties.MUNICIPAL_NAME_SHORTFORM;
  if (quiz.currentPrompt == guess) {
    if (quiz.correctAnswers.includes(guess)) {
      quiz.siienComment.innerText = quiz.getRandom(quiz.comments.repeated);
    } else {
      quiz.correctGuess(guess);
    }
  } else quiz.siienComment.innerText = quiz.getRandom(quiz.comments.incorrect);
};

// remove fill and flyTo region on successful guess
quiz.correctGuess = (answer) => {
  // remove current prompt from answers list
  quiz.answerList.splice(quiz.answerList.indexOf(quiz.currentPrompt), 1);
  // add to array of correct answers
  quiz.correctAnswers.push(answer);
  // random list of encouragment? dependent on progress?
  quiz.siienComment.innerText = quiz.getRandom(quiz.comments.correct);
  // add to total correct on screen & adjust var visual
  quiz.totalCorrect.textContent = quiz.correctAnswers.length;
  quiz.scoreBar.style.width = `${Math.round(
    (quiz.correctAnswers.length / quiz.masterTotals.answers) * 100,
  )}%`;
  quiz.checkBarZindex();
  quiz.revealAnswer(answer);
  if (quiz.correctAnswers.length === quiz.masterTotals.answers) {
    setTimeout(() => quiz.end("win"), 1000);
  } else quiz.newPrompt();
};

quiz.revealAnswer = (answer) => {
  // fly to region, reveal
  const bearing = module.map.getBearing();
  module.map.fitBounds(quiz.borderBox[answer], {
    bearing: bearing,
    duration: 1500,
    linear: true,
    maxZoom: 10,
    offset: [0, -60],
    padding: 20,
  });
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

// make sure the shorter bar is on top of the other
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

  quiz.endButton.removeEventListener("click", quiz.giveUp);
  quiz.endButton.innerText = "Reset Quiz";
  quiz.endButton.addEventListener("click", quiz.reset);

  if (outcome === "win") {
    quiz.prompt;
    // stop the timer
    clearInterval(quiz.timer);
    quiz.siienComment.innerText = "Well done, you got them all!";
    quiz.skipButton.classList.add("text-gray-500", "dark:text-gray-400");
    quiz.skipButton.disabled = true;
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
    quiz.skipButton.focus();
    // offer to reveal rest of answers
    quiz.skipButton.innerText = "Show Remaining";
    quiz.skipButton.addEventListener("click", quiz.showRemaining, {
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
  if (score > 20) comment = quiz.comments.result.best;
  if (score == quiz.totalCount) {
    // replaces question with extra victory message and rainbow
    const prompt = document.getElementById("prompt").parentElement;
    prompt.innerHTML = `Congratulations - a perfect score!`;
    quiz.highScore(document.getElementById("promptPopup").firstElementChild);
  }
  // replace with score and comment
  const results = [
    `You got ${score} out of ${quiz.totalCount} municipalities with ${timeLeft}.`,
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
quiz.highScore = (element) => {
  const colors = ["#7C3AED", "#00B073", "#00C1D4", "#EB6894"];
  element.style.borderTopColor = colors[0];
  element.style.borderLeftColor = colors[1];
  element.style.borderBottomColor = colors[2];
  element.style.borderRightColor = colors[3];
  quiz.rainbow = setInterval(() => {
    colors.push(colors[0]);
    colors.shift();
    element.style.borderTopColor = colors[0];
    element.style.borderLeftColor = colors[1];
    element.style.borderBottomColor = colors[2];
    element.style.borderRightColor = colors[3];
  }, 1000);
};

// fly through each missed answer after quiz is complete
quiz.showRemaining = () => {
  quiz.siienComment.innerText = "Here's what you missed...";
  quiz.skipButton.classList.add("text-gray-500", "dark:text-gray-400");
  quiz.skipButton.disabled = true;
  const remaining = quiz.answerList.filter(
    (municipality) => !quiz.correctAnswers.includes(municipality),
  );
  quiz.timeouts = {};
  remaining.forEach((municipality, index) => {
    const timeoutInfo = setTimeout(() => {
      quiz.prompt.innerText = municipality;
      quiz.missedAnswers.push(municipality);
      quiz.revealMissed(municipality);
    }, index * 2500);
    quiz.timeouts[municipality] = timeoutInfo;
  });
};

quiz.revealMissed = (answer) => {
  // fly to region, reveal
  const bearing = module.map.getBearing();
  module.map.fitBounds(quiz.borderBox[answer], {
    bearing: bearing,
    duration: 1500,
    linear: true,
    maxZoom: 12,
    offset: [0, -60],
  });
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
  if (quiz.timeouts) {
    for (const municipality in quiz.timeouts) {
      clearTimeout(quiz.timeouts[municipality]);
    }
  }

  if (quiz.rainbow) clearInterval(quiz.rainbow);

  clearInterval(quiz.timer);
  clearInterval(quiz.resultScroll);

  document.getElementById("promptPopup").remove();

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

  module.map.once("idle", quiz.showInstructions);
};

// add a listener to the map that shows the intro popup when the map is idle
module.map.once("idle", () => {
  setTimeout(quiz.showIntro, 500);
});
