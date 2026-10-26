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
  levelOrder,
  PASS_RATIO,
  findQuestion
} from "./questions.js";

import { getCourse, hasContent } from "./courses.js";

import {
  defaultProgress,
  normalizeProgress,
  createOrUpdateUserProfile,
  saveQuizResult,
  recordExamResult,
  recordRevisionResult,
  removeMistake,
  markCourseRead,
  checkIsAdmin
} from "./configstore.js";

/* ============================================================
   Constantes et état
============================================================ */

const VIEWS = ["quiz", "exam", "revision", "courses"];
const EXAM_COUNTS = [10, 20, 30];
const SECONDS_PER_QUESTION = 45;
const PASS_PERCENT = Math.round(PASS_RATIO * 100);

const themeIcons = {
  fondamentaux: "📘",
  manipulation: "🛠️",
  jointures: "🔗",
  avance: "📊"
};

let currentUser = null;
let isAdmin = false;
let userProgress = normalizeProgress(defaultProgress);

let activeView = "quiz";
let sessionMode = "level"; // "level" | "revision"

let currentTheme = null;
let currentLevel = null;
let currentQuestions = [];
let currentIndex = 0;
let answers = [];
let validated = [];

// Examen
let examRunning = false;
let examQuestions = [];
let examAnswers = [];
let examIndex = 0;
let examLimit = 0;
let examStart = 0;
let examEndsAt = 0;
let examTimer = null;
let examSelectedThemes = new Set();
let examCount = 20;

// Révision
let revisionFilter = "all";

// Cours
let openedCourse = null;

/* ============================================================
   Éléments HTML
============================================================ */

const ids = [
  "google-login-button", "logout-button", "user-area", "user-name", "user-avatar",
  "journey-button", "admin-link", "revision-count", "hero",
  "view-quiz", "view-exam", "view-revision", "view-courses",
  "theme-grid", "level-panel", "quiz-panel", "results-panel", "empty-state",
  "theme-title", "theme-description", "levels-container", "quiz-title", "quiz-badge",
  "question-counter", "score-live", "progress-fill", "question-container",
  "feedback-container", "message", "previous-button", "next-button", "finish-button",
  "score-number", "score-percent", "result-message", "review-container",
  "retry-button", "continue-button", "back-to-themes",
  "exam-gate", "exam-setup", "exam-themes", "exam-counts", "exam-summary", "exam-start",
  "exam-last", "exam-run", "exam-timer", "exam-progress-text", "exam-submit",
  "exam-progress-fill", "exam-nav", "exam-qlabel", "exam-question", "exam-prev",
  "exam-next", "exam-result", "exam-result-message", "exam-result-score",
  "exam-result-percent", "exam-result-stats", "exam-result-themes", "exam-review",
  "exam-again", "exam-to-revision",
  "revision-gate", "revision-home", "revision-stats", "revision-filter",
  "revision-start", "revision-random", "revision-list",
  "courses-home", "course-reader", "course-back", "course-title", "course-meta",
  "course-body", "course-read-button", "course-quiz-button",
  "journey-modal", "journey-close", "j-name", "j-subtitle", "j-ring", "j-progress-text",
  "j-best", "j-completed", "j-quizzes", "j-average", "j-evolution", "j-themes",
  "j-path", "j-history", "j-continue"
];

const el = {};
const missing = [];

ids.forEach(id => {
  el[id] = document.getElementById(id);
  if (!el[id]) missing.push(id);
});

const $ = id => el[id];
const tabs = [...document.querySelectorAll(".tab")];

/* ============================================================
   Outils
============================================================ */

function shuffle(array) {
  const copied = [...array];
  for (let i = copied.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
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

const levelKey = (theme, level) => `${theme}-${level}`;

const isThemeUnlocked = theme =>
  Boolean(userProgress.unlockedThemes?.includes(theme));

const isLevelUnlocked = (theme, level) =>
  Boolean(userProgress.unlockedLevels?.[theme]?.includes(level));

const isCompleted = (theme, level) =>
  Boolean(userProgress.completedLevels?.[levelKey(theme, level)]);

const getBestPercent = (theme, level) =>
  Number(userProgress.bestPercent?.[levelKey(theme, level)] || 0);

const isThemeCompleted = theme =>
  levelOrder.every(level => isCompleted(theme, level));

function getFirstName(user) {
  if (!user?.displayName) return "Utilisateur";
  return user.displayName.trim().split(/\s+/)[0] || "Utilisateur";
}

function entryPercent(entry) {
  return Math.round((entry.score / (entry.total || 1)) * 100);
}

function formatDate(timestamp, withYear = false) {
  return new Date(timestamp).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    ...(withYear ? { year: "2-digit" } : {})
  });
}

function formatTime(totalSeconds) {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function makeElement(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function statCard(icon, value, label) {
  return `<article class="j-stat"><span>${icon}</span><strong>${value}</strong><small>${label}</small></article>`;
}

function getStats() {
  const completedCount = Object.values(userProgress.completedLevels || {}).filter(Boolean).length;
  const totalLevels = themeOrder.length * levelOrder.length;
  const progressPercent = Math.round((completedCount / totalLevels) * 100);

  const percents = Object.values(userProgress.bestPercent || {}).map(Number);
  const bestPercent = percents.length ? Math.max(...percents) : 0;

  const recent = (userProgress.history || []).slice(-10);
  const average = recent.length
    ? Math.round(recent.reduce((sum, e) => sum + entryPercent(e), 0) / recent.length)
    : 0;

  return { completedCount, totalLevels, progressPercent, bestPercent, average };
}

function buildPool(themes) {
  const pool = [];

  themes.forEach(theme => {
    if (!isThemeUnlocked(theme)) return;

    levelOrder.forEach(level => {
      if (!isLevelUnlocked(theme, level)) return;

      (quizData[theme]?.levels?.[level] || []).forEach(question => {
        pool.push({ ...question, theme, level });
      });
    });
  });

  return pool;
}

function withShuffledOptions(question) {
  return { ...question, options: shuffle(question.options || []) };
}

/* ============================================================
   Navigation entre les vues
============================================================ */

function showView(name, tab = name) {
  if (examRunning && name !== "exam") {
    const leave = confirm(
      "Un examen est en cours. Si tu quittes cette page, il sera abandonné. Quitter ?"
    );
    if (!leave) return false;
    cancelExam();
  }

  if (name === "quiz" && tab === "quiz" && sessionMode === "revision") {
    sessionMode = "level";
    showHome();
  }

  VIEWS.forEach(view => {
    $(`view-${view}`).hidden = view !== name;
  });

  $("hero").hidden = name !== "quiz";
  tabs.forEach(button => button.classList.toggle("active", button.dataset.view === tab));
  activeView = name;

  if (name === "exam" && !examRunning) renderExamSetup();
  if (name === "revision") renderRevision();
  if (name === "courses") renderCoursesHome();

  window.scrollTo({ top: 0, behavior: "smooth" });
  return true;
}

/* ============================================================
   Compte utilisateur
============================================================ */

function renderUser(user) {
  if (!user) {
    $("google-login-button").hidden = false;
    $("logout-button").hidden = true;
    $("user-area").hidden = true;
    $("admin-link").hidden = true;
    return;
  }

  $("google-login-button").hidden = true;
  $("logout-button").hidden = false;
  $("user-area").hidden = false;
  $("admin-link").hidden = !isAdmin;

  const name = user.displayName || "Utilisateur";
  $("user-name").textContent = getFirstName(user);
  $("user-avatar").textContent = name.trim().charAt(0).toUpperCase();
}

function updateRevisionBadge() {
  const count = Object.keys(userProgress.mistakes || {}).length;
  $("revision-count").textContent = String(count);
  $("revision-count").hidden = !currentUser || count === 0;
}

/* ============================================================
   Thèmes et niveaux
============================================================ */

function renderThemes() {
  $("theme-grid").replaceChildren();

  themeOrder.forEach((theme, index) => {
    const data = quizData[theme];
    if (!data) return;

    const unlocked = isThemeUnlocked(theme);
    const completed = isThemeCompleted(theme);
    const doneLevels = levelOrder.filter(level => isCompleted(theme, level)).length;

    const button = document.createElement("button");
    button.type = "button";
    button.className = `theme-card theme-${index + 1}`;
    button.disabled = !currentUser || !unlocked;
    if (completed) button.classList.add("completed");

    const statusText = !currentUser
      ? "Connecte-toi"
      : completed
        ? "Thème terminé ✓"
        : unlocked
          ? "Continuer →"
          : "Verrouillé";

    const statusLabel = completed ? "✓ Terminé" : unlocked ? "Disponible" : "🔒 Verrouillé";
    const statusClass = completed ? "pill-success" : unlocked ? "" : "pill-lock";
    const width = Math.round((doneLevels / levelOrder.length) * 100);

    button.innerHTML = `
      <div class="theme-icon">${themeIcons[theme] || "📚"}</div>
      <h3>${index + 1}. ${data.title}</h3>
      <p>${data.description}</p>
      <div class="theme-mini-track"><div class="theme-mini-fill" style="width:${width}%"></div></div>
      <div class="theme-footer">
        <span>${statusText}</span>
        <span class="pill ${statusClass}">${statusLabel}</span>
      </div>
    `;

    button.addEventListener("click", () => openTheme(theme));
    $("theme-grid").appendChild(button);
  });
}

function openTheme(theme, scroll = true) {
  if (!currentUser || !isThemeUnlocked(theme)) return;

  sessionMode = "level";
  currentTheme = theme;
  currentLevel = null;

  $("empty-state").hidden = true;
  $("level-panel").hidden = false;
  $("quiz-panel").hidden = true;
  $("results-panel").hidden = true;

  $("theme-title").textContent = quizData[theme].title;
  $("theme-description").textContent = quizData[theme].description;

  renderLevels();

  if (scroll) {
    document.getElementById("quiz")?.scrollIntoView({ behavior: "smooth" });
  }
}

function renderLevels() {
  $("levels-container").replaceChildren();
  if (!currentTheme) return;

  const theme = currentTheme;

  levelOrder.forEach(level => {
    const unlocked = isLevelUnlocked(theme, level);
    const completed = isCompleted(theme, level);
    const best = getBestPercent(theme, level);
    const count = quizData[theme].levels[level]?.length || 0;

    const wrapper = makeElement("div", "level-item");

    const button = document.createElement("button");
    button.type = "button";
    button.className = "level-card";
    button.disabled = !unlocked;
    if (completed) button.classList.add("completed");

    const description = unlocked
      ? `${count} questions · ${PASS_PERCENT} % pour valider ce niveau.`
      : "Réussis le niveau précédent pour le débloquer.";

    let scoreText;
    if (completed) scoreText = `✓ Réussi · meilleur score : ${best} %`;
    else if (unlocked && best > 0) scoreText = `Meilleur score : ${best} %`;
    else if (unlocked) scoreText = "Disponible";
    else scoreText = "🔒 Verrouillé";

    button.innerHTML = `
      <strong>${levelLabel(level)}</strong>
      <span>${description}</span>
      <small>${scoreText}</small>
    `;

    button.addEventListener("click", () => startQuiz(level));

    const link = makeElement(
      "button",
      "course-link",
      hasContent(getCourse(theme, level))
        ? "📖 Lire la fiche de cours"
        : "📖 Fiche de cours (bientôt)"
    );
    link.type = "button";
    link.addEventListener("click", () => {
      if (showView("courses")) openCourse(theme, level);
    });

    wrapper.append(button, link);
    $("levels-container").appendChild(wrapper);
  });
}

/* ============================================================
   Quiz (niveaux et révision)
============================================================ */

function startQuiz(level) {
  if (!currentTheme || !isLevelUnlocked(currentTheme, level)) return;

  const questions = shuffle(quizData?.[currentTheme]?.levels?.[level] || [])
    .map(withShuffledOptions);

  if (questions.length === 0) {
    alert("Aucune question disponible pour ce niveau.");
    return;
  }

  currentLevel = level;

  beginSession(questions, {
    mode: "level",
    title: quizData[currentTheme].title,
    badge: `Niveau ${levelLabel(level)}`
  });
}

function beginSession(questions, { mode, title, badge }) {
  sessionMode = mode;
  currentQuestions = questions;
  currentIndex = 0;
  answers = Array(questions.length).fill(null);
  validated = Array(questions.length).fill(false);

  $("empty-state").hidden = true;
  $("level-panel").hidden = true;
  $("quiz-panel").hidden = false;
  $("results-panel").hidden = true;

  $("quiz-title").textContent = title;
  $("quiz-badge").textContent = badge;

  renderQuestion();
}

function getCurrentScore() {
  return answers.reduce(
    (score, answer, index) =>
      score + (answer === currentQuestions[index].correct ? 1 : 0),
    0
  );
}

function renderQuestion() {
  const question = currentQuestions[currentIndex];
  const total = currentQuestions.length;
  if (!question || total === 0) return;

  const isValidated = validated[currentIndex];

  $("question-counter").textContent = `Question ${currentIndex + 1} sur ${total}`;
  $("score-live").textContent = `Bonnes réponses : ${getCurrentScore()}`;
  $("progress-fill").style.width = `${((currentIndex + 1) / total) * 100}%`;

  $("question-container").replaceChildren();
  $("feedback-container").replaceChildren();
  $("message").textContent = "";

  const title = document.createElement("h3");
  title.textContent = question.text;

  const options = makeElement("div", "options");

  question.options.forEach((option, index) => {
    const label = makeElement("label", "option");

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "answer";
    input.value = option;
    input.checked = answers[currentIndex] === option;
    input.disabled = isValidated;

    if (answers[currentIndex] === option && !isValidated) label.classList.add("selected");
    if (isValidated && option === question.correct) label.classList.add("correct");
    if (isValidated && answers[currentIndex] === option && option !== question.correct) {
      label.classList.add("incorrect");
    }

    input.addEventListener("change", () => {
      answers[currentIndex] = option;
      renderQuestion();
    });

    label.append(
      input,
      makeElement("span", "option-letter", String.fromCharCode(65 + index)),
      makeElement("span", "", option)
    );

    options.appendChild(label);
  });

  $("question-container").append(title, options);

  if (isValidated) {
    const correct = answers[currentIndex] === question.correct;

    const feedback = makeElement("div", `feedback ${correct ? "correct" : "incorrect"}`);
    feedback.append(
      makeElement(
        "strong",
        "",
        correct ? "✅ Bonne réponse !" : `❌ Réponse correcte : ${question.correct}`
      ),
      makeElement("span", "", question.explanation || "")
    );

    $("feedback-container").appendChild(feedback);
  }

  const isLast = currentIndex === total - 1;

  $("previous-button").disabled = currentIndex === 0;
  $("next-button").hidden = isLast;
  $("finish-button").hidden = !isLast;

  $("next-button").textContent = isValidated
    ? "Question suivante →"
    : "Valider puis continuer →";

  $("finish-button").textContent = isValidated
    ? "Voir mon résultat"
    : "Valider la réponse";
}

function validateCurrentQuestion() {
  if (!answers[currentIndex]) {
    $("message").textContent = "Choisis une réponse avant de continuer.";
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

function showResults(score, total, percent, message) {
  $("quiz-panel").hidden = true;
  $("results-panel").hidden = false;

  $("score-number").textContent = `${score}/${total}`;
  $("score-percent").textContent = `${percent} %`;
  $("result-message").textContent = message;

  renderReviewInto($("review-container"), currentQuestions, answers);

  window.scrollTo({
    top: document.getElementById("quiz").offsetTop - 80,
    behavior: "smooth"
  });
}

async function finishQuiz() {
  if (!validated[currentIndex]) {
    validateCurrentQuestion();
    return;
  }

  const missingIndex = answers.findIndex(answer => answer === null);

  if (missingIndex !== -1) {
    currentIndex = missingIndex;
    renderQuestion();
    $("message").textContent = "Réponds à toutes les questions avant de terminer.";
    return;
  }

  if (!currentUser) {
    alert("Tu dois être connecté pour enregistrer ton résultat.");
    return;
  }

  const score = getCurrentScore();
  const total = currentQuestions.length;
  const percent = Math.round((score / total) * 100);

  const wrongIds = [];
  const correctIds = [];
  currentQuestions.forEach((question, index) => {
    (answers[index] === question.correct ? correctIds : wrongIds).push(question.id);
  });

  $("finish-button").disabled = true;
  $("finish-button").textContent = "Enregistrement...";

  try {
    if (sessionMode === "revision") {
      const progress = await recordRevisionResult({ wrongIds, correctIds });
      userProgress = normalizeProgress(progress);

      showResults(
        score,
        total,
        percent,
        `${score} bonne(s) réponse(s) sur ${total}. Les questions réussies sont retirées de ta liste, les autres restent à revoir.`
      );

      $("retry-button").textContent = "Retour à la révision";
      $("continue-button").hidden = true;
    } else {
      const result = await saveQuizResult({
        theme: currentTheme,
        level: currentLevel,
        score,
        totalQuestions: total,
        missedIds: wrongIds
      });

      userProgress = normalizeProgress(result.progress);

      let message;
      if (!result.passed) {
        message = `Il faut au moins ${PASS_PERCENT} % pour valider ce niveau. Relis les corrections ci-dessous : tes erreurs sont aussi dans l'onglet Révision.`;
      } else if (result.perfect) {
        message = "🏆 Score parfait ! Tu maîtrises ce niveau, la suite est débloquée.";
      } else {
        message = "🎉 Bravo, niveau validé ! Tu peux continuer ou refaire le niveau pour viser le sans-faute.";
      }

      showResults(score, total, result.percent, message);
      configureResultButtons(result);
    }

    renderThemes();
    updateRevisionBadge();
  } catch (error) {
    console.error("Erreur complète Firestore :", error);

    const errorCode = error?.code || "code_inconnu";
    const errorMessage = error?.message || String(error);

    $("message").textContent = `Erreur Firebase : ${errorCode}`;
    alert(`Erreur Firebase\n\nCode : ${errorCode}\n\nMessage : ${errorMessage}`);
  } finally {
    $("finish-button").disabled = false;
    $("finish-button").textContent = "Voir mon résultat";
  }
}

function renderReviewInto(container, questions, answerList) {
  container.replaceChildren();

  questions.forEach((question, index) => {
    const given = answerList[index];
    const good = given === question.correct;

    const article = makeElement("article", "review-item");

    const status = makeElement(
      "span",
      `review-status ${good ? "good" : "bad"}`,
      good ? "Bonne réponse" : given ? "À revoir" : "Sans réponse"
    );

    const answer = document.createElement("p");
    answer.append(
      makeElement("strong", "", "Ta réponse : "),
      document.createTextNode(given || "Aucune réponse")
    );

    const correct = document.createElement("p");
    correct.append(
      makeElement("strong", "", "Bonne réponse : "),
      document.createTextNode(question.correct)
    );

    const explanation = makeElement("div", "explanation");
    explanation.append(
      makeElement("strong", "", "💡 Explication : "),
      document.createTextNode(question.explanation || "")
    );

    article.append(
      makeElement("h3", "", `${index + 1}. ${question.text}`),
      status,
      answer,
      correct,
      explanation
    );

    container.appendChild(article);
  });
}

function configureResultButtons(result) {
  $("retry-button").hidden = false;
  $("continue-button").hidden = !result.passed;

  $("retry-button").textContent = result.perfect
    ? "Refaire pour réviser"
    : "Refaire ce niveau";

  if (!result.passed) return;

  if (result.nextTheme && result.nextTheme !== currentTheme) {
    $("continue-button").textContent = "Passer au thème suivant →";
  } else if (result.nextLevel) {
    $("continue-button").textContent = `Passer au niveau ${levelLabel(result.nextLevel)} →`;
  } else {
    $("continue-button").textContent = "🎓 Parcours terminé, voir mon parcours";
  }
}

function continueProgression() {
  if (!currentUser) return;

  closeJourney();

  const theme = userProgress.currentTheme;
  const level = userProgress.currentLevel;

  if (!showView("quiz")) return;

  if (theme && level && isThemeUnlocked(theme) && isLevelUnlocked(theme, level)) {
    openTheme(theme);
    startQuiz(level);
  } else {
    showHome();
  }
}

function onContinueButton() {
  if (
    themeOrder.every(isThemeCompleted) &&
    $("continue-button").textContent.includes("Parcours terminé")
  ) {
    openJourney();
    return;
  }
  continueProgression();
}

function onRetryButton() {
  if (sessionMode === "revision") {
    showView("revision");
  } else {
    startQuiz(currentLevel);
  }
}

function showHome() {
  currentTheme = null;
  currentLevel = null;

  $("empty-state").hidden = false;
  $("level-panel").hidden = true;
  $("quiz-panel").hidden = true;
  $("results-panel").hidden = true;

  const title = $("empty-state").querySelector("h3");
  const text = $("empty-state").querySelector("p");

  if (currentUser) {
    title.textContent = "Choisis un thème pour commencer";
    text.textContent =
      "Sélectionne un thème disponible ci-dessus. Les niveaux se débloquent au fil de ta progression.";
  } else {
    title.textContent = "Connecte-toi pour commencer";
    text.textContent =
      "Ta progression, tes scores et ton évolution seront sauvegardés dans ton compte Google.";
  }

  renderThemes();
}

/* ============================================================
   Mode examen
============================================================ */

function renderExamSetup() {
  const logged = Boolean(currentUser);

  $("exam-gate").hidden = logged;
  $("exam-setup").hidden = !logged;
  $("exam-run").hidden = true;
  $("exam-result").hidden = true;

  if (!logged) return;

  const unlocked = themeOrder.filter(isThemeUnlocked);

  examSelectedThemes = new Set(
    [...examSelectedThemes].filter(theme => unlocked.includes(theme))
  );
  if (examSelectedThemes.size === 0) {
    unlocked.forEach(theme => examSelectedThemes.add(theme));
  }

  // Chips des thèmes
  $("exam-themes").replaceChildren();
  themeOrder.forEach(theme => {
    const available = unlocked.includes(theme);
    const chip = makeElement(
      "button",
      "chip",
      `${themeIcons[theme] || "📚"} ${quizData[theme].title}${available ? "" : " 🔒"}`
    );
    chip.type = "button";
    chip.disabled = !available;
    chip.setAttribute("aria-pressed", String(examSelectedThemes.has(theme)));
    if (examSelectedThemes.has(theme)) chip.classList.add("active");

    chip.addEventListener("click", () => {
      if (examSelectedThemes.has(theme)) {
        if (examSelectedThemes.size === 1) return;
        examSelectedThemes.delete(theme);
      } else {
        examSelectedThemes.add(theme);
      }
      renderExamSetup();
    });

    $("exam-themes").appendChild(chip);
  });

  // Chips du nombre de questions
  const poolSize = buildPool([...examSelectedThemes]).length;

  $("exam-counts").replaceChildren();
  EXAM_COUNTS.forEach(count => {
    const chip = makeElement("button", "chip", `${count} questions`);
    chip.type = "button";
    chip.setAttribute("aria-pressed", String(examCount === count));
    if (examCount === count) chip.classList.add("active");

    chip.addEventListener("click", () => {
      examCount = count;
      renderExamSetup();
    });

    $("exam-counts").appendChild(chip);
  });

  const effective = Math.min(examCount, poolSize);

  $("exam-summary").textContent = poolSize === 0
    ? "Aucune question disponible : débloque d'abord un niveau."
    : `📝 ${effective} questions · ⏱️ ${formatTime(effective * SECONDS_PER_QUESTION)} · 🎯 réussite à ${PASS_PERCENT} %` +
      (poolSize < examCount ? ` (seulement ${poolSize} questions disponibles)` : "");

  $("exam-start").disabled = poolSize === 0;

  // Derniers examens
  $("exam-last").replaceChildren();
  const last = [...(userProgress.exams || [])].reverse().slice(0, 5);

  if (last.length === 0) {
    $("exam-last").appendChild(
      makeElement("p", "empty-chart", "Aucun examen passé pour l'instant. Lance-toi ! ⏱️")
    );
  } else {
    last.forEach(exam => {
      const good = exam.percent >= PASS_PERCENT;
      const row = makeElement("div", "j-history-item");

      const info = document.createElement("div");
      info.append(
        makeElement("strong", "", `Examen de ${exam.total} questions`),
        makeElement("small", "", `${formatDate(exam.at, true)} · ${formatTime(exam.used)} sur ${formatTime(exam.limit)}`)
      );

      row.append(
        info,
        makeElement(
          "span",
          `j-score ${good ? "good" : "bad"}`,
          `${exam.score}/${exam.total} · ${exam.percent} %`
        )
      );

      $("exam-last").appendChild(row);
    });
  }
}

function startExam() {
  const pool = buildPool([...examSelectedThemes]);
  const count = Math.min(examCount, pool.length);
  if (count === 0) return;

  examQuestions = shuffle(pool).slice(0, count).map(withShuffledOptions);
  examAnswers = Array(count).fill(null);
  examIndex = 0;
  examLimit = count * SECONDS_PER_QUESTION;
  examStart = Date.now();
  examEndsAt = examStart + examLimit * 1000;
  examRunning = true;

  $("exam-setup").hidden = true;
  $("exam-result").hidden = true;
  $("exam-run").hidden = false;

  renderExamQuestion();
  updateExamTimer();

  clearInterval(examTimer);
  examTimer = setInterval(updateExamTimer, 500);

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateExamTimer() {
  const remaining = Math.max(0, Math.ceil((examEndsAt - Date.now()) / 1000));

  $("exam-timer").textContent = `⏱️ ${formatTime(remaining)}`;
  $("exam-timer").classList.toggle("warning", remaining <= 60);

  if (remaining <= 0 && examRunning) {
    submitExam(true);
  }
}

function renderExamQuestion() {
  const question = examQuestions[examIndex];
  const total = examQuestions.length;
  if (!question) return;

  const answered = examAnswers.filter(answer => answer !== null).length;

  $("exam-qlabel").textContent = `Question ${examIndex + 1} sur ${total}`;
  $("exam-progress-text").textContent = `${answered}/${total} répondues`;
  $("exam-progress-fill").style.width = `${(answered / total) * 100}%`;

  $("exam-question").replaceChildren();

  const options = makeElement("div", "options");

  question.options.forEach((option, index) => {
    const label = makeElement("label", "option");
    if (examAnswers[examIndex] === option) label.classList.add("selected");

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "exam-answer";
    input.value = option;
    input.checked = examAnswers[examIndex] === option;

    input.addEventListener("change", () => {
      examAnswers[examIndex] = option;
      renderExamQuestion();
    });

    label.append(
      input,
      makeElement("span", "option-letter", String.fromCharCode(65 + index)),
      makeElement("span", "", option)
    );

    options.appendChild(label);
  });

  $("exam-question").append(makeElement("h3", "", question.text), options);

  // Grille de navigation
  $("exam-nav").replaceChildren();
  examQuestions.forEach((_, index) => {
    const button = makeElement("button", "exam-dot", String(index + 1));
    button.type = "button";
    if (examAnswers[index] !== null) button.classList.add("answered");
    if (index === examIndex) button.classList.add("current");

    button.addEventListener("click", () => {
      examIndex = index;
      renderExamQuestion();
    });

    $("exam-nav").appendChild(button);
  });

  $("exam-prev").disabled = examIndex === 0;
  $("exam-next").disabled = examIndex === total - 1;
}

function cancelExam() {
  clearInterval(examTimer);
  examRunning = false;
  $("exam-run").hidden = true;
  $("exam-result").hidden = true;
}

async function submitExam(auto = false) {
  if (!examRunning) return;

  if (!auto) {
    const unanswered = examAnswers.filter(answer => answer === null).length;
    const text = unanswered > 0
      ? `Il reste ${unanswered} question(s) sans réponse. Terminer l'examen quand même ?`
      : "Terminer l'examen et voir ta note ?";

    if (!confirm(text)) return;
  }

  clearInterval(examTimer);
  examRunning = false;

  const total = examQuestions.length;
  const used = Math.min(examLimit, Math.round((Date.now() - examStart) / 1000));

  let score = 0;
  let unanswered = 0;
  const byTheme = {};
  const missedIds = [];

  examQuestions.forEach((question, index) => {
    const given = examAnswers[index];
    const ok = given === question.correct;

    byTheme[question.theme] = byTheme[question.theme] || { ok: 0, total: 0 };
    byTheme[question.theme].total += 1;

    if (given === null) unanswered += 1;
    if (ok) {
      score += 1;
      byTheme[question.theme].ok += 1;
    } else {
      missedIds.push(question.id);
    }
  });

  const percent = Math.round((score / total) * 100);
  const grade = ((score / total) * 20).toFixed(1).replace(".", ",");
  const passed = percent >= PASS_PERCENT;

  $("exam-run").hidden = true;
  $("exam-result").hidden = false;

  $("exam-result-score").textContent = `${score}/${total}`;
  $("exam-result-percent").textContent = `${percent} %`;

  $("exam-result-message").textContent = auto
    ? `⏰ Temps écoulé ! ${passed ? "Tu as réussi l'examen 🎉" : "Il faut au moins " + PASS_PERCENT + " % pour réussir."}`
    : passed
      ? "🎉 Examen réussi, félicitations !"
      : `Il faut au moins ${PASS_PERCENT} % pour réussir l'examen. Passe par la révision puis retente.`;

  $("exam-result-stats").innerHTML =
    statCard("🎓", `${grade}/20`, "Note") +
    statCard("⏱️", formatTime(used), "Temps utilisé") +
    statCard("✅", String(score), "Bonnes réponses") +
    statCard("⚪", String(unanswered), "Sans réponse");

  $("exam-result-themes").innerHTML = Object.entries(byTheme).map(([theme, value]) => {
    const themePercent = Math.round((value.ok / value.total) * 100);
    return `
      <div class="j-bar wide">
        <span>${themeIcons[theme] || "📚"} ${quizData[theme].title}</span>
        <div class="j-bar-track">
          <div class="j-bar-fill ${themePercent >= PASS_PERCENT ? "passed" : ""}" style="width:${themePercent}%"></div>
        </div>
        <b>${value.ok}/${value.total}</b>
      </div>
    `;
  }).join("");

  renderReviewInto($("exam-review"), examQuestions, examAnswers);
  window.scrollTo({ top: 0, behavior: "smooth" });

  try {
    const progress = await recordExamResult({
      score,
      total,
      usedSeconds: used,
      limitSeconds: examLimit,
      byTheme,
      missedIds
    });

    userProgress = normalizeProgress(progress);
    updateRevisionBadge();
  } catch (error) {
    console.error("Erreur enregistrement examen :", error);
    $("exam-result-message").textContent +=
      ` (⚠️ Résultat non enregistré : ${error?.code || error?.message || "erreur"})`;
  }
}

/* ============================================================
   Espace de révision
============================================================ */

function getMistakeEntries() {
  return Object.entries(userProgress.mistakes || {})
    .map(([id, mistake]) => {
      const question = findQuestion(id);
      return question
        ? { id, question, wrong: Number(mistake.wrong || 1), at: Number(mistake.at || 0) }
        : null;
    })
    .filter(Boolean);
}

function renderRevision() {
  const logged = Boolean(currentUser);

  $("revision-gate").hidden = logged;
  $("revision-home").hidden = !logged;

  if (!logged) return;

  const all = getMistakeEntries();
  const themesWithMistakes = themeOrder.filter(theme =>
    all.some(entry => entry.question.theme === theme)
  );

  if (revisionFilter !== "all" && !themesWithMistakes.includes(revisionFilter)) {
    revisionFilter = "all";
  }

  const filtered = revisionFilter === "all"
    ? all
    : all.filter(entry => entry.question.theme === revisionFilter);

  const totalMisses = all.reduce((sum, entry) => sum + entry.wrong, 0);

  $("revision-stats").innerHTML =
    statCard("📌", String(all.length), "Questions à revoir") +
    statCard("🗂️", String(themesWithMistakes.length), "Thèmes concernés") +
    statCard("❌", String(totalMisses), "Erreurs cumulées");

  // Filtres
  $("revision-filter").replaceChildren();

  const makeChip = (value, text) => {
    const chip = makeElement("button", "chip", text);
    chip.type = "button";
    chip.setAttribute("aria-pressed", String(revisionFilter === value));
    if (revisionFilter === value) chip.classList.add("active");
    chip.addEventListener("click", () => {
      revisionFilter = value;
      renderRevision();
    });
    $("revision-filter").appendChild(chip);
  };

  makeChip("all", `Tous (${all.length})`);
  themesWithMistakes.forEach(theme => {
    const count = all.filter(entry => entry.question.theme === theme).length;
    makeChip(theme, `${themeIcons[theme] || "📚"} ${quizData[theme].title} (${count})`);
  });

  $("revision-start").disabled = filtered.length === 0;
  $("revision-random").disabled = buildPool(themeOrder).length === 0;

  // Liste
  $("revision-list").replaceChildren();

  if (all.length === 0) {
    const empty = makeElement("div", "gate");
    empty.append(
      makeElement("div", "empty-icon", "🎉"),
      makeElement("h3", "", "Aucune question à revoir !"),
      makeElement(
        "p",
        "",
        "Quand tu rates une question (quiz ou examen), elle apparaît ici avec sa correction. Tu peux aussi lancer une révision au hasard."
      )
    );
    $("revision-list").appendChild(empty);
    return;
  }

  themeOrder.forEach(theme => {
    const entries = filtered
      .filter(entry => entry.question.theme === theme)
      .sort((a, b) => b.wrong - a.wrong || b.at - a.at);

    if (entries.length === 0) return;

    const group = makeElement("section", "rev-group");
    group.appendChild(
      makeElement("h3", "", `${themeIcons[theme] || "📚"} ${quizData[theme].title}`)
    );

    entries.forEach(entry => {
      const { question } = entry;

      const details = document.createElement("details");
      details.className = "rev-item";

      const summary = document.createElement("summary");
      summary.append(
        makeElement("span", "rev-question", question.text),
        makeElement("span", "pill pill-danger", `${entry.wrong}× raté`),
        makeElement("span", "pill", levelLabel(question.level))
      );

      const body = makeElement("div", "rev-body");

      const correct = document.createElement("p");
      correct.append(
        makeElement("strong", "", "Bonne réponse : "),
        document.createTextNode(question.correct)
      );

      const explanation = makeElement("div", "explanation");
      explanation.append(
        makeElement("strong", "", "💡 Explication : "),
        document.createTextNode(question.explanation || "")
      );

      const master = makeElement("button", "button button-success button-sm", "✔ Je maîtrise cette question");
      master.type = "button";
      master.addEventListener("click", async () => {
        master.disabled = true;
        try {
          userProgress = normalizeProgress(await removeMistake(entry.id));
          updateRevisionBadge();
          renderRevision();
        } catch (error) {
          master.disabled = false;
          alert(`Erreur : ${error?.message || error}`);
        }
      });

      body.append(correct, explanation, master);
      details.append(summary, body);
      group.appendChild(details);
    });

    $("revision-list").appendChild(group);
  });
}

function startRevision(random = false) {
  let questions;

  if (random) {
    questions = shuffle(buildPool(themeOrder)).slice(0, 10);
  } else {
    const entries = getMistakeEntries().filter(
      entry => revisionFilter === "all" || entry.question.theme === revisionFilter
    );
    questions = shuffle(entries.map(entry => entry.question)).slice(0, 20);
  }

  if (questions.length === 0) return;

  if (!showView("quiz", "revision")) return;

  beginSession(questions.map(withShuffledOptions), {
    mode: "revision",
    title: random ? "Révision au hasard" : "Révision de tes erreurs",
    badge: `${questions.length} questions`
  });

  document.getElementById("quiz")?.scrollIntoView({ behavior: "smooth" });
}

/* ============================================================
   Fiches de cours
============================================================ */

function renderCoursesHome() {
  $("course-reader").hidden = true;
  $("courses-home").hidden = false;
  $("courses-home").replaceChildren();
  openedCourse = null;

  themeOrder.forEach((theme, index) => {
    const card = makeElement("article", `course-card theme-${index + 1}`);

    card.append(
      makeElement("div", "theme-icon", themeIcons[theme] || "📚"),
      makeElement("h3", "", `${index + 1}. ${quizData[theme].title}`),
      makeElement("p", "", quizData[theme].description)
    );

    levelOrder.forEach(level => {
      const course = getCourse(theme, level);
      const read = Boolean(userProgress.coursesRead?.[levelKey(theme, level)]);

      const row = makeElement("button", "course-row");
      row.type = "button";

      let status = "Bientôt";
      let statusClass = "pill-lock";
      if (hasContent(course)) {
        status = read ? "✓ Lue" : "À lire";
        statusClass = read ? "pill-success" : "";
      }

      row.append(
        makeElement("span", "", `📖 ${levelLabel(level)}`),
        makeElement("span", `pill ${statusClass}`, status)
      );

      row.addEventListener("click", () => openCourse(theme, level));
      card.appendChild(row);
    });

    $("courses-home").appendChild(card);
  });
}

function renderBlock(block) {
  switch (block.type) {
    case "list": {
      const list = makeElement("ul", "course-list");
      (block.items || []).forEach(item => list.appendChild(makeElement("li", "", item)));
      return list;
    }

    case "code": {
      const figure = makeElement("figure", "course-code");
      const pre = document.createElement("pre");
      pre.appendChild(makeElement("code", "", block.code || ""));
      figure.appendChild(pre);
      if (block.caption) figure.appendChild(makeElement("figcaption", "", block.caption));
      return figure;
    }

    case "example": {
      const box = makeElement("div", "course-example");
      box.appendChild(makeElement("strong", "", block.title || "Exemple"));
      const pre = document.createElement("pre");
      pre.appendChild(makeElement("code", "", block.code || ""));
      box.appendChild(pre);
      if (block.result) box.appendChild(makeElement("p", "", `➜ ${block.result}`));
      return box;
    }

    case "tip":
    case "warning": {
      const box = makeElement("div", `callout ${block.type}`);
      box.append(
        makeElement("strong", "", block.type === "tip" ? "💡 Astuce" : "⚠️ Attention"),
        makeElement("span", "", block.text || "")
      );
      return box;
    }

    default:
      return makeElement("p", "", block.text || "");
  }
}

function openCourse(theme, level) {
  const course = getCourse(theme, level);
  openedCourse = { theme, level };

  $("courses-home").hidden = true;
  $("course-reader").hidden = false;

  $("course-title").textContent = `${quizData[theme].title} — ${levelLabel(level)}`;

  const meta = [];
  if (course.duration) meta.push(`⏱️ ${course.duration}`);
  if (course.summary) meta.push(course.summary);
  $("course-meta").textContent = meta.join(" · ");

  $("course-body").replaceChildren();

  if (!hasContent(course)) {
    const placeholder = makeElement("div", "gate");
    placeholder.append(
      makeElement("div", "empty-icon", "🚧"),
      makeElement("h3", "", "Fiche en cours de rédaction"),
      makeElement(
        "p",
        "",
        "Les explications, syntaxes et exemples de ce niveau arrivent bientôt. En attendant, tu peux déjà tester tes connaissances avec le quiz."
      )
    );
    $("course-body").appendChild(placeholder);
  } else {
    course.sections.forEach(section => {
      const block = makeElement("section", "course-section");
      block.appendChild(makeElement("h3", "", section.title || ""));
      (section.blocks || []).forEach(item => block.appendChild(renderBlock(item)));
      $("course-body").appendChild(block);
    });
  }

  const alreadyRead = Boolean(userProgress.coursesRead?.[levelKey(theme, level)]);
  $("course-read-button").hidden = !(currentUser && hasContent(course));
  $("course-read-button").disabled = alreadyRead;
  $("course-read-button").textContent = alreadyRead ? "✓ Fiche lue" : "✓ J'ai lu cette fiche";

  $("course-quiz-button").hidden = !(currentUser && isLevelUnlocked(theme, level));

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ============================================================
   Fenêtre « Mon parcours »
============================================================ */

function ringSVG(percent) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return `
    <svg viewBox="0 0 140 140" class="ring" role="img" aria-label="Progression globale ${percent} %">
      <defs>
        <linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0a8a5f"/>
          <stop offset="100%" stop-color="#ffbf1f"/>
        </linearGradient>
      </defs>
      <circle class="ring-bg" cx="70" cy="70" r="${radius}"/>
      <circle class="ring-fg" cx="70" cy="70" r="${radius}"
        stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
        transform="rotate(-90 70 70)"/>
      <text class="ring-text" x="70" y="78" text-anchor="middle">${percent}%</text>
    </svg>
  `;
}

function evolutionSVG(history) {
  const data = history.slice(-20);

  if (data.length < 2) {
    return `<p class="empty-chart">Fais au moins 2 quiz pour voir apparaître ta courbe d'évolution 📈</p>`;
  }

  const W = 640, H = 260, L = 42, R = 18, T = 16, B = 40;
  const innerW = W - L - R;
  const innerH = H - T - B;

  const x = i => L + (innerW * i) / (data.length - 1);
  const y = v => T + innerH * (1 - v / 100);

  const grid = [0, 25, 50, 75, 100].map(v => `
    <line class="grid" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/>
    <text x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${v}%</text>
  `).join("");

  const points = data.map((entry, i) => [x(i), y(entryPercent(entry))]);
  const line = points.map(([px, py]) => `${px},${py}`).join(" ");
  const area = `${L},${y(0)} ${line} ${x(data.length - 1)},${y(0)}`;

  const dots = data.map((entry, i) => {
    const percent = entryPercent(entry);
    const label = `${quizData[entry.theme]?.title || entry.theme} · ${levelLabel(entry.level)} : ${entry.score}/${entry.total} (${percent} %) le ${formatDate(entry.at, true)}`;
    return `<circle class="dot ${percent >= PASS_PERCENT ? "pass" : ""}" cx="${points[i][0]}" cy="${points[i][1]}" r="5"><title>${label}</title></circle>`;
  }).join("");

  return `
    <svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Courbe d'évolution des scores">
      <defs>
        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0a8a5f" stop-opacity=".3"/>
          <stop offset="100%" stop-color="#0a8a5f" stop-opacity="0"/>
        </linearGradient>
      </defs>
      ${grid}
      <line class="pass-line" x1="${L}" x2="${W - R}" y1="${y(PASS_PERCENT)}" y2="${y(PASS_PERCENT)}"/>
      <polygon points="${area}" fill="url(#areaGradient)"/>
      <polyline class="line" points="${line}"/>
      ${dots}
      <text x="${L}" y="${H - 12}" text-anchor="start">${formatDate(data[0].at)}</text>
      <text x="${W - R}" y="${H - 12}" text-anchor="end">${formatDate(data[data.length - 1].at)}</text>
      <text x="${W / 2}" y="${H - 12}" text-anchor="middle">${data.length} derniers quiz</text>
    </svg>
  `;
}

function themeBarsHTML() {
  return themeOrder.map(theme => {
    const rows = levelOrder.map(level => {
      const best = getBestPercent(theme, level);
      const passed = isCompleted(theme, level);
      return `
        <div class="j-bar">
          <span>${levelLabel(level)}</span>
          <div class="j-bar-track">
            <div class="j-bar-fill ${passed ? "passed" : ""}" style="width:${best}%"></div>
          </div>
          <b>${best} %</b>
        </div>
      `;
    }).join("");

    return `
      <div class="j-theme-row">
        <h4>${themeIcons[theme] || "📚"} ${quizData[theme].title}</h4>
        ${rows}
      </div>
    `;
  }).join("");
}

function pathHTML() {
  return themeOrder.map(theme => {
    const unlocked = isThemeUnlocked(theme);
    const completed = isThemeCompleted(theme);
    const done = levelOrder.filter(level => isCompleted(theme, level)).length;

    let icon = "🔒";
    if (completed) icon = "✅";
    else if (unlocked) icon = "🚀";

    const cls = completed ? "completed" : unlocked ? "unlocked" : "";

    return `
      <div class="j-path-item ${cls}">
        <span>${icon} ${quizData[theme].title}</span>
        <small>${done}/${levelOrder.length} niveaux</small>
      </div>
    `;
  }).join("");
}

function historyHTML() {
  const items = [...(userProgress.history || [])].reverse().slice(0, 8);

  if (items.length === 0) {
    return `<p class="empty-chart">Aucun quiz réalisé pour l'instant. Lance-toi ! 🚀</p>`;
  }

  return items.map(entry => {
    const percent = entryPercent(entry);
    const good = percent >= PASS_PERCENT;
    return `
      <div class="j-history-item">
        <div>
          <strong>${quizData[entry.theme]?.title || entry.theme}</strong>
          <small>${levelLabel(entry.level)} · ${formatDate(entry.at, true)}</small>
        </div>
        <span class="j-score ${good ? "good" : "bad"}">${entry.score}/${entry.total} · ${percent} %</span>
      </div>
    `;
  }).join("");
}

function renderJourney() {
  if (!currentUser) return;

  const stats = getStats();

  $("j-name").textContent = getFirstName(currentUser);
  $("j-ring").innerHTML = ringSVG(stats.progressPercent);
  $("j-progress-text").textContent = `${stats.completedCount} / ${stats.totalLevels} niveaux réussis`;
  $("j-best").textContent = `${stats.bestPercent} %`;
  $("j-completed").textContent = String(stats.completedCount);
  $("j-quizzes").textContent = String(userProgress.totalQuizzes || 0);
  $("j-average").textContent = `${stats.average} %`;

  $("j-subtitle").textContent =
    stats.completedCount === stats.totalLevels
      ? "🎓 Bravo, tu as terminé tout le parcours SQL Master !"
      : stats.completedCount === 0
        ? "Ton aventure SQL commence maintenant. Lance ton premier quiz !"
        : "Continue comme ça, chaque niveau te rend plus solide.";

  $("j-evolution").innerHTML = evolutionSVG(userProgress.history || []);
  $("j-themes").innerHTML = themeBarsHTML();
  $("j-path").innerHTML = pathHTML();
  $("j-history").innerHTML = historyHTML();
}

function openJourney() {
  if (!currentUser) return;
  renderJourney();
  $("journey-modal").hidden = false;
  document.body.classList.add("modal-open");
  $("journey-close").focus();
}

function closeJourney() {
  $("journey-modal").hidden = true;
  document.body.classList.remove("modal-open");
}

/* ============================================================
   Initialisation
============================================================ */

function init() {
  // Compte
  $("google-login-button").addEventListener("click", async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Erreur connexion Google :", error);
      alert(
        `Connexion impossible\n\nCode : ${error?.code || "code_inconnu"}\n\nMessage : ${error?.message || String(error)}`
      );
    }
  });

  $("logout-button").addEventListener("click", async () => {
    try {
      closeJourney();
      cancelExam();
      await signOut(auth);
    } catch (error) {
      console.error("Erreur déconnexion :", error);
      alert(`Erreur pendant la déconnexion : ${error?.message || error}`);
    }
  });

  // Onglets
  tabs.forEach(button => {
    button.addEventListener("click", () => showView(button.dataset.view));
  });

  // Fenêtre Mon parcours
  $("journey-button").addEventListener("click", openJourney);
  $("journey-close").addEventListener("click", closeJourney);
  $("j-continue").addEventListener("click", continueProgression);

  $("journey-modal").addEventListener("click", event => {
    if (event.target.dataset.close) closeJourney();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !$("journey-modal").hidden) closeJourney();
  });

  // Quiz
  $("previous-button").addEventListener("click", previousQuestion);
  $("next-button").addEventListener("click", nextQuestion);
  $("finish-button").addEventListener("click", event => {
    event.preventDefault();
    finishQuiz();
  });
  $("retry-button").addEventListener("click", onRetryButton);
  $("continue-button").addEventListener("click", onContinueButton);
  $("back-to-themes").addEventListener("click", showHome);

  // Examen
  $("exam-start").addEventListener("click", startExam);
  $("exam-submit").addEventListener("click", () => submitExam(false));
  $("exam-prev").addEventListener("click", () => {
    if (examIndex > 0) {
      examIndex -= 1;
      renderExamQuestion();
    }
  });
  $("exam-next").addEventListener("click", () => {
    if (examIndex < examQuestions.length - 1) {
      examIndex += 1;
      renderExamQuestion();
    }
  });
  $("exam-again").addEventListener("click", renderExamSetup);
  $("exam-to-revision").addEventListener("click", () => showView("revision"));

  window.addEventListener("beforeunload", event => {
    if (examRunning) {
      event.preventDefault();
      event.returnValue = "";
    }
  });

  // Révision
  $("revision-start").addEventListener("click", () => startRevision(false));
  $("revision-random").addEventListener("click", () => startRevision(true));

  // Cours
  $("course-back").addEventListener("click", renderCoursesHome);

  $("course-read-button").addEventListener("click", async () => {
    if (!openedCourse) return;

    $("course-read-button").disabled = true;

    try {
      userProgress = normalizeProgress(
        await markCourseRead(openedCourse.theme, openedCourse.level)
      );
      $("course-read-button").textContent = "✓ Fiche lue";
    } catch (error) {
      $("course-read-button").disabled = false;
      alert(`Erreur : ${error?.message || error}`);
    }
  });

  $("course-quiz-button").addEventListener("click", () => {
    if (!openedCourse) return;

    const { theme, level } = openedCourse;
    if (!showView("quiz")) return;

    openTheme(theme, false);
    startQuiz(level);
    document.getElementById("quiz")?.scrollIntoView({ behavior: "smooth" });
  });

  // Authentification
  onAuthStateChanged(auth, async user => {
    currentUser = user;
    isAdmin = false;
    renderUser(user);

    if (!user) {
      userProgress = normalizeProgress(defaultProgress);
      closeJourney();
      cancelExam();
      sessionMode = "level";
      updateRevisionBadge();
      showView("quiz");
      showHome();
      return;
    }

    try {
      userProgress = await createOrUpdateUserProfile(user);
      isAdmin = await checkIsAdmin(user);

      renderUser(user);
      updateRevisionBadge();
      showHome();

      if (activeView === "exam" && !examRunning) renderExamSetup();
      if (activeView === "revision") renderRevision();
      if (activeView === "courses" && !openedCourse) renderCoursesHome();

      const savedTheme = userProgress.currentTheme;
      const savedLevel = userProgress.currentLevel;

      if (
        activeView === "quiz" &&
        savedTheme &&
        savedLevel &&
        isThemeUnlocked(savedTheme) &&
        isLevelUnlocked(savedTheme, savedLevel)
      ) {
        openTheme(savedTheme, false);
      }
    } catch (error) {
      console.error("Erreur chargement profil Firestore :", error);
      alert(
        `Impossible de charger ta progression.\n\n` +
        `Code : ${error?.code || "code_inconnu"}\n\n` +
        `Message : ${error?.message || String(error)}\n\n` +
        `Vérifie Firestore, les règles et le domaine autorisé.`
      );
    }
  });

  showHome();
  renderCoursesHome();
}

if (missing.length === 0) {
  init();
} else {
  console.error(
    "index.html ne contient pas tous les éléments nécessaires. Manquants :",
    missing
  );
}
