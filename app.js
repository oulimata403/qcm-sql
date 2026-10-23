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
  PASS_RATIO
} from "./questions.js";

import {
  defaultProgress,
  normalizeProgress,
  createOrUpdateUserProfile,
  saveQuizResult
} from "./configstore.js";

/* ============================================================
   État
============================================================ */

let currentUser = null;
let userProgress = normalizeProgress(defaultProgress);

let currentTheme = null;
let currentLevel = null;
let currentQuestions = [];
let currentIndex = 0;
let answers = [];
let validated = [];

/* ============================================================
   Éléments HTML
============================================================ */

const ids = [
  "google-login-button", "logout-button", "user-area", "user-name", "user-avatar",
  "journey-button", "theme-grid", "level-panel", "quiz-panel", "results-panel",
  "empty-state", "theme-title", "theme-description", "levels-container",
  "quiz-title", "quiz-badge", "question-counter", "score-live", "progress-fill",
  "question-container", "feedback-container", "message", "previous-button",
  "next-button", "finish-button", "score-number", "score-percent", "result-message",
  "review-container", "retry-button", "continue-button", "back-to-themes",
  "journey-modal", "journey-close", "j-name", "j-subtitle", "j-ring",
  "j-progress-text", "j-best", "j-completed", "j-quizzes", "j-average",
  "j-evolution", "j-themes", "j-path", "j-history", "j-continue"
];

const el = {};
let missing = [];

ids.forEach(id => {
  el[id] = document.getElementById(id);
  if (!el[id]) {
    missing.push(id);
  }
});

/* ============================================================
   Outils
============================================================ */

const PASS_PERCENT = Math.round(PASS_RATIO * 100);

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
const themeIcons = {
  fondamentaux: "📘",
  manipulation: "🛠️",
  jointures: "🔗",
  avance: "📊"
};

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

/* ============================================================
   Compte utilisateur
============================================================ */

function renderUser(user) {
  if (!user) {
    el["google-login-button"].hidden = false;
    el["logout-button"].hidden = true;
    el["user-area"].hidden = true;
    return;
  }

  el["google-login-button"].hidden = true;
  el["logout-button"].hidden = false;
  el["user-area"].hidden = false;

  const name = user.displayName || "Utilisateur";
  el["user-name"].textContent = getFirstName(user);
  el["user-avatar"].textContent = name.trim().charAt(0).toUpperCase();
}

/* ============================================================
   Thèmes et niveaux
============================================================ */

function renderThemes() {
  el["theme-grid"].replaceChildren();

  themeOrder.forEach((theme, index) => {
    const data = quizData[theme];
    if (!data) return;

    const unlocked = isThemeUnlocked(theme);
    const completed = isThemeCompleted(theme);
    const doneLevels = levelOrder.filter(level => isCompleted(theme, level)).length;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "theme-card";
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
    el["theme-grid"].appendChild(button);
  });
}

function openTheme(theme, scroll = true) {
  if (!currentUser || !isThemeUnlocked(theme)) return;

  currentTheme = theme;
  currentLevel = null;

  el["empty-state"].hidden = true;
  el["level-panel"].hidden = false;
  el["quiz-panel"].hidden = true;
  el["results-panel"].hidden = true;

  el["theme-title"].textContent = quizData[theme].title;
  el["theme-description"].textContent = quizData[theme].description;

  renderLevels();

  if (scroll) {
    document.getElementById("quiz")?.scrollIntoView({ behavior: "smooth" });
  }
}

function renderLevels() {
  el["levels-container"].replaceChildren();
  if (!currentTheme) return;

  levelOrder.forEach(level => {
    const unlocked = isLevelUnlocked(currentTheme, level);
    const completed = isCompleted(currentTheme, level);
    const best = getBestPercent(currentTheme, level);
    const count = quizData[currentTheme].levels[level]?.length || 0;

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
    el["levels-container"].appendChild(button);
  });
}

/* ============================================================
   Quiz
============================================================ */

function prepareQuestions(theme, level) {
  const questions = quizData?.[theme]?.levels?.[level] || [];
  return shuffle(questions).map(question => ({
    ...question,
    options: shuffle(question.options || [])
  }));
}

function startQuiz(level) {
  if (!currentTheme || !isLevelUnlocked(currentTheme, level)) return;

  currentLevel = level;
  currentQuestions = prepareQuestions(currentTheme, currentLevel);

  if (currentQuestions.length === 0) {
    alert("Aucune question disponible pour ce niveau.");
    return;
  }

  currentIndex = 0;
  answers = Array(currentQuestions.length).fill(null);
  validated = Array(currentQuestions.length).fill(false);

  el["level-panel"].hidden = true;
  el["quiz-panel"].hidden = false;
  el["results-panel"].hidden = true;
  el["empty-state"].hidden = true;

  el["quiz-title"].textContent = quizData[currentTheme].title;
  el["quiz-badge"].textContent = `Niveau ${levelLabel(level)}`;

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

  el["question-counter"].textContent = `Question ${currentIndex + 1} sur ${total}`;
  el["score-live"].textContent = `Bonnes réponses : ${getCurrentScore()}`;
  el["progress-fill"].style.width = `${((currentIndex + 1) / total) * 100}%`;

  el["question-container"].replaceChildren();
  el["feedback-container"].replaceChildren();
  el["message"].textContent = "";

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

    const letter = document.createElement("span");
    letter.className = "option-letter";
    letter.textContent = String.fromCharCode(65 + index);

    const text = document.createElement("span");
    text.textContent = option;

    label.append(input, letter, text);
    options.appendChild(label);
  });

  el["question-container"].append(title, options);

  if (isValidated) {
    const correct = answers[currentIndex] === question.correct;

    const feedback = document.createElement("div");
    feedback.className = `feedback ${correct ? "correct" : "incorrect"}`;

    const feedbackTitle = document.createElement("strong");
    feedbackTitle.textContent = correct
      ? "✅ Bonne réponse !"
      : `❌ Réponse correcte : ${question.correct}`;

    const feedbackText = document.createElement("span");
    feedbackText.textContent = question.explanation || "";

    feedback.append(feedbackTitle, feedbackText);
    el["feedback-container"].appendChild(feedback);
  }

  const isLast = currentIndex === total - 1;

  el["previous-button"].disabled = currentIndex === 0;
  el["next-button"].hidden = isLast;
  el["finish-button"].hidden = !isLast;

  el["next-button"].textContent = isValidated
    ? "Question suivante →"
    : "Valider puis continuer →";

  el["finish-button"].textContent = isValidated
    ? "Voir mon résultat"
    : "Valider la réponse";
}

function validateCurrentQuestion() {
  if (!answers[currentIndex]) {
    el["message"].textContent = "Choisis une réponse avant de continuer.";
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
  // Dernière question : on valide d'abord pour afficher la correction
  if (!validated[currentIndex]) {
    validateCurrentQuestion();
    return;
  }

  const missingIndex = answers.findIndex(answer => answer === null);

  if (missingIndex !== -1) {
    currentIndex = missingIndex;
    renderQuestion();
    el["message"].textContent = "Réponds à toutes les questions avant de terminer.";
    return;
  }

  if (!currentUser) {
    alert("Tu dois être connecté pour enregistrer ton résultat.");
    return;
  }

  const score = getCurrentScore();

  el["finish-button"].disabled = true;
  el["finish-button"].textContent = "Enregistrement...";

  try {
    const result = await saveQuizResult({
      theme: currentTheme,
      level: currentLevel,
      score,
      totalQuestions: currentQuestions.length
    });

    userProgress = normalizeProgress(result.progress);

    el["quiz-panel"].hidden = true;
    el["results-panel"].hidden = false;

    el["score-number"].textContent = `${score}/${currentQuestions.length}`;
    el["score-percent"].textContent = `${result.percent} %`;

    if (!result.passed) {
      el["result-message"].textContent =
        `Il faut au moins ${PASS_PERCENT} % pour valider ce niveau. Relis les corrections ci-dessous et retente ta chance !`;
    } else if (result.perfect) {
      el["result-message"].textContent =
        "🏆 Score parfait ! Tu maîtrises ce niveau, la suite est débloquée.";
    } else {
      el["result-message"].textContent =
        "🎉 Bravo, niveau validé ! Tu peux continuer ou refaire le niveau pour viser le sans-faute.";
    }

    renderReview();
    configureResultButtons(result);
    renderThemes();
    window.scrollTo({ top: document.getElementById("quiz").offsetTop - 80, behavior: "smooth" });
  } catch (error) {
    console.error("Erreur complète Firestore :", error);

    const errorCode = error?.code || "code_inconnu";
    const errorMessage = error?.message || String(error);

    el["message"].textContent = `Erreur Firebase : ${errorCode}`;
    alert(`Erreur Firebase\n\nCode : ${errorCode}\n\nMessage : ${errorMessage}`);
  } finally {
    el["finish-button"].disabled = false;
    el["finish-button"].textContent = "Voir mon résultat";
  }
}

function renderReview() {
  el["review-container"].replaceChildren();

  currentQuestions.forEach((question, index) => {
    const good = answers[index] === question.correct;

    const article = document.createElement("article");
    article.className = "review-item";

    const title = document.createElement("h3");
    title.textContent = `${index + 1}. ${question.text}`;

    const status = document.createElement("span");
    status.className = `review-status ${good ? "good" : "bad"}`;
    status.textContent = good ? "Bonne réponse" : "À revoir";

    const answer = document.createElement("p");
    const answerLabel = document.createElement("strong");
    answerLabel.textContent = "Ta réponse : ";
    answer.append(answerLabel, document.createTextNode(answers[index] || "Aucune réponse"));

    const correct = document.createElement("p");
    const correctLabel = document.createElement("strong");
    correctLabel.textContent = "Bonne réponse : ";
    correct.append(correctLabel, document.createTextNode(question.correct));

    const explanation = document.createElement("div");
    explanation.className = "explanation";
    const explanationLabel = document.createElement("strong");
    explanationLabel.textContent = "💡 Explication : ";
    explanation.append(explanationLabel, document.createTextNode(question.explanation || ""));

    article.append(title, status, answer, correct, explanation);
    el["review-container"].appendChild(article);
  });
}

function configureResultButtons(result) {
  el["retry-button"].hidden = false;
  el["continue-button"].hidden = !result.passed;

  el["retry-button"].textContent = result.perfect
    ? "Refaire pour réviser"
    : "Refaire ce niveau";

  if (!result.passed) return;

  if (result.nextTheme && result.nextTheme !== currentTheme) {
    el["continue-button"].textContent = "Passer au thème suivant →";
  } else if (result.nextLevel) {
    el["continue-button"].textContent = `Passer au niveau ${levelLabel(result.nextLevel)} →`;
  } else {
    el["continue-button"].textContent = "🎓 Parcours terminé, voir mon parcours";
  }
}

function continueProgression() {
  if (!currentUser) return;

  closeJourney();

  const theme = userProgress.currentTheme;
  const level = userProgress.currentLevel;

  if (theme && level && isThemeUnlocked(theme) && isLevelUnlocked(theme, level)) {
    openTheme(theme);
    startQuiz(level);
  } else {
    showHome();
  }
}

function onContinueButton() {
  // Parcours entièrement terminé : on ouvre la fenêtre Mon parcours
  const allDone = themeOrder.every(isThemeCompleted);
  if (allDone && el["continue-button"].textContent.includes("Parcours terminé")) {
    openJourney();
    return;
  }
  continueProgression();
}

function showHome() {
  currentTheme = null;
  currentLevel = null;

  el["empty-state"].hidden = false;
  el["level-panel"].hidden = true;
  el["quiz-panel"].hidden = true;
  el["results-panel"].hidden = true;

  if (currentUser) {
    el["empty-state"].querySelector("h3").textContent = "Choisis un thème pour commencer";
    el["empty-state"].querySelector("p").textContent =
      "Sélectionne un thème disponible ci-dessus. Les niveaux se débloquent au fil de ta progression.";
  } else {
    el["empty-state"].querySelector("h3").textContent = "Connecte-toi pour commencer";
    el["empty-state"].querySelector("p").textContent =
      "Ta progression, tes scores et ton évolution seront sauvegardés dans ton compte Google.";
  }

  renderThemes();
}

/* ============================================================
   Fenêtre « Mon parcours » (graphiques)
============================================================ */

function ringSVG(percent) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return `
    <svg viewBox="0 0 140 140" class="ring" role="img" aria-label="Progression globale ${percent} %">
      <defs>
        <linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#5b4bf0"/>
          <stop offset="100%" stop-color="#06b6d4"/>
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

  const first = formatDate(data[0].at);
  const last = formatDate(data[data.length - 1].at);

  return `
    <svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Courbe d'évolution des scores">
      <defs>
        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#5b4bf0" stop-opacity=".28"/>
          <stop offset="100%" stop-color="#5b4bf0" stop-opacity="0"/>
        </linearGradient>
      </defs>
      ${grid}
      <line class="pass-line" x1="${L}" x2="${W - R}" y1="${y(PASS_PERCENT)}" y2="${y(PASS_PERCENT)}"/>
      <polygon points="${area}" fill="url(#areaGradient)"/>
      <polyline class="line" points="${line}"/>
      ${dots}
      <text x="${L}" y="${H - 12}" text-anchor="start">${first}</text>
      <text x="${W - R}" y="${H - 12}" text-anchor="end">${last}</text>
      <text x="${W / 2}" y="${H - 12}" text-anchor="middle">${data.length} derniers quiz</text>
    </svg>
  `;
}

function themeBarsHTML() {
  return themeOrder.map(theme => {
    const data = quizData[theme];
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
        <h4>${themeIcons[theme] || "📚"} ${data.title}</h4>
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

  el["j-name"].textContent = getFirstName(currentUser);
  el["j-ring"].innerHTML = ringSVG(stats.progressPercent);
  el["j-progress-text"].textContent = `${stats.completedCount} / ${stats.totalLevels} niveaux réussis`;
  el["j-best"].textContent = `${stats.bestPercent} %`;
  el["j-completed"].textContent = String(stats.completedCount);
  el["j-quizzes"].textContent = String(userProgress.totalQuizzes || 0);
  el["j-average"].textContent = `${stats.average} %`;

  el["j-subtitle"].textContent =
    stats.completedCount === stats.totalLevels
      ? "🎓 Bravo, tu as terminé tout le parcours SQL Master !"
      : stats.completedCount === 0
        ? "Ton aventure SQL commence maintenant. Lance ton premier quiz !"
        : "Continue comme ça, chaque niveau te rend plus solide.";

  el["j-evolution"].innerHTML = evolutionSVG(userProgress.history || []);
  el["j-themes"].innerHTML = themeBarsHTML();
  el["j-path"].innerHTML = pathHTML();
  el["j-history"].innerHTML = historyHTML();
}

function openJourney() {
  if (!currentUser) return;
  renderJourney();
  el["journey-modal"].hidden = false;
  document.body.classList.add("modal-open");
  el["journey-close"].focus();
}

function closeJourney() {
  el["journey-modal"].hidden = true;
  document.body.classList.remove("modal-open");
}

/* ============================================================
   Initialisation
============================================================ */

function init() {
  el["google-login-button"].addEventListener("click", async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Erreur connexion Google :", error);
      alert(
        `Connexion impossible\n\nCode : ${error?.code || "code_inconnu"}\n\nMessage : ${error?.message || String(error)}`
      );
    }
  });

  el["logout-button"].addEventListener("click", async () => {
    try {
      closeJourney();
      await signOut(auth);
    } catch (error) {
      console.error("Erreur déconnexion :", error);
      alert(`Erreur pendant la déconnexion : ${error?.message || error}`);
    }
  });

  el["journey-button"].addEventListener("click", openJourney);
  el["journey-close"].addEventListener("click", closeJourney);
  el["j-continue"].addEventListener("click", continueProgression);

  el["journey-modal"].addEventListener("click", event => {
    if (event.target.dataset.close) closeJourney();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !el["journey-modal"].hidden) closeJourney();
  });

  el["previous-button"].addEventListener("click", previousQuestion);
  el["next-button"].addEventListener("click", nextQuestion);

  el["finish-button"].addEventListener("click", event => {
    event.preventDefault();
    finishQuiz();
  });

  el["retry-button"].addEventListener("click", () => startQuiz(currentLevel));
  el["continue-button"].addEventListener("click", onContinueButton);
  el["back-to-themes"].addEventListener("click", showHome);

  onAuthStateChanged(auth, async user => {
    currentUser = user;
    renderUser(user);

    if (!user) {
      userProgress = normalizeProgress(defaultProgress);
      closeJourney();
      showHome();
      return;
    }

    try {
      userProgress = await createOrUpdateUserProfile(user);
      renderThemes();
      showHome();

      const savedTheme = userProgress.currentTheme;
      const savedLevel = userProgress.currentLevel;

      if (
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
}

if (missing.length === 0) {
  init();
} else {
  console.error(
    "index.html ne contient pas tous les éléments nécessaires. Manquants :",
    missing
  );
}
