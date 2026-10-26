// admin.js — tableau de bord administrateur (lecture seule)

import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  collection,
  getDocs,
  query,
  orderBy,
  limit
} from "./firebase-config.js";

import {
  quizData,
  themeOrder,
  levelOrder,
  PASS_RATIO,
  findQuestion
} from "./questions.js";

import { checkIsAdmin } from "./configstore.js";

/* ============================================================
   Outils
============================================================ */

const $ = id => document.getElementById(id);

const DAY = 24 * 60 * 60 * 1000;
const WEEK = 7 * DAY;
const PASS_PERCENT = Math.round(PASS_RATIO * 100);
const TOTAL_LEVELS = themeOrder.length * levelOrder.length;

let users = [];
let visibleUsers = [];

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function toMs(value) {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value === "number") return value;
  return 0;
}

function levelLabel(level) {
  return { debutant: "Débutant", intermediaire: "Intermédiaire", avance: "Avancé" }[level] || level;
}

function formatDate(ms, withYear = true) {
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    ...(withYear ? { year: "numeric" } : {})
  });
}

function dayLabel(ms) {
  const date = new Date(ms);
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function startOfDay(ms) {
  const date = new Date(ms);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function ago(ms) {
  if (!ms) return "jamais";
  const days = Math.floor((Date.now() - ms) / DAY);
  if (days <= 0) return "aujourd'hui";
  if (days === 1) return "hier";
  if (days < 30) return `il y a ${days} j`;
  return `il y a ${Math.floor(days / 30)} mois`;
}

function entryPercent(entry) {
  return Math.round((Number(entry.score) / (Number(entry.total) || 1)) * 100);
}

function formatTime(totalSeconds) {
  const seconds = Math.max(0, Math.round(totalSeconds));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

/* ============================================================
   Préparation des données
============================================================ */

function toUser(id, data) {
  const progress = data.progress || {};
  const history = Array.isArray(progress.history) ? progress.history : [];
  const exams = Array.isArray(progress.exams) ? progress.exams : [];
  const mistakes = progress.mistakes && typeof progress.mistakes === "object" ? progress.mistakes : {};
  const completedLevels = progress.completedLevels || {};
  const bestPercent = progress.bestPercent || {};

  const completed = Object.values(completedLevels).filter(Boolean).length;
  const bests = Object.values(bestPercent).map(Number);
  const percents = history.map(entryPercent);

  return {
    id,
    name: data.fullName || "Utilisateur",
    email: data.email || "",
    createdAt: toMs(data.createdAt),
    lastLogin: toMs(data.lastLoginAt),
    completed,
    progressPct: Math.round((completed / TOTAL_LEVELS) * 100),
    quizzes: Number(data.totalQuizzes || progress.totalQuizzes || 0),
    best: bests.length ? Math.max(...bests) : 0,
    avg: percents.length
      ? Math.round(percents.reduce((sum, value) => sum + value, 0) / percents.length)
      : null,
    history,
    exams,
    mistakes,
    bestPercent
  };
}

async function loadUsers() {
  $("a-updated").textContent = "Chargement des utilisateurs…";

  try {
    const snapshot = await getDocs(
      query(collection(db, "users"), orderBy("lastLoginAt", "desc"), limit(500))
    );

    users = snapshot.docs.map(item => toUser(item.id, item.data()));

    $("a-updated").textContent =
      `Mis à jour le ${new Date().toLocaleString("fr-FR")} · ${users.length} utilisateur(s) chargé(s)`;

    renderAll();
  } catch (error) {
    console.error("Erreur chargement des utilisateurs :", error);
    $("a-updated").textContent =
      `Erreur : ${error?.code || error?.message || "inconnue"}. Vérifie que les règles Firestore autorisent l'administrateur.`;
  }
}

/* ============================================================
   Graphiques
============================================================ */

function columnChart(items, cls = "") {
  if (items.every(item => item.value === 0)) {
    return `<p class="empty-chart">Pas encore de données à afficher.</p>`;
  }

  const W = 560, H = 220, L = 8, R = 8, T = 24, B = 34;
  const max = Math.max(1, ...items.map(item => item.value));
  const slot = (W - L - R) / items.length;
  const barWidth = Math.min(46, slot * 0.7);

  const bars = items.map((item, index) => {
    const height = ((H - T - B) * item.value) / max;
    const x = L + slot * index + (slot - barWidth) / 2;
    const y = H - B - height;

    return `
      <rect class="bar ${cls}" x="${x}" y="${y}" width="${barWidth}" height="${item.value ? Math.max(height, 2) : 0}" rx="5">
        <title>${esc(item.label)} : ${item.value}</title>
      </rect>
      <text class="bar-value" x="${x + barWidth / 2}" y="${y - 6}" text-anchor="middle">${item.value}</text>
      <text x="${x + barWidth / 2}" y="${H - 12}" text-anchor="middle">${esc(item.label)}</text>
    `;
  }).join("");

  return `
    <svg viewBox="0 0 ${W} ${H}" class="chart" role="img">
      <line class="grid" x1="${L}" x2="${W - R}" y1="${H - B}" y2="${H - B}"/>
      ${bars}
    </svg>
  `;
}

function barRow(label, percent, rightText, passed) {
  return `
    <div class="a-bar">
      <span>${esc(label)}</span>
      <div class="j-bar-track">
        <div class="j-bar-fill ${passed ? "passed" : ""}" style="width:${Math.max(0, Math.min(100, percent))}%"></div>
      </div>
      <b>${esc(rightText)}</b>
    </div>
  `;
}

/* ============================================================
   Rendu du tableau de bord
============================================================ */

function renderKpis() {
  const now = Date.now();
  const total = users.length;

  const active = users.filter(user => now - user.lastLogin <= WEEK).length;
  const fresh = users.filter(user => user.createdAt && now - user.createdAt <= WEEK).length;
  const quizzes = users.reduce((sum, user) => sum + user.quizzes, 0);
  const exams = users.reduce((sum, user) => sum + user.exams.length, 0);
  const finished = users.filter(user => user.progressPct === 100).length;

  const avgProgress = total
    ? Math.round(users.reduce((sum, user) => sum + user.progressPct, 0) / total)
    : 0;

  const scored = users.filter(user => user.avg !== null);
  const avgScore = scored.length
    ? Math.round(scored.reduce((sum, user) => sum + user.avg, 0) / scored.length)
    : 0;

  const cards = [
    ["👥", total, "Utilisateurs"],
    ["🟢", active, "Actifs (7 jours)"],
    ["🆕", fresh, "Nouveaux (7 jours)"],
    ["📝", quizzes, "Quiz réalisés"],
    ["⏱️", exams, "Examens passés"],
    ["🏁", `${avgProgress} %`, "Progression moyenne"],
    ["🎯", `${avgScore} %`, "Score moyen"],
    ["🎓", finished, "Parcours terminés"]
  ];

  $("a-kpis").innerHTML = cards
    .map(([icon, value, label]) => `<article class="kpi"><span>${icon}</span><strong>${value}</strong><small>${label}</small></article>`)
    .join("");
}

function renderSignups() {
  const now = Date.now();
  const buckets = Array(8).fill(0);

  users.forEach(user => {
    if (!user.createdAt) return;
    const index = Math.floor((now - user.createdAt) / WEEK);
    if (index >= 0 && index < 8) buckets[index] += 1;
  });

  const items = buckets
    .map((value, index) => ({ label: dayLabel(now - (index + 1) * WEEK), value }))
    .reverse();

  $("a-signups").innerHTML = columnChart(items, "");
}

function renderActivity() {
  const today = startOfDay(Date.now());
  const buckets = Array(14).fill(0);

  const count = at => {
    const index = Math.floor((today - startOfDay(at)) / DAY);
    if (index >= 0 && index < 14) buckets[index] += 1;
  };

  users.forEach(user => {
    user.history.forEach(entry => count(Number(entry.at) || 0));
    user.exams.forEach(exam => count(Number(exam.at) || 0));
  });

  const items = buckets
    .map((value, index) => ({ label: dayLabel(today - index * DAY), value }))
    .reverse();

  $("a-activity").innerHTML = columnChart(items, "gold");
}

function renderDifficulty() {
  const stats = {};

  users.forEach(user => {
    user.history.forEach(entry => {
      const key = `${entry.theme}|${entry.level}`;
      stats[key] = stats[key] || { sum: 0, count: 0 };
      stats[key].sum += entryPercent(entry);
      stats[key].count += 1;
    });
  });

  const rows = Object.entries(stats)
    .map(([key, value]) => {
      const [theme, level] = key.split("|");
      return {
        label: `${quizData[theme]?.title || theme} · ${levelLabel(level)}`,
        avg: Math.round(value.sum / value.count),
        count: value.count
      };
    })
    .sort((a, b) => a.avg - b.avg);

  $("a-difficulty").innerHTML = rows.length
    ? rows.map(row => barRow(row.label, row.avg, `${row.avg} % · ${row.count} essai(s)`, row.avg >= PASS_PERCENT)).join("")
    : `<p class="empty-chart">Aucun quiz réalisé pour l'instant.</p>`;
}

function renderDistribution() {
  const buckets = [
    { label: "0 %", test: pct => pct === 0 },
    { label: "1-25 %", test: pct => pct >= 1 && pct <= 25 },
    { label: "26-50 %", test: pct => pct >= 26 && pct <= 50 },
    { label: "51-75 %", test: pct => pct >= 51 && pct <= 75 },
    { label: "76-99 %", test: pct => pct >= 76 && pct <= 99 },
    { label: "100 %", test: pct => pct === 100 }
  ];

  const items = buckets.map(bucket => ({
    label: bucket.label,
    value: users.filter(user => bucket.test(user.progressPct)).length
  }));

  $("a-distribution").innerHTML = columnChart(items, "coral");
}

function renderMissed() {
  const stats = {};

  users.forEach(user => {
    Object.entries(user.mistakes).forEach(([id, mistake]) => {
      stats[id] = stats[id] || { wrong: 0, people: 0 };
      stats[id].wrong += Number(mistake?.wrong || 1);
      stats[id].people += 1;
    });
  });

  const top = Object.entries(stats)
    .map(([id, value]) => ({ id, question: findQuestion(id), ...value }))
    .filter(item => item.question)
    .sort((a, b) => b.wrong - a.wrong || b.people - a.people)
    .slice(0, 10);

  $("a-missed").innerHTML = top.length
    ? top.map(item => `
        <div class="missed-item">
          <div>
            <strong>${esc(item.question.text)}</strong>
            <small>${esc(quizData[item.question.theme]?.title)} · ${levelLabel(item.question.level)} · bonne réponse : ${esc(item.question.correct)}</small>
          </div>
          <span class="pill pill-danger">${item.wrong} erreur(s) · ${item.people} élève(s)</span>
        </div>
      `).join("")
    : `<p class="empty-chart">Aucune erreur enregistrée pour l'instant.</p>`;
}

/* ---------- Tableau des utilisateurs ---------- */

function sortUsers(list, mode) {
  const sorters = {
    last: (a, b) => b.lastLogin - a.lastLogin,
    progress: (a, b) => b.progressPct - a.progressPct || b.quizzes - a.quizzes,
    quizzes: (a, b) => b.quizzes - a.quizzes,
    best: (a, b) => b.best - a.best,
    created: (a, b) => b.createdAt - a.createdAt,
    name: (a, b) => a.name.localeCompare(b.name, "fr")
  };

  return [...list].sort(sorters[mode] || sorters.last);
}

function renderTable() {
  const term = $("a-search").value.trim().toLowerCase();

  const filtered = users.filter(user =>
    !term || user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term)
  );

  visibleUsers = sortUsers(filtered, $("a-sort").value);

  $("a-count").textContent = `${visibleUsers.length} / ${users.length}`;

  $("a-table-body").innerHTML = visibleUsers.length
    ? visibleUsers.map(user => `
        <tr data-uid="${esc(user.id)}">
          <td><strong>${esc(user.name)}</strong><small>${esc(user.email)}</small></td>
          <td><span class="mini-bar"><i style="width:${user.progressPct}%"></i></span><b>${user.progressPct} %</b><small>${user.completed}/${TOTAL_LEVELS} niveaux</small></td>
          <td>${user.quizzes}</td>
          <td>${user.exams.length}</td>
          <td>${user.best} %</td>
          <td>${user.avg === null ? "—" : `${user.avg} %`}</td>
          <td>${formatDate(user.createdAt)}</td>
          <td>${formatDate(user.lastLogin)}<small>${ago(user.lastLogin)}</small></td>
        </tr>
      `).join("")
    : `<tr><td colspan="8"><p class="empty-chart">Aucun utilisateur trouvé.</p></td></tr>`;
}

function renderAll() {
  renderKpis();
  renderSignups();
  renderActivity();
  renderDifficulty();
  renderDistribution();
  renderMissed();
  renderTable();
}

/* ============================================================
   Détail d'un utilisateur
============================================================ */

function openUser(id) {
  const user = users.find(item => item.id === id);
  if (!user) return;

  const initial = esc(user.name.trim().charAt(0).toUpperCase() || "?");

  const recent = user.history.slice(-12).map((entry, index) => ({
    label: `#${index + 1}`,
    value: entryPercent(entry)
  }));

  const themeRows = themeOrder.map(theme => `
    <div class="j-theme-row">
      <h4>${esc(quizData[theme].title)}</h4>
      ${levelOrder.map(level => {
        const best = Number(user.bestPercent[`${theme}-${level}`] || 0);
        return barRow(levelLabel(level), best, `${best} %`, best >= PASS_PERCENT);
      }).join("")}
    </div>
  `).join("");

  const history = [...user.history].reverse().slice(0, 8).map(entry => {
    const percent = entryPercent(entry);
    return `
      <div class="j-history-item">
        <div>
          <strong>${esc(quizData[entry.theme]?.title || entry.theme)}</strong>
          <small>${levelLabel(entry.level)} · ${formatDate(Number(entry.at))}</small>
        </div>
        <span class="j-score ${percent >= PASS_PERCENT ? "good" : "bad"}">${entry.score}/${entry.total} · ${percent} %</span>
      </div>
    `;
  }).join("") || `<p class="empty-chart">Aucun quiz.</p>`;

  const exams = [...user.exams].reverse().slice(0, 5).map(exam => `
    <div class="j-history-item">
      <div>
        <strong>Examen de ${exam.total} questions</strong>
        <small>${formatDate(Number(exam.at))} · ${formatTime(exam.used)} / ${formatTime(exam.limit)}</small>
      </div>
      <span class="j-score ${exam.percent >= PASS_PERCENT ? "good" : "bad"}">${exam.score}/${exam.total} · ${exam.percent} %</span>
    </div>
  `).join("") || `<p class="empty-chart">Aucun examen.</p>`;

  const toReview = Object.keys(user.mistakes).length;

  $("u-content").innerHTML = `
    <div class="u-head">
      <span class="avatar">${initial}</span>
      <div>
        <h2>${esc(user.name)}</h2>
        <p>${esc(user.email)} · inscrit le ${formatDate(user.createdAt)} · vu ${ago(user.lastLogin)}</p>
      </div>
    </div>

    <div class="j-stats" style="margin-bottom:16px">
      <article class="j-stat"><span>🏁</span><strong>${user.progressPct} %</strong><small>Progression</small></article>
      <article class="j-stat"><span>📝</span><strong>${user.quizzes}</strong><small>Quiz réalisés</small></article>
      <article class="j-stat"><span>⏱️</span><strong>${user.exams.length}</strong><small>Examens</small></article>
      <article class="j-stat"><span>📌</span><strong>${toReview}</strong><small>Questions à revoir</small></article>
    </div>

    <section class="j-card">
      <div class="j-card-head"><h3>📈 Derniers scores (en %)</h3></div>
      ${columnChart(recent, "gold")}
    </section>

    <section class="j-card">
      <div class="j-card-head"><h3>📊 Meilleurs scores par niveau</h3></div>
      ${themeRows}
    </section>

    <div class="j-two">
      <section class="j-card"><div class="j-card-head"><h3>🕘 Derniers quiz</h3></div>${history}</section>
      <section class="j-card"><div class="j-card-head"><h3>⏱️ Derniers examens</h3></div>${exams}</section>
    </div>
  `;

  $("user-modal").hidden = false;
  document.body.classList.add("modal-open");
  $("user-modal-close").focus();
}

function closeUser() {
  $("user-modal").hidden = true;
  document.body.classList.remove("modal-open");
}

/* ============================================================
   Export CSV
============================================================ */

function csvCell(value) {
  let text = String(value ?? "");
  // Protection contre l'injection de formules dans Excel
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

function exportCsv() {
  const headers = [
    "Nom", "Email", "Progression (%)", "Niveaux réussis", "Quiz", "Examens",
    "Meilleur score (%)", "Moyenne (%)", "Inscrit le", "Dernière connexion"
  ];

  const rows = visibleUsers.map(user => [
    user.name,
    user.email,
    user.progressPct,
    user.completed,
    user.quizzes,
    user.exams.length,
    user.best,
    user.avg === null ? "" : user.avg,
    user.createdAt ? new Date(user.createdAt).toISOString().slice(0, 10) : "",
    user.lastLogin ? new Date(user.lastLogin).toISOString().slice(0, 10) : ""
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(csvCell).join(";"))
    .join("\r\n");

  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `sql-master-utilisateurs-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/* ============================================================
   Authentification et initialisation
============================================================ */

function showGate(title, text) {
  $("admin-gate").hidden = false;
  $("admin-dashboard").hidden = true;
  $("admin-gate-title").textContent = title;
  $("admin-gate-text").textContent = text;
}

$("admin-login").addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    alert(`Connexion impossible : ${error?.code || error?.message || error}`);
  }
});

$("admin-logout").addEventListener("click", () => signOut(auth));
$("a-refresh").addEventListener("click", loadUsers);
$("a-export").addEventListener("click", exportCsv);
$("a-search").addEventListener("input", renderTable);
$("a-sort").addEventListener("change", renderTable);

$("a-table-body").addEventListener("click", event => {
  const row = event.target.closest("tr[data-uid]");
  if (row) openUser(row.dataset.uid);
});

$("user-modal-close").addEventListener("click", closeUser);
$("user-modal").addEventListener("click", event => {
  if (event.target.dataset.close) closeUser();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !$("user-modal").hidden) closeUser();
});

onAuthStateChanged(auth, async user => {
  $("admin-login").hidden = Boolean(user);
  $("admin-logout").hidden = !user;
  $("admin-user-name").textContent = user ? user.displayName || user.email || "" : "";

  if (!user) {
    users = [];
    showGate(
      "Espace réservé à l'administrateur",
      "Connecte-toi avec le compte Google administrateur pour continuer."
    );
    return;
  }

  const admin = await checkIsAdmin(user);

  if (!admin) {
    showGate(
      "Accès refusé 🚫",
      `Ce compte n'est pas administrateur. Si c'est bien le tien, crée dans Firestore le document admins/${user.uid} (voir les instructions), puis recharge cette page.`
    );
    return;
  }

  $("admin-gate").hidden = true;
  $("admin-dashboard").hidden = false;

  await loadUsers();
});
