// questions.js
// Format compact : [question, bonneReponse, faux1, faux2, faux3, explication]
// Les options sont mélangées automatiquement dans app.js.

export const PASS_RATIO = 0.7; // 70 % = 14/20 pour valider un niveau

export const themeOrder = ["fondamentaux", "manipulation", "jointures", "avance"];
export const levelOrder = ["debutant", "intermediaire", "avance"];

const mk = rows =>
  rows.map(([text, correct, a, b, c, explanation]) => ({
    text,
    correct,
    options: [correct, a, b, c],
    explanation
  }));

export const quizData = {
  /* ============================================================
     THÈME 1 — FONDAMENTAUX
  ============================================================ */
  fondamentaux: {
    title: "Fondamentaux SQL",
    description: "Lire, filtrer et trier des données : SELECT, WHERE, ORDER BY, NULL, LIKE…",
    levels: {
      debutant: mk([
        ["Quelle commande SQL permet de lire des données ?", "SELECT", "UPDATE", "DELETE", "INSERT", "SELECT récupère des données sans jamais les modifier."],
        ["Quelle clause indique la table utilisée par la requête ?", "FROM", "WHERE", "HAVING", "ORDER BY", "FROM désigne la table source des données."],
        ["Quelle clause filtre les lignes selon une condition ?", "WHERE", "ORDER BY", "DISTINCT", "GROUP BY", "WHERE ne garde que les lignes qui respectent la condition."],
        ["Quelle requête affiche toutes les colonnes de la table clients ?", "SELECT * FROM clients;", "GET * clients;", "SHOW clients;", "SELECT clients;", "L'astérisque * représente toutes les colonnes."],
        ["Quel mot-clé supprime les doublons dans un résultat ?", "DISTINCT", "REMOVE", "FILTER", "SINGLE", "DISTINCT affiche chaque valeur une seule fois. (UNIQUE existe, mais comme contrainte de table.)"],
        ["Quelle condition sélectionne les prix supérieurs à 1000 ?", "WHERE prix > 1000", "WHERE prix = 1000", "WHERE prix < 1000", "ORDER BY prix > 1000", "Le signe > signifie « strictement supérieur à »."],
        ["Quel symbole teste l'égalité en SQL ?", "=", "==", "=>", ":=", "SQL utilise un seul signe = pour comparer (pas ==)."],
        ["Quelle requête affiche uniquement le nom et l'email des clients ?", "SELECT nom, email FROM clients;", "FROM clients SELECT nom, email;", "GET nom, email FROM clients;", "SELECT clients FROM nom, email;", "SELECT liste les colonnes voulues, puis FROM la table."],
        ["Quelle clause trie les résultats ?", "ORDER BY", "GROUP BY", "WHERE", "DISTINCT", "ORDER BY trie le résultat final. GROUP BY, lui, regroupe."],
        ["Que signifie ORDER BY prix DESC ?", "Du plus grand au plus petit prix", "Du plus petit au plus grand prix", "Supprimer les prix", "Filtrer les prix", "DESC = décroissant ; ASC = croissant."],
        ["Que signifie l'opérateur AND entre deux conditions ?", "Les deux conditions doivent être vraies", "Une seule condition suffit", "Aucune condition ne doit être vraie", "Il trie les résultats", "AND est restrictif : il faut que tout soit vrai."],
        ["Que signifie l'opérateur OR entre deux conditions ?", "Au moins une condition doit être vraie", "Les deux doivent être vraies", "Les deux doivent être fausses", "Il supprime les doublons", "OR est plus large : une seule condition suffit."],
        ["Sans précision, dans quel sens ORDER BY trie-t-il ?", "Croissant (ASC)", "Décroissant (DESC)", "Aléatoire", "Dans l'ordre d'insertion garanti", "ASC est la valeur par défaut."],
        ["Comment écrit-on une valeur texte dans une requête ?", "Entre apostrophes : 'Dakar'", "Entre parenthèses : (Dakar)", "Entre crochets : [Dakar]", "Entre accolades : {Dakar}", "En SQL standard, les chaînes se notent avec des apostrophes simples."],
        ["Comment limiter le résultat à 5 lignes (MySQL / PostgreSQL) ?", "LIMIT 5", "MAX 5", "STOP AT 5", "COUNT 5", "LIMIT s'écrit à la fin de la requête. Sous SQL Server, on utilise SELECT TOP 5."],
        ["Quel mot-clé renomme une colonne dans le résultat ?", "AS", "RENAME", "TO", "NAME", "SELECT prix AS tarif donne un alias (nom temporaire) à la colonne."],
        ["Que retourne SELECT 2 + 3; ?", "5", "'2 + 3'", "NULL", "Une erreur de syntaxe", "SQL sait calculer : le résultat est 5."],
        ["Un SELECT modifie-t-il les données de la table ?", "Non, il se contente de lire", "Oui, il supprime les doublons définitivement", "Oui, il trie physiquement la table", "Oui, il vide la table", "SELECT est une commande de lecture seule."],
        ["Quel opérateur signifie « différent de » ?", "<>", "=!", "!!", "NOT=", "<> est le standard SQL (!= fonctionne aussi dans la plupart des SGBD)."],
        ["Qu'est-ce qu'une table en SQL ?", "Un ensemble de lignes et de colonnes", "Un fichier image", "Un mot de passe", "Une requête enregistrée", "Une table organise les données en colonnes (champs) et lignes (enregistrements)."]
      ]),

      intermediaire: mk([
        ["Comment vérifier qu'une valeur est NULL ?", "colonne IS NULL", "colonne = NULL", "colonne == NULL", "colonne EMPTY", "NULL n'est pas une valeur : on le teste avec IS NULL, jamais avec =."],
        ["Quel opérateur compare une valeur à une liste de possibilités ?", "IN", "BETWEEN", "LIKE", "ORDER BY", "IN ('a','b','c') remplace plusieurs OR."],
        ["À quoi sert LIKE ?", "Rechercher du texte selon un modèle", "Créer une table", "Supprimer des doublons", "Additionner des colonnes", "LIKE utilise des caractères génériques comme % et _."],
        ["Dans LIKE 'Da%', que signifie % ?", "Zéro, un ou plusieurs caractères", "Exactement un caractère", "Un chiffre obligatoire", "Un espace", "% remplace n'importe quelle suite de caractères (même vide)."],
        ["Quelle condition sélectionne les âges de 18 à 30 ans inclus ?", "WHERE age BETWEEN 18 AND 30", "WHERE age = 18 TO 30", "WHERE age > 18 OR age < 30", "WHERE age IN 18, 30", "BETWEEN inclut les deux bornes (18 et 30)."],
        ["Comment trier les noms de A à Z ?", "ORDER BY nom ASC", "ORDER BY nom DESC", "GROUP BY nom ASC", "WHERE nom ASC", "ASC = croissant, donc A → Z."],
        ["Quelle condition sélectionne les clients hors de Dakar ?", "WHERE ville <> 'Dakar'", "WHERE ville NOT 'Dakar'", "WHERE ville =! 'Dakar'", "WHERE ville DIFFERENT 'Dakar'", "<> signifie différent de."],
        ["Comment sélectionner les clients de Dakar ou de Thiès ?", "WHERE ville IN ('Dakar', 'Thiès')", "WHERE ville = ('Dakar', 'Thiès')", "WHERE ville BETWEEN 'Dakar' AND 'Thiès'", "WHERE ville LIKE ('Dakar', 'Thiès')", "IN est fait pour tester une liste de valeurs."],
        ["Quelle expression applique une réduction de 10 % ?", "prix * 0.90", "prix / 10", "prix - 10", "prix + 0.90", "Payer 90 % du prix revient à multiplier par 0,90."],
        ["Que signifie _ (underscore) dans LIKE 'A_' ?", "Exactement un caractère", "Zéro ou plusieurs caractères", "Un espace", "Un chiffre", "'A_' correspond à « Al », « Ab »… mais pas à « Abc »."],
        ["Que fait NOT IN ('Dakar', 'Thiès') ?", "Exclut les lignes dont la valeur est dans la liste", "Garde uniquement Dakar et Thiès", "Trie par ville", "Supprime ces villes de la table", "NOT IN inverse le test de IN."],
        ["Comment trier par ville, puis par nom à l'intérieur de chaque ville ?", "ORDER BY ville, nom", "ORDER BY nom, ville", "GROUP BY ville, nom", "SORT ville THEN nom", "Le premier critère domine ; le second départage les égalités."],
        ["Dans a = 1 OR b = 2 AND c = 3, quel opérateur est évalué en premier ?", "AND", "OR", "Aucun, tout est évalué en même temps", "Celui de gauche", "AND est prioritaire sur OR : utilisez des parenthèses pour éviter les surprises."],
        ["Quelle condition garde uniquement les lignes où email est renseigné ?", "WHERE email IS NOT NULL", "WHERE email != NULL", "WHERE email <> NULL", "WHERE email NOT EMPTY", "IS NOT NULL est la seule écriture fiable."],
        ["BETWEEN 10 AND 20 inclut-il 10 et 20 ?", "Oui, les deux bornes sont incluses", "Non, aucune borne", "Seulement 10", "Seulement 20", "BETWEEN est inclusif aux deux extrémités."],
        ["Quels noms correspondent à LIKE '%a' ?", "Ceux qui se terminent par a", "Ceux qui commencent par a", "Ceux qui contiennent a au milieu uniquement", "Ceux de 1 seule lettre", "% devant : n'importe quoi avant, puis a à la fin."],
        ["Quelle condition cherche les noms qui contiennent « an » ?", "WHERE nom LIKE '%an%'", "WHERE nom LIKE 'an%'", "WHERE nom = '%an%'", "WHERE nom IN 'an'", "Un % de chaque côté : « an » peut être n'importe où."],
        ["Quelle requête compte le nombre de clients ?", "SELECT COUNT(*) FROM clients;", "SELECT NUMBER FROM clients;", "COUNT clients;", "SELECT SUM(*) FROM clients;", "COUNT(*) compte toutes les lignes."],
        ["Que fait SELECT DISTINCT ville FROM clients ; ?", "Affiche chaque ville une seule fois", "Supprime les clients en double", "Compte les villes", "Trie les villes", "DISTINCT élimine les répétitions dans le résultat uniquement."],
        ["Quelle requête affiche les 3 produits les plus chers (MySQL / PostgreSQL) ?", "SELECT * FROM produits ORDER BY prix DESC LIMIT 3;", "SELECT TOP 3 FROM produits;", "SELECT * FROM produits LIMIT 3 ORDER BY prix;", "SELECT MAX(prix) * 3 FROM produits;", "On trie du plus cher au moins cher, puis on limite à 3 lignes."]
      ]),

      avance: mk([
        ["Que retourne WHERE colonne = NULL ?", "Aucune ligne, car la comparaison est inconnue", "Toutes les lignes NULL", "Une erreur de syntaxe", "Toutes les lignes vides", "Comparer quoi que ce soit à NULL donne UNKNOWN : utilisez IS NULL."],
        ["Que fait COUNT(colonne) avec des valeurs NULL ?", "Il les ignore", "Il les compte", "Il les remplace par 0", "Il arrête la requête", "COUNT(*) compte les lignes ; COUNT(colonne) ne compte que les valeurs non NULL."],
        ["Quelle fonction standard remplace NULL par une valeur par défaut ?", "COALESCE(colonne, 0)", "REPLACE NULL WITH 0", "NULLTOZERO(colonne)", "EMPTY(colonne, 0)", "COALESCE retourne la première valeur non NULL (ISNULL fait de même sous SQL Server)."],
        ["Que sélectionne NOT BETWEEN 100 AND 500 ?", "Les valeurs inférieures à 100 ou supérieures à 500", "Les valeurs entre 100 et 500", "Uniquement 100 et 500", "Toutes les valeurs", "NOT BETWEEN exclut l'intervalle, bornes comprises."],
        ["Pourquoi écrit-on 'Dakar' entre apostrophes ?", "C'est une valeur texte", "C'est un nom de colonne", "C'est un nombre", "Cela supprime les espaces", "Sans apostrophes, SQL chercherait une colonne nommée Dakar."],
        ["Quelle condition trouve les emails Gmail ?", "WHERE email LIKE '%@gmail.com'", "WHERE email LIKE '@gmail.com%'", "WHERE email = '%@gmail.com'", "WHERE email IN '@gmail.com'", "% représente tout ce qui précède @gmail.com."],
        ["Pourquoi éviter SELECT * dans une application ?", "On récupère des colonnes inutiles : requête moins claire et moins performante", "SELECT * est interdit en SQL", "Cela supprime les NULL", "Cela crée un index", "Choisir ses colonnes rend la requête lisible et plus rapide."],
        ["Si ville contient des NULL, que fait WHERE ville NOT IN ('Dakar', 'Thiès') ?", "Les lignes où ville est NULL sont exclues du résultat", "Elles sont incluses", "Elles sont remplacées par 'Dakar'", "La requête échoue", "NULL NOT IN (...) donne UNKNOWN, donc la ligne est rejetée."],
        ["Que vaut NULL + 5 ?", "NULL", "5", "0", "Une erreur", "Toute opération arithmétique avec NULL donne NULL."],
        ["Dans quel ordre logique SQL traite-t-il une requête ?", "FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY", "SELECT → FROM → WHERE → ORDER BY", "WHERE → FROM → SELECT → GROUP BY", "ORDER BY → SELECT → FROM → WHERE", "L'ordre d'écriture diffère de l'ordre d'exécution : c'est la source de nombreuses erreurs."],
        ["À quoi sert CASE WHEN ?", "À créer une colonne conditionnelle (si… alors… sinon)", "À supprimer des lignes", "À créer une table", "À trier aléatoirement", "CASE WHEN note >= 10 THEN 'Admis' ELSE 'Refusé' END est l'équivalent d'un if."],
        ["Que fait LIMIT 10 OFFSET 20 ?", "Saute 20 lignes puis retourne les 10 suivantes", "Retourne 20 lignes puis 10", "Retourne 30 lignes", "Retourne les lignes 1 à 10", "C'est la base de la pagination (page 3 avec 10 résultats par page)."],
        ["Pourquoi une pagination sans ORDER BY est-elle risquée ?", "Sans tri, l'ordre des lignes n'est pas garanti", "LIMIT devient interdit", "Cela supprime des lignes", "Cela provoque toujours une erreur", "Sans ORDER BY, deux pages peuvent contenir les mêmes lignes ou en oublier."],
        ["Que retourne SELECT DISTINCT ville, pays FROM clients ?", "Les combinaisons uniques de ville et pays", "Les villes uniques seulement", "Les pays uniques seulement", "Les lignes triées", "DISTINCT s'applique à l'ensemble des colonnes sélectionnées."],
        ["Comment DISTINCT traite-t-il les valeurs NULL ?", "Il les regroupe en une seule valeur NULL", "Il les supprime", "Il les garde toutes", "Il provoque une erreur", "Pour DISTINCT, tous les NULL sont considérés identiques."],
        ["Où apparaissent les NULL dans un ORDER BY ?", "Cela dépend du SGBD (début ou fin)", "Toujours en premier", "Toujours en dernier", "Ils sont supprimés", "SQL Server les met en premier en ASC, PostgreSQL en dernier : vérifiez votre SGBD."],
        ["LIKE 'dakar' trouve-t-il « Dakar » ?", "Cela dépend de la collation (sensibilité à la casse) du SGBD", "Toujours oui", "Toujours non", "Seulement avec ILIKE", "SQL Server et MySQL sont souvent insensibles à la casse ; PostgreSQL y est sensible."],
        ["Quelle est la bonne façon de filtrer toute l'année 2025 sur une colonne date ?", "WHERE d >= '2025-01-01' AND d < '2026-01-01'", "WHERE d = 2025", "WHERE d BETWEEN '2025-01-01' AND '2025-12-31 ' sans se soucier de l'heure", "WHERE YEAR = 2025", "Borne haute exclusive : fiable même si la colonne contient une heure."],
        ["Que retourne NULL = NULL ?", "UNKNOWN (ni vrai, ni faux)", "TRUE", "FALSE", "0", "NULL = absence de valeur connue : deux inconnues ne sont pas « égales »."],
        ["Que retourne SELECT COUNT(*) - COUNT(email) FROM clients ?", "Le nombre de clients sans email (NULL)", "Le nombre total de clients", "Le nombre d'emails distincts", "Toujours 0", "COUNT(*) compte toutes les lignes, COUNT(email) uniquement les emails renseignés."]
      ])
    }
  },

  /* ============================================================
     THÈME 2 — CRÉER & MODIFIER (DDL / DML)
  ============================================================ */
  manipulation: {
    title: "Créer & modifier",
    description: "CREATE, INSERT, UPDATE, DELETE, DROP, TRUNCATE, ALTER et transactions.",
    levels: {
      debutant: mk([
        ["Quelle commande crée une nouvelle table ?", "CREATE TABLE", "MAKE TABLE", "NEW TABLE", "INSERT TABLE", "CREATE TABLE définit le nom, les colonnes et leurs types."],
        ["Quelle commande ajoute une ligne dans une table ?", "INSERT INTO", "ADD ROW", "UPDATE", "CREATE ROW", "INSERT INTO ... VALUES ... ajoute un enregistrement."],
        ["Quelle commande modifie des données existantes ?", "UPDATE", "ALTER", "MODIFY", "CHANGE", "UPDATE modifie les valeurs ; ALTER modifie la structure."],
        ["Quelle commande supprime des lignes d'une table ?", "DELETE FROM", "DROP", "REMOVE", "CLEAR", "DELETE FROM ... WHERE ... supprime des lignes, la table reste."],
        ["Quelle commande supprime entièrement une table (structure + données) ?", "DROP TABLE", "DELETE TABLE", "TRUNCATE TABLE", "REMOVE TABLE", "DROP TABLE détruit la table elle-même."],
        ["Quelle commande vide toute une table en gardant sa structure ?", "TRUNCATE TABLE", "DROP TABLE", "DELETE TABLE", "CLEAR TABLE", "TRUNCATE supprime toutes les lignes mais conserve les colonnes."],
        ["Quelle commande crée une base de données ?", "CREATE DATABASE", "NEW DATABASE", "INSERT DATABASE", "MAKE DATABASE", "Exemple : CREATE DATABASE boutique;"],
        ["Quelle est la syntaxe correcte pour insérer un client ?", "INSERT INTO clients (nom, ville) VALUES ('Awa', 'Dakar');", "INSERT clients VALUES nom = 'Awa';", "ADD INTO clients ('Awa', 'Dakar');", "INSERT (nom, ville) INTO clients;", "On liste les colonnes, puis les valeurs dans le même ordre."],
        ["Quelle est la syntaxe correcte pour changer la ville du client 1 ?", "UPDATE clients SET ville = 'Thiès' WHERE id = 1;", "UPDATE clients ville = 'Thiès' WHERE id = 1;", "SET clients ville = 'Thiès' WHERE id = 1;", "CHANGE clients SET ville = 'Thiès';", "UPDATE table SET colonne = valeur WHERE condition."],
        ["Que fait DELETE FROM clients; (sans WHERE) ?", "Supprime toutes les lignes de la table", "Supprime la table", "Ne supprime rien", "Supprime seulement la première ligne", "Sans WHERE, toutes les lignes sont concernées. La table, elle, reste."],
        ["Quelle commande permet de supprimer seulement certains clients ?", "DELETE FROM clients WHERE ville = 'Thiès';", "TRUNCATE TABLE clients;", "DROP TABLE clients;", "DROP clients WHERE ville = 'Thiès';", "Seul DELETE accepte une clause WHERE."],
        ["Quel type convient à un nombre entier ?", "INT", "VARCHAR", "DATE", "TEXTE", "INT stocke des entiers (âge, quantité…)."],
        ["Que signifie VARCHAR(50) ?", "Du texte de longueur variable, 50 caractères maximum", "Un nombre à 50 chiffres", "Une date sur 50 jours", "Exactement 50 caractères", "VARCHAR(n) accepte jusqu'à n caractères."],
        ["Quel type stocke une date ?", "DATE", "INT", "VARCHAR(1)", "BOOLEAN", "DATE stocke jour, mois et année."],
        ["Quelle requête crée correctement une table clients ?", "CREATE TABLE clients (id INT, nom VARCHAR(50));", "CREATE clients (id INT, nom VARCHAR(50));", "CREATE TABLE clients [id INT, nom VARCHAR(50)];", "CREATE TABLE clients id INT, nom VARCHAR(50);", "Les colonnes et leurs types sont placés entre parenthèses, séparés par des virgules."],
        ["Que supprime DROP TABLE clients ; ?", "La structure ET toutes les données de la table", "Uniquement les données", "Uniquement une colonne", "Rien, c'est une simulation", "DROP est destructif : la table disparaît complètement."],
        ["Que garde TRUNCATE TABLE clients ; ?", "La structure de la table (colonnes, types)", "Les données", "Rien du tout", "Seulement la première ligne", "TRUNCATE vide les données mais pas la structure."],
        ["Pourquoi un UPDATE sans WHERE est-il dangereux ?", "Il modifie toutes les lignes de la table", "Il ne fait rien", "Il supprime la table", "Il crée une copie", "Toujours vérifier la présence du WHERE avant d'exécuter un UPDATE."],
        ["Quelle commande ajoute une colonne à une table existante ?", "ALTER TABLE ... ADD", "UPDATE TABLE ... ADD", "CREATE COLUMN", "INSERT COLUMN", "ALTER TABLE modifie la structure d'une table."],
        ["CREATE TABLE appartient à quelle famille de commandes ?", "DDL (définition de structure)", "DML (manipulation de données)", "DCL (droits)", "TCL (transactions)", "DDL = CREATE, ALTER, DROP, TRUNCATE. DML = INSERT, UPDATE, DELETE."]
      ]),

      intermediaire: mk([
        ["À quoi sert une clé primaire (PRIMARY KEY) ?", "Identifier chaque ligne de façon unique", "Trier les lignes", "Chiffrer les données", "Accélérer uniquement les UPDATE", "Elle est unique et ne peut pas être NULL."],
        ["Que garantit la contrainte NOT NULL ?", "La colonne doit toujours avoir une valeur", "La colonne est toujours unique", "La colonne vaut 0 par défaut", "La colonne est en lecture seule", "NOT NULL interdit les valeurs manquantes."],
        ["Que garantit la contrainte UNIQUE ?", "Pas deux fois la même valeur dans la colonne", "La colonne ne peut pas être modifiée", "La colonne est obligatoire", "La colonne est indexée en lecture seule", "Utile pour un email ou un numéro de téléphone. (Elle accepte en général un NULL.)"],
        ["Que fait DEFAULT dans une définition de colonne ?", "Donne une valeur automatique si aucune n'est fournie", "Rend la colonne obligatoire", "Supprime la colonne", "Trie la colonne", "Ex. : statut VARCHAR(20) DEFAULT 'actif'."],
        ["Quelle est la différence principale entre DELETE et TRUNCATE ?", "DELETE accepte un WHERE, TRUNCATE vide toute la table", "TRUNCATE accepte un WHERE, DELETE non", "Aucune différence", "DELETE supprime la table", "TRUNCATE ne permet pas de filtrer les lignes."],
        ["Quelle est la différence entre DROP et DELETE ?", "DROP supprime la table elle-même, DELETE supprime des lignes", "DROP supprime des lignes, DELETE supprime la table", "Aucune différence", "DROP ne fonctionne qu'avec WHERE", "Après DELETE la table existe encore ; après DROP, elle n'existe plus."],
        ["Comment insérer plusieurs lignes en une seule requête ?", "INSERT INTO t (a) VALUES (1), (2), (3);", "INSERT INTO t (a) VALUES 1, 2, 3;", "INSERT MANY INTO t (a);", "INSERT INTO t (a) LOOP (1, 2, 3);", "On sépare chaque groupe de valeurs par une virgule."],
        ["Pourquoi préciser les colonnes dans un INSERT ?", "Pour éviter les erreurs si la structure de la table change", "C'est interdit de ne pas le faire", "Pour accélérer la requête de 10 fois", "Pour créer automatiquement un index", "Sans liste de colonnes, l'INSERT dépend de l'ordre exact des colonnes."],
        ["À quoi sert une clé étrangère (FOREIGN KEY) ?", "Relier une colonne à la clé primaire d'une autre table", "Chiffrer une colonne", "Trier une table", "Dupliquer une table", "Elle garantit que la valeur référencée existe réellement."],
        ["Quelle commande supprime une colonne d'une table ?", "ALTER TABLE clients DROP COLUMN telephone;", "DELETE COLUMN telephone FROM clients;", "DROP telephone FROM clients;", "UPDATE clients REMOVE telephone;", "La structure se modifie avec ALTER TABLE."],
        ["Quelle requête ajoute une colonne telephone à clients ?", "ALTER TABLE clients ADD telephone VARCHAR(20);", "ADD COLUMN clients telephone;", "UPDATE clients ADD telephone;", "INSERT INTO clients COLUMN telephone;", "ALTER TABLE nom ADD colonne type."],
        ["Comment modifier plusieurs colonnes dans un seul UPDATE ?", "UPDATE t SET a = 1, b = 2 WHERE id = 5;", "UPDATE t SET a = 1 AND b = 2;", "UPDATE t (a, b) = (1, 2);", "UPDATE t SET a = 1; SET b = 2;", "Les affectations sont séparées par des virgules."],
        ["Pourquoi TRUNCATE est-il souvent plus rapide que DELETE sur une grosse table ?", "Il ne traite pas et ne journalise pas chaque ligne une par une", "Il ne vide rien en réalité", "Il compresse la table", "Il désactive la base", "DELETE doit gérer chaque ligne individuellement."],
        ["À quoi sert une contrainte CHECK ?", "Imposer une règle de validation sur les valeurs (ex. age >= 0)", "Vérifier l'orthographe", "Créer un index", "Supprimer les doublons", "L'insertion est refusée si la règle n'est pas respectée."],
        ["Que fait DROP TABLE IF EXISTS clients ; ?", "Supprime la table seulement si elle existe, sans erreur sinon", "Crée la table si elle n'existe pas", "Supprime la table dans tous les cas, avec erreur si absente", "Vide la table", "IF EXISTS évite une erreur quand la table n'existe pas."],
        ["Que se passe-t-il si on insère deux fois la même clé primaire ?", "Le SGBD refuse l'insertion avec une erreur", "La première ligne est remplacée silencieusement", "Les deux lignes sont gardées", "La table est supprimée", "Une clé primaire est unique par définition."],
        ["Comment écrit-on une valeur texte dans un INSERT ?", "VALUES ('Awa')", "VALUES (Awa)", "VALUES ([Awa])", "VALUES (<Awa>)", "Le texte et les dates s'écrivent entre apostrophes."],
        ["Quelle requête supprime les commandes annulées ?", "DELETE FROM commandes WHERE statut = 'annulee';", "DROP commandes WHERE statut = 'annulee';", "TRUNCATE commandes WHERE statut = 'annulee';", "REMOVE FROM commandes statut = 'annulee';", "DELETE + WHERE cible précisément les lignes à supprimer."],
        ["Quelle commande permet de modifier le type d'une colonne existante ?", "ALTER TABLE (ALTER COLUMN / MODIFY selon le SGBD)", "UPDATE TABLE", "CHANGE DATA", "RETYPE COLUMN", "La syntaxe exacte varie : ALTER COLUMN (SQL Server), MODIFY (MySQL)."],
        ["Quelle bonne pratique avant un UPDATE ou un DELETE important ?", "Tester d'abord avec un SELECT utilisant le même WHERE", "Exécuter sans WHERE pour voir", "Supprimer la sauvegarde", "Utiliser DROP à la place", "Le SELECT montre exactement quelles lignes seront touchées."]
      ]),

      avance: mk([
        ["Qu'est-ce qu'une transaction ?", "Un groupe d'opérations exécutées comme un tout : toutes réussissent ou aucune", "Une copie de table", "Un type d'index", "Un paiement en ligne", "Elle garantit la cohérence des données (propriétés ACID)."],
        ["Que fait ROLLBACK ?", "Annule les modifications de la transaction en cours", "Valide la transaction", "Supprime la base", "Recrée les index", "ROLLBACK ramène les données à l'état du début de la transaction."],
        ["Que fait COMMIT ?", "Valide définitivement les modifications de la transaction", "Annule les modifications", "Supprime la table", "Verrouille la base à vie", "Après COMMIT, les changements sont durables."],
        ["Dans MySQL, que se passe-t-il avec TRUNCATE TABLE dans une transaction ?", "Il valide implicitement et ne peut pas être annulé par ROLLBACK", "Il est toujours annulable", "Il est ignoré", "Il bloque la transaction", "En MySQL, les commandes DDL font un COMMIT implicite. SQL Server et PostgreSQL permettent le ROLLBACK d'un TRUNCATE."],
        ["Que se passe-t-il généralement pour un compteur auto-incrémenté après TRUNCATE ?", "Il est remis à zéro (ou à sa valeur initiale)", "Il continue sans changement", "Il double", "Il est supprimé", "DELETE, lui, ne remet généralement pas le compteur à zéro."],
        ["Que fait ON DELETE CASCADE sur une clé étrangère ?", "Supprime automatiquement les lignes enfants quand la ligne parent est supprimée", "Empêche toute suppression", "Met le parent à NULL", "Supprime la base", "Supprimer un client supprime aussi ses commandes."],
        ["Que se passe-t-il si on tente de DROP une table référencée par une clé étrangère ?", "Le SGBD refuse (sauf suppression préalable de la contrainte ou usage de CASCADE)", "La suppression réussit toujours", "Les données enfants sont déplacées", "La clé étrangère est ignorée", "L'intégrité référentielle protège les données liées."],
        ["Pourquoi TRUNCATE est-il refusé sur une table référencée par une clé étrangère (ex. SQL Server) ?", "Il contourne les vérifications ligne par ligne de l'intégrité", "Il est interdit en SQL", "Il est trop lent", "Il ne supporte pas les entiers", "Il faut d'abord supprimer la contrainte, ou utiliser DELETE."],
        ["Que fait INSERT INTO archive SELECT * FROM commandes WHERE annee = 2020 ; ?", "Copie les commandes de 2020 dans la table archive", "Supprime les commandes de 2020", "Crée la table archive", "Déplace la table commandes", "INSERT ... SELECT insère le résultat d'une requête."],
        ["GRANT et REVOKE appartiennent à quelle famille ?", "DCL (contrôle des droits)", "DDL", "DML", "TCL", "Ils donnent ou retirent des permissions aux utilisateurs."],
        ["À quoi sert CREATE INDEX ?", "Accélérer les recherches sur une colonne", "Créer une table", "Dupliquer les données", "Chiffrer une colonne", "Un index accélère la lecture mais ralentit un peu l'écriture."],
        ["Quelle option crée une colonne auto-incrémentée sous SQL Server ?", "IDENTITY(1,1)", "AUTO_INCREMENT", "SERIAL", "SEQUENCE_ID", "MySQL utilise AUTO_INCREMENT, PostgreSQL SERIAL / IDENTITY."],
        ["À quoi sert un UPSERT (MERGE / ON CONFLICT) ?", "Insérer la ligne si absente, sinon la mettre à jour", "Supprimer les doublons", "Vider la table", "Créer une sauvegarde", "Très utile pour synchroniser des données."],
        ["Que signifie « intégrité référentielle » ?", "Toute clé étrangère doit pointer vers une ligne existante", "Les données sont chiffrées", "Les tables sont triées", "Les colonnes sont indexées", "Pas de commande sans client existant, par exemple."],
        ["DROP DATABASE boutique ; est-il annulable facilement ?", "Non, c'est destructif : seule une sauvegarde permet de restaurer", "Oui, avec CTRL+Z", "Oui, toujours avec ROLLBACK", "Oui, la base reste en corbeille", "Les commandes DDL destructives demandent une sauvegarde préalable."],
        ["À quoi sert un SAVEPOINT ?", "Définir un point de retour partiel dans une transaction", "Sauvegarder la base sur disque", "Créer un index", "Valider définitivement", "On peut faire ROLLBACK TO savepoint sans tout annuler."],
        ["Que fait UPDATE produits SET prix = prix * 1.1 WHERE categorie = 'Boissons' ; ?", "Augmente de 10 % le prix des boissons", "Diminue le prix de 10 %", "Met tous les prix à 1.1", "Augmente tous les produits de 10 %", "prix * 1.1 = prix + 10 %, et le WHERE limite aux boissons."],
        ["Pourquoi ajouter une colonne NOT NULL à une table remplie demande-t-il une valeur par défaut ?", "Les lignes existantes doivent recevoir une valeur", "NOT NULL est interdit avec ALTER", "Pour accélérer la requête", "Pour créer l'index", "Sans DEFAULT, les lignes existantes auraient NULL et la contrainte échouerait."],
        ["Que signifie ACID ?", "Atomicité, Cohérence, Isolation, Durabilité", "Accès, Contrôle, Index, Données", "Automatique, Complet, Indexé, Distribué", "Aucun de ces termes", "Ce sont les 4 garanties d'une transaction fiable."],
        ["Quelle est la meilleure pratique avant une modification risquée en production ?", "Sauvegarde + transaction + SELECT de vérification", "Exécuter directement sans WHERE", "Utiliser DROP pour repartir de zéro", "Désactiver les contraintes", "Prudence : sauvegarder, tester, puis valider."]
      ])
    }
  },

  /* ============================================================
     THÈME 3 — JOINTURES
  ============================================================ */
  jointures: {
    title: "Jointures SQL",
    description: "INNER, LEFT, RIGHT, FULL, CROSS : relier plusieurs tables sans se tromper.",
    levels: {
      debutant: mk([
        ["Pourquoi utilise-t-on une jointure SQL ?", "Pour relier les données de plusieurs tables", "Pour supprimer une table", "Pour créer une base", "Pour modifier un mot de passe", "Une jointure combine des lignes de tables liées entre elles."],
        ["Quelle jointure ne garde que les lignes qui ont une correspondance des deux côtés ?", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "CROSS JOIN", "INNER JOIN = intersection."],
        ["Quelle jointure conserve toutes les lignes de la table de gauche ?", "LEFT JOIN", "INNER JOIN", "RIGHT JOIN", "CROSS JOIN", "LEFT JOIN garde tout à gauche, même sans correspondance."],
        ["Quelle condition relie clients et commandes ?", "clients.id_client = commandes.id_client", "clients.ville = commandes.montant", "clients.nom = commandes.date_commande", "clients.email = commandes.prix", "On relie la clé primaire à la clé étrangère correspondante."],
        ["Quel mot-clé introduit la condition de jointure ?", "ON", "WHERE", "AS", "FROM", "ON précise quelles colonnes doivent correspondre."],
        ["Dans un LEFT JOIN, que valent les colonnes de droite sans correspondance ?", "NULL", "0", "Une chaîne vide", "La ligne est supprimée", "La ligne de gauche est conservée, et la partie droite est remplie de NULL."],
        ["Un client peut avoir plusieurs commandes : quelle relation est-ce ?", "Un-à-plusieurs", "Un-à-un", "Plusieurs-à-plusieurs", "Aucune relation", "Un client → plusieurs commandes ; chaque commande → un seul client."],
        ["Qu'est-ce qu'une clé primaire ?", "Une colonne qui identifie chaque ligne de façon unique", "Une colonne toujours textuelle", "Une colonne autorisant les doublons", "Une colonne de tri", "Exemple : id_client."],
        ["Quelle requête de jointure est correcte ?", "SELECT * FROM clients INNER JOIN commandes ON clients.id_client = commandes.id_client;", "SELECT clients + commandes;", "MERGE clients WITH commandes;", "SELECT * FROM clients JOIN commandes;", "Il faut un JOIN et sa condition ON."],
        ["Quel alias de table est correct ?", "clients AS c", "clients TO c", "clients NAME c", "clients RENAME c", "Un alias raccourcit les noms : c.nom au lieu de clients.nom."],
        ["Que signifie « ON c.id = o.client_id » ?", "Les lignes sont liées quand ces deux valeurs sont égales", "Les tables sont fusionnées définitivement", "La table o est supprimée", "Les colonnes sont renommées", "ON définit le critère de rapprochement."],
        ["Que signifie JOIN seul, sans INNER ni LEFT ?", "Il équivaut à INNER JOIN", "Il équivaut à LEFT JOIN", "Il équivaut à CROSS JOIN", "Il est invalide", "INNER est le type par défaut."],
        ["Qu'est-ce qu'une clé étrangère ?", "Une colonne qui référence la clé primaire d'une autre table", "Une clé de chiffrement", "Une colonne obligatoire", "Une colonne triée", "id_client dans commandes pointe vers clients.id_client."],
        ["Un client a 3 commandes. Combien de lignes produit un INNER JOIN pour ce client ?", "3", "1", "0", "6", "Chaque commande donne une ligne, avec les infos du client répétées."],
        ["Un client sans aucune commande apparaît-il dans un INNER JOIN ?", "Non", "Oui, avec des NULL", "Oui, avec des 0", "Seulement s'il a un email", "INNER JOIN élimine les lignes sans correspondance."],
        ["Que se passe-t-il si « id » existe dans deux tables jointes et qu'on écrit SELECT id ?", "Erreur d'ambiguïté : il faut préfixer par la table ou l'alias", "SQL choisit automatiquement", "Les deux colonnes sont fusionnées", "La première table gagne", "Écrivez c.id ou o.id."],
        ["Comment joindre trois tables ?", "En enchaînant deux JOIN", "C'est impossible", "Avec UNION", "Avec TRUNCATE", "FROM a JOIN b ON ... JOIN c ON ..."],
        ["Que se passe-t-il quand on écrit FROM a, b sans aucune condition ?", "On obtient toutes les combinaisons (produit cartésien)", "Une erreur", "Un INNER JOIN", "Un LEFT JOIN", "Chaque ligne de a est associée à chaque ligne de b."],
        ["Que doivent partager les colonnes utilisées dans un ON ?", "Des types de données compatibles", "Le même nom obligatoirement", "La même position", "Aucune contrainte", "On compare des valeurs : mieux vaut des types compatibles (INT avec INT)."],
        ["Quelle jointure choisir pour lister tous les clients, avec ou sans commande ?", "LEFT JOIN depuis clients vers commandes", "INNER JOIN", "CROSS JOIN", "RIGHT JOIN depuis clients vers commandes", "Les clients sont à gauche, donc LEFT JOIN les conserve tous."]
      ]),

      intermediaire: mk([
        ["Quelle jointure conserve toutes les lignes de la table de droite ?", "RIGHT JOIN", "LEFT JOIN", "INNER JOIN", "CROSS JOIN", "RIGHT JOIN est le miroir de LEFT JOIN."],
        ["Que fait FULL OUTER JOIN ?", "Conserve toutes les lignes des deux tables", "Conserve seulement les correspondances", "Supprime les lignes isolées", "Crée une base", "Les lignes sans correspondance sont gardées des deux côtés, complétées par NULL."],
        ["Comment trouver les clients sans commande ?", "LEFT JOIN puis WHERE commandes.id_commande IS NULL", "INNER JOIN puis IS NULL", "CROSS JOIN", "ORDER BY id_commande", "NULL à droite = aucune commande correspondante."],
        ["Pourquoi utiliser des alias de tables ?", "Pour rendre les requêtes plus courtes et lisibles", "Pour éviter ON", "Pour supprimer des colonnes", "Pour créer une clé", "Surtout utile avec plusieurs jointures ou une auto-jointure."],
        ["Quel risque avec une relation un-à-plusieurs ?", "Les lignes du côté « un » sont répétées", "Les tables sont supprimées", "Les valeurs deviennent NULL", "La jointure devient automatiquement LEFT", "Un client avec 3 commandes apparaît 3 fois."],
        ["Quelle jointure retourne toutes les combinaisons possibles ?", "CROSS JOIN", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "CROSS JOIN = produit cartésien (n × m lignes)."],
        ["Que signifie c.id_client ?", "La colonne id_client de la table d'alias c", "Une nouvelle table", "Une fonction", "Une valeur NULL", "Notation alias.colonne."],
        ["Pourquoi qualifier nom avec la table (c.nom) ?", "Plusieurs tables peuvent avoir une colonne nom", "SQL interdit nom", "Cela crée une table", "Cela supprime les doublons", "Cela évite les ambiguïtés."],
        ["Que fait WHERE sur une colonne de la table de droite d'un LEFT JOIN (ex. WHERE o.statut = 'payee') ?", "Il élimine les lignes NULL : le LEFT JOIN se comporte comme un INNER JOIN", "Il n'a aucun effet", "Il transforme en RIGHT JOIN", "Il supprime la table", "Le filtre rejette les NULL. Mettez la condition dans le ON pour conserver l'effet du LEFT."],
        ["Quel est l'intérêt de placer une condition dans le ON plutôt que dans le WHERE d'un LEFT JOIN ?", "Elle filtre la table de droite sans supprimer les lignes de gauche", "Elle est plus rapide dans tous les cas", "C'est obligatoire", "Elle supprime les NULL", "ON filtre avant la jointure, WHERE après."],
        ["Que compte COUNT(o.id) dans un LEFT JOIN clients → commandes ?", "Les commandes, avec 0 pour un client sans commande", "Toujours au moins 1", "Les clients", "Une erreur", "COUNT(colonne) ignore les NULL, alors que COUNT(*) compterait la ligne du client."],
        ["Comment obtenir le nombre de commandes par client ?", "JOIN puis GROUP BY client", "ORDER BY client", "DISTINCT client", "UNION clients commandes", "On regroupe par client puis on compte."],
        ["FULL OUTER JOIN n'existe pas nativement en MySQL. Comment l'imiter ?", "UNION d'un LEFT JOIN et d'un RIGHT JOIN", "CROSS JOIN", "INNER JOIN deux fois", "TRUNCATE JOIN", "L'union des deux jointures reproduit le FULL OUTER JOIN."],
        ["Comment joindre sur deux colonnes à la fois ?", "ON a.x = b.x AND a.y = b.y", "ON a.x, a.y = b.x, b.y", "ON a.x = b.x OR a.y = b.y", "ON (x, y)", "On combine les conditions avec AND."],
        ["A INNER JOIN B et B INNER JOIN A donnent-ils le même résultat ?", "Oui, l'INNER JOIN est symétrique", "Non, jamais", "Seulement avec ORDER BY", "Seulement avec des alias", "Pour un LEFT JOIN, l'ordre change tout."],
        ["Qu'est-ce que USING (id_client) dans une jointure ?", "Un raccourci quand les deux colonnes portent le même nom", "Une clause de tri", "Un type d'index", "Un alias", "JOIN commandes USING (id_client) évite de réécrire ON."],
        ["Pourquoi NATURAL JOIN est-il risqué ?", "Il joint automatiquement sur toutes les colonnes de même nom, même par hasard", "Il est trop lent", "Il supprime des lignes", "Il crée des tables", "Un changement de schéma peut modifier silencieusement le résultat."],
        ["Quelle requête liste clients et commandes, même pour les clients sans commande ?", "FROM clients c LEFT JOIN commandes o ON c.id = o.client_id", "FROM clients c INNER JOIN commandes o ON c.id = o.client_id", "FROM commandes o LEFT JOIN clients c ON c.id = o.client_id", "FROM clients c CROSS JOIN commandes o", "La table à conserver entièrement doit être à gauche d'un LEFT JOIN."],
        ["Quel élément relie généralement deux tables ?", "Une clé primaire et une clé étrangère", "Une ville et un prix", "Un nom et une date", "Deux colonnes aléatoires", "Les clés représentent la relation entre tables."]
      ]),

      avance: mk([
        ["Quel est le risque d'un INNER JOIN avec des données incomplètes ?", "Les lignes sans correspondance disparaissent du résultat", "Les tables sont supprimées", "Tout devient NULL", "Les colonnes changent de nom", "Cela peut fausser des totaux sans que vous le remarquiez."],
        ["Comment réaliser une auto-jointure ?", "En utilisant deux alias de la même table", "En supprimant ON", "Avec DELETE JOIN", "Avec deux bases", "Ex. : employes e JOIN employes m ON e.manager_id = m.id."],
        ["Pourquoi vérifier la cardinalité d'une jointure ?", "Pour prévoir combien de lignes elle va produire", "Pour supprimer des clés", "Pour interdire SELECT", "Pour changer les types", "Un-à-un, un-à-plusieurs ou plusieurs-à-plusieurs n'ont pas le même effet."],
        ["Quelle table sert de pont pour une relation plusieurs-à-plusieurs ?", "Une table de liaison (association)", "Une table vide", "Une table sans clé", "Une table de dates", "Elle contient les clés des deux tables (ex. inscriptions : id_etudiant, id_cours)."],
        ["Pourquoi une somme peut-elle être faussée après une jointure ?", "Les lignes peuvent être dupliquées, donc les montants comptés plusieurs fois", "SUM devient du texte", "JOIN supprime les montants", "GROUP BY est interdit", "Une relation un-à-plusieurs répète les valeurs du côté « un »."],
        ["Comment trouver les lignes présentes uniquement à gauche ?", "LEFT JOIN puis WHERE colonne_droite IS NULL", "INNER JOIN puis ORDER BY", "CROSS JOIN", "RIGHT JOIN seul", "C'est le motif « anti-jointure »."],
        ["Pourquoi éviter SELECT * avec plusieurs tables ?", "Des colonnes homonymes créent des ambiguïtés", "SELECT * est interdit", "JOIN ne fonctionnerait plus", "Les tables sont supprimées", "Choisissez explicitement c.nom, o.date, etc."],
        ["Quelle relation est plusieurs-à-plusieurs ?", "Des étudiants et des cours", "Un client et son adresse unique", "Un pays et sa capitale", "Une commande et son client", "Un étudiant suit plusieurs cours et un cours accueille plusieurs étudiants."],
        ["Quel opérateur teste l'existence d'une correspondance ?", "EXISTS", "MATCHES", "PRESENT", "FOUND", "EXISTS retourne vrai si la sous-requête renvoie au moins une ligne."],
        ["Que faut-il vérifier avant une jointure complexe ?", "Les clés et la relation entre les tables", "La couleur de l'interface", "Le navigateur utilisé", "La taille de l'écran", "Comprendre le modèle de données évite les erreurs silencieuses."],
        ["Quelle est l'alternative à LEFT JOIN + IS NULL pour trouver les clients sans commande ?", "WHERE NOT EXISTS (SELECT 1 FROM commandes o WHERE o.client_id = c.id)", "WHERE EXISTS (...)", "GROUP BY c.id", "ORDER BY c.id", "NOT EXISTS exprime directement « aucune commande n'existe »."],
        ["Comment compter correctement des clients après une jointure un-à-plusieurs ?", "COUNT(DISTINCT c.id)", "COUNT(*)", "SUM(c.id)", "COUNT(o.id)", "COUNT(*) compterait chaque commande, pas chaque client."],
        ["Différence entre EXISTS et un JOIN pour savoir « le client a-t-il une commande ? »", "EXISTS ne multiplie pas les lignes", "EXISTS multiplie les lignes", "Aucune différence possible", "JOIN est interdit ici", "EXISTS s'arrête à la première correspondance : pas de doublons."],
        ["Comment lister les clients ayant au moins une commande, sans doublon ?", "WHERE EXISTS (SELECT 1 FROM commandes ...)", "INNER JOIN simple sans DISTINCT", "CROSS JOIN", "LEFT JOIN sans WHERE", "Un INNER JOIN simple répéterait le client pour chaque commande."],
        ["Deux lignes dont la clé de jointure est NULL se correspondent-elles ?", "Non, NULL = NULL n'est jamais vrai", "Oui, toujours", "Seulement en LEFT JOIN", "Seulement avec DISTINCT", "Les lignes avec NULL sur la clé ne se joignent pas."],
        ["Pourquoi indexer les colonnes de jointure ?", "Pour accélérer fortement la mise en correspondance des lignes", "Pour supprimer les doublons", "Pour changer le type de colonne", "Pour éviter ON", "Sans index, le SGBD peut parcourir toute la table."],
        ["Dans quel cas CROSS JOIN est-il utile ?", "Générer toutes les combinaisons (ex. tailles × couleurs)", "Joindre clients et commandes", "Supprimer des lignes", "Trier une table", "Il est volontairement combinatoire."],
        ["Qu'est-ce qu'une jointure non-équi ?", "Une jointure avec une condition autre que = (ex. BETWEEN)", "Une jointure sans table", "Une jointure sur NULL", "Une jointure interdite", "Ex. : ON v.date BETWEEN p.debut AND p.fin."],
        ["Dans l'ordre logique d'exécution, que vient avant le WHERE ?", "FROM et les JOIN", "SELECT", "ORDER BY", "LIMIT", "Les tables sont d'abord jointes, puis filtrées."],
        ["Comment éviter les totaux faussés quand on joint une table de détails ?", "Pré-agréger les détails dans une sous-requête ou une CTE avant de joindre", "Utiliser SELECT *", "Ajouter DISTINCT partout", "Supprimer la clé", "On agrège au bon niveau, puis on joint le résultat."]
      ])
    }
  },

  /* ============================================================
     THÈME 4 — SQL AVANCÉ
  ============================================================ */
  avance: {
    title: "SQL avancé",
    description: "Agrégations, GROUP BY, sous-requêtes, CTE et fonctions de fenêtre.",
    levels: {
      debutant: mk([
        ["Quelle fonction compte les lignes ?", "COUNT(*)", "SUM(*)", "TOTAL(*)", "NUMBER(*)", "COUNT(*) compte toutes les lignes."],
        ["Quelle fonction calcule une somme ?", "SUM()", "AVG()", "MAX()", "COUNT()", "SUM additionne les valeurs."],
        ["Quelle fonction calcule une moyenne ?", "AVG()", "MIN()", "SUM()", "COUNT()", "AVG = average."],
        ["Quelle fonction retourne la plus grande valeur ?", "MAX()", "COUNT()", "MIN()", "AVG()", "MAX retourne la valeur maximale."],
        ["Quelle fonction retourne la plus petite valeur ?", "MIN()", "SUM()", "AVG()", "MAX()", "MIN retourne la valeur minimale."],
        ["À quoi sert GROUP BY ?", "Regrouper des lignes pour calculer par groupe", "Supprimer une table", "Modifier une clé", "Trier uniquement", "Ex. : le total des ventes par ville."],
        ["Quelle clause filtre les groupes ?", "HAVING", "WHERE", "FROM", "ORDER BY", "HAVING agit après GROUP BY."],
        ["Que fait SELECT DISTINCT ville FROM clients ?", "Affiche chaque ville une seule fois", "Supprime les clients", "Compte les villes", "Trie les villes", "DISTINCT supprime les répétitions."],
        ["Que signifie COUNT(colonne) ?", "Le nombre de valeurs non NULL", "La somme", "Le maximum", "Toutes les lignes obligatoirement", "COUNT(colonne) ignore les NULL."],
        ["Quel calcul donne le chiffre d'affaires total ?", "SUM(montant)", "MAX(montant)", "COUNT(montant)", "AVG(montant)", "SUM additionne tous les montants."],
        ["Que fait COUNT(DISTINCT ville) ?", "Compte le nombre de villes différentes", "Compte toutes les lignes", "Additionne les villes", "Trie les villes", "DISTINCT à l'intérieur de COUNT ne compte chaque valeur qu'une fois."],
        ["Quelle requête donne le nombre de clients par ville ?", "SELECT ville, COUNT(*) FROM clients GROUP BY ville;", "SELECT ville, COUNT(*) FROM clients;", "SELECT COUNT(ville) ORDER BY ville;", "SELECT ville FROM clients COUNT;", "Chaque colonne non agrégée doit figurer dans le GROUP BY."],
        ["AVG tient-il compte des valeurs NULL ?", "Non, elles sont ignorées", "Oui, comme des zéros", "Oui, comme la moyenne", "Il provoque une erreur", "AVG(1, 3, NULL) = 2, pas 1,33."],
        ["Que retourne SUM(colonne) si toutes les valeurs sont NULL ?", "NULL", "0", "Une erreur", "1", "Utilisez COALESCE(SUM(colonne), 0) si vous voulez 0."],
        ["Que retourne COUNT(*) sur une table vide ?", "0", "NULL", "Une erreur", "1", "COUNT retourne toujours un nombre."],
        ["Que retourne MIN() sur une colonne texte ?", "La première valeur dans l'ordre alphabétique", "NULL", "Une erreur", "La plus courte", "MIN et MAX fonctionnent aussi sur le texte et les dates."],
        ["Comment arrondir une moyenne à 2 décimales ?", "ROUND(AVG(note), 2)", "AVG(note, 2)", "DECIMAL(AVG(note))", "CUT(AVG(note), 2)", "ROUND(valeur, nombre_de_décimales)."],
        ["Comment trier les villes par nombre de clients décroissant ?", "GROUP BY ville ORDER BY COUNT(*) DESC", "ORDER BY ville GROUP BY COUNT(*)", "GROUP BY COUNT(*) DESC", "ORDER BY DESC COUNT", "ORDER BY peut trier sur un calcul d'agrégation."],
        ["Que se passe-t-il avec SELECT ville, COUNT(*) FROM clients; (sans GROUP BY) ?", "Erreur : une colonne non agrégée sans GROUP BY", "Le résultat est correct", "SQL devine le groupe", "COUNT est ignoré", "Mélanger colonne simple et agrégat exige un GROUP BY."],
        ["Comment nommer le résultat d'un calcul ?", "SUM(montant) AS total", "SUM(montant) NAME total", "SUM(montant) = total", "SUM(montant) TO total", "AS crée un alias lisible pour la colonne calculée."]
      ]),

      intermediaire: mk([
        ["Quelle est la différence entre WHERE et HAVING ?", "WHERE filtre les lignes avant le regroupement, HAVING filtre les groupes après", "HAVING trie seulement", "WHERE ne marche qu'avec JOIN", "Aucune différence", "WHERE agit sur les lignes ; HAVING sur les résultats agrégés."],
        ["Qu'est-ce qu'une sous-requête ?", "Une requête placée à l'intérieur d'une autre", "Une copie de table", "Un type de clé", "Une jointure obligatoire", "Elle fournit une valeur ou un ensemble à la requête principale."],
        ["Quel mot-clé commence une CTE ?", "WITH", "TEMP", "DEFINE", "CREATE CTE", "WITH nom AS (SELECT ...) définit une requête nommée temporaire."],
        ["Pourquoi utiliser une CTE ?", "Pour structurer et lire plus facilement une requête complexe", "Pour empêcher les jointures", "Pour supprimer les doublons automatiquement", "Pour remplacer toutes les tables", "Une CTE découpe une requête en étapes lisibles."],
        ["Quel calcul donne le salaire moyen par département ?", "SELECT departement, AVG(salaire) FROM employes GROUP BY departement;", "AVG(departement)", "SELECT AVG(salaire) ORDER BY departement;", "COUNT(departement)", "On regroupe par département puis on moyenne les salaires."],
        ["Quelle clause trie le résultat final d'une requête agrégée ?", "ORDER BY", "DISTINCT", "ON", "WHERE", "ORDER BY est évalué en dernier."],
        ["Comment sélectionner les produits plus chers que la moyenne ?", "WHERE prix > (SELECT AVG(prix) FROM produits)", "WHERE prix > AVG(prix)", "ORDER BY AVG(prix)", "HAVING prix > AVG(prix)", "AVG ne peut pas s'utiliser directement dans WHERE : on passe par une sous-requête."],
        ["Comment trouver les départements de plus de 10 employés ?", "GROUP BY departement HAVING COUNT(*) > 10", "WHERE COUNT(*) > 10", "ORDER BY COUNT(*) > 10", "DISTINCT COUNT(*) > 10", "Le comptage existe après le regroupement : HAVING."],
        ["Que fait COUNT(*) ?", "Compte toutes les lignes du résultat", "Compte seulement les textes", "Calcule une moyenne", "Retourne le maximum", "Il compte les lignes, NULL compris."],
        ["Quelle syntaxe nomme une CTE ?", "WITH ventes AS (SELECT ...)", "CREATE ventes AS", "TEMP ventes", "NAME ventes", "La syntaxe standard est WITH nom AS ( ... )."],
        ["Comment trouver les clients ayant dépensé plus de 1000 au total ?", "GROUP BY client HAVING SUM(montant) > 1000", "WHERE SUM(montant) > 1000", "ORDER BY SUM(montant) > 1000", "SELECT MAX(montant) > 1000", "On agrège par client, puis on filtre le groupe."],
        ["Que signifie « table dérivée » ?", "Une sous-requête placée dans le FROM", "Une table copiée", "Une table temporaire permanente", "Une vue matérialisée", "FROM (SELECT ...) AS t permet de réutiliser un résultat intermédiaire."],
        ["Que fait WHERE id IN (SELECT id_client FROM commandes) ?", "Garde les clients qui ont au moins une commande", "Supprime les commandes", "Joint les tables en FULL JOIN", "Trie les commandes", "IN compare à la liste produite par la sous-requête."],
        ["Qu'est-ce qu'une sous-requête corrélée ?", "Une sous-requête qui dépend de la ligne de la requête externe", "Une sous-requête sans WHERE", "Une sous-requête dans HAVING", "Une jointure déguisée", "Elle est ré-évaluée pour chaque ligne externe."],
        ["Peut-on définir plusieurs CTE ?", "Oui : WITH a AS (...), b AS (...)", "Non, une seule est autorisée", "Oui, avec plusieurs WITH", "Seulement avec UNION", "On les sépare par une virgule."],
        ["Que permet GROUP BY ville, pays ?", "Un groupe pour chaque combinaison ville + pays", "Un groupe par ville seulement", "Un groupe par pays seulement", "Un tri", "Chaque combinaison distincte forme un groupe."],
        ["Quelle est la différence entre UNION et UNION ALL ?", "UNION supprime les doublons, UNION ALL les conserve", "UNION ALL supprime les doublons", "Aucune différence", "UNION ALL est trié", "UNION ALL est plus rapide car il ne compare pas les lignes."],
        ["Que fait SUM(CASE WHEN statut = 'payee' THEN montant ELSE 0 END) ?", "Additionne seulement les montants des commandes payées", "Additionne tout", "Compte les commandes", "Supprime les non payées", "CASE dans un agrégat permet de calculer des totaux conditionnels."],
        ["Que doit retourner une sous-requête scalaire ?", "Une seule valeur (une ligne, une colonne)", "Plusieurs colonnes", "Toute une table", "Rien", "Si elle retourne plusieurs lignes, la requête échoue."]
      ]),

      avance: mk([
        ["Quelle fonction numérote les lignes ?", "ROW_NUMBER()", "COUNT()", "SUM()", "RANK_TABLE()", "ROW_NUMBER() attribue 1, 2, 3… selon l'ordre demandé."],
        ["À quoi sert PARTITION BY dans une fonction de fenêtre ?", "Faire le calcul séparément pour chaque groupe", "Supprimer des départements", "Créer une table", "Désactiver ORDER BY", "C'est le « GROUP BY » des fonctions de fenêtre, sans réduire les lignes."],
        ["Avec ORDER BY salaire DESC, quelle ligne vient en premier ?", "Le plus grand salaire", "Le plus petit salaire", "Le salaire moyen", "Un salaire aléatoire", "DESC trie du plus grand au plus petit."],
        ["Quelle différence entre RANK et ROW_NUMBER ?", "RANK donne le même rang aux égalités, ROW_NUMBER numérote chaque ligne différemment", "Aucune", "ROW_NUMBER gère les égalités", "RANK ne trie pas", "Deux ex æquo : RANK → 1, 1, 3 ; ROW_NUMBER → 1, 2, 3."],
        ["Quelle expression calcule un total cumulé ?", "SUM(montant) OVER (ORDER BY date_commande)", "COUNT(*) GROUP BY date_commande", "DISTINCT SUM(date_commande)", "ORDER BY SUM()", "OVER transforme SUM en fonction de fenêtre."],
        ["Quelle syntaxe crée une CTE ?", "WITH nom AS (SELECT ...)", "CTE nom = SELECT", "CREATE CTE SELECT", "TEMP nom FROM SELECT", "WITH nom AS (...) est la syntaxe standard."],
        ["Que permet EXISTS ?", "Vérifier qu'une sous-requête renvoie au moins une ligne", "Trier une table", "Supprimer des doublons", "Calculer une somme", "EXISTS retourne vrai dès qu'une ligne est trouvée."],
        ["Comment trouver le meilleur salaire de chaque département avec le détail de la ligne ?", "ROW_NUMBER() OVER (PARTITION BY departement ORDER BY salaire DESC) puis garder le rang 1", "SELECT DISTINCT uniquement", "DELETE avec GROUP BY", "ORDER BY global seulement", "Le classement est refait pour chaque département."],
        ["Comment garder les lignes individuelles tout en ajoutant un calcul agrégé ?", "Une fonction de fenêtre avec OVER", "GROUP BY seul", "DISTINCT seul", "HAVING seul", "Les fonctions de fenêtre ne réduisent pas le nombre de lignes."],
        ["À quoi sert LAG(montant) OVER (ORDER BY date) ?", "À lire la valeur de la ligne précédente", "À lire la ligne suivante", "À sommer les montants", "À supprimer la première ligne", "Parfait pour calculer une évolution entre deux périodes."],
        ["À quoi sert LEAD() ?", "À lire la valeur de la ligne suivante", "À lire la ligne précédente", "À trier", "À compter", "LEAD regarde en avant, LAG regarde en arrière."],
        ["Différence entre RANK et DENSE_RANK avec des égalités ?", "DENSE_RANK ne laisse pas de trou (1, 1, 2) contrairement à RANK (1, 1, 3)", "Aucune", "RANK ne laisse jamais de trou", "DENSE_RANK ignore ORDER BY", "DENSE_RANK produit des rangs consécutifs."],
        ["Que fait NTILE(4) ?", "Répartit les lignes en 4 groupes de taille à peu près égale (quartiles)", "Retourne 4 lignes", "Multiplie par 4", "Crée 4 tables", "Utile pour segmenter (top 25 %, etc.)."],
        ["Que fait AVG(x) OVER (ORDER BY d ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) ?", "Calcule une moyenne mobile sur 3 lignes", "Calcule la moyenne globale", "Supprime 2 lignes", "Trie par d", "La fenêtre contient la ligne courante et les 2 précédentes."],
        ["À quoi sert une CTE récursive ?", "À parcourir des hiérarchies (organigramme, catégories)", "À supprimer des tables", "À créer des index", "À trier aléatoirement", "Elle s'appelle elle-même jusqu'à épuisement des niveaux."],
        ["Pourquoi ne peut-on pas écrire WHERE ROW_NUMBER() OVER (...) = 1 directement ?", "Le WHERE est évalué avant les fonctions de fenêtre : il faut une CTE ou sous-requête", "ROW_NUMBER est interdit", "OVER n'existe pas dans WHERE", "Cela supprime la table", "On calcule le rang dans une CTE, puis on filtre dessus."],
        ["Que retourne SUM(montant) OVER (PARTITION BY client) ?", "Le total du client sur chacune de ses lignes", "Un seul total global", "Le maximum du client", "Une erreur sans GROUP BY", "Contrairement à GROUP BY, chaque ligne est conservée."],
        ["Comment obtenir les 3 meilleures ventes par vendeur ?", "ROW_NUMBER() OVER (PARTITION BY vendeur ORDER BY montant DESC) <= 3 dans une CTE", "LIMIT 3 global", "SELECT TOP 3 vendeur", "GROUP BY vendeur LIMIT 3", "Un LIMIT global ne fonctionne pas par groupe."],
        ["Que retourne COUNT(*) OVER () ?", "Le nombre total de lignes, répété sur chaque ligne", "1", "Une erreur", "Le nombre de colonnes", "OVER () sans partition = toute la table comme fenêtre."]
      ])
    }
  }
};
