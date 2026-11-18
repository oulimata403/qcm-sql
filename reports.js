// reports.js — signalement d'erreurs enregistré dans Firestore (collection "reports")
// Le signalement apparaît ensuite dans le tableau de bord administrateur.

import { auth, db, collection, addDoc, serverTimestamp } from "./firebase-config.js";

const COOLDOWN_MS = 15000; // anti-spam : 1 signalement toutes les 15 secondes

let lastSent = 0;
let modal = null;
let current = null;
const ref = {};

function setStatus(type, text) {
  ref.status.className = `pr-feedback ${type}`;
  ref.status.textContent = text;
}

// Récupère « Type : … » et « Identifiant : … » dans les lignes déjà préparées par app.js / practice.js
function parse(lines) {
  const find = label => {
    const line = lines.find(item => item.startsWith(label));
    return line ? line.slice(label.length).trim() : "";
  };
  return { type: find("Type :"), itemId: find("Identifiant :") };
}

function close() {
  if (!modal) return;
  modal.hidden = true;
  document.body.classList.remove("modal-open");
}

function build() {
  modal = document.createElement("div");
  modal.className = "modal";
  modal.hidden = true;

  modal.innerHTML = `
    <div class="modal-backdrop" data-close="true"></div>
    <div class="modal-dialog report-dialog" role="dialog" aria-modal="true" aria-labelledby="rp-title">
      <button class="modal-close" type="button" data-close="true" aria-label="Fermer">✕</button>
      <h2 id="rp-title">🚩 Signaler une erreur</h2>
      <p id="rp-target" class="report-target"></p>
      <div id="rp-login" class="callout warning" hidden>
        <strong>Connexion requise</strong>
        <span>Connecte-toi avec Google pour envoyer un signalement.</span>
      </div>
      <div class="field">
        <label for="rp-comment">Qu'est-ce qui est faux ou pas clair ?</label>
        <textarea id="rp-comment" class="report-textarea" rows="5" maxlength="1000"
          placeholder="Ex. : la bonne réponse est B, pas A, parce que…"></textarea>
      </div>
      <p id="rp-status" class="pr-feedback" role="status" aria-live="polite"></p>
      <div class="rev-actions">
        <button id="rp-send" class="button" type="button">📨 Envoyer le signalement</button>
        <button class="button button-outline" type="button" data-close="true">Annuler</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  ref.target = modal.querySelector("#rp-target");
  ref.login = modal.querySelector("#rp-login");
  ref.comment = modal.querySelector("#rp-comment");
  ref.status = modal.querySelector("#rp-status");
  ref.send = modal.querySelector("#rp-send");

  modal.addEventListener("click", event => {
    if (event.target.dataset.close) close();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !modal.hidden) close();
  });

  ref.send.addEventListener("click", send);
}

async function send() {
  const user = auth.currentUser;

  if (!user) {
    setStatus("ko", "Connecte-toi pour envoyer un signalement.");
    return;
  }

  const comment = ref.comment.value.trim();

  if (comment.length < 3) {
    setStatus("ko", "Explique en quelques mots ce qu'il faut corriger.");
    return;
  }

  if (Date.now() - lastSent < COOLDOWN_MS) {
    setStatus("ko", "Patiente quelques secondes avant un nouveau signalement.");
    return;
  }

  ref.send.disabled = true;
  setStatus("info", "Envoi en cours…");

  try {
    const { type, itemId } = parse(current.lines);

    await addDoc(collection(db, "reports"), {
      userId: user.uid,
      userEmail: user.email || "",
      userName: user.displayName || "Utilisateur",
      type: type.slice(0, 40),
      itemId: itemId.slice(0, 100),
      title: current.subject.slice(0, 300),
      details: current.lines.join("\n").slice(0, 2000),
      comment: comment.slice(0, 1000),
      page: window.location.href.split("#")[0].slice(0, 300),
      status: "new",
      createdAt: serverTimestamp()
    });

    lastSent = Date.now();
    ref.comment.value = "";
    setStatus("ok", "✅ Merci ! Ton signalement a bien été envoyé.");
    setTimeout(close, 1500);
  } catch (error) {
    console.error("Erreur envoi signalement :", error);
    setStatus("ko", `❌ Envoi impossible (${error?.code || error?.message || "erreur"}).`);
  } finally {
    ref.send.disabled = !auth.currentUser;
  }
}

// Même signature que l'ancien reportHref(subject, lines)
export function openReport(subject, lines = []) {
  if (!modal) build();

  current = {
    subject: String(subject || "Signalement"),
    lines: lines.map(line => String(line ?? ""))
  };

  const user = auth.currentUser;

  ref.target.textContent = current.subject.replace(/^Signalement - /, "Concerne : ");
  ref.comment.value = "";
  ref.login.hidden = Boolean(user);
  ref.send.disabled = !user;
  setStatus("", "");

  modal.hidden = false;
  document.body.classList.add("modal-open");
  ref.comment.focus();
}
