// configstore.js

import {
  auth,
  db,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "./firebase-config.js";

import { themeOrder, levelOrder, PASS_RATIO } from "./questions.js";

const MAX_HISTORY = 60;

function buildDefaultLevels() {
  const levels = {};
  themeOrder.forEach((theme, index) => {
    levels[theme] = index === 0 ? [levelOrder[0]] : [];
  });
  return levels;
}

export const defaultProgress = {
  currentTheme: themeOrder[0],
  currentLevel: levelOrder[0],
  unlockedThemes: [themeOrder[0]],
  unlockedLevels: buildDefaultLevels(),
  completedLevels: {},
  bestPercent: {},
  history: [],
  totalQuizzes: 0
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function normalizeProgress(progress = {}) {
  const base = clone(defaultProgress);
  const source = progress || {};

  const normalized = {
    ...base,
    currentTheme: source.currentTheme || base.currentTheme,
    currentLevel: source.currentLevel || base.currentLevel,
    unlockedThemes: Array.isArray(source.unlockedThemes)
      ? [...source.unlockedThemes]
      : base.unlockedThemes,
    unlockedLevels: {
      ...base.unlockedLevels,
      ...(source.unlockedLevels || {})
    },
    completedLevels:
      source.completedLevels && typeof source.completedLevels === "object"
        ? { ...source.completedLevels }
        : {},
    bestPercent:
      source.bestPercent && typeof source.bestPercent === "object"
        ? { ...source.bestPercent }
        : {},
    history: Array.isArray(source.history)
      ? source.history.slice(-MAX_HISTORY)
      : [],
    totalQuizzes: Number(source.totalQuizzes || 0)
  };

  // Cohérence : un thème dont le précédent est terminé est débloqué
  themeOrder.forEach((theme, index) => {
    if (index > 0) {
      const previous = themeOrder[index - 1];
      const previousDone = levelOrder.every(
        level => normalized.completedLevels[`${previous}-${level}`]
      );
      if (previousDone && !normalized.unlockedThemes.includes(theme)) {
        normalized.unlockedThemes.push(theme);
      }
    }

    if (!Array.isArray(normalized.unlockedLevels[theme])) {
      normalized.unlockedLevels[theme] = [];
    }

    if (
      normalized.unlockedThemes.includes(theme) &&
      !normalized.unlockedLevels[theme].includes(levelOrder[0])
    ) {
      normalized.unlockedLevels[theme].push(levelOrder[0]);
    }

    // Un niveau terminé débloque le suivant
    levelOrder.forEach((level, levelIndex) => {
      const next = levelOrder[levelIndex + 1];
      if (
        next &&
        normalized.completedLevels[`${theme}-${level}`] &&
        !normalized.unlockedLevels[theme].includes(next)
      ) {
        normalized.unlockedLevels[theme].push(next);
      }
    });
  });

  return normalized;
}

function getCurrentUser() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Aucun utilisateur connecté.");
  }
  return user;
}

function splitDisplayName(displayName) {
  const name = displayName || "Utilisateur";
  const parts = name.trim().split(/\s+/);
  const firstName = parts.shift() || "Utilisateur";
  const lastName = parts.join(" ");
  return { firstName, lastName };
}

export async function createOrUpdateUserProfile(user = auth.currentUser) {
  if (!user) {
    throw new Error("Aucun utilisateur connecté.");
  }

  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);
  const { firstName, lastName } = splitDisplayName(user.displayName);

  if (!snapshot.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      firstName,
      lastName,
      fullName: user.displayName || "Utilisateur",
      email: user.email || "",
      progress: clone(defaultProgress),
      totalQuizzes: 0,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    });

    return normalizeProgress(defaultProgress);
  }

  const data = snapshot.data();
  const progress = normalizeProgress(data.progress);

  await setDoc(
    userRef,
    {
      uid: user.uid,
      firstName,
      lastName,
      fullName: user.displayName || data.fullName || "Utilisateur",
      email: user.email || data.email || "",
      lastLoginAt: serverTimestamp(),
      progress
    },
    { merge: true }
  );

  return progress;
}

export async function saveUserProgress(progress, user = auth.currentUser) {
  if (!user) {
    throw new Error("Aucun utilisateur connecté.");
  }

  const userRef = doc(db, "users", user.uid);
  const normalized = normalizeProgress(progress);

  await setDoc(
    userRef,
    {
      progress: normalized,
      totalQuizzes: normalized.totalQuizzes,
      lastProgressUpdate: serverTimestamp()
    },
    { merge: true }
  );

  return normalized;
}

export async function saveQuizResult({ theme, level, score, totalQuestions }) {
  const user = getCurrentUser();
  const progress = await createOrUpdateUserProfile(user);

  const normalizedScore = Number(score);
  const total = Number(totalQuestions) || 1;
  const percent = Math.round((normalizedScore / total) * 100);
  const key = `${theme}-${level}`;
  const passed = normalizedScore / total >= PASS_RATIO;

  progress.bestPercent[key] = Math.max(
    Number(progress.bestPercent[key] || 0),
    percent
  );

  progress.totalQuizzes = Number(progress.totalQuizzes || 0) + 1;

  progress.history.push({
    theme,
    level,
    score: normalizedScore,
    total,
    at: Date.now()
  });
  progress.history = progress.history.slice(-MAX_HISTORY);

  const themeIndex = themeOrder.indexOf(theme);
  const levelIndex = levelOrder.indexOf(level);

  let nextTheme = null;
  let nextLevel = null;

  progress.currentTheme = theme;
  progress.currentLevel = level;

  if (passed) {
    progress.completedLevels[key] = true;

    if (levelIndex < levelOrder.length - 1) {
      nextTheme = theme;
      nextLevel = levelOrder[levelIndex + 1];

      if (!progress.unlockedLevels[theme].includes(nextLevel)) {
        progress.unlockedLevels[theme].push(nextLevel);
      }

      progress.currentLevel = nextLevel;
    } else if (themeIndex < themeOrder.length - 1) {
      nextTheme = themeOrder[themeIndex + 1];
      nextLevel = levelOrder[0];

      if (!progress.unlockedThemes.includes(nextTheme)) {
        progress.unlockedThemes.push(nextTheme);
      }

      if (!progress.unlockedLevels[nextTheme].includes(nextLevel)) {
        progress.unlockedLevels[nextTheme].push(nextLevel);
      }

      progress.currentTheme = nextTheme;
      progress.currentLevel = nextLevel;
    }
  }

  const savedProgress = await saveUserProgress(progress, user);

  return {
    progress: savedProgress,
    score: normalizedScore,
    totalQuestions: total,
    percent,
    passed,
    perfect: normalizedScore === total,
    nextTheme,
    nextLevel
  };
}
