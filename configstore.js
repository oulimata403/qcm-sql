// configstore.js

import {
  auth,
  db,
  doc,
  getDoc,
  setDoc,
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

export function normalizeProgress(progress = {}) {
  return {
    ...clone(defaultProgress),
    ...progress,

    unlockedThemes: Array.isArray(
      progress.unlockedThemes
    )
      ? progress.unlockedThemes
      : clone(defaultProgress.unlockedThemes),

    unlockedLevels: {
      ...clone(defaultProgress.unlockedLevels),
      ...(progress.unlockedLevels || {})
    },

    completedLevels:
      progress.completedLevels || {},

    bestScores:
      progress.bestScores || {},

    totalQuizzes:
      Number(progress.totalQuizzes || 0),

    currentTheme:
      progress.currentTheme || "fondamentaux",

    currentLevel:
      progress.currentLevel || "debutant"
  };
}

function splitName(fullName) {
  const parts = (
    fullName || "Utilisateur"
  ).trim().split(/\s+/);

  const firstName =
    parts.shift() || "Utilisateur";

  const lastName =
    parts.join(" ");

  return {
    firstName,
    lastName
  };
}

function getUserRef(user = auth.currentUser) {
  if (!user) {
    throw new Error(
      "Aucun utilisateur connecté."
    );
  }

  return doc(db, "users", user.uid);
}

export async function createOrUpdateUserProfile(
  user = auth.currentUser
) {
  if (!user) {
    throw new Error(
      "Aucun utilisateur connecté."
    );
  }

  const userRef = getUserRef(user);
  const snapshot = await getDoc(userRef);

  const {
    firstName,
    lastName
  } = splitName(user.displayName);

  if (!snapshot.exists()) {
    const newProfile = {
      uid: user.uid,

      firstName,
      lastName,
      fullName:
        user.displayName || "Utilisateur",

      email: user.email || "",
      photoURL: user.photoURL || "",

      loginCount: 1,

      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),

      progress: clone(defaultProgress)
    };

    await setDoc(userRef, newProfile);

    return clone(defaultProgress);
  }

  const oldData = snapshot.data();

  const oldProgress =
    normalizeProgress(oldData.progress);

  const oldLoginCount =
    Number(oldData.loginCount || 0);

  const updatedProfile = {
    uid: user.uid,

    firstName,
    lastName,
    fullName:
      user.displayName ||
      oldData.fullName ||
      "Utilisateur",

    email:
      user.email ||
      oldData.email ||
      "",

    photoURL:
      user.photoURL ||
      oldData.photoURL ||
      "",

    loginCount: oldLoginCount + 1,

    createdAt:
      oldData.createdAt || serverTimestamp(),

    lastLoginAt: serverTimestamp(),

    progress: oldProgress
  };

  await setDoc(
    userRef,
    updatedProfile,
    { merge: true }
  );

  return oldProgress;
}

export async function getUserProfile(
  user = auth.currentUser
) {
  if (!user) {
    throw new Error(
      "Aucun utilisateur connecté."
    );
  }

  const userRef = getUserRef(user);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    await createOrUpdateUserProfile(user);
    return getUserProfile(user);
  }

  const data = snapshot.data();

  return {
    id: snapshot.id,
    ...data,
    progress: normalizeProgress(data.progress)
  };
}

export async function getUserProgress(
  user = auth.currentUser
) {
  const profile =
    await getUserProfile(user);

  return normalizeProgress(
    profile.progress
  );
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

  const userRef = getUserRef(user);

  await setDoc(
    userRef,
    {
      progress: normalizeProgress(progress),
      lastProgressUpdate: serverTimestamp()
    },
    { merge: true }
  );

  return normalizeProgress(progress);
}

export async function saveQuizResult(
  {
    theme,
    level,
    score,
    totalQuestions = 10
  },
  user = auth.currentUser
) {
  if (!user) {
    throw new Error(
      "Aucun utilisateur connecté."
    );
  }

  const progress =
    await getUserProgress(user);

  const numericScore =
    Number(score);

  const resultKey =
    `${theme}-${level}`;

  const previousBest =
    Number(
      progress.bestScores[resultKey] || 0
    );

  progress.bestScores[resultKey] =
    Math.max(
      previousBest,
      numericScore
    );

  progress.totalQuizzes += 1;

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

  const levelIndex =
    levels.indexOf(level);

  const themeIndex =
    themes.indexOf(theme);

  let nextTheme = null;
  let nextLevel = null;

  if (numericScore < 7) {
    progress.currentTheme = theme;
    progress.currentLevel = level;
  }

  if (numericScore >= 7) {
    progress.completedLevels[resultKey] = true;

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

      progress.currentTheme = nextTheme;
      progress.currentLevel = nextLevel;
    } else if (
      themeIndex < themes.length - 1
    ) {
      nextTheme =
        themes[themeIndex + 1];

      nextLevel = "debutant";

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

      progress.currentTheme = nextTheme;
      progress.currentLevel = nextLevel;
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
    perfect:
      numericScore === totalQuestions,
    nextTheme,
    nextLevel
  };
}
