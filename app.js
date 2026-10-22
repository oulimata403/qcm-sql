// app.js

import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "./firebase-config.js";

import {
  quizData,
  themeOrder,
  levelOrder
} from "./questions.js";

import {
  defaultProgress,
  normalizeProgress,
  createOrUpdateUserProfile,
  saveQuizResult
} from "./configstore.js";

let currentUser = null;
let userProgress = normalizeProgress(defaultProgress);

let currentTheme = null;
let currentLevel = null;
let currentQuestions = [];
let currentIndex = 0;
let answers = [];
let validated = [];

const loginButton = document.getElementById("google-login-button");
const logoutButton = document.getElementById("logout-button");
const userArea = document.getElementById("user-area");
const userName = document.getElementById("user-name");
const userPhoto = document.getElementById("user-photo");

const themeGrid = document.getElementById("theme-grid");
const levelPanel = document.getElementById("level-panel");
const quizPanel = document.getElementById("quiz-panel");
const resultsPanel = document.getElementById("results-panel");
const emptyState = document.getElementById("empty-state");

const themeTitle = document.getElementById("theme-title");
const themeDescription = document.getElementById("theme-description");
const levelsContainer = document.getElementById("levels-container");

const quizTitle = document.getElementById("quiz-title");
const quizBadge = document.getElementById("quiz-badge");
const questionCounter = document.getElementById("question-counter");
const scoreLive = document.getElementById("score-live");
const progressFill = document.getElementById("progress-fill");
const questionContainer = document.getElementById("question-container");
const feedbackContainer = document.getElementById("feedback-container");
const message = document.getElementById("message");

const previousButton = document.getElementById("previous-button");
const nextButton = document.getElementById("next-button");
const finishButton = document.getElementById("finish-button");

const scoreNumber = document.getElementById("score-number");
const scorePercent = document.getElementById("score-percent");
const resultMessage = document.getElementById("result-message");
const reviewContainer = document.getElementById("review-container");
const retryButton = document.getElementById("retry-button");
const continueButton = document.getElementById("continue-button");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function shuffle(array) {
  const copied = [...array];

  for (let i = copied.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    [copied[i], copied[randomIndex]] = [
      copied[randomIndex],
      copied[i]
    ];
  }

  return copied;
}

function levelLabel(level) {
  return {
    debutant: "Débutant",
    intermediaire: "Intermédiaire",
    avance: "Avancé"
  }[level];
}

function levelKey(theme, level) {
  return `${theme}-${level}`;
}

function isThemeUnlocked(theme) {
  return userProgress.unlockedThemes.includes(theme);
}

function isLevelUnlocked(theme, level) {
  return Boolean(
    userProgress.unlockedLevels[theme]?.includes(level)
  );
}

function isCompleted(theme, level) {
  return Boolean(
    userProgress.completedLevels[levelKey(theme, level)]
  );
}

function bestScore(theme, level) {
  return userProgress.bestScores[levelKey(theme, level)] || 0;
}

function renderUser(user) {
  if (!user) {
    loginButton.hidden = false;
    logoutButton.hidden = true;
    userArea.hidden = true;
    return;
  }

  loginButton.hidden = true;
  logoutButton.hidden = false;
  userArea.hidden = false;

  userName.textContent = user.displayName || "Utilisateur";
  userPhoto.src =
    user.photoURL ||
    "https://via.placeholder.com/44";
}

function renderThemes() {
  themeGrid.replaceChildren();

  themeOrder.forEach((theme, index) => {
    const data = quizData[theme];
    const unlocked = isThemeUnlocked(theme);

    const completed = levelOrder.every(level =>
      isCompleted(theme, level)
    );

    const button = document.createElement("button");

    button.type = "button";
    button.className = "theme-card";
    button.disabled = !currentUser || !unlocked;

    if (completed) {
      button.classList.add("completed");
    }

    const icons = ["📘", "🔗", "📊"];

    button.innerHTML = `
      <div class="theme-icon">${icons[index]}</div>

      <h3>${index + 1}. ${data.title}</h3>

      <p>${data.description}</p>

      <div class="theme-footer">
        <span>
          ${
            !currentUser
              ? "Connecte-toi"
              : completed
                ? "Thème terminé ✓"
                : unlocked
                  ? "Continuer →"
                  : "Verrouillé"
          }
        </span>

        <span class="pill ${
          completed
            ? "pill-success"
            : unlocked
              ? ""
              : "pill-lock"
        }">
          ${
            completed
              ? "✓ Terminé"
              : unlocked
                ? "Disponible"
                : "🔒 Verrouillé"
          }
        </span>
      </div>
    `;

    button.addEventListener("click", () => {
      openTheme(theme);
    });

    themeGrid.appendChild(button);
  });
}

function openTheme(theme) {
  if (!currentUser || !isThemeUnlocked(theme)) {
    return;
  }

  currentTheme = theme;
  currentLevel = null;

  emptyState.hidden = true;
  levelPanel.hidden = false;
  quizPanel.hidden = true;
  resultsPanel.hidden = true;

  themeTitle.textContent = quizData[theme].title;
  themeDescription.textContent = quizData[theme].description;

  renderLevels();

  document
    .getElementById("quiz")
    .scrollIntoView({ behavior: "smooth" });
}

function renderLevels() {
  levelsContainer.replaceChildren();

  levelOrder.forEach(level => {
    const unlocked = isLevelUnlocked(currentTheme, level);
    const completed = isCompleted(currentTheme, level);
    const score = bestScore(currentTheme, level);

    const button = document.createElement("button");

    button.type = "button";
    button.className = "level-card";
    button.disabled = !unlocked;

    if (completed) {
      button.classList.add("completed");
    }

    button.innerHTML = `
      <strong>${levelLabel(level)}</strong>

      <span>
        ${
          unlocked
            ? "10 questions pour valider ce niveau."
            : "Termine le niveau précédent."
        }
      </span>

      <small>
        ${
          completed
            ? `✓ Réussi : ${score}/10`
            : unlocked && score > 0
              ? `Meilleur score : ${score}/10`
              : unlocked
                ? "Disponible"
                : "🔒 Verrouillé"
        }
      </small>
    `;

    button.addEventListener("click", () => {
      startQuiz(level);
    });

    levelsContainer.appendChild(button);
  });
}

function prepareQuestions(theme, level) {
  return quizData[theme].levels[level].map(question => ({
    ...question,
    options: shuffle(question.options)
  }));
}

function startQuiz(level) {
  if (!isLevelUnlocked(currentTheme, level)) {
    return;
  }

  currentLevel = level;
  currentQuestions = prepareQuestions(
    currentTheme,
    currentLevel
  );

  currentIndex = 0;
  answers = Array(currentQuestions.length).fill(null);
  validated = Array(currentQuestions.length).fill(false);

  levelPanel.hidden = true;
  quizPanel.hidden = false;
  resultsPanel.hidden = true;

  quizTitle.textContent = quizData[currentTheme].title;
  quizBadge.textContent = `Niveau ${levelLabel(level)}`;

  renderQuestion();
}

function getCurrentScore() {
  return answers.reduce((score, answer, index) => {
    return score + (
      answer === currentQuestions[index].correct
        ? 1
        : 0
    );
  }, 0);
}

function renderQuestion() {
  const question = currentQuestions[currentIndex];
  const total = currentQuestions.length;

  questionCounter.textContent =
    `Question ${currentIndex + 1} sur ${total}`;

  scoreLive.textContent =
    `Score actuel : ${getCurrentScore()}`;

  progressFill.style.width =
    `${((currentIndex + 1) / total) * 100}%`;

  questionContainer.replaceChildren();
  feedbackContainer.replaceChildren();
  message.textContent = "";

  const title = document.createElement("h3");
  title.textContent = question.text;

  const options = document.createElement("div");
  options.className = "options";

  question.options.forEach((option, index) => {
    const label = document.createElement("label");
    label.className = "option";

    const input = document.createElement("input");

    input.type = "radio";
    input.name = "answer";
    input.value = option;
    input.checked = answers[currentIndex] === option;
    input.disabled = validated[currentIndex];

    if (
      answers[currentIndex] === option &&
      !validated[currentIndex]
    ) {
      label.classList.add("selected");
    }

    if (
      validated[currentIndex] &&
      option === question.correct
    ) {
      label.classList.add("correct");
    }

    if (
      validated[currentIndex] &&
      answers[currentIndex] === option &&
      option !== question.correct
    ) {
      label.classList.add("incorrect");
    }

    input.addEventListener("change", () => {
      answers[currentIndex] = option;
      renderQuestion();
    });

    const letter = document.createElement("span");
    letter.className = "option-letter";
    letter.textContent = String.fromCharCode(65 + index);

    const text = document.createElement("span");
    text.textContent = option;

    label.append(input, letter, text);
    options.appendChild(label);
  });

  questionContainer.append(title, options);

  if (validated[currentIndex]) {
    const correct =
      answers[currentIndex] === question.correct;

    feedbackContainer.innerHTML = `
      <div class="feedback ${
        correct ? "correct" : "incorrect"
      }">
        <strong>
          ${
            correct
              ? "Bonne réponse !"
              : `Réponse correcte : ${question.correct}`
          }
        </strong>

        <span>${question.explanation}</span>
      </div>
    `;
  }

  previousButton.disabled = currentIndex === 0;

  nextButton.hidden =
    currentIndex === total - 1;

  finishButton.hidden =
    currentIndex !== total - 1;

  nextButton.textContent =
    validated[currentIndex]
      ? "Question suivante →"
      : "Valider puis continuer →";
}

function validateCurrentQuestion() {
  if (!answers[currentIndex]) {
    message.textContent =
      "Choisis une réponse avant de continuer.";

    return false;
  }

  validated[currentIndex] = true;
  renderQuestion();

  return true;
}

function nextQuestion() {
  if (!validated[currentIndex]) {
    validateCurrentQuestion();
    return;
  }

  if (currentIndex < currentQuestions.length - 1) {
    currentIndex += 1;
    renderQuestion();
  }
}

function previousQuestion() {
  if (currentIndex > 0) {
    currentIndex -= 1;
    renderQuestion();
  }
}

async function finishQuiz() {
  if (
    !validated[currentIndex] &&
    !validateCurrentQuestion()
  ) {
    return;
  }

  const missingIndex = answers.findIndex(
    answer => answer === null
  );

  if (missingIndex !== -1) {
    currentIndex = missingIndex;
    renderQuestion();

    message.textContent =
      "Réponds à toutes les questions avant de terminer.";

    return;
  }

  const score = getCurrentScore();

  try {
    const result = await saveQuizResult({
      theme: currentTheme,
      level: currentLevel,
      score,
      totalQuestions: currentQuestions.length
    });

    userProgress = normalizeProgress(result.progress);

    quizPanel.hidden = true;
    resultsPanel.hidden = false;

    scoreNumber.textContent =
      `${score}/${currentQuestions.length}`;

    scorePercent.textContent =
      `${Math.round(
        (score / currentQuestions.length) * 100
      )} %`;

    if (score < 7) {
      resultMessage.textContent =
        "Tu dois obtenir au moins 7/10. Recommence ce niveau.";
    } else if (result.perfect) {
      resultMessage.textContent =
        "Félicitations ! Score parfait et passage automatique.";
    } else {
      resultMessage.textContent =
        "Bravo ! Tu peux refaire ce niveau ou continuer.";
    }

    renderReview();
    configureResultButtons(result);
    renderThemes();
  } catch (error) {
    console.error(error);

    message.textContent =
      "Erreur lors de l'enregistrement du résultat.";
  }
}

function renderReview() {
  reviewContainer.replaceChildren();

  currentQuestions.forEach((question, index) => {
    const good =
      answers[index] === question.correct;

    const article = document.createElement("article");
    article.className = "review-item";

    article.innerHTML = `
      <h3>${index + 1}. ${question.text}</h3>

      <span class="review-status ${
        good ? "good" : "bad"
      }">
        ${good ? "Bonne réponse" : "À revoir"}
      </span>

      <p>
        <strong>Ta réponse :</strong>
        ${answers[index]}
      </p>

      <p>
        <strong>Bonne réponse :</strong>
        ${question.correct}
      </p>

      <div class="explanation">
        <strong>Explication :</strong>
        ${question.explanation}
      </div>
    `;

    reviewContainer.appendChild(article);
  });
}

function configureResultButtons(result) {
  retryButton.hidden = false;
  continueButton.hidden = !result.passed;

  retryButton.textContent =
    result.perfect
      ? "Refaire pour réviser"
      : "Refaire ce niveau";

  if (!result.passed) {
    return;
  }

  if (
    result.nextTheme &&
    result.nextTheme !== currentTheme
  ) {
    continueButton.textContent =
      "Passer au thème suivant →";

    return;
  }

  if (result.nextLevel) {
    continueButton.textContent =
      `Passer au niveau ${
        levelLabel(result.nextLevel)
      } →`;

    return;
  }

  continueButton.textContent =
    "Voir mon parcours terminé";
}

function continueProgression() {
  if (!currentUser) {
    return;
  }

  if (userProgress.currentTheme) {
    openTheme(userProgress.currentTheme);

    if (
      userProgress.currentLevel &&
      isLevelUnlocked(
        userProgress.currentTheme,
        userProgress.currentLevel
      )
    ) {
      startQuiz(userProgress.currentLevel);
    }
  }
}

function showHome() {
  currentTheme = null;
  currentLevel = null;

  emptyState.hidden = false;
  levelPanel.hidden = true;
  quizPanel.hidden = true;
  resultsPanel.hidden = true;

  renderThemes();
}

loginButton.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error(error);
    alert(`Connexion impossible : ${error.message}`);
  }
});

logoutButton.addEventListener("click", async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error(error);
    alert("Erreur pendant la déconnexion.");
  }
});

previousButton.addEventListener(
  "click",
  previousQuestion
);

nextButton.addEventListener(
  "click",
  nextQuestion
);

finishButton.addEventListener(
  "click",
  event => {
    event.preventDefault();
    finishQuiz();
  }
);

retryButton.addEventListener(
  "click",
  () => startQuiz(currentLevel)
);

continueButton.addEventListener(
  "click",
  continueProgression
);

document
  .getElementById("back-to-themes")
  .addEventListener("click", showHome);

onAuthStateChanged(auth, async user => {
  currentUser = user;
  renderUser(user);

  if (!user) {
    userProgress = normalizeProgress(defaultProgress);
    showHome();
    return;
  }

  try {
    userProgress =
      await createOrUpdateUserProfile(user);

    renderThemes();

    const savedTheme =
      userProgress.currentTheme;

    const savedLevel =
      userProgress.currentLevel;

    if (
      savedTheme &&
      savedLevel &&
      isThemeUnlocked(savedTheme) &&
      isLevelUnlocked(savedTheme, savedLevel)
    ) {
      openTheme(savedTheme);
    }
  } catch (error) {
    console.error(error);

    alert(
      "Impossible de charger ta progression. " +
      "Vérifie Firebase et les règles Firestore."
    );
  }
});

showHome();
