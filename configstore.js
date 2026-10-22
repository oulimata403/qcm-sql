// configstore.js

import {
  auth,
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  increment
} from "./firebase-config.js";

export const defaultProgress = {
  currentTheme: "fondamentaux",
  currentLevel: "debutant",

  unlockedThemes: [
    "fondamentaux"
  ],

  unlockedLevels: {
    fondamentaux: [
      "debutant"
    ],

    jointures: [],

    avance: []
  },

  completedLevels: {},

  bestScores: {},

  totalQuizzes: 0
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeProgress(progress) {
  const saved = progress || {};

  return {
    ...clone(defaultProgress),
    ...saved,

    unlockedThemes: Array.isArray(saved.unlockedThemes)
      ? saved.unlockedThemes
      : clone(defaultProgress.unlockedThemes),

    unlockedLevels: {
      ...clone(defaultProgress.unlockedLevels),
      ...(saved.unlockedLevels || {})
    },

    completedLevels: saved.completedLevels || {},

    bestScores: saved.bestScores || {},

    totalQuizzes: Number(saved.totalQuizzes || 0),

    currentTheme: saved.currentTheme || "fondamentaux",

    currentLevel: saved.currentLevel || "debutant"
  };
}

function splitName(fullName) {
  const name = (fullName || "Utilisateur").trim();
  const parts = name.split(/\s+/);

  const firstName = parts.shift() || "Utilisateur";
  const lastName = parts.join(" ");

  return {
    firstName,
    lastName
  };
}

export function getUserDocumentReference(user = auth.currentUser) {
  if (!user) {
    throw new Error("Aucun utilisateur connecté.");
  }

  return doc(db, "users", user.uid);
}

export async function createUserProfile(user = auth.currentUser) {
  if (!user) {
    throw new Error("Impossible de créer le profil : aucun utilisateur connecté.");
  }

  const userRef = getUserDocumentReference(user);
  const snapshot = await getDoc(userRef);

  const { firstName, lastName } = splitName(user.displayName);

  if (!snapshot.exists()) {
    const profile = {
      uid: user.uid,

      firstName,
      lastName,
      fullName: user.displayName || "Utilisateur",

      email: user.email || "",
      photoURL: user.photoURL || "",

      loginCount: 1,

      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),

      progress: clone(defaultProgress)
    };

    await setDoc(userRef, profile);

    return clone(defaultProgress);
  }

  const existingData = snapshot.data();

  await updateDoc(userRef, {
    firstName,
    lastName,
    fullName: user.displayName || existingData.fullName || "Utilisateur",
    email: user.email || existingData.email || "",
    photoURL: user.photoURL || existingData.photoURL || "",
    lastLoginAt: serverTimestamp(),
    loginCount: increment(1)
  });

  return normalizeProgress(existingData.progress);
}

export async function getUserProfile(user = auth.currentUser) {
  if (!user) {
    throw new Error("Aucun utilisateur connecté.");
  }

  const userRef = getUserDocumentReference(user);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    await createUserProfile(user);
    return getUserProfile(user);
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
    progress: normalizeProgress(snapshot.data().progress)
  };
}

export async function getUserProgress(user = auth.currentUser) {
  const profile = await getUserProfile(user);
  return normalizeProgress(profile.progress);
}

export async function saveUserProgress(
  progress,
  user = auth.currentUser
) {
  if (!user) {
    throw new Error("Impossible d'enregistrer : aucun utilisateur connecté.");
  }

  const userRef = getUserDocumentReference(user);
  const normalized = normalizeProgress(progress);

  await updateDoc(userRef, {
    progress: normalized,
    lastProgressUpdate: serverTimestamp()
  });

  return normalized;
}

export async function updateUserProgress(
  changes,
  user = auth.currentUser
) {
  const currentProgress = await getUserProgress(user);

  const newProgress = normalizeProgress({
    ...currentProgress,
    ...changes
  });

  await saveUserProgress(newProgress, user);

  return newProgress;
}

export async function saveQuizResult({
  theme,
  level,
  score,
  totalQuestions = 10
}, user = auth.currentUser) {
  if (!user) {
    throw new Error("Impossible d'enregistrer le score : aucun utilisateur connecté.");
  }

  const progress = await getUserProgress(user);
  const resultKey = `${theme}-${level}`;

  const previousBest = Number(progress.bestScores[resultKey] || 0);
  const numericScore = Number(score);

  progress.bestScores[resultKey] = Math.max(
    previousBest,
    numericScore
  );

  progress.totalQuizzes += 1;

  const levelIndex = ["debutant", "intermediaire", "avance"].indexOf(level);
  const themeIndex = ["fondamentaux", "jointures", "avance"].indexOf(theme);

  if (numericScore >= 7) {
    progress.completedLevels[resultKey] = true;

    if (levelIndex < 2) {
      const nextLevel = ["debutant", "intermediaire", "avance"][levelIndex + 1];

      if (!progress.unlockedLevels[theme].includes(nextLevel)) {
        progress.unlockedLevels[theme].push(nextLevel);
      }

      progress.currentTheme = theme;
      progress.currentLevel = nextLevel;
    } else if (themeIndex < 2) {
      const nextTheme = ["fondamentaux", "jointures", "avance"][themeIndex + 1];

      if (!progress.unlockedThemes.includes(nextTheme)) {
        progress.unlockedThemes.push(nextTheme);
      }

      if (!progress.unlockedLevels[nextTheme].includes("debutant")) {
        progress.unlockedLevels[nextTheme].push("debutant");
      }

      progress.currentTheme = nextTheme;
      progress.currentLevel = "debutant";
    } else {
      progress.currentTheme = "avance";
      progress.currentLevel = "avance";
    }
  }

  await saveUserProgress(progress, user);

  return {
    progress,
    score: numericScore,
    totalQuestions,
    passed: numericScore >= 7,
    perfect: numericScore === totalQuestions
  };
}
