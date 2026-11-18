// practice.js — zone d'exercices pratiques (SQL exécuté dans le navigateur avec sql.js / SQLite)

import { themeOrder, levelOrder, quizData } from "./questions.js";
import { exercises, SEED_SQL } from "./exercises.js";
import { markExerciseDone } from "./configstore.js";
import { openReport } from "./reports.js";

const SQLJS_BASE = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/";
const MAX_ROWS = 100;

const levelNames = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  avance: "Avancé"
};

const themeIcons = {
  fondamentaux: "📘",
  manipulation: "🛠️",
  jointures: "🔗",
  avance: "📊"
};

const $ = id => document.getElementById(id);

let SQL = null;
let loading = null;
let ctx = null;
let bound = false;

let theme = themeOrder[0];
let level = levelOrder[0];
let index = 0;
let exerciseReport = null;
const drafts = {};

/* ============================================================
   Chargement du moteur SQL (à la demande)
============================================================ */

function loadSqlJs() {
  if (SQL) return Promise.resolve(SQL);
  if (loading) return loading;

  loading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${SQLJS_BASE}sql-wasm.js`;

    script.onload = () => {
      window
        .initSqlJs({ locateFile: file => `${SQLJS_BASE}${file}` })
        .then(lib => {
          SQL = lib;
          resolve(lib);
        })
        .catch(reject);
    };

    script.onerror = () =>
      reject(new Error("Impossible de charger le moteur SQL. Vérifie ta connexion internet."));

    document.head.appendChild(script);
  }).catch(error => {
    loading = null;
    throw error;
  });

  return loading;
}

function freshDb() {
  const db = new SQL.Database();
  db.exec(SEED_SQL);
  return db;
}

/* ============================================================
   Outils
============================================================ */

function make(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

const list = () => exercises[theme]?.[level] || [];
const current = () => list()[index];
const getDone = () => ctx?.getProgress()?.practiceDone || {};

function endsWithQuery(sql) {
  const parts = sql.split(";").map(part => part.trim()).filter(Boolean);
  return /^(select|with|pragma|values)\b/i.test(parts[parts.length - 1] || "");
}

function lastSet(sets, sql) {
  if (sets.length) return sets[sets.length - 1];
  return endsWithQuery(sql) ? { columns: null, values: [] } : null;
}

function setFeedback(type, text) {
  const box = $("pr-feedback");
  box.className = `pr-feedback ${type}`;
  box.textContent = text;
}

/* ============================================================
   Affichage des résultats
============================================================ */

function showTable(set, caption) {
  const container = $("pr-result");
  container.replaceChildren();

  if (caption) container.appendChild(make("p", "pr-caption", caption));

  if (!set || !set.columns || set.values.length === 0) {
    container.appendChild(make("p", "empty-chart", "Aucune ligne dans le résultat."));
    return;
  }

  const wrap = make("div", "table-wrap");
  const table = make("table", "a-table pr-table");

  const head = document.createElement("tr");
  set.columns.forEach(column => head.appendChild(make("th", "", column)));
  const thead = document.createElement("thead");
  thead.appendChild(head);

  const tbody = document.createElement("tbody");
  set.values.slice(0, MAX_ROWS).forEach(row => {
    const tr = document.createElement("tr");
    row.forEach(value => {
      const td = document.createElement("td");
      if (value === null) {
        td.className = "pr-null";
        td.textContent = "NULL";
      } else {
        td.textContent = String(value);
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  table.append(thead, tbody);
  wrap.appendChild(table);
  container.appendChild(wrap);

  const count = set.values.length;
  container.appendChild(
    make(
      "p",
      "pr-caption",
      count > MAX_ROWS
        ? `${count} lignes (les ${MAX_ROWS} premières sont affichées).`
        : `${count} ligne(s).`
    )
  );
}

function showMessage(text) {
  $("pr-result").replaceChildren(make("p", "empty-chart", text));
}

/* ============================================================
   Comparaison des résultats
============================================================ */

const normalize = value =>
  value === null ? null : typeof value === "number" ? Number(value.toFixed(6)) : String(value);

const rowKey = row => JSON.stringify(row.map(normalize));

function compare(student, expected, { ordered, names }) {
  if (!student) {
    return { ok: false, reason: "Ta requête ne renvoie aucun résultat : il faut terminer par un SELECT." };
  }

  if (student.columns && student.columns.length !== expected.columns.length) {
    return {
      ok: false,
      reason: `Il faut ${expected.columns.length} colonne(s), ta requête en renvoie ${student.columns.length}.`
    };
  }

  if (names && student.columns) {
    const a = student.columns.map(column => column.toLowerCase());
    const b = expected.columns.map(column => column.toLowerCase());
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      return { ok: false, reason: "Les noms de colonnes ne correspondent pas : utilise les alias demandés (AS)." };
    }
  }

  if (student.values.length !== expected.values.length) {
    return {
      ok: false,
      reason: `Il faut ${expected.values.length} ligne(s), tu en obtiens ${student.values.length}.`
    };
  }

  const a = student.values.map(rowKey);
  const b = expected.values.map(rowKey);

  if (JSON.stringify(a) === JSON.stringify(b)) return { ok: true };

  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  const sameRows = JSON.stringify(sortedA) === JSON.stringify(sortedB);

  if (sameRows && !ordered) return { ok: true };

  if (sameRows && ordered) {
    return { ok: false, reason: "Les bonnes lignes, mais dans le mauvais ordre : vérifie ton ORDER BY." };
  }

  return { ok: false, reason: "Le contenu du résultat ne correspond pas à ce qui est attendu. Relis l'énoncé et l'indice." };
}

/* ============================================================
   Actions
============================================================ */

function run() {
  const sql = $("pr-editor").value.trim();
  const exercise = current();

  if (!sql) {
    setFeedback("info", "Écris d'abord ta requête dans l'éditeur.");
    return;
  }

  const db = freshDb();

  try {
    const sets = db.exec(sql);
    const last = sets[sets.length - 1];

    if (last) {
      showTable(last);
      setFeedback("info", `✔ Requête exécutée : ${last.values.length} ligne(s). Clique sur « Vérifier » quand tu penses avoir la bonne réponse.`);
    } else if (endsWithQuery(sql)) {
      showTable({ columns: null, values: [] });
      setFeedback("info", "✔ Requête exécutée : aucune ligne dans le résultat.");
    } else {
      if (exercise.check) {
        try {
          const state = db.exec(exercise.check);
          showTable(state[state.length - 1], "État de la base après ta requête :");
        } catch (error) {
          showMessage(`La vérification n'a pas pu être affichée : ${error.message}`);
        }
      } else {
        showMessage("Requête exécutée avec succès (aucun résultat à afficher).");
      }
      setFeedback("info", "✔ Requête exécutée. Clique sur « Vérifier » pour contrôler ta réponse.");
    }
  } catch (error) {
    showMessage("");
    setFeedback("ko", `❌ Erreur SQL : ${error.message}`);
  } finally {
    db.close();
  }
}

async function verify() {
  const sql = $("pr-editor").value.trim();
  const exercise = current();

  if (!sql) {
    setFeedback("info", "Écris d'abord ta requête dans l'éditeur.");
    return;
  }

  for (const [pattern, message] of exercise.require || []) {
    if (!new RegExp(pattern, "i").test(sql)) {
      setFeedback("ko", `❌ ${message}`);
      return;
    }
  }

  let studentResult;

  const dbStudent = freshDb();
  try {
    const sets = dbStudent.exec(sql);

    if (exercise.check) {
      try {
        studentResult = lastSet(dbStudent.exec(exercise.check), exercise.check);
      } catch (error) {
        setFeedback("ko", `❌ Ta requête s'exécute, mais le résultat attendu n'existe pas (${error.message}). Relis bien le nom de la table ou de la colonne demandé.`);
        return;
      }
    } else {
      studentResult = lastSet(sets, sql);
    }
  } catch (error) {
    setFeedback("ko", `❌ Erreur SQL : ${error.message}`);
    return;
  } finally {
    dbStudent.close();
  }

  const dbExpected = freshDb();
  let expectedResult;
  try {
    const sets = dbExpected.exec(exercise.solution);
    expectedResult = exercise.check
      ? lastSet(dbExpected.exec(exercise.check), exercise.check)
      : lastSet(sets, exercise.solution);
  } finally {
    dbExpected.close();
  }

  const outcome = compare(studentResult, expectedResult, {
    ordered: Boolean(exercise.ordered),
    names: Boolean(exercise.names)
  });

  if (!outcome.ok) {
    setFeedback("ko", `❌ Pas encore. ${outcome.reason}`);
    return;
  }

  let message = "✅ Bravo, c'est exact !";

  if (!ctx.getUser()) {
    message += " (Connecte-toi pour enregistrer ta progression.)";
  } else if (!getDone()[exercise.id]) {
    try {
      const progress = await markExerciseDone(exercise.id);
      ctx.setProgress(progress);
    } catch (error) {
      message += " (⚠️ Progression non enregistrée.)";
    }
  }

  setFeedback("ok", message);
  renderSelectors();
  renderDots();
}

function showHint() {
  const box = $("pr-hint");
  box.hidden = false;
  box.replaceChildren(make("strong", "", "💡 Indice"), make("span", "", current().hint || ""));
}

function showSolution() {
  const box = $("pr-solution");
  box.hidden = false;
  box.replaceChildren(
    make("strong", "", "👁 Solution proposée"),
    make("pre", "", current().solution)
  );
}

/* ============================================================
   Rendu
============================================================ */

function chip(text, active, onClick) {
  const button = make("button", `chip${active ? " active" : ""}`, text);
  button.type = "button";
  button.setAttribute("aria-pressed", String(active));
  button.addEventListener("click", onClick);
  return button;
}

function renderSelectors() {
  const done = getDone();

  $("pr-themes").replaceChildren(
    ...themeOrder.map(key => {
      const all = levelOrder.flatMap(lv => exercises[key]?.[lv] || []);
      const count = all.filter(ex => done[ex.id]).length;

      return chip(
        `${themeIcons[key] || "📚"} ${quizData[key].title} (${count}/${all.length})`,
        key === theme,
        () => {
          saveDraft();
          theme = key;
          index = 0;
          renderSelectors();
          renderExercise();
        }
      );
    })
  );

  $("pr-levels").replaceChildren(
    ...levelOrder.map(key => {
      const all = exercises[theme]?.[key] || [];
      const count = all.filter(ex => done[ex.id]).length;

      return chip(`${levelNames[key]} (${count}/${all.length})`, key === level, () => {
        saveDraft();
        level = key;
        index = 0;
        renderSelectors();
        renderExercise();
      });
    })
  );

  const total = themeOrder.reduce(
    (sum, key) => sum + levelOrder.reduce((s, lv) => s + (exercises[key]?.[lv]?.length || 0), 0),
    0
  );
  const finished = Object.keys(done).length;

  $("pr-progress").textContent = ctx.getUser()
    ? `🏁 ${finished} / ${total} exercices réussis`
    : "Connecte-toi pour enregistrer les exercices réussis.";
}

function renderDots() {
  const done = getDone();

  $("pr-dots").replaceChildren(
    ...list().map((exercise, i) => {
      const button = make("button", "exam-dot", String(i + 1));
      button.type = "button";
      if (done[exercise.id]) button.classList.add("answered");
      if (i === index) button.classList.add("current");

      button.addEventListener("click", () => {
        saveDraft();
        index = i;
        renderExercise();
      });

      return button;
    })
  );
}

function saveDraft() {
  const exercise = current();
  if (exercise) drafts[exercise.id] = $("pr-editor").value;
}

function renderExercise() {
  const exercises_ = list();
  const exercise = current();
  if (!exercise) return;

  $("pr-counter").textContent = `Exercice ${index + 1} sur ${exercises_.length}`;
  $("pr-title").textContent = `${quizData[theme].title} · ${levelNames[level]}`;
  $("pr-prompt").textContent = exercise.prompt;
  $("pr-editor").value = drafts[exercise.id] || "";

  $("pr-hint").hidden = true;
  $("pr-solution").hidden = true;
  $("pr-result").replaceChildren();
  setFeedback("", "");

  if (getDone()[exercise.id]) {
    setFeedback("ok", "✅ Exercice déjà réussi. Tu peux le refaire pour t'entraîner.");
  }

  $("pr-prev").disabled = index === 0;
  $("pr-next").disabled = index === exercises_.length - 1;

  // Signalement de l'exercice (envoyé dans Firestore au clic)
  exerciseReport = [
    `Signalement - exercice ${exercise.id}`,
    [
      "Type : exercice pratique",
      `Identifiant : ${exercise.id}`,
      `Énoncé : ${exercise.prompt}`,
      `Solution attendue : ${exercise.solution}`
    ]
  ];

  renderDots();
}

function renderTables() {
  const container = $("pr-tables");
  container.replaceChildren();

  const db = freshDb();

  try {
    const names = db
      .exec("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")[0]
      .values.map(row => row[0]);

    names.forEach(name => {
      const columns = db
        .exec(`SELECT name FROM pragma_table_info('${name}') ORDER BY cid`)[0]
        .values.map(row => row[0]);

      const item = make("div", "pr-table-item");
      item.append(
        make("strong", "", name),
        make("small", "", columns.join(", "))
      );

      const preview = make("button", "button button-sm button-outline", "Aperçu");
      preview.type = "button";
      preview.addEventListener("click", () => {
        const previewDb = freshDb();
        try {
          const sets = previewDb.exec(`SELECT * FROM ${name}`);
          showTable(sets[0], `Contenu de la table ${name} :`);
          setFeedback("info", `Aperçu de la table ${name}.`);
        } finally {
          previewDb.close();
        }
      });

      item.appendChild(preview);
      container.appendChild(item);
    });
  } finally {
    db.close();
  }
}

/* ============================================================
   Point d'entrée
============================================================ */

function bindEvents() {
  if (bound) return;
  bound = true;

  $("pr-run").addEventListener("click", run);
  $("pr-check").addEventListener("click", verify);
  $("pr-hint-btn").addEventListener("click", showHint);
  $("pr-solution-btn").addEventListener("click", showSolution);

  $("pr-report").addEventListener("click", event => {
    event.preventDefault();
    if (exerciseReport) openReport(...exerciseReport);
  });

  $("pr-reset").addEventListener("click", () => {
    $("pr-editor").value = "";
    drafts[current().id] = "";
    $("pr-result").replaceChildren();
    setFeedback("", "");
  });

  $("pr-prev").addEventListener("click", () => {
    if (index > 0) {
      saveDraft();
      index -= 1;
      renderExercise();
    }
  });

  $("pr-next").addEventListener("click", () => {
    if (index < list().length - 1) {
      saveDraft();
      index += 1;
      renderExercise();
    }
  });

  $("pr-editor").addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      run();
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      const editor = event.target;
      const start = editor.selectionStart;
      editor.setRangeText("  ", start, editor.selectionEnd, "end");
    }
  });

  $("pr-retry").addEventListener("click", showPractice);
}

export function initPractice(context) {
  ctx = context;
  bindEvents();
}

export async function showPractice() {
  $("pr-app").hidden = true;
  $("pr-status").hidden = false;
  $("pr-retry").hidden = true;
  $("pr-status-text").textContent = "⏳ Chargement du moteur SQL… (quelques secondes la première fois)";

  try {
    await loadSqlJs();
  } catch (error) {
    $("pr-status-text").textContent = `❌ ${error.message}`;
    $("pr-retry").hidden = false;
    return;
  }

  $("pr-status").hidden = true;
  $("pr-app").hidden = false;

  renderSelectors();
  renderExercise();
  renderTables();
}
