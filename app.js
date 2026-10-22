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

function getElement(id) {
  const element = document.getElementById(id);

  if (!element) {
    console.error(`Élément HTML introuvable : #${id}`);
  }

  return element;
}

const loginButton = getElement("google-login-button");
const logoutButton = getElement("logout-button");
const userArea = getElement("user-area");
const userName = getElement("user-name");
const userPhoto = getElement("user-photo");

const themeGrid = getElement("theme-grid");
const levelPanel = getElement("level-panel");
const quizPanel = getElement("quiz-panel");
const resultsPanel = getElement("results-panel");
const emptyState = getElement("empty-state");

const themeTitle = getElement("theme-title");
const themeDescription = getElement("theme-description");
const levelsContainer = getElement("levels-container");

const quizTitle = getElement("quiz-title");
const quizBadge = getElement("quiz-badge");
const questionCounter = getElement("question-counter");
const scoreLive = getElement("score-live");
const progressFill = getElement("progress-fill");
const questionContainer = getElement("question-container");
const feedbackContainer = getElement("feedback-container");
const message = getElement("message");

const previousButton = getElement("previous-button");
const nextButton = getElement("next-button");
const finishButton = getElement("finish-button");

const scoreNumber = getElement("score-number");
const scorePercent = getElement("score-percent");
const resultMessage = getElement("result-message");
const reviewContainer = getElement("review-container");
const retryButton = getElement("retry-button");
const continueButton = getElement("continue-button");

function elementsAreReady() {
  const requiredElements = [
    loginButton,
    logoutButton,
    userArea,
    userName,
    userPhoto,
    themeGrid,
    levelPanel,
    quizPanel,
    resultsPanel,
    emptyState,
    themeTitle,
    themeDescription,
    levelsContainer,
    quizTitle,
    quizBadge,
    questionCounter,
    scoreLive,
    progressFill,
    questionContainer,
    feedbackContainer,
    message,
    previousButton,
    nextButton,
    finishButton,
    scoreNumber,
    scorePercent,
    resultMessage,
    reviewContainer,
    retryButton,
    continueButton
  ];

  return requiredElements.every(Boolean);
}

function shuffle(array) {
  const copied = [...array];

  for (let index = copied.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(
      Math.random() * (index + 1)
    );

    [
      copied[index],
      copied[randomIndex]
    ] = [
      copied[randomIndex],
      copied[index]
    ];
  }

  return copied;
}

function levelLabel(level) {
  const labels = {
    debutant: "Débutant",
    intermediaire: "Intermédiaire",
    avance: "Avancé"
  };

  return labels[level] || level;
}

function levelKey(theme, level) {
  return `${theme}-${level}`;
}

function isThemeUnlocked(theme) {
  return Boolean(
    userProgress.unlockedThemes?.includes(theme)
  );
}

function isLevelUnlocked(theme, level) {
  return Boolean(
    userProgress.unlockedLevels?.[theme]?.includes(level)
  );
}

function isCompleted(theme, level) {
  return Boolean(
    userProgress.completedLevels?.[
      levelKey(theme, level)
    ]
  );
}

function getBestScore(theme, level) {
  return Number(
    userProgress.bestScores?.[
      levelKey(theme, level)
    ] || 0
  );
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

  userName.textContent =
    user.displayName || "Utilisateur";

  userPhoto.src =
    user.photoURL ||
    "https://via.placeholder.com/44";

  userPhoto.alt =
    `Photo de ${user.displayName || "l'utilisateur"}`;
}

function renderThemes() {
  themeGrid.replaceChildren();

  themeOrder.forEach((theme, index) => {
    const data = quizData[theme];

    if (!data) {
      return;
    }

    const unlocked =
      isThemeUnlocked(theme);

    const completed =
      levelOrder.every(level =>
        isCompleted(theme, level)
      );

    const button =
      document.createElement("button");

    button.type = "button";
    button.className = "theme-card";
    button.disabled =
      !currentUser || !unlocked;

    if (completed) {
      button.classList.add("completed");
    }

    const icons = [
      "📘",
      "🔗",
      "📊"
    ];

    const statusText =
      !currentUser
        ? "Connecte-toi"
        : completed
          ? "Thème terminé ✓"
          : unlocked
            ? "Continuer →"
            : "Verrouillé";

    const statusLabel =
      completed
        ? "✓ Terminé"
        : unlocked
          ? "Disponible"
          : "🔒 Verrouillé";

    const statusClass =
      completed
        ? "pill-success"
        : unlocked
          ? ""
          : "pill-lock";

    button.innerHTML = `
      <div class="theme-icon">
        ${icons[index] || "📚"}
      </div>

      <h3>
        ${index + 1}. ${data.title}
      </h3>

      <p>
        ${data.description}
      </p>

      <div class="theme-footer">
        <span>${statusText}</span>

        <span class="pill ${statusClass}">
          ${statusLabel}
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
  if (
    !currentUser ||
    !isThemeUnlocked(theme)
  ) {
    return;
  }

  currentTheme = theme;
  currentLevel = null;

  emptyState.hidden = true;
  levelPanel.hidden = false;
  quizPanel.hidden = true;
  resultsPanel.hidden = true;

  themeTitle.textContent =
    quizData[theme].title;

  themeDescription.textContent =
    quizData[theme].description;

  renderLevels();

  const quizSection =
    document.getElementById("quiz");

  if (quizSection) {
    quizSection.scrollIntoView({
      behavior: "smooth"
    });
  }
}

function renderLevels() {
  levelsContainer.replaceChildren();

  if (!currentTheme) {
    return;
  }

  levelOrder.forEach(level => {
    const unlocked =
      isLevelUnlocked(currentTheme, level);

    const completed =
      isCompleted(currentTheme, level);

    const score =
      getBestScore(currentTheme, level);

    const button =
      document.createElement("button");

    button.type = "button";
    button.className = "level-card";
    button.disabled = !unlocked;

    if (completed) {
      button.classList.add("completed");
    }

    const description =
      unlocked
        ? "10 questions pour valider ce niveau."
        : "Termine le niveau précédent.";

    let scoreText;

    if (completed) {
      scoreText = `✓ Réussi : ${score}/10`;
    } else if (unlocked && score > 0) {
      scoreText = `Meilleur score : ${score}/10`;
    } else if (unlocked) {
      scoreText = "Disponible";
    } else {
      scoreText = "🔒 Verrouillé";
    }

    button.innerHTML = `
      <strong>${levelLabel(level)}</strong>
      <span>${description}</span>
      <small>${scoreText}</small>
    `;

    button.addEventListener("click", () => {
      startQuiz(level);
    });

    levelsContainer.appendChild(button);
  });
}

function prepareQuestions(theme, level) {
  const questions =
    quizData?.[theme]?.levels?.[level] || [];

  return questions.map(question => ({
    ...question,
    options: shuffle(question.options || [])
  }));
}

function startQuiz(level) {
  if (
    !currentTheme ||
    !isLevelUnlocked(currentTheme, level)
  ) {
    return;
  }

  currentLevel = level;

  currentQuestions =
    prepareQuestions(
      currentTheme,
      currentLevel
    );

  if (currentQuestions.length === 0) {
    alert(
      "Aucune question disponible pour ce niveau."
    );
    return;
  }

  currentIndex = 0;

  answers = Array(
    currentQuestions.length
  ).fill(null);

  validated = Array(
    currentQuestions.length
  ).fill(false);

  levelPanel.hidden = true;
  quizPanel.hidden = false;
  resultsPanel.hidden = true;

  quizTitle.textContent =
    quizData[currentTheme].title;

  quizBadge.textContent =
    `Niveau ${levelLabel(level)}`;

  renderQuestion();
}

function getCurrentScore() {
  return answers.reduce(
    (score, answer, index) => {
      const question =
        currentQuestions[index];

      return score + (
        answer === question.correct
          ? 1
          : 0
      );
    },
    0
  );
}

function renderQuestion() {
  const question =
    currentQuestions[currentIndex];

  const total =
    currentQuestions.length;

  if (!question || total === 0) {
    return;
  }

  questionCounter.textContent =
    `Question ${currentIndex + 1} sur ${total}`;

  scoreLive.textContent =
    `Score actuel : ${getCurrentScore()}`;

  progressFill.style.width =
    `${((currentIndex + 1) / total) * 100}%`;

  questionContainer.replaceChildren();
  feedbackContainer.replaceChildren();
  message.textContent = "";

  const title =
    document.createElement("h3");

  title.textContent =
    question.text;

  const options =
    document.createElement("div");

  options.className = "options";

  question.options.forEach(
    (option, index) => {
      const label =
        document.createElement("label");

      label.className = "option";

      const input =
        document.createElement("input");

      input.type = "radio";
      input.name = "answer";
      input.value = option;
      input.checked =
        answers[currentIndex] === option;
      input.disabled =
        validated[currentIndex];

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

      input.addEventListener(
        "change",
        () => {
          answers[currentIndex] = option;
          renderQuestion();
        }
      );

      const letter =
        document.createElement("span");

      letter.className =
        "option-letter";

      letter.textContent =
        String.fromCharCode(65 + index);

      const text =
        document.createElement("span");

      text.textContent = option;

      label.append(
        input,
        letter,
        text
      );

      options.appendChild(label);
    }
  );

  questionContainer.append(
    title,
    options
  );

  if (validated[currentIndex]) {
    const correct =
      answers[currentIndex] === question.correct;

    const feedback =
      document.createElement("div");

    feedback.className =
      `feedback ${
        correct
          ? "correct"
          : "incorrect"
      }`;

    const feedbackTitle =
      document.createElement("strong");

    feedbackTitle.textContent =
      correct
        ? "Bonne réponse !"
        : `Réponse correcte : ${question.correct}`;

    const feedbackText =
      document.createElement("span");

    feedbackText.textContent =
      question.explanation || "";

    feedback.append(
      feedbackTitle,
      feedbackText
    );

    feedbackContainer.appendChild(
      feedback
    );
  }

  previousButton.disabled =
    currentIndex === 0;

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

  if (
    currentIndex <
    currentQuestions.length - 1
  ) {
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

  const missingIndex =
    answers.findIndex(
      answer => answer === null
    );

  if (missingIndex !== -1) {
    currentIndex = missingIndex;
    renderQuestion();

    message.textContent =
      "Réponds à toutes les questions avant de terminer.";

    return;
  }

  if (!currentUser) {
    alert(
      "Tu dois être connecté pour enregistrer ton résultat."
    );
    return;
  }

  const score =
    getCurrentScore();

  finishButton.disabled = true;
  finishButton.textContent =
    "Enregistrement...";

  try {
    const result =
      await saveQuizResult({
        theme: currentTheme,
        level: currentLevel,
        score,
        totalQuestions:
          currentQuestions.length
      });

    userProgress =
      normalizeProgress(result.progress);

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
    console.error(
      "Erreur complète Firestore :",
      error
    );

    const errorCode =
      error?.code || "code_inconnu";

    const errorMessage =
      error?.message || String(error);

    message.textContent =
      `Erreur Firebase : ${errorCode}`;

    alert(
      `Erreur Firebase\n\n` +
      `Code : ${errorCode}\n\n` +
      `Message : ${errorMessage}`
    );
  } finally {
    finishButton.disabled = false;
    finishButton.textContent =
      "Voir mon résultat";
  }
}

function renderReview() {
  reviewContainer.replaceChildren();

  currentQuestions.forEach(
    (question, index) => {
      const good =
        answers[index] === question.correct;

      const article =
        document.createElement("article");

      article.className =
        "review-item";

      const title =
        document.createElement("h3");

      title.textContent =
        `${index + 1}. ${question.text}`;

      const status =
        document.createElement("span");

      status.className =
        `review-status ${
          good ? "good" : "bad"
        }`;

      status.textContent =
        good
          ? "Bonne réponse"
          : "À revoir";

      const answer =
        document.createElement("p");

      const answerLabel =
        document.createElement("strong");

      answerLabel.textContent =
        "Ta réponse : ";

      answer.append(
        answerLabel,
        document.createTextNode(
          answers[index] || "Aucune réponse"
        )
      );

      const correct =
        document.createElement("p");

      const correctLabel =
        document.createElement("strong");

      correctLabel.textContent =
        "Bonne réponse : ";

      correct.append(
        correctLabel,
        document.createTextNode(
          question.correct
        )
      );

      const explanation =
        document.createElement("div");

      explanation.className =
        "explanation";

      const explanationLabel =
        document.createElement("strong");

      explanationLabel.textContent =
        "Explication : ";

      explanation.append(
        explanationLabel,
        document.createTextNode(
          question.explanation || ""
        )
      );

      article.append(
        title,
        status,
        answer,
        correct,
        explanation
      );

      reviewContainer.appendChild(article);
    }
  );
}

function configureResultButtons(result) {
  retryButton.hidden = false;
  continueButton.hidden =
    !result.passed;

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

  const theme =
    userProgress.currentTheme;

  const level =
    userProgress.currentLevel;

  if (
    theme &&
    level &&
    isThemeUnlocked(theme) &&
    isLevelUnlocked(theme, level)
  ) {
    openTheme(theme);
    startQuiz(level);
  } else {
    showHome();
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

if (elementsAreReady()) {
  loginButton.addEventListener(
    "click",
    async () => {
      try {
        await signInWithPopup(
          auth,
          googleProvider
        );
      } catch (error) {
        console.error(
          "Erreur connexion Google :",
          error
        );

        const errorCode =
          error?.code || "code_inconnu";

        const errorMessage =
          error?.message || String(error);

        alert(
          `Connexion impossible\n\n` +
          `Code : ${errorCode}\n\n` +
          `Message : ${errorMessage}`
        );
      }
    }
  );

  logoutButton.addEventListener(
    "click",
    async () => {
      try {
        await signOut(auth);
      } catch (error) {
        console.error(
          "Erreur déconnexion :",
          error
        );

        alert(
          `Erreur pendant la déconnexion : ${
            error?.message || error
          }`
        );
      }
    }
  );

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
    () => {
      startQuiz(currentLevel);
    }
  );

  continueButton.addEventListener(
    "click",
    continueProgression
  );

  const backToThemes =
    document.getElementById("back-to-themes");

  if (backToThemes) {
    backToThemes.addEventListener(
      "click",
      showHome
    );
  }

  onAuthStateChanged(
    auth,
    async user => {
      currentUser = user;
      renderUser(user);

      if (!user) {
        userProgress =
          normalizeProgress(defaultProgress);

        showHome();
        return;
      }

      try {
        console.log(
          "Utilisateur connecté :",
          user.uid
        );

        userProgress =
          await createOrUpdateUserProfile(user);

        console.log(
          "Progression chargée :",
          userProgress
        );

        renderThemes();

        const savedTheme =
          userProgress.currentTheme;

        const savedLevel =
          userProgress.currentLevel;

        if (
          savedTheme &&
          savedLevel &&
          isThemeUnlocked(savedTheme) &&
          isLevelUnlocked(
            savedTheme,
            savedLevel
          )
        ) {
          openTheme(savedTheme);
        }
      } catch (error) {
        console.error(
          "Erreur chargement profil Firestore :",
          error
        );

        const errorCode =
          error?.code || "code_inconnu";

        const errorMessage =
          error?.message || String(error);

        alert(
          `Impossible de charger ta progression.\n\n` +
          `Code : ${errorCode}\n\n` +
          `Message : ${errorMessage}\n\n` +
          `Vérifie Firestore, les règles et le domaine autorisé.`
        );
      }
    }
  );

  showHome();
} else {
  console.error(
    "Le fichier index.html ne contient pas tous les éléments nécessaires."
  );
}
