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

export function normalizeProgress(progress = {}) {
  return {
    ...clone(defaultProgress),
    ...progress,

    unlockedThemes: Array.isArray(progress.unlockedThemes)
      ? progress.unlockedThemes
      : clone(defaultProgress.unlockedThemes),

    unlockedLevels: {
      ...clone(defaultProgress.unlockedLevels),
      ...(progress.unlockedLevels || {})
    },

    completedLevels: progress.completedLevels || {},
    bestScores: progress.bestScores || {},

    totalQuizzes: Number(progress.totalQuizzes || 0),

    currentTheme: progress.currentTheme || "fondamentaux",
    currentLevel: progress.currentLevel || "debutant"
  };
}

function splitName(fullName) {
  const parts = (fullName || "Utilisateur").trim().split(/\s+/);

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

export async function createOrUpdateUserProfile(
  user = auth.currentUser
) {
  if (!user) {
    throw new Error("Aucun utilisateur connecté.");
  }

  const userRef = getUserDocumentReference(user);
  const snapshot = await getDoc(userRef);

  const { firstName, lastName } = splitName(user.displayName);

  if (!snapshot.exists()) {
    const newProfile = {
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

    await setDoc(userRef, newProfile);

    return clone(defaultProgress);
  }

  const oldData = snapshot.data();

  await updateDoc(userRef, {
    firstName,
    lastName,
    fullName: user.displayName || oldData.fullName || "Utilisateur",
    email: user.email || oldData.email || "",
    photoURL: user.photoURL || oldData.photoURL || "",

    lastLoginAt: serverTimestamp(),
    loginCount: increment(1)
  });

  return normalizeProgress(oldData.progress);
}

export async function getUserProfile(user = auth.currentUser) {
  if (!user) {
    throw new Error("Aucun utilisateur connecté.");
  }

  const userRef = getUserDocumentReference(user);
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

export async function getUserProgress(user = auth.currentUser) {
  const profile = await getUserProfile(user);
  return normalizeProgress(profile.progress);
}

export async function saveUserProgress(
  progress,
  user = auth.currentUser
) {
  if (!user) {
    throw new Error("Aucun utilisateur connecté.");
  }

  const userRef = getUserDocumentReference(user);
  const normalized = normalizeProgress(progress);

  await updateDoc(userRef, {
    progress: normalized,
    lastProgressUpdate: serverTimestamp()
  });

  return normalized;
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
    throw new Error("Aucun utilisateur connecté.");
  }

  const progress = await getUserProgress(user);
  const numericScore = Number(score);
  const resultKey = `${theme}-${level}`;

  const oldBestScore = Number(
    progress.bestScores[resultKey] || 0
  );

  progress.bestScores[resultKey] = Math.max(
    oldBestScore,
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

  const levelIndex = levels.indexOf(level);
  const themeIndex = themes.indexOf(theme);

  let nextTheme = null;
  let nextLevel = null;

  /*
    Score inférieur à 7 :
    le niveau reste verrouillé et l'utilisateur recommence.
  */
  if (numericScore < 7) {
    progress.currentTheme = theme;
    progress.currentLevel = level;
  }

  /*
    Score de 7 à 10 :
    le niveau est réussi.
  */
  if (numericScore >= 7) {
    progress.completedLevels[resultKey] = true;

    /*
      Il reste un niveau dans le même thème.
    */
    if (levelIndex < levels.length - 1) {
      nextTheme = theme;
      nextLevel = levels[levelIndex + 1];

      if (
        !progress.unlockedLevels[theme].includes(nextLevel)
      ) {
        progress.unlockedLevels[theme].push(nextLevel);
      }

      progress.currentTheme = nextTheme;
      progress.currentLevel = nextLevel;
    }

    /*
      Le thème est terminé :
      on débloque le thème suivant.
    */
    else if (themeIndex < themes.length - 1) {
      nextTheme = themes[themeIndex + 1];
      nextLevel = "debutant";

      if (
        !progress.unlockedThemes.includes(nextTheme)
      ) {
        progress.unlockedThemes.push(nextTheme);
      }

      if (
        !progress.unlockedLevels[nextTheme].includes("debutant")
      ) {
        progress.unlockedLevels[nextTheme].push("debutant");
      }

      progress.currentTheme = nextTheme;
      progress.currentLevel = nextLevel;
    }

    /*
      Tous les thèmes sont terminés.
    */
    else {
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
    perfect: numericScore === totalQuestions,
    nextTheme,
    nextLevel
  };
}
