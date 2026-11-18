// settings.js
// Réglages simples de la plateforme.

// ⚠️ REMPLACE cette adresse par TON email : c'est là que arriveront les signalements.
export const REPORT_EMAIL = "votre.email@exemple.com";

// Construit un lien « mailto: » avec un email déjà rédigé.
export function reportHref(subject, lines = []) {
  const body = [
    "Bonjour,",
    "",
    "Je signale un problème sur SQL Master Quiz.",
    "",
    ...lines,
    "",
    `Page : ${window.location.href.split("#")[0]}`,
    "",
    "Mon commentaire (que faut-il corriger ?) :",
    "",
    ""
  ].join("\n");

  return `mailto:${REPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
