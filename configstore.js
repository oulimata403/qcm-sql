// configstore.js

import {
  auth,
  db,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
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
  return JSON.parse(
    JSON.stringify(value)
  );
}

export function normalizeProgress(progress = {}) {
  const normalized = {
    ...clone(defaultProgress),
    ...progress
  };

  normalized.unlockedThemes =
    Array.isArray(progress.unlockedThemes)
      ? [...progress.unlockedThemes]
      : clone(
          defaultProgress.unlockedThemes
        );

  normalized.unlockedLevels = {
    ...clone(
      defaultProgress.unlockedLevels
    ),
    ...(progress.unlockedLevels || {})
  };

  normalized.completedLevels =
    progress.completedLevels &&
    typeof progress.completedLevels === "object"
      ? { ...progress.completedLevels }
      : {};

  normalized.bestScores =
    progress.bestScores &&
    typeof progress.bestScores === "object"
      ? { ...progress.bestScores }
      : {};

  normalized.totalQuizzes =
    Number(progress.totalQuizzes || 0);

  normalized.currentTheme =
    progress.currentTheme ||
    defaultProgress.currentTheme;

  normalized.currentLevel =
    progress.currentLevel ||
    defaultProgress.currentLevel;

  return normalized;
}

function getCurrentUser() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "Aucun utilisateur connecté."
    );
  }

  return user;
}

function splitDisplayName(displayName) {
  const name =
    displayName || "Utilisateur";

  const parts =
    name.trim().split(/\s+/);

  const firstName =
    parts.shift() || "Utilisateur";

  const lastName =
    parts.join(" ");

  return {
    firstName,
    lastName
  };
}

export async function createOrUpdateUserProfile(
  user = auth.currentUser
) {
  if (!user) {
    throw new Error(
      "Aucun utilisateur connecté."
    );
  }

  const userRef =
    doc(db, "users", user.uid);

  const snapshot =
    await getDoc(userRef);

  const {
    firstName,
    lastName
  } = splitDisplayName(
    user.displayName
  );

  if (!snapshot.exists()) {
    const profile = {
      uid: user.uid,

      firstName,

      lastName,

      fullName:
        user.displayName ||
        "Utilisateur",

      email:
        user.email || "",

      progress:
        clone(defaultProgress),

      totalQuizzes: 0,

      createdAt:
        serverTimestamp(),

      lastLoginAt:
        serverTimestamp()
    };

    await setDoc(
      userRef,
      profile
    );

    return normalizeProgress(
      defaultProgress
    );
  }

  const data =
    snapshot.data();

  const progress =
    normalizeProgress(
      data.progress
    );

  await setDoc(
    userRef,
    {
      uid: user.uid,

      firstName,

      lastName,

      fullName:
        user.displayName ||
        data.fullName ||
        "Utilisateur",

      email:
        user.email ||
        data.email ||
        "",

      lastLoginAt:
        serverTimestamp(),

      progress
    },
    {
      merge: true
    }
  );

  return progress;
}

export async function saveUserProgress(
  progress,
  user = auth.currentUser
) {
  if (!user) {
    throw new Error(
      "Aucun utilisateur connecté."
    );
  }

  const userRef =
    doc(db, "users", user.uid);

  const normalized =
    normalizeProgress(progress);

  await setDoc(
    userRef,
    {
      progress: normalized,

      totalQuizzes:
        normalized.totalQuizzes,

      lastProgressUpdate:
        serverTimestamp()
    },
    {
      merge: true
    }
  );

  return normalized;
}

export async function saveQuizResult({
  theme,
  level,
  score,
  totalQuestions
}) {
  const user =
    getCurrentUser();

  const progress =
    await createOrUpdateUserProfile(
      user
    );

  const normalizedScore =
    Number(score);

  const resultKey =
    `${theme}-${level}`;

  const previousBest =
    Number(
      progress.bestScores?.[resultKey] || 0
    );

  progress.bestScores[resultKey] =
    Math.max(
      previousBest,
      normalizedScore
    );

  progress.totalQuizzes =
    Number(
      progress.totalQuizzes || 0
    ) + 1;

  const themes = [
    "fondamentaux",
    "jointures",
    "avance"
  ];

  const levels = [
    "debutant",
    "intermediaire",
    "avance"
  ];

  const themeIndex =
    themes.indexOf(theme);

  const levelIndex =
    levels.indexOf(level);

  let nextTheme = null;
  let nextLevel = null;

  if (normalizedScore >= 7) {
    progress.completedLevels[
      resultKey
    ] = true;

    if (levelIndex < levels.length - 1) {
      nextTheme = theme;
      nextLevel =
        levels[levelIndex + 1];

      if (
        !progress.unlockedLevels[theme]
          .includes(nextLevel)
      ) {
        progress.unlockedLevels[theme]
          .push(nextLevel);
      }

      progress.currentTheme =
        theme;

      progress.currentLevel =
        nextLevel;
    } else if (
      themeIndex < themes.length - 1
    ) {
      nextTheme =
        themes[themeIndex + 1];

      nextLevel =
        "debutant";

      if (
        !progress.unlockedThemes
          .includes(nextTheme)
      ) {
        progress.unlockedThemes
          .push(nextTheme);
      }

      if (
        !progress.unlockedLevels[nextTheme]
          .includes("debutant")
      ) {
        progress.unlockedLevels[nextTheme]
          .push("debutant");
      }

      progress.currentTheme =
        nextTheme;

      progress.currentLevel =
        nextLevel;
    } else {
      progress.currentTheme =
        theme;

      progress.currentLevel =
        level;
    }
  } else {
    progress.currentTheme =
      theme;

    progress.currentLevel =
      level;
  }

  const savedProgress =
    await saveUserProgress(
      progress,
      user
    );

  return {
    progress: savedProgress,

    score: normalizedScore,

    totalQuestions,

    passed:
      normalizedScore >= 7,

    perfect:
      normalizedScore ===
      Number(totalQuestions),

    nextTheme,

    nextLevel
  };
}
