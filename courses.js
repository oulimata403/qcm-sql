// courses.js
// Structure des fiches de cours : 4 thèmes x 3 niveaux = 12 fiches.
// Pour l'instant elles sont VIDES : le site affiche « en cours de rédaction ».
//
// Pour écrire une fiche, remplis simplement les champs d'un cours, par exemple :
//
//   courses.fondamentaux.debutant = {
//     summary: "Apprendre à lire une table avec SELECT.",
//     duration: "8 min",
//     sections: [
//       {
//         title: "Le rôle de SELECT",
//         blocks: [
//           { type: "text",    text: "SELECT sert à lire des données." },
//           { type: "list",    items: ["Premier point", "Deuxième point"] },
//           { type: "code",    code: "SELECT * FROM clients;", caption: "Syntaxe de base" },
//           { type: "example", title: "Exemple", code: "SELECT nom FROM clients;", result: "Affiche tous les noms." },
//           { type: "tip",     text: "Astuce utile." },
//           { type: "warning", text: "Attention à ce piège." }
//         ]
//       }
//     ]
//   };
//
// Types de blocs : text, list, code, example, tip, warning.

import { themeOrder, levelOrder } from "./questions.js";

function emptyCourse() {
  return {
    summary: "",
    duration: "",
    sections: []
  };
}

export const courses = {};

themeOrder.forEach(theme => {
  courses[theme] = {};
  levelOrder.forEach(level => {
    courses[theme][level] = emptyCourse();
  });
});

// ---- Ajoute tes fiches ici (exemple : courses.jointures.debutant = {...}) ----

export function getCourse(theme, level) {
  return courses[theme]?.[level] || emptyCourse();
}

export function hasContent(course) {
  return Boolean(course) && Array.isArray(course.sections) && course.sections.length > 0;
}
