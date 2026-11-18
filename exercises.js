// exercises.js
// Exercices pratiques exécutés dans le navigateur avec SQLite (sql.js).
//
// Chaque exercice : x(énoncé, solution, indice, options)
// Options :
//   check    : requête SELECT exécutée APRÈS la requête de l'étudiant pour comparer l'état
//              de la base (exercices CREATE / INSERT / UPDATE / DELETE / DROP…)
//   ordered  : true si l'ORDRE des lignes compte (ORDER BY demandé)
//   names    : true si les NOMS des colonnes (alias) comptent
//   require  : [[regex, message], …] mots-clés obligatoires dans la requête

import { themeOrder, levelOrder } from "./questions.js";

/* ------------------------------------------------------------
   Base d'entraînement (recréée à chaque exécution)
------------------------------------------------------------ */
export const SEED_SQL = `
CREATE TABLE clients (
  id INTEGER PRIMARY KEY, nom TEXT NOT NULL, ville TEXT, age INTEGER, email TEXT
);
INSERT INTO clients VALUES
  (1, 'Awa',      'Dakar',       28, 'awa@mail.com'),
  (2, 'Moussa',   'Thiès',       35, 'moussa@mail.com'),
  (3, 'Fatou',    'Dakar',       22, NULL),
  (4, 'Ibrahima', 'Saint-Louis', 41, 'ibra@mail.com'),
  (5, 'Aminata',  'Kaolack',     30, 'aminata@gmail.com'),
  (6, 'Cheikh',   'Dakar',       45, NULL),
  (7, 'Mariama',  'Thiès',       19, 'mariama@gmail.com'),
  (8, 'Omar',     'Saint-Louis', 52, 'omar@mail.com');

CREATE TABLE commandes (
  id INTEGER PRIMARY KEY, client_id INTEGER, montant INTEGER, date_commande TEXT, statut TEXT
);
INSERT INTO commandes VALUES
  (101, 1, 15000, '2025-01-10', 'payee'),
  (102, 1,  8000, '2025-02-03', 'payee'),
  (103, 2, 25000, '2025-02-15', 'annulee'),
  (104, 4, 12000, '2025-03-01', 'payee'),
  (105, 5, 30000, '2025-03-12', 'payee'),
  (106, 5,  6000, '2025-03-20', 'annulee'),
  (107, 7,  9500, '2025-04-02', 'payee');

CREATE TABLE produits (
  id INTEGER PRIMARY KEY, nom TEXT, prix INTEGER, stock INTEGER, categorie TEXT
);
INSERT INTO produits VALUES
  (1, 'Riz 5kg',  3500, 40,  'Alimentaire'),
  (2, 'Huile 1L', 1800, 25,  'Alimentaire'),
  (3, 'Savon',     500, 100, 'Hygiène'),
  (4, 'Thé',      1200, 0,   'Alimentaire'),
  (5, 'Cahier',    600, 60,  'Papeterie');

CREATE TABLE lignes_commande (commande_id INTEGER, produit_id INTEGER, quantite INTEGER);
INSERT INTO lignes_commande VALUES
  (101, 1, 2), (101, 2, 1), (102, 3, 4), (104, 5, 10),
  (105, 1, 3), (105, 4, 2), (107, 3, 5);

CREATE TABLE equipe (id INTEGER PRIMARY KEY, nom TEXT, manager_id INTEGER);
INSERT INTO equipe VALUES (1, 'Mame', NULL), (2, 'Cheikh', 1), (3, 'Aminata', 1), (4, 'Omar', 2);

CREATE TABLE employes (id INTEGER PRIMARY KEY, nom TEXT, departement TEXT, salaire INTEGER);
INSERT INTO employes VALUES
  (1, 'Awa',     'Informatique', 800000),
  (2, 'Moussa',  'Informatique', 800000),
  (3, 'Fatou',   'Informatique', 600000),
  (4, 'Ibra',    'Marketing',    700000),
  (5, 'Aminata', 'Marketing',    650000);

CREATE TABLE ventes (id INTEGER PRIMARY KEY, mois TEXT, montant INTEGER);
INSERT INTO ventes VALUES (1, 'Jan', 100), (2, 'Fév', 120), (3, 'Mar', 90);
`;

const x = (prompt, solution, hint, options = {}) => ({ prompt, solution, hint, ...options });

export const exercises = {
  /* ============================================================
     FONDAMENTAUX
  ============================================================ */
  fondamentaux: {
    debutant: [
      x("Affiche le nom et la ville de tous les clients.",
        "SELECT nom, ville FROM clients;",
        "Structure : SELECT colonne1, colonne2 FROM table;"),
      x("Affiche toutes les colonnes des clients qui habitent à Dakar.",
        "SELECT * FROM clients WHERE ville = 'Dakar';",
        "Utilise WHERE ville = '...' (le texte va entre apostrophes)."),
      x("Affiche le nom et l'âge des clients de plus de 30 ans, du plus âgé au plus jeune.",
        "SELECT nom, age FROM clients WHERE age > 30 ORDER BY age DESC;",
        "WHERE filtre, puis ORDER BY age DESC trie du plus grand au plus petit.",
        { ordered: true }),
      x("Affiche la liste des villes, sans doublon.",
        "SELECT DISTINCT ville FROM clients;",
        "Le mot-clé DISTINCT se place juste après SELECT."),
      x("Affiche les 3 clients les plus jeunes (nom et âge).",
        "SELECT nom, age FROM clients ORDER BY age ASC LIMIT 3;",
        "Trie par âge croissant puis limite avec LIMIT 3 (sous SQL Server on écrirait TOP 3).",
        { ordered: true })
    ],

    intermediaire: [
      x("Affiche le nom des clients qui n'ont pas d'email.",
        "SELECT nom FROM clients WHERE email IS NULL;",
        "On teste NULL avec IS NULL, jamais avec = NULL."),
      x("Affiche le nom et la ville des clients de Dakar ou de Thiès, triés par ville puis par nom.",
        "SELECT nom, ville FROM clients WHERE ville IN ('Dakar', 'Thiès') ORDER BY ville, nom;",
        "IN ('a', 'b') remplace plusieurs OR. ORDER BY ville, nom trie sur deux colonnes.",
        { ordered: true }),
      x("Affiche le nom des clients âgés de 25 à 40 ans inclus.",
        "SELECT nom FROM clients WHERE age BETWEEN 25 AND 40;",
        "BETWEEN 25 AND 40 inclut les deux bornes."),
      x("Affiche le nom des clients dont le nom commence par la lettre A.",
        "SELECT nom FROM clients WHERE nom LIKE 'A%';",
        "LIKE 'A%' : le % remplace n'importe quelle suite de caractères."),
      x("Affiche le nom et l'email des clients qui ont une adresse Gmail.",
        "SELECT nom, email FROM clients WHERE email LIKE '%@gmail.com';",
        "Le % placé AVANT @gmail.com accepte n'importe quel début d'adresse.")
    ],

    avance: [
      x("Affiche le nom et l'email des clients. Si l'email est absent, affiche « non renseigné ». Nomme la colonne email.",
        "SELECT nom, COALESCE(email, 'non renseigné') AS email FROM clients;",
        "COALESCE(colonne, valeur_de_remplacement) remplace les NULL.",
        { names: true }),
      x("Affiche le nom et une catégorie : « Jeune » (moins de 25 ans), « Adulte » (25 à 39 ans), « Senior » (40 ans et plus).",
        "SELECT nom, CASE WHEN age < 25 THEN 'Jeune' WHEN age < 40 THEN 'Adulte' ELSE 'Senior' END AS categorie FROM clients;",
        "CASE WHEN condition THEN valeur ... ELSE valeur END AS categorie"),
      x("Affiche l'id et le nom des clients de la page 2, avec 3 clients par page, triés par id.",
        "SELECT id, nom FROM clients ORDER BY id LIMIT 3 OFFSET 3;",
        "OFFSET saute les lignes de la page précédente. N'oublie pas ORDER BY.",
        { ordered: true }),
      x("Affiche l'id et la date des commandes de février 2025, avec une borne de fin exclue (< 1er mars).",
        "SELECT id, date_commande FROM commandes WHERE date_commande >= '2025-02-01' AND date_commande < '2025-03-01';",
        "Début inclus (>=) et fin exclue (<) : '2025-02-01' à '2025-03-01'."),
      x("Combien de clients n'ont pas d'email ? Réponds avec UN seul nombre, en utilisant COUNT(*) et COUNT(email).",
        "SELECT COUNT(*) - COUNT(email) FROM clients;",
        "COUNT(*) compte toutes les lignes, COUNT(email) ignore les NULL : leur différence donne les NULL.")
    ]
  },

  /* ============================================================
     CRÉER & MODIFIER
  ============================================================ */
  manipulation: {
    debutant: [
      x("Crée une table fournisseurs avec : id (entier, clé primaire), nom (texte) et ville (texte).",
        "CREATE TABLE fournisseurs (id INTEGER PRIMARY KEY, nom TEXT, ville TEXT);",
        "CREATE TABLE nom (colonne type, colonne type, ...); ajoute PRIMARY KEY après id.",
        { check: "SELECT name, pk FROM pragma_table_info('fournisseurs') ORDER BY cid;", ordered: true }),
      x("Ajoute dans produits : id 6, nom 'Sucre 1kg', prix 900, stock 30, catégorie 'Alimentaire'.",
        "INSERT INTO produits (id, nom, prix, stock, categorie) VALUES (6, 'Sucre 1kg', 900, 30, 'Alimentaire');",
        "INSERT INTO table (colonnes) VALUES (valeurs dans le même ordre);",
        { check: "SELECT * FROM produits ORDER BY id;", ordered: true }),
      x("Passe le prix du produit numéro 1 à 3800.",
        "UPDATE produits SET prix = 3800 WHERE id = 1;",
        "UPDATE table SET colonne = valeur WHERE condition; (n'oublie pas le WHERE !)",
        { check: "SELECT id, prix FROM produits ORDER BY id;", ordered: true }),
      x("Supprime le produit dont l'id est 4.",
        "DELETE FROM produits WHERE id = 4;",
        "DELETE FROM table WHERE condition;",
        { check: "SELECT id FROM produits ORDER BY id;", ordered: true }),
      x("Ajoute une colonne telephone (texte) à la table clients.",
        "ALTER TABLE clients ADD telephone TEXT;",
        "ALTER TABLE table ADD colonne type;",
        { check: "SELECT name FROM pragma_table_info('clients') ORDER BY cid;", ordered: true })
    ],

    intermediaire: [
      x("Crée la table avis : id (entier, clé primaire), client_id (entier, NOT NULL), note (entier), commentaire (texte).",
        "CREATE TABLE avis (id INTEGER PRIMARY KEY, client_id INTEGER NOT NULL, note INTEGER, commentaire TEXT);",
        "Ajoute NOT NULL après le type de client_id.",
        { check: `SELECT name, pk, "notnull" FROM pragma_table_info('avis') ORDER BY cid;`, ordered: true }),
      x("En UNE seule requête, ajoute dans produits : (7, 'Lait 1L', 700, 50, 'Alimentaire'), (8, 'Stylo', 200, 80, 'Papeterie') et (9, 'Gel douche', 1500, 20, 'Hygiène').",
        "INSERT INTO produits (id, nom, prix, stock, categorie) VALUES (7, 'Lait 1L', 700, 50, 'Alimentaire'), (8, 'Stylo', 200, 80, 'Papeterie'), (9, 'Gel douche', 1500, 20, 'Hygiène');",
        "Sépare chaque groupe de valeurs par une virgule : VALUES (...), (...), (...);",
        { check: "SELECT * FROM produits ORDER BY id;", ordered: true }),
      x("Augmente de 10 % le prix de tous les produits de la catégorie 'Alimentaire'.",
        "UPDATE produits SET prix = prix * 1.1 WHERE categorie = 'Alimentaire';",
        "Augmenter de 10 % revient à multiplier par 1.1. Le WHERE limite à la catégorie.",
        { check: "SELECT id, prix FROM produits ORDER BY id;", ordered: true }),
      x("Supprime toutes les commandes annulées (statut 'annulee').",
        "DELETE FROM commandes WHERE statut = 'annulee';",
        "DELETE FROM commandes WHERE statut = '...';",
        { check: "SELECT id FROM commandes ORDER BY id;", ordered: true }),
      x("En UNE seule requête, change la ville du client 3 en 'Thiès' ET son âge en 23.",
        "UPDATE clients SET ville = 'Thiès', age = 23 WHERE id = 3;",
        "Sépare les affectations par une virgule : SET a = 1, b = 2",
        { check: "SELECT id, ville, age FROM clients ORDER BY id;", ordered: true })
    ],

    avance: [
      x("Dans une transaction : supprime le client 8 puis annule tout avec ROLLBACK. Le client 8 doit toujours exister à la fin.",
        "BEGIN; DELETE FROM clients WHERE id = 8; ROLLBACK;",
        "BEGIN; ... DELETE ... ; ROLLBACK;",
        {
          check: "SELECT COUNT(*) FROM clients WHERE id = 8;",
          require: [["DELETE", "Ta requête doit contenir un DELETE."], ["ROLLBACK", "Ta requête doit se terminer par ROLLBACK."]]
        }),
      x("Crée une table archive_commandes (id, client_id, montant : tous entiers), puis copie dedans, avec INSERT ... SELECT, les commandes annulées.",
        "CREATE TABLE archive_commandes (id INTEGER, client_id INTEGER, montant INTEGER); INSERT INTO archive_commandes SELECT id, client_id, montant FROM commandes WHERE statut = 'annulee';",
        "Deux requêtes séparées par un point-virgule : CREATE TABLE puis INSERT INTO ... SELECT ...",
        { check: "SELECT * FROM archive_commandes ORDER BY id;", ordered: true }),
      x("Crée un index nommé idx_clients_ville sur la colonne ville de la table clients.",
        "CREATE INDEX idx_clients_ville ON clients(ville);",
        "CREATE INDEX nom_index ON table(colonne);",
        { check: "SELECT name FROM sqlite_master WHERE type = 'index' AND name = 'idx_clients_ville';" }),
      x("Supprime complètement la table commandes (structure + données).",
        "DROP TABLE commandes;",
        "DROP TABLE nom_de_la_table;",
        { check: "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = 'commandes';" }),
      x("Avec un UPSERT (INSERT ... ON CONFLICT), insère le produit (1, 'Riz 5kg', 3900, 40, 'Alimentaire') : comme l'id 1 existe déjà, mets simplement son prix à 3900.",
        "INSERT INTO produits (id, nom, prix, stock, categorie) VALUES (1, 'Riz 5kg', 3900, 40, 'Alimentaire') ON CONFLICT(id) DO UPDATE SET prix = 3900;",
        "INSERT ... VALUES (...) ON CONFLICT(id) DO UPDATE SET prix = 3900; (MySQL utilise ON DUPLICATE KEY UPDATE).",
        {
          check: "SELECT id, prix FROM produits ORDER BY id;",
          ordered: true,
          require: [["ON CONFLICT", "Utilise INSERT ... ON CONFLICT pour cet exercice."]]
        })
    ]
  },

  /* ============================================================
     JOINTURES
  ============================================================ */
  jointures: {
    debutant: [
      x("Affiche le nom de chaque client avec le montant de ses commandes (seuls les clients qui ont commandé).",
        "SELECT c.nom, o.montant FROM clients c INNER JOIN commandes o ON c.id = o.client_id;",
        "FROM clients c INNER JOIN commandes o ON c.id = o.client_id"),
      x("Affiche le nom de TOUS les clients avec le montant de leurs commandes (NULL si aucune commande).",
        "SELECT c.nom, o.montant FROM clients c LEFT JOIN commandes o ON c.id = o.client_id;",
        "LEFT JOIN conserve toutes les lignes de la table de gauche (clients)."),
      x("Affiche le nom (sans doublon) des clients qui ont au moins une commande payée.",
        "SELECT DISTINCT c.nom FROM clients c JOIN commandes o ON o.client_id = c.id WHERE o.statut = 'payee';",
        "Joins les deux tables, filtre sur statut = 'payee', puis ajoute DISTINCT."),
      x("Affiche la date et le montant des commandes de la cliente Awa.",
        "SELECT o.date_commande, o.montant FROM commandes o JOIN clients c ON c.id = o.client_id WHERE c.nom = 'Awa';",
        "Joins commandes et clients, puis filtre avec WHERE c.nom = 'Awa'."),
      x("Affiche le nom du client et l'id de la commande pour les commandes de plus de 10000, de la plus chère à la moins chère.",
        "SELECT c.nom, o.id FROM clients c JOIN commandes o ON o.client_id = c.id WHERE o.montant > 10000 ORDER BY o.montant DESC;",
        "Joins, filtre avec WHERE o.montant > 10000, puis ORDER BY o.montant DESC.",
        { ordered: true })
    ],

    intermediaire: [
      x("Affiche le nom des clients qui n'ont jamais passé de commande.",
        "SELECT c.nom FROM clients c LEFT JOIN commandes o ON o.client_id = c.id WHERE o.id IS NULL;",
        "LEFT JOIN, puis garde les lignes où l'id de la commande est NULL."),
      x("Affiche pour chaque client son nom et son nombre de commandes (0 si aucune).",
        "SELECT c.nom, COUNT(o.id) AS nb FROM clients c LEFT JOIN commandes o ON o.client_id = c.id GROUP BY c.id, c.nom;",
        "LEFT JOIN + GROUP BY, et COUNT(o.id) (et non COUNT(*)) pour obtenir 0."),
      x("Affiche pour chaque client son nom et le total de ses commandes PAYÉES (0 s'il n'en a pas). Tous les clients doivent apparaître.",
        "SELECT c.nom, COALESCE(SUM(o.montant), 0) AS total FROM clients c LEFT JOIN commandes o ON o.client_id = c.id AND o.statut = 'payee' GROUP BY c.id, c.nom;",
        "Piège ! Mets la condition statut = 'payee' dans le ON, pas dans le WHERE, sinon des clients disparaissent. COALESCE remplace NULL par 0."),
      x("Affiche toutes les combinaisons entre les clients d'id 1 et 2 (leur nom) et les produits de la catégorie 'Alimentaire' (leur nom).",
        "SELECT c.nom, p.nom FROM clients c CROSS JOIN produits p WHERE c.id <= 2 AND p.categorie = 'Alimentaire';",
        "CROSS JOIN associe chaque client à chaque produit ; filtre ensuite avec WHERE."),
      x("Affiche le nom des clients qui ont plus d'une commande, avec leur nombre de commandes.",
        "SELECT c.nom, COUNT(*) AS nb FROM clients c JOIN commandes o ON o.client_id = c.id GROUP BY c.id, c.nom HAVING COUNT(*) > 1;",
        "JOIN + GROUP BY, puis HAVING COUNT(*) > 1 pour filtrer les groupes.")
    ],

    avance: [
      x("Avec la table equipe, affiche chaque membre (colonne employe) avec le nom de son manager (colonne manager). La directrice, sans manager, doit apparaître avec NULL.",
        "SELECT e.nom AS employe, m.nom AS manager FROM equipe e LEFT JOIN equipe m ON e.manager_id = m.id;",
        "Auto-jointure : equipe e LEFT JOIN equipe m ON e.manager_id = m.id"),
      x("Affiche le nom des clients qui n'ont aucune commande, en utilisant NOT EXISTS.",
        "SELECT nom FROM clients c WHERE NOT EXISTS (SELECT 1 FROM commandes o WHERE o.client_id = c.id);",
        "WHERE NOT EXISTS (SELECT 1 FROM commandes o WHERE o.client_id = c.id)",
        { require: [["NOT EXISTS", "Utilise NOT EXISTS pour cet exercice."]] }),
      x("Affiche le nom des clients qui ont au moins une commande de plus de 20000, sans doublon.",
        "SELECT nom FROM clients c WHERE EXISTS (SELECT 1 FROM commandes o WHERE o.client_id = c.id AND o.montant > 20000);",
        "EXISTS ne multiplie pas les lignes, contrairement à une simple jointure."),
      x("Calcule le chiffre d'affaires (somme des montants) des commandes qui possèdent au moins une ligne dans lignes_commande, sans compter une commande deux fois.",
        "SELECT SUM(montant) FROM commandes WHERE id IN (SELECT commande_id FROM lignes_commande);",
        "Piège des totaux faussés : une jointure répète la commande pour chaque ligne. Utilise plutôt IN (SELECT ...) ou EXISTS."),
      x("Pour chaque commande payée, affiche le client (colonne client), le produit (colonne produit) et la quantité, triés par id de commande puis par nom de produit.",
        "SELECT c.nom AS client, p.nom AS produit, l.quantite FROM commandes o JOIN clients c ON c.id = o.client_id JOIN lignes_commande l ON l.commande_id = o.id JOIN produits p ON p.id = l.produit_id WHERE o.statut = 'payee' ORDER BY o.id, p.nom;",
        "Enchaîne 3 JOIN : commandes → clients, commandes → lignes_commande, lignes_commande → produits.",
        { ordered: true })
    ]
  },

  /* ============================================================
     SQL AVANCÉ
  ============================================================ */
  avance: {
    debutant: [
      x("Calcule le chiffre d'affaires total : la somme des montants de toutes les commandes.",
        "SELECT SUM(montant) FROM commandes;",
        "SUM(colonne) additionne les valeurs."),
      x("Affiche le nombre de clients par ville (colonnes ville et nb).",
        "SELECT ville, COUNT(*) AS nb FROM clients GROUP BY ville;",
        "SELECT ville, COUNT(*) ... GROUP BY ville"),
      x("Affiche le montant moyen des commandes payées, arrondi à 2 décimales.",
        "SELECT ROUND(AVG(montant), 2) FROM commandes WHERE statut = 'payee';",
        "ROUND(AVG(montant), 2) avec un WHERE sur le statut."),
      x("Affiche, par client_id, le total des commandes, uniquement pour les clients dont le total dépasse 20000.",
        "SELECT client_id, SUM(montant) AS total FROM commandes GROUP BY client_id HAVING SUM(montant) > 20000;",
        "GROUP BY client_id puis HAVING SUM(montant) > 20000 (pas WHERE !)."),
      x("Affiche le prix le plus bas et le prix le plus élevé des produits.",
        "SELECT MIN(prix), MAX(prix) FROM produits;",
        "MIN() et MAX() dans le même SELECT.")
    ],

    intermediaire: [
      x("Affiche l'id et le montant des commandes dont le montant est supérieur à la moyenne de toutes les commandes.",
        "SELECT id, montant FROM commandes WHERE montant > (SELECT AVG(montant) FROM commandes);",
        "On ne peut pas écrire WHERE montant > AVG(montant) : utilise une sous-requête entre parenthèses."),
      x("Avec une CTE nommée totaux (total des commandes par client_id), affiche le nom et le total des clients dont le total dépasse 20000.",
        "WITH totaux AS (SELECT client_id, SUM(montant) AS total FROM commandes GROUP BY client_id) SELECT c.nom, t.total FROM clients c JOIN totaux t ON t.client_id = c.id WHERE t.total > 20000;",
        "WITH totaux AS ( ... ) SELECT ... FROM clients c JOIN totaux t ON ...",
        { require: [["WITH", "Utilise une CTE (WITH ... AS) pour cet exercice."]] }),
      x("En UNE requête, affiche le total des commandes payées et le total des commandes annulées (deux colonnes), avec SUM(CASE WHEN ...).",
        "SELECT SUM(CASE WHEN statut = 'payee' THEN montant ELSE 0 END) AS total_paye, SUM(CASE WHEN statut = 'annulee' THEN montant ELSE 0 END) AS total_annule FROM commandes;",
        "SUM(CASE WHEN statut = 'payee' THEN montant ELSE 0 END) pour chaque statut.",
        { require: [["CASE", "Utilise CASE WHEN dans un SUM pour cet exercice."]] }),
      x("Affiche les villes qui comptent au moins 2 clients, avec leur nombre de clients.",
        "SELECT ville, COUNT(*) AS nb FROM clients GROUP BY ville HAVING COUNT(*) > 1;",
        "GROUP BY ville puis HAVING COUNT(*) > 1"),
      x("Affiche le nom du produit le plus cher, avec une sous-requête.",
        "SELECT nom FROM produits WHERE prix = (SELECT MAX(prix) FROM produits);",
        "WHERE prix = (SELECT MAX(prix) FROM produits)",
        { require: [["\\(\\s*SELECT", "Utilise une sous-requête pour cet exercice."]] })
    ],

    avance: [
      x("Classe les employés par salaire décroissant avec RANK() : affiche nom, salaire et rang.",
        "SELECT nom, salaire, RANK() OVER (ORDER BY salaire DESC) AS rang FROM employes;",
        "RANK() OVER (ORDER BY salaire DESC) : les ex æquo ont le même rang."),
      x("Affiche le mieux payé de chaque département (nom, departement, salaire). En cas d'égalité, prends celui qui a le plus petit id.",
        "WITH classement AS (SELECT nom, departement, salaire, ROW_NUMBER() OVER (PARTITION BY departement ORDER BY salaire DESC, id) AS rang FROM employes) SELECT nom, departement, salaire FROM classement WHERE rang = 1;",
        "ROW_NUMBER() OVER (PARTITION BY departement ORDER BY salaire DESC, id) dans une CTE, puis WHERE rang = 1."),
      x("Affiche pour chaque mois de ventes : mois, montant et le montant du mois précédent (colonne precedent), avec LAG.",
        "SELECT mois, montant, LAG(montant) OVER (ORDER BY id) AS precedent FROM ventes;",
        "LAG(montant) OVER (ORDER BY id)",
        { require: [["LAG", "Utilise la fonction LAG pour cet exercice."]] }),
      x("Affiche pour chaque mois le total cumulé des ventes (colonnes mois et cumul).",
        "SELECT mois, SUM(montant) OVER (ORDER BY id) AS cumul FROM ventes;",
        "SUM(montant) OVER (ORDER BY id)"),
      x("Avec une CTE récursive, affiche chaque membre de equipe avec son niveau hiérarchique (nom, niveau). La directrice, sans manager, est au niveau 1.",
        "WITH RECURSIVE h AS (SELECT id, nom, 1 AS niveau FROM equipe WHERE manager_id IS NULL UNION ALL SELECT e.id, e.nom, h.niveau + 1 FROM equipe e JOIN h ON e.manager_id = h.id) SELECT nom, niveau FROM h;",
        "Point de départ : manager_id IS NULL (niveau 1). Partie récursive : joindre equipe à la CTE et faire niveau + 1.",
        { require: [["WITH", "Utilise une CTE récursive (WITH RECURSIVE) pour cet exercice."]] })
    ]
  }
};

// Identifiants stables : theme.niveau.index
themeOrder.forEach(theme => {
  levelOrder.forEach(level => {
    (exercises[theme]?.[level] || []).forEach((exercise, index) => {
      exercise.id = `${theme}.${level}.${index}`;
    });
  });
});
