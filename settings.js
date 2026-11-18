// settings.js
// Réglages simples de la plateforme.

// Adresse qui reçoit les signalements d'erreurs.
// Tu peux la remplacer par une adresse dédiée (ex. support@tondomaine.com).
export const REPORT_EMAIL = "oulimatat17@gmail.com";

export const SITE_NAME = "SQL Master Quiz";

// Les liens « mailto: » trop longs sont refusés par certains navigateurs
// et clients mail : on limite donc la taille du corps du message.
const MAX_BODY_LENGTH = 1500;

function cut(text, max) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

// Construit un lien « mailto: » avec un email déjà rédigé.
export function reportHref(subject, lines = []) {
  const details = lines.map(line => cut(String(line ?? ""), 400));

  let body = [
    "Bonjour,",
    "",
    `Je signale un problème sur ${SITE_NAME}.`,
    "",
    ...details,
    "",
    `Page : ${window.location.href.split("#")[0]}`,
    "",
    "Mon commentaire (que faut-il corriger ?) :",
    "",
    ""
  ].join("\n");

  body = cut(body, MAX_BODY_LENGTH);

  return `mailto:${REPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
