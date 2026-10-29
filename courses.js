// courses.js
// Fiches de cours : 4 thèmes x 3 niveaux = 12 fiches.
// Types de blocs : text, list, code, example, tip, warning.
//
// Les mêmes tables d'exemple reviennent dans tous les cours :
//   clients, commandes (puis produits, lignes_commande, equipe, employes, ventes).

import { themeOrder, levelOrder } from "./questions.js";

/* ------------------------------------------------------------
   Petits raccourcis pour écrire les blocs
------------------------------------------------------------ */
const txt = text => ({ type: "text", text });
const list = (...items) => ({ type: "list", items });
const code = (sql, caption) => ({ type: "code", code: sql, caption });
const ex = (title, sql, result) => ({ type: "example", title, code: sql, result });
const tip = text => ({ type: "tip", text });
const warn = text => ({ type: "warning", text });

/* ------------------------------------------------------------
   Tables d'exemple (affichées plusieurs fois)
------------------------------------------------------------ */
const CLIENTS = `id | nom      | ville       | age | email
---+----------+-------------+-----+----------------
1  | Awa      | Dakar       | 28  | awa@mail.com
2  | Moussa   | Thiès       | 35  | moussa@mail.com
3  | Fatou    | Dakar       | 22  | NULL
4  | Ibrahima | Saint-Louis | 41  | ibra@mail.com`;

const COMMANDES = `id  | client_id | montant | date_commande | statut
----+-----------+---------+---------------+--------
101 | 1         | 15000   | 2025-01-10    | payee
102 | 1         | 8000    | 2025-02-03    | payee
103 | 2         | 25000   | 2025-02-15    | annulee
104 | 4         | 12000   | 2025-03-01    | payee`;

function emptyCourse() {
  return { summary: "", duration: "", sections: [] };
}

export const courses = {};

themeOrder.forEach(theme => {
  courses[theme] = {};
  levelOrder.forEach(level => {
    courses[theme][level] = emptyCourse();
  });
});

/* ============================================================
   THÈME 1 — FONDAMENTAUX
============================================================ */

courses.fondamentaux.debutant = {
  summary: "Apprendre à lire les données d'une table avec SELECT, FROM, WHERE et ORDER BY.",
  duration: "12 min",
  sections: [
    {
      title: "1. SQL, tables, lignes et colonnes",
      blocks: [
        txt("SQL (Structured Query Language) est le langage utilisé pour parler aux bases de données : lire, ajouter, modifier ou supprimer des informations. Une base de données range ses informations dans des tables, un peu comme des tableaux Excel."),
        list(
          "Une table = un sujet (clients, commandes, produits…).",
          "Une colonne = une information (nom, ville, âge…).",
          "Une ligne = un enregistrement (un client précis)."
        ),
        txt("Dans tous les cours, nous utiliserons les mêmes petites tables. Voici la table clients :"),
        code(CLIENTS, "Table clients"),
        tip("Chaque table possède une clé primaire : une colonne (ici id) qui identifie chaque ligne de façon unique. Remarque aussi que l'email de Fatou vaut NULL : cela signifie « valeur absente ».")
      ]
    },
    {
      title: "2. SELECT et FROM : lire des données",
      blocks: [
        txt("Toute requête de lecture commence par SELECT (quelles colonnes veut-on ?) suivi de FROM (dans quelle table ?)."),
        code("SELECT colonne1, colonne2\nFROM nom_de_la_table;", "Syntaxe de base"),
        ex(
          "Afficher le nom et la ville de tous les clients",
          "SELECT nom, ville\nFROM clients;",
          "On obtient une ligne par client, avec seulement ces deux colonnes."
        ),
        code(`nom      | ville
---------+------------
Awa      | Dakar
Moussa   | Thiès
Fatou    | Dakar
Ibrahima | Saint-Louis`, "Résultat"),
        ex(
          "Afficher toutes les colonnes",
          "SELECT *\nFROM clients;",
          "L'étoile * signifie « toutes les colonnes »."
        ),
        tip("Le point-virgule ; termine la requête. SELECT ne modifie jamais les données : c'est une simple lecture, sans aucun danger.")
      ]
    },
    {
      title: "3. WHERE : filtrer les lignes",
      blocks: [
        txt("WHERE ne garde que les lignes qui respectent une condition. Voici les opérateurs de comparaison :"),
        list(
          "=   égal à",
          "<>  différent de (!= fonctionne aussi dans la plupart des systèmes)",
          ">   strictement supérieur à",
          "<   strictement inférieur à",
          ">=  supérieur ou égal à",
          "<=  inférieur ou égal à"
        ),
        ex(
          "Les clients de Dakar",
          "SELECT nom, age\nFROM clients\nWHERE ville = 'Dakar';",
          "Seules Awa et Fatou habitent à Dakar."
        ),
        code(`nom   | age
------+-----
Awa   | 28
Fatou | 22`, "Résultat"),
        ex(
          "Les clients de plus de 25 ans",
          "SELECT nom, age\nFROM clients\nWHERE age > 25;",
          "Awa (28), Moussa (35) et Ibrahima (41) sont retenus."
        ),
        warn("On utilise un seul = pour comparer (pas ==). Les textes s'écrivent entre apostrophes simples : 'Dakar'. Sans apostrophes, SQL croit que Dakar est un nom de colonne et renvoie une erreur.")
      ]
    },
    {
      title: "4. AND et OR : combiner des conditions",
      blocks: [
        list(
          "AND : les deux conditions doivent être vraies (plus restrictif).",
          "OR : au moins une condition doit être vraie (plus large)."
        ),
        ex(
          "Dakar ET plus de 25 ans",
          "SELECT nom\nFROM clients\nWHERE ville = 'Dakar' AND age > 25;",
          "Seule Awa respecte les deux conditions (Fatou a 22 ans)."
        ),
        ex(
          "Dakar OU Thiès",
          "SELECT nom\nFROM clients\nWHERE ville = 'Dakar' OR ville = 'Thiès';",
          "On obtient Awa, Moussa et Fatou."
        ),
        tip("Quand tu mélanges AND et OR, ajoute des parenthèses pour que ta requête soit claire. Tu verras pourquoi au niveau suivant.")
      ]
    },
    {
      title: "5. Trier, supprimer les doublons, renommer, limiter",
      blocks: [
        txt("ORDER BY trie le résultat. Par défaut le tri est croissant (ASC). DESC donne un tri décroissant."),
        ex(
          "Du plus âgé au plus jeune",
          "SELECT nom, age\nFROM clients\nORDER BY age DESC;",
          "Ibrahima (41), Moussa (35), Awa (28), Fatou (22)."
        ),
        txt("DISTINCT supprime les doublons : chaque valeur n'apparaît qu'une seule fois."),
        ex(
          "Les villes présentes dans la table",
          "SELECT DISTINCT ville\nFROM clients;",
          "Dakar, Thiès et Saint-Louis (Dakar n'apparaît qu'une fois)."
        ),
        txt("AS donne un nom temporaire (un alias) à une colonne dans le résultat."),
        code("SELECT nom AS client, age AS age_du_client\nFROM clients;", "Renommer des colonnes"),
        txt("Pour limiter le nombre de lignes : LIMIT (MySQL, PostgreSQL) ou TOP (SQL Server)."),
        code("-- MySQL / PostgreSQL\nSELECT nom, age FROM clients ORDER BY age DESC LIMIT 2;\n\n-- SQL Server\nSELECT TOP 2 nom, age FROM clients ORDER BY age DESC;", "Les 2 clients les plus âgés")
      ]
    },
    {
      title: "6. L'ordre des clauses et les erreurs fréquentes",
      blocks: [
        txt("Les clauses s'écrivent toujours dans cet ordre :"),
        code("SELECT   colonnes\nFROM     table\nWHERE    condition\nORDER BY tri;", "Ordre d'écriture"),
        list(
          "Oublier les apostrophes autour d'un texte : WHERE ville = Dakar ❌",
          "Écrire == au lieu de = ❌",
          "Placer ORDER BY avant WHERE ❌",
          "Oublier le point-virgule en fin de requête (surtout quand on enchaîne plusieurs requêtes)."
        ),
        tip("Retiens la phrase : « SELECT quoi ? FROM où ? WHERE quelle condition ? ORDER BY dans quel ordre ? »")
      ]
    }
  ]
};

courses.fondamentaux.intermediaire = {
  summary: "Filtrer avec précision : NULL, IN, BETWEEN, LIKE, priorité des opérateurs et calculs.",
  duration: "14 min",
  sections: [
    {
      title: "1. NULL : une valeur absente",
      blocks: [
        txt("NULL ne veut pas dire 0 ni « texte vide » : cela signifie « on ne connaît pas la valeur ». C'est pourquoi on ne peut pas le tester avec =."),
        code(CLIENTS, "Rappel : table clients"),
        ex(
          "Les clients sans email",
          "SELECT nom\nFROM clients\nWHERE email IS NULL;",
          "Seule Fatou n'a pas d'email."
        ),
        ex(
          "Les clients avec un email",
          "SELECT nom\nFROM clients\nWHERE email IS NOT NULL;",
          "Awa, Moussa et Ibrahima."
        ),
        warn("WHERE email = NULL ne renvoie jamais rien, même s'il y a des NULL. Utilise toujours IS NULL ou IS NOT NULL.")
      ]
    },
    {
      title: "2. IN, NOT IN et BETWEEN",
      blocks: [
        txt("IN remplace une série de OR : on compare une valeur à une liste."),
        ex(
          "Clients de Dakar ou de Thiès",
          "SELECT nom\nFROM clients\nWHERE ville IN ('Dakar', 'Thiès');",
          "Équivalent à ville = 'Dakar' OR ville = 'Thiès' : Awa, Moussa, Fatou."
        ),
        ex(
          "Clients hors de Dakar et Thiès",
          "SELECT nom\nFROM clients\nWHERE ville NOT IN ('Dakar', 'Thiès');",
          "Il ne reste qu'Ibrahima, de Saint-Louis."
        ),
        txt("BETWEEN teste un intervalle, bornes comprises."),
        ex(
          "Clients de 25 à 35 ans inclus",
          "SELECT nom, age\nFROM clients\nWHERE age BETWEEN 25 AND 35;",
          "Awa (28) et Moussa (35). Le 35 est bien inclus."
        ),
        tip("BETWEEN 25 AND 35 est exactement équivalent à age >= 25 AND age <= 35.")
      ]
    },
    {
      title: "3. LIKE : chercher selon un modèle",
      blocks: [
        txt("LIKE permet de rechercher du texte avec deux caractères joker :"),
        list(
          "%  remplace zéro, un ou plusieurs caractères.",
          "_  remplace exactement un caractère."
        ),
        ex("Noms qui commencent par A", "SELECT nom FROM clients WHERE nom LIKE 'A%';", "Awa."),
        ex("Noms qui contiennent « ou »", "SELECT nom FROM clients WHERE nom LIKE '%ou%';", "Moussa et Fatou."),
        ex("Noms de 3 lettres : A, une lettre quelconque, puis a", "SELECT nom FROM clients WHERE nom LIKE 'A_a';", "Awa."),
        ex("Emails Gmail", "SELECT email FROM clients WHERE email LIKE '%@gmail.com';", "Tout ce qui se termine par @gmail.com."),
        tip("Selon le système, LIKE peut être sensible ou non à la majuscule. SQL Server et MySQL ignorent souvent la casse, PostgreSQL la respecte.")
      ]
    },
    {
      title: "4. La priorité entre AND et OR",
      blocks: [
        txt("SQL évalue AND avant OR, comme en mathématiques la multiplication passe avant l'addition. Cela surprend souvent les débutants."),
        ex(
          "Sans parenthèses",
          "SELECT nom\nFROM clients\nWHERE ville = 'Thiès' OR ville = 'Saint-Louis' AND age > 50;",
          "SQL lit : Thiès OU (Saint-Louis ET plus de 50 ans). Résultat : Moussa."
        ),
        ex(
          "Avec parenthèses",
          "SELECT nom\nFROM clients\nWHERE (ville = 'Thiès' OR ville = 'Saint-Louis') AND age > 50;",
          "Ici personne n'a plus de 50 ans : résultat vide."
        ),
        warn("Deux requêtes presque identiques, deux résultats différents ! Mets toujours des parenthèses dès que tu mélanges AND et OR.")
      ]
    },
    {
      title: "5. Trier sur plusieurs colonnes et faire des calculs",
      blocks: [
        ex(
          "Trier par ville, puis par nom",
          "SELECT nom, ville\nFROM clients\nORDER BY ville ASC, nom ASC;",
          "Le premier critère domine ; le second départage les égalités (Awa avant Fatou à Dakar)."
        ),
        txt("On peut faire des calculs directement dans le SELECT : + - * /"),
        ex(
          "Appliquer une réduction de 10 %",
          "SELECT montant, montant * 0.90 AS prix_reduit\nFROM commandes\nWHERE id = 101;",
          "Payer 90 % du prix revient à multiplier par 0,90 : 15000 devient 13500."
        ),
        ex(
          "Compter les lignes",
          "SELECT COUNT(*) AS nombre_clients\nFROM clients;",
          "Résultat : 4."
        )
      ]
    },
    {
      title: "6. À retenir",
      blocks: [
        list(
          "NULL se teste avec IS NULL / IS NOT NULL, jamais avec =.",
          "IN pour une liste, BETWEEN pour un intervalle (bornes incluses).",
          "LIKE avec % (plusieurs caractères) et _ (un caractère).",
          "AND passe avant OR : utilise des parenthèses.",
          "ORDER BY peut trier sur plusieurs colonnes."
        )
      ]
    }
  ]
};

courses.fondamentaux.avance = {
  summary: "Maîtriser les pièges de NULL, CASE WHEN, l'ordre d'exécution, la pagination et les dates.",
  duration: "16 min",
  sections: [
    {
      title: "1. NULL en profondeur : la logique à trois valeurs",
      blocks: [
        txt("En SQL, une condition peut valoir VRAI, FAUX ou INCONNU (UNKNOWN). Dès qu'on compare quelque chose à NULL, le résultat est INCONNU, et WHERE ne garde que les lignes VRAI."),
        list(
          "NULL = NULL  →  INCONNU (pas VRAI !)",
          "NULL + 5  →  NULL",
          "NULL <> 'Dakar'  →  INCONNU : la ligne est exclue."
        ),
        ex(
          "COUNT(*) contre COUNT(colonne)",
          "SELECT COUNT(*) AS lignes, COUNT(email) AS emails\nFROM clients;",
          "Résultat : 4 lignes mais seulement 3 emails, car COUNT(email) ignore les NULL."
        ),
        ex(
          "Le piège de NOT IN",
          "SELECT nom\nFROM clients\nWHERE email NOT IN ('awa@mail.com');",
          "On attendrait Moussa, Fatou et Ibrahima. Fatou disparaît : son email est NULL, donc la comparaison est INCONNUE."
        ),
        tip("Pour garder les NULL, écris explicitement : WHERE email NOT IN ('awa@mail.com') OR email IS NULL.")
      ]
    },
    {
      title: "2. COALESCE et CASE WHEN",
      blocks: [
        txt("COALESCE renvoie la première valeur qui n'est pas NULL. C'est idéal pour remplacer les valeurs absentes."),
        ex(
          "Afficher « non renseigné » à la place de NULL",
          "SELECT nom, COALESCE(email, 'non renseigné') AS email\nFROM clients;",
          "Fatou apparaît avec « non renseigné » au lieu de NULL."
        ),
        txt("CASE WHEN fonctionne comme un « si… alors… sinon » : on crée une colonne calculée selon des conditions."),
        ex(
          "Classer les clients par tranche d'âge",
          `SELECT nom, age,
       CASE
         WHEN age < 25 THEN 'Jeune'
         WHEN age < 40 THEN 'Adulte'
         ELSE 'Senior'
       END AS categorie
FROM clients;`,
          "Awa et Moussa : Adulte. Fatou : Jeune. Ibrahima : Senior."
        ),
        tip("SQL Server propose aussi ISNULL(colonne, valeur), mais COALESCE fonctionne partout.")
      ]
    },
    {
      title: "3. L'ordre logique d'exécution",
      blocks: [
        txt("On écrit SELECT en premier, mais SQL l'exécute presque en dernier. Voici l'ordre réel de traitement :"),
        code(`1. FROM       → on choisit la table (et les jointures)
2. WHERE      → on filtre les lignes
3. GROUP BY   → on regroupe
4. HAVING     → on filtre les groupes
5. SELECT     → on calcule les colonnes et les alias
6. ORDER BY   → on trie
7. LIMIT      → on coupe`, "Ordre d'exécution"),
        txt("Conséquence directe : un alias créé dans SELECT n'existe pas encore au moment du WHERE."),
        code(`-- ❌ Erreur : l'alias n'existe pas encore dans WHERE
SELECT age * 2 AS double_age FROM clients WHERE double_age > 50;

-- ✅ Correct : on répète le calcul
SELECT age * 2 AS double_age FROM clients WHERE age * 2 > 50;

-- ✅ ORDER BY, lui, peut utiliser l'alias
SELECT age * 2 AS double_age FROM clients ORDER BY double_age;`, "Alias et ordre d'exécution")
      ]
    },
    {
      title: "4. Pagination : LIMIT et OFFSET",
      blocks: [
        txt("Pour afficher les résultats page par page, on combine un tri, une taille de page (LIMIT) et un décalage (OFFSET)."),
        ex(
          "Page 2, avec 2 clients par page",
          "SELECT id, nom\nFROM clients\nORDER BY id\nLIMIT 2 OFFSET 2;",
          "OFFSET 2 saute les deux premiers clients. On obtient Fatou et Ibrahima."
        ),
        code("-- SQL Server\nSELECT id, nom FROM clients ORDER BY id\nOFFSET 2 ROWS FETCH NEXT 2 ROWS ONLY;", "Équivalent SQL Server"),
        warn("Sans ORDER BY, l'ordre des lignes n'est pas garanti : une pagination sans tri peut afficher deux fois la même ligne ou en oublier.")
      ]
    },
    {
      title: "5. Filtrer correctement les dates et les doublons",
      blocks: [
        txt("Pour filtrer une période, la méthode la plus fiable consiste à utiliser une borne de début incluse et une borne de fin exclue."),
        ex(
          "Les commandes de février 2025",
          "SELECT id, date_commande\nFROM commandes\nWHERE date_commande >= '2025-02-01'\n  AND date_commande <  '2025-03-01';",
          "On obtient les commandes 102 et 103. Cette écriture reste correcte même si la colonne contient une heure."
        ),
        txt("DISTINCT s'applique à l'ensemble des colonnes sélectionnées : il garde les combinaisons uniques."),
        ex(
          "Combinaisons client + statut",
          "SELECT DISTINCT client_id, statut\nFROM commandes;",
          "(1, payee), (2, annulee), (4, payee) : le client 1 n'apparaît qu'une fois pour « payee »."
        ),
        tip("Pour DISTINCT, toutes les valeurs NULL sont considérées comme identiques et regroupées en une seule.")
      ]
    },
    {
      title: "6. Bonnes pratiques d'écriture",
      blocks: [
        list(
          "Évite SELECT * dans une application : choisis les colonnes utiles, la requête sera plus claire et plus rapide.",
          "Écris les mots-clés en majuscules et indente chaque clause sur sa ligne.",
          "Donne des alias explicites aux colonnes calculées.",
          "Pense toujours à ce qui se passe avec les NULL.",
          "Utilise ORDER BY dès que l'ordre des lignes compte."
        )
      ]
    }
  ]
};

/* ============================================================
   THÈME 2 — CRÉER & MODIFIER
============================================================ */

courses.manipulation.debutant = {
  summary: "Créer une table, y ajouter, modifier et supprimer des données : CREATE, INSERT, UPDATE, DELETE, DROP, TRUNCATE.",
  duration: "14 min",
  sections: [
    {
      title: "1. Deux familles de commandes : DDL et DML",
      blocks: [
        txt("Jusqu'ici, nous avons seulement lu des données. SQL permet aussi de construire et de modifier une base de données. On distingue deux grandes familles :"),
        list(
          "DDL (Data Definition Language) : définir la structure. CREATE, ALTER, DROP, TRUNCATE.",
          "DML (Data Manipulation Language) : manipuler les données. INSERT, UPDATE, DELETE."
        ),
        warn("Ces commandes modifient réellement la base. Avant de t'entraîner, utilise une base de test, jamais des données importantes.")
      ]
    },
    {
      title: "2. CREATE TABLE : créer une table",
      blocks: [
        txt("CREATE TABLE définit le nom de la table, puis chaque colonne avec son type de données."),
        code(`CREATE TABLE produits (
  id         INT PRIMARY KEY,
  nom        VARCHAR(50),
  prix       DECIMAL(10, 2),
  stock      INT,
  date_ajout DATE
);`, "Création de la table produits"),
        txt("Les types les plus courants :"),
        list(
          "INT : nombre entier (quantité, âge…).",
          "DECIMAL(10, 2) : nombre à virgule (prix) : 10 chiffres au total, dont 2 après la virgule.",
          "VARCHAR(50) : texte de 50 caractères maximum.",
          "DATE : une date (2025-03-01).",
          "BOOLEAN : vrai ou faux (BIT sous SQL Server)."
        ),
        tip("CREATE DATABASE boutique; crée une base de données entière, qui contiendra ensuite plusieurs tables.")
      ]
    },
    {
      title: "3. INSERT INTO : ajouter des lignes",
      blocks: [
        code(`INSERT INTO produits (id, nom, prix, stock, date_ajout)
VALUES (1, 'Riz 5kg', 3500, 40, '2025-01-15');`, "Ajouter un produit"),
        list(
          "On liste d'abord les colonnes, puis les valeurs dans le même ordre.",
          "Les textes et les dates s'écrivent entre apostrophes.",
          "Les nombres s'écrivent sans apostrophes."
        ),
        tip("Précise toujours les colonnes. Si la structure de la table change plus tard, ton INSERT continuera de fonctionner.")
      ]
    },
    {
      title: "4. UPDATE : modifier des données",
      blocks: [
        code(`UPDATE produits
SET prix = 3800
WHERE id = 1;`, "Changer le prix du produit 1"),
        txt("SET indique la nouvelle valeur. WHERE indique quelles lignes modifier."),
        warn("Sans WHERE, UPDATE modifie TOUTES les lignes de la table ! Vérifie toujours la présence de ton WHERE avant d'exécuter.")
      ]
    },
    {
      title: "5. DELETE, TRUNCATE, DROP : supprimer, mais pas pareil",
      blocks: [
        txt("Trois commandes servent à « supprimer », mais elles ne détruisent pas la même chose :"),
        code(`Commande                      | Ce qui est supprimé
------------------------------+-----------------------------------
DELETE FROM produits WHERE... | Des lignes précises (WHERE possible)
TRUNCATE TABLE produits;      | TOUTES les lignes, structure gardée
DROP TABLE produits;          | La table entière : structure + données`, "Comparaison"),
        code(`DELETE FROM produits WHERE id = 3;   -- supprime le produit 3
TRUNCATE TABLE produits;              -- vide la table
DROP TABLE produits;                  -- supprime la table`, "Exemples"),
        warn("DELETE FROM produits; sans WHERE supprime toutes les lignes. DROP TABLE est encore plus radical : la table n'existe plus.")
      ]
    },
    {
      title: "6. ALTER TABLE : modifier la structure",
      blocks: [
        txt("Pour ajouter une colonne à une table qui existe déjà, on utilise ALTER TABLE."),
        code("ALTER TABLE produits\nADD categorie VARCHAR(30);", "Ajouter une colonne"),
        tip("Retiens : CREATE, ALTER, DROP touchent à la structure ; INSERT, UPDATE, DELETE touchent aux données.")
      ]
    }
  ]
};

courses.manipulation.intermediaire = {
  summary: "Protéger tes données avec les contraintes, relier les tables avec une clé étrangère et supprimer proprement.",
  duration: "16 min",
  sections: [
    {
      title: "1. Les contraintes : des règles pour garder des données propres",
      blocks: [
        txt("Une contrainte est une règle définie sur une colonne. Si une donnée ne la respecte pas, le système refuse l'ajout ou la modification."),
        list(
          "PRIMARY KEY : identifie chaque ligne de façon unique (jamais NULL, jamais en double).",
          "NOT NULL : la colonne doit toujours avoir une valeur.",
          "UNIQUE : pas deux fois la même valeur (ex. un email).",
          "DEFAULT : valeur automatique si on n'en fournit pas.",
          "CHECK : règle de validation (ex. un âge positif)."
        ),
        code(`CREATE TABLE clients (
  id     INT PRIMARY KEY,
  nom    VARCHAR(50)  NOT NULL,
  email  VARCHAR(100) UNIQUE,
  age    INT CHECK (age >= 0),
  statut VARCHAR(20)  DEFAULT 'actif'
);`, "Une table avec toutes les contraintes"),
        tip("Si tu insères deux fois le même id, le système répond par une erreur de clé primaire dupliquée. C'est voulu : c'est lui qui protège tes données.")
      ]
    },
    {
      title: "2. FOREIGN KEY : relier deux tables",
      blocks: [
        txt("Une clé étrangère est une colonne qui pointe vers la clé primaire d'une autre table. Elle garantit qu'on ne peut pas créer une commande pour un client qui n'existe pas."),
        code(`CREATE TABLE commandes (
  id         INT PRIMARY KEY,
  client_id  INT NOT NULL,
  montant    DECIMAL(10, 2),
  FOREIGN KEY (client_id) REFERENCES clients(id)
);`, "commandes.client_id référence clients.id"),
        txt("On appelle cela l'intégrité référentielle : toute clé étrangère doit pointer vers une ligne qui existe."),
        warn("Insérer une commande avec client_id = 999 provoque une erreur si le client 999 n'existe pas. De même, supprimer un client qui a encore des commandes est refusé (sauf règle contraire, voir le niveau avancé).")
      ]
    },
    {
      title: "3. ALTER TABLE : faire évoluer une table",
      blocks: [
        code("ALTER TABLE clients ADD telephone VARCHAR(20);", "Ajouter une colonne"),
        code("ALTER TABLE clients DROP COLUMN telephone;", "Supprimer une colonne"),
        txt("Changer le type d'une colonne existante dépend du système de base de données :"),
        code(`-- MySQL
ALTER TABLE clients MODIFY nom VARCHAR(80);

-- SQL Server
ALTER TABLE clients ALTER COLUMN nom VARCHAR(80);

-- PostgreSQL
ALTER TABLE clients ALTER COLUMN nom TYPE VARCHAR(80);`, "Modifier le type d'une colonne"),
        warn("Supprimer une colonne détruit définitivement les données qu'elle contient.")
      ]
    },
    {
      title: "4. DELETE, TRUNCATE ou DROP : lequel choisir ?",
      blocks: [
        code(`                 | DELETE         | TRUNCATE       | DROP
-----------------+----------------+----------------+----------------
Supprime         | des lignes     | toutes lignes  | la table entière
WHERE possible   | oui            | non            | non
Structure gardée | oui            | oui            | non
Vitesse          | plus lent      | très rapide    | très rapide`, "Tableau comparatif"),
        list(
          "Supprimer quelques lignes précises → DELETE avec WHERE.",
          "Vider complètement une table pour la remplir de nouveau → TRUNCATE.",
          "Ne plus jamais utiliser la table → DROP.",
          "TRUNCATE est généralement plus rapide car il ne traite pas chaque ligne une par une."
        ),
        ex(
          "Supprimer les commandes annulées",
          "DELETE FROM commandes\nWHERE statut = 'annulee';",
          "Seules les lignes annulées sont supprimées, la table reste intacte."
        )
      ]
    },
    {
      title: "5. Insérer et modifier plusieurs lignes",
      blocks: [
        code(`INSERT INTO clients (id, nom, ville)
VALUES (5, 'Aminata', 'Kaolack'),
       (6, 'Cheikh',  'Ziguinchor'),
       (7, 'Mariama', 'Dakar');`, "Insérer 3 lignes en une seule requête"),
        code(`UPDATE clients
SET ville = 'Dakar', statut = 'actif'
WHERE id = 5;`, "Modifier plusieurs colonnes à la fois : les affectations sont séparées par des virgules"),
        tip("DROP TABLE IF EXISTS clients; supprime la table seulement si elle existe, sans provoquer d'erreur dans le cas contraire.")
      ]
    },
    {
      title: "6. La règle d'or avant UPDATE et DELETE",
      blocks: [
        txt("Avant de modifier ou supprimer, teste ta condition avec un SELECT. Tu vois exactement quelles lignes seront touchées."),
        code(`-- Étape 1 : je vérifie
SELECT * FROM commandes WHERE statut = 'annulee';

-- Étape 2 : si le résultat est bon, je supprime
DELETE FROM commandes WHERE statut = 'annulee';`, "Toujours SELECT d'abord"),
        tip("Prends cette habitude dès maintenant : elle t'évitera la pire erreur du métier, supprimer ou modifier toute une table par oubli du WHERE.")
      ]
    }
  ]
};

courses.manipulation.avance = {
  summary: "Transactions, intégrité référentielle, UPSERT, droits d'accès et bonnes pratiques de production.",
  duration: "18 min",
  sections: [
    {
      title: "1. Les transactions : tout ou rien",
      blocks: [
        txt("Une transaction regroupe plusieurs opérations en un tout : soit elles réussissent toutes, soit aucune n'est appliquée. Imagine un virement de 5000 entre deux comptes : retirer sans ajouter serait une catastrophe."),
        code(`BEGIN TRANSACTION;   -- MySQL : START TRANSACTION

UPDATE comptes SET solde = solde - 5000 WHERE id = 1;
UPDATE comptes SET solde = solde + 5000 WHERE id = 2;

COMMIT;`, "Un virement bancaire"),
        list(
          "COMMIT : valide définitivement toutes les modifications.",
          "ROLLBACK : annule toutes les modifications depuis le début de la transaction."
        ),
        txt("Les transactions respectent les propriétés ACID :"),
        list(
          "Atomicité : tout ou rien.",
          "Cohérence : les règles et contraintes sont toujours respectées.",
          "Isolation : deux transactions simultanées ne se perturbent pas.",
          "Durabilité : une fois validée, la modification est permanente."
        ),
        tip("En cas d'erreur au milieu du virement, un ROLLBACK remet les deux comptes dans leur état initial.")
      ]
    },
    {
      title: "2. SAVEPOINT : un point de retour partiel",
      blocks: [
        txt("Un SAVEPOINT permet d'annuler seulement une partie d'une transaction, sans tout recommencer."),
        code(`BEGIN;
INSERT INTO commandes (id, client_id, montant) VALUES (105, 1, 5000);
SAVEPOINT apres_commande;
DELETE FROM clients WHERE id = 3;       -- on se rend compte d'une erreur
ROLLBACK TO apres_commande;             -- on annule seulement le DELETE
COMMIT;`, "Annulation partielle (PostgreSQL / MySQL)"),
        tip("Sous SQL Server, la syntaxe est SAVE TRANSACTION nom puis ROLLBACK TRANSACTION nom.")
      ]
    },
    {
      title: "3. Intégrité référentielle : ON DELETE",
      blocks: [
        txt("Que se passe-t-il quand on supprime un client qui possède des commandes ? On choisit le comportement lors de la création de la clé étrangère :"),
        code(`FOREIGN KEY (client_id) REFERENCES clients(id)
  ON DELETE CASCADE`, "Supprimer un client supprime aussi ses commandes"),
        list(
          "ON DELETE RESTRICT (ou NO ACTION) : la suppression est refusée tant que des commandes existent. C'est le comportement par défaut.",
          "ON DELETE CASCADE : les lignes enfants sont supprimées automatiquement.",
          "ON DELETE SET NULL : la clé étrangère des lignes enfants est mise à NULL."
        ),
        warn("DROP TABLE clients est refusé si une autre table y fait référence par clé étrangère. De même, TRUNCATE est refusé (par exemple sous SQL Server) sur une table référencée. Il faut d'abord supprimer la contrainte, ou utiliser DELETE.")
      ]
    },
    {
      title: "4. DELETE et TRUNCATE : les différences avancées",
      blocks: [
        list(
          "Compteur automatique : TRUNCATE remet généralement le compteur (IDENTITY, AUTO_INCREMENT) à zéro, DELETE non.",
          "Annulation : sous SQL Server et PostgreSQL, un TRUNCATE dans une transaction peut être annulé par ROLLBACK. Sous MySQL, TRUNCATE valide implicitement et ne peut pas être annulé.",
          "Performance : TRUNCATE ne traite pas chaque ligne individuellement, il est donc beaucoup plus rapide sur de grandes tables.",
          "Filtrage : seul DELETE accepte une clause WHERE."
        ),
        txt("Les colonnes qui se remplissent toutes seules s'écrivent différemment selon le système :"),
        code(`-- SQL Server
id INT IDENTITY(1,1) PRIMARY KEY

-- MySQL
id INT AUTO_INCREMENT PRIMARY KEY

-- PostgreSQL
id SERIAL PRIMARY KEY`, "Identifiant auto-incrémenté"),
        warn("DROP DATABASE est irréversible : seule une sauvegarde permet de restaurer. Ne l'exécute jamais sans en avoir une.")
      ]
    },
    {
      title: "5. INSERT … SELECT et UPSERT",
      blocks: [
        txt("INSERT … SELECT insère le résultat d'une requête dans une autre table, par exemple pour archiver."),
        code(`INSERT INTO archive_commandes (id, client_id, montant)
SELECT id, client_id, montant
FROM commandes
WHERE date_commande < '2025-01-01';`, "Copier d'anciennes commandes dans une table d'archive"),
        txt("Un UPSERT insère la ligne si elle n'existe pas, sinon la met à jour. La syntaxe change d'un système à l'autre :"),
        code(`-- PostgreSQL
INSERT INTO produits (id, nom, prix) VALUES (1, 'Riz 5kg', 3800)
ON CONFLICT (id) DO UPDATE SET prix = 3800;

-- MySQL
INSERT INTO produits (id, nom, prix) VALUES (1, 'Riz 5kg', 3800)
ON DUPLICATE KEY UPDATE prix = 3800;

-- SQL Server : MERGE ... WHEN MATCHED / WHEN NOT MATCHED`, "UPSERT"),
        ex(
          "Augmenter de 10 % le prix d'une catégorie",
          "UPDATE produits\nSET prix = prix * 1.1\nWHERE categorie = 'Boissons';",
          "Seuls les prix des boissons augmentent de 10 %."
        )
      ]
    },
    {
      title: "6. Index, droits et bonnes pratiques de production",
      blocks: [
        txt("Un index accélère les recherches sur une colonne, comme l'index d'un livre. En contrepartie, il ralentit un peu les écritures."),
        code("CREATE INDEX idx_clients_ville\nON clients(ville);", "Créer un index"),
        txt("Les commandes de la famille DCL (Data Control Language) gèrent les droits d'accès :"),
        code("GRANT SELECT ON clients TO lecteur;   -- donne le droit de lire\nREVOKE SELECT ON clients FROM lecteur; -- retire ce droit", "GRANT et REVOKE"),
        txt("Quatre familles à connaître : DDL (structure), DML (données), DCL (droits), TCL (transactions : COMMIT, ROLLBACK)."),
        tip("Avant une modification risquée en production : 1) sauvegarde, 2) transaction, 3) SELECT de vérification, 4) COMMIT seulement si tout est correct.")
      ]
    }
  ]
};

/* ============================================================
   THÈME 3 — JOINTURES
============================================================ */

courses.jointures.debutant = {
  summary: "Comprendre pourquoi et comment relier deux tables avec INNER JOIN et LEFT JOIN.",
  duration: "14 min",
  sections: [
    {
      title: "1. Pourquoi plusieurs tables ?",
      blocks: [
        txt("Dans une vraie base, on ne mélange pas tout dans une seule table. On sépare les informations : les clients d'un côté, leurs commandes de l'autre. Ainsi, le nom d'un client n'est écrit qu'une seule fois, même s'il passe cent commandes."),
        code(CLIENTS, "Table clients"),
        code(COMMANDES, "Table commandes"),
        txt("Les deux tables sont reliées : commandes.client_id contient l'id du client qui a passé la commande. C'est une clé étrangère. Une jointure permet de retrouver, dans un seul résultat, le nom du client et le montant de sa commande."),
        list(
          "Clé primaire : identifie chaque ligne (clients.id).",
          "Clé étrangère : pointe vers la clé primaire d'une autre table (commandes.client_id)."
        )
      ]
    },
    {
      title: "2. INNER JOIN : ne garder que les correspondances",
      blocks: [
        code(`SELECT clients.nom, commandes.montant
FROM clients
INNER JOIN commandes
  ON clients.id = commandes.client_id;`, "Syntaxe d'une jointure"),
        list(
          "FROM : la première table (celle de gauche).",
          "INNER JOIN : la seconde table (celle de droite).",
          "ON : la condition qui relie les deux tables."
        ),
        code(`nom      | montant
---------+--------
Awa      | 15000
Awa      | 8000
Moussa   | 25000
Ibrahima | 12000`, "Résultat"),
        tip("Fatou n'apparaît pas : elle n'a passé aucune commande, donc aucune ligne de commandes ne correspond. INNER JOIN élimine les lignes sans correspondance.")
      ]
    },
    {
      title: "3. Les alias de tables",
      blocks: [
        txt("Écrire clients.id et commandes.client_id partout devient vite pénible. On donne alors un alias court à chaque table avec AS."),
        code(`SELECT c.nom, o.montant
FROM clients AS c
INNER JOIN commandes AS o
  ON c.id = o.client_id;`, "Même requête, avec alias"),
        tip("c.nom signifie « la colonne nom de la table dont l'alias est c ». Choisis des alias courts mais lisibles (c pour clients, o pour commandes).")
      ]
    },
    {
      title: "4. LEFT JOIN : garder tous les clients",
      blocks: [
        txt("LEFT JOIN conserve toutes les lignes de la table de gauche, même celles qui n'ont aucune correspondance. Les colonnes de droite sont alors remplies avec NULL."),
        code(`SELECT c.nom, o.montant
FROM clients AS c
LEFT JOIN commandes AS o
  ON c.id = o.client_id;`, "LEFT JOIN"),
        code(`nom      | montant
---------+--------
Awa      | 15000
Awa      | 8000
Moussa   | 25000
Fatou    | NULL
Ibrahima | 12000`, "Résultat : Fatou est maintenant présente"),
        tip("Choisis LEFT JOIN quand tu veux « tous les clients, avec ou sans commande ».")
      ]
    },
    {
      title: "5. Relation un-à-plusieurs : les lignes se répètent",
      blocks: [
        txt("Un client peut avoir plusieurs commandes, mais une commande n'appartient qu'à un seul client : c'est une relation un-à-plusieurs."),
        txt("Dans le résultat d'une jointure, la ligne du côté « un » est répétée pour chaque ligne du côté « plusieurs ». C'est pourquoi Awa apparaît deux fois : elle a deux commandes."),
        warn("Cette répétition est normale, mais elle explique des erreurs de calcul fréquentes (on les verra au niveau avancé).")
      ]
    },
    {
      title: "6. Erreurs fréquentes",
      blocks: [
        list(
          "Colonne ambiguë : si id existe dans les deux tables, SELECT id provoque une erreur. Écris c.id ou o.id.",
          "Oublier la condition ON : on obtient toutes les combinaisons possibles (produit cartésien), donc des résultats absurdes.",
          "Joindre des colonnes sans rapport (clients.ville = commandes.montant) : une jointure se fait presque toujours entre une clé primaire et la clé étrangère correspondante."
        ),
        tip("Réflexe : avant d'écrire une jointure, identifie les deux tables, puis la colonne qui les relie.")
      ]
    }
  ]
};

courses.jointures.intermediaire = {
  summary: "Maîtriser LEFT, RIGHT, FULL et CROSS JOIN, trouver les lignes sans correspondance et éviter le piège du WHERE.",
  duration: "17 min",
  sections: [
    {
      title: "1. Vue d'ensemble des types de jointures",
      blocks: [
        code(`INNER JOIN : uniquement les correspondances
LEFT JOIN  : tout A + les correspondances de B (NULL sinon)
RIGHT JOIN : tout B + les correspondances de A (NULL sinon)
FULL JOIN  : tout A + tout B
CROSS JOIN : toutes les combinaisons A × B`, "A = table de gauche, B = table de droite"),
        tip("RIGHT JOIN est le miroir de LEFT JOIN : on peut presque toujours le remplacer en inversant l'ordre des tables. Beaucoup de développeurs n'utilisent que LEFT JOIN.")
      ]
    },
    {
      title: "2. RIGHT JOIN et FULL OUTER JOIN",
      blocks: [
        code(`SELECT c.nom, o.montant
FROM clients c
RIGHT JOIN commandes o ON c.id = o.client_id;`, "RIGHT JOIN : toutes les commandes, même sans client correspondant"),
        code(`SELECT c.nom, o.montant
FROM clients c
FULL OUTER JOIN commandes o ON c.id = o.client_id;`, "FULL OUTER JOIN : tout des deux côtés"),
        txt("FULL OUTER JOIN conserve toutes les lignes des deux tables : celles qui correspondent, celles de gauche sans correspondance et celles de droite sans correspondance."),
        warn("MySQL ne propose pas FULL OUTER JOIN. On le reproduit en réunissant un LEFT JOIN et un RIGHT JOIN avec UNION.")
      ]
    },
    {
      title: "3. Trouver les lignes sans correspondance",
      blocks: [
        txt("Un grand classique : « Quels clients n'ont jamais commandé ? ». On fait un LEFT JOIN, puis on garde les lignes où la partie droite vaut NULL."),
        code(`SELECT c.nom
FROM clients c
LEFT JOIN commandes o ON o.client_id = c.id
WHERE o.id IS NULL;`, "Clients sans commande"),
        ex(
          "Résultat",
          "-- Fatou",
          "Fatou est la seule à n'avoir aucune ligne dans commandes, donc o.id vaut NULL pour elle."
        ),
        tip("On teste une colonne qui ne peut jamais être NULL quand la correspondance existe, en général la clé primaire de la table de droite (o.id).")
      ]
    },
    {
      title: "4. ON ou WHERE ? Le piège du LEFT JOIN",
      blocks: [
        txt("Quand on filtre la table de droite d'un LEFT JOIN, l'endroit où l'on place la condition change le résultat."),
        code(`-- ❌ Condition dans WHERE : le LEFT JOIN devient un INNER JOIN
SELECT c.nom, o.montant
FROM clients c
LEFT JOIN commandes o ON o.client_id = c.id
WHERE o.statut = 'payee';`, "Fatou et Moussa disparaissent"),
        txt("Pourquoi ? Pour Fatou, o.statut vaut NULL, et NULL = 'payee' est inconnu : la ligne est rejetée. Même chose pour Moussa dont la seule commande est annulée."),
        code(`-- ✅ Condition dans ON : on garde tous les clients
SELECT c.nom, o.montant
FROM clients c
LEFT JOIN commandes o
  ON o.client_id = c.id AND o.statut = 'payee';`, "Tous les clients sont conservés"),
        code(`nom      | montant
---------+--------
Awa      | 15000
Awa      | 8000
Moussa   | NULL
Fatou    | NULL
Ibrahima | 12000`, "Résultat"),
        tip("ON filtre avant la jointure, WHERE filtre après. Pour conserver les lignes de gauche, mets la condition sur la table de droite dans le ON.")
      ]
    },
    {
      title: "5. Jointure + GROUP BY : des totaux par client",
      blocks: [
        code(`SELECT c.nom,
       COUNT(o.id)                AS nb_commandes,
       COALESCE(SUM(o.montant), 0) AS total
FROM clients c
LEFT JOIN commandes o ON o.client_id = c.id
GROUP BY c.id, c.nom;`, "Nombre et total des commandes par client"),
        code(`nom      | nb_commandes | total
---------+--------------+-------
Awa      | 2            | 23000
Moussa   | 1            | 25000
Fatou    | 0            | 0
Ibrahima | 1            | 12000`, "Résultat"),
        warn("Utilise COUNT(o.id) et non COUNT(*) : COUNT(*) compterait aussi la ligne de Fatou (donnant 1 au lieu de 0), alors que COUNT(o.id) ignore les NULL.")
      ]
    },
    {
      title: "6. CROSS JOIN, USING, NATURAL JOIN et trois tables",
      blocks: [
        txt("CROSS JOIN associe chaque ligne de la première table à chaque ligne de la seconde. Utile pour générer des combinaisons, par exemple toutes les tailles avec toutes les couleurs d'un produit."),
        code("SELECT t.taille, c.couleur\nFROM tailles t\nCROSS JOIN couleurs c;", "2 tailles × 2 couleurs = 4 lignes"),
        txt("Si les deux colonnes de jointure portent le même nom, USING raccourcit l'écriture :"),
        code("SELECT c.nom, o.montant\nFROM clients c\nJOIN commandes o USING (id_client);", "USING (quand la colonne s'appelle pareil des deux côtés)"),
        warn("NATURAL JOIN joint automatiquement sur toutes les colonnes de même nom, même par hasard. Un changement de schéma peut alors modifier silencieusement tes résultats : évite-le."),
        txt("Pour relier trois tables, on enchaîne simplement les JOIN :"),
        code(`SELECT c.nom, p.nom AS produit, l.quantite
FROM clients c
JOIN commandes o        ON o.client_id   = c.id
JOIN lignes_commande l  ON l.commande_id = o.id
JOIN produits p         ON p.id          = l.produit_id;`, "Client → commande → ligne → produit")
      ]
    }
  ]
};

courses.jointures.avance = {
  summary: "Cardinalité, totaux faussés, auto-jointures, EXISTS, relations plusieurs-à-plusieurs et jointures non-équi.",
  duration: "20 min",
  sections: [
    {
      title: "1. La cardinalité : prévoir le nombre de lignes",
      blocks: [
        txt("La cardinalité décrit combien de lignes d'une table correspondent à une ligne de l'autre : un-à-un, un-à-plusieurs ou plusieurs-à-plusieurs. Avant d'écrire une jointure, demande-toi toujours : combien de lignes vais-je obtenir ?"),
        list(
          "Un-à-un : une ligne correspond à une seule ligne (un pays et sa capitale).",
          "Un-à-plusieurs : une ligne correspond à plusieurs lignes (un client et ses commandes).",
          "Plusieurs-à-plusieurs : nécessite une table de liaison (voir plus bas)."
        ),
        tip("Contrôle rapide : compare COUNT(*) avant et après la jointure. Si le nombre de lignes a augmenté, la jointure multiplie les lignes.")
      ]
    },
    {
      title: "2. Les totaux faussés par une jointure",
      blocks: [
        txt("C'est l'erreur la plus fréquente, et la plus dangereuse car elle ne provoque aucun message d'erreur. Supposons que la commande 101 (montant 15000) contienne 3 lignes de produits dans lignes_commande."),
        code(`SELECT SUM(o.montant)
FROM commandes o
JOIN lignes_commande l ON l.commande_id = o.id;`, "❌ Le montant 15000 est compté 3 fois : 45000"),
        txt("La jointure répète la commande une fois par ligne de produit, donc son montant aussi."),
        code(`WITH nb_lignes AS (
  SELECT commande_id, COUNT(*) AS nb
  FROM lignes_commande
  GROUP BY commande_id
)
SELECT SUM(o.montant)
FROM commandes o
JOIN nb_lignes n ON n.commande_id = o.id;`, "✅ On agrège d'abord le détail : une seule ligne par commande"),
        tip("Règle d'or : agrège au bon niveau avant de joindre (CTE ou sous-requête), ou calcule tes totaux sur la table qui ne répète pas ses lignes. Pour compter des clients, utilise COUNT(DISTINCT c.id).")
      ]
    },
    {
      title: "3. L'auto-jointure",
      blocks: [
        txt("Une table peut être jointe à elle-même, avec deux alias différents. C'est typique pour une hiérarchie : chaque employé a un manager, qui est lui aussi un employé."),
        code(`id | nom     | manager_id
---+---------+-----------
1  | Mame    | NULL
2  | Cheikh  | 1
3  | Aminata | 1
4  | Omar    | 2`, "Table equipe"),
        code(`SELECT e.nom AS employe, m.nom AS manager
FROM equipe e
LEFT JOIN equipe m ON e.manager_id = m.id;`, "Chaque employé avec son manager"),
        code(`employe | manager
--------+--------
Mame    | NULL
Cheikh  | Mame
Aminata | Mame
Omar    | Cheikh`, "Résultat"),
        tip("LEFT JOIN garde Mame, la directrice, qui n'a pas de manager (NULL).")
      ]
    },
    {
      title: "4. EXISTS et NOT EXISTS : tester l'existence",
      blocks: [
        txt("EXISTS vérifie si une sous-requête renvoie au moins une ligne. Contrairement à une jointure, il ne multiplie jamais les lignes."),
        code(`SELECT c.nom
FROM clients c
WHERE EXISTS (
  SELECT 1 FROM commandes o WHERE o.client_id = c.id
);`, "Clients ayant au moins une commande, sans doublon : Awa, Moussa, Ibrahima"),
        code(`SELECT c.nom
FROM clients c
WHERE NOT EXISTS (
  SELECT 1 FROM commandes o WHERE o.client_id = c.id
);`, "Clients sans commande : Fatou"),
        tip("NOT EXISTS est une alternative lisible à LEFT JOIN … IS NULL pour trouver les lignes sans correspondance.")
      ]
    },
    {
      title: "5. Relations plusieurs-à-plusieurs",
      blocks: [
        txt("Un étudiant suit plusieurs cours, et un cours accueille plusieurs étudiants. On ne peut pas relier directement ces deux tables : on crée une table de liaison qui contient les clés des deux."),
        code(`etudiants(id, nom)        cours(id, titre)
          \\                   /
        inscriptions(etudiant_id, cours_id)`, "Schéma"),
        code(`SELECT e.nom, c.titre
FROM etudiants e
JOIN inscriptions i ON i.etudiant_id = e.id
JOIN cours c        ON c.id = i.cours_id;`, "Qui suit quel cours ?")
      ]
    },
    {
      title: "6. Jointures non-équi, NULL, performance et checklist",
      blocks: [
        txt("Une jointure n'est pas obligée d'utiliser =. On peut relier des lignes selon un intervalle :"),
        code(`SELECT c.nom, t.libelle
FROM clients c
JOIN tranches_age t
  ON c.age BETWEEN t.age_min AND t.age_max;`, "Jointure non-équi : associer chaque client à sa tranche d'âge"),
        warn("Deux valeurs NULL ne se correspondent jamais dans un ON : NULL = NULL est inconnu. Les lignes dont la clé est NULL ne se joignent pas."),
        tip("Crée un index sur les colonnes de jointure (clés étrangères). Sans index, le système peut parcourir toute la table."),
        txt("Checklist avant une jointure complexe :"),
        list(
          "Ai-je identifié les clés primaires et étrangères ?",
          "Quelle est la cardinalité ? Les lignes vont-elles se multiplier ?",
          "Ai-je besoin de toutes les lignes de gauche (LEFT JOIN) ou seulement des correspondances (INNER JOIN) ?",
          "Mes filtres sur la table de droite sont-ils dans le ON ou le WHERE ?",
          "Mes totaux sont-ils calculés au bon niveau ?"
        )
      ]
    }
  ]
};

/* ============================================================
   THÈME 4 — SQL AVANCÉ
============================================================ */

courses.avance.debutant = {
  summary: "Calculer avec COUNT, SUM, AVG, MIN, MAX, regrouper avec GROUP BY et filtrer les groupes avec HAVING.",
  duration: "15 min",
  sections: [
    {
      title: "1. Les fonctions d'agrégation",
      blocks: [
        txt("Une fonction d'agrégation résume plusieurs lignes en une seule valeur. Voici notre table commandes :"),
        code(COMMANDES, "Table commandes"),
        list(
          "COUNT(*) : nombre de lignes.",
          "SUM(colonne) : somme des valeurs.",
          "AVG(colonne) : moyenne.",
          "MAX(colonne) : plus grande valeur.",
          "MIN(colonne) : plus petite valeur."
        ),
        ex(
          "Résumer toutes les commandes",
          "SELECT COUNT(*) AS nb, SUM(montant) AS total, AVG(montant) AS moyenne,\n       MAX(montant) AS maximum, MIN(montant) AS minimum\nFROM commandes;",
          "4 commandes, 60000 au total, 15000 en moyenne, de 8000 à 25000."
        ),
        ex(
          "Le chiffre d'affaires des commandes payées",
          "SELECT SUM(montant) AS ca_paye\nFROM commandes\nWHERE statut = 'payee';",
          "15000 + 8000 + 12000 = 35000. WHERE filtre d'abord, puis SUM additionne."
        )
      ]
    },
    {
      title: "2. Agrégations et valeurs NULL",
      blocks: [
        list(
          "COUNT(*) compte toutes les lignes, NULL compris.",
          "COUNT(colonne) compte seulement les valeurs non NULL : COUNT(email) vaut 3 dans notre table clients.",
          "AVG, SUM, MIN et MAX ignorent les NULL : AVG de 10, 20 et NULL vaut 15 (et non 10).",
          "SUM d'une colonne entièrement NULL vaut NULL, pas 0 : utilise COALESCE(SUM(colonne), 0).",
          "COUNT(*) sur une table vide vaut 0."
        ),
        ex(
          "Compter les villes différentes",
          "SELECT COUNT(DISTINCT ville) AS nb_villes\nFROM clients;",
          "3 villes différentes : Dakar, Thiès et Saint-Louis. DISTINCT dans COUNT ne compte chaque valeur qu'une fois."
        )
      ]
    },
    {
      title: "3. GROUP BY : calculer par groupe",
      blocks: [
        txt("Sans GROUP BY, une agrégation donne un seul résultat pour toute la table. Avec GROUP BY, on obtient un résultat par groupe."),
        code(`SELECT ville, COUNT(*) AS nb_clients
FROM clients
GROUP BY ville;`, "Nombre de clients par ville"),
        code(`ville       | nb_clients
------------+-----------
Dakar       | 2
Thiès       | 1
Saint-Louis | 1`, "Résultat"),
        code(`SELECT client_id, SUM(montant) AS total
FROM commandes
GROUP BY client_id;`, "Total des commandes par client : 23000, 25000 et 12000"),
        warn("Toute colonne du SELECT qui n'est pas dans une fonction d'agrégation doit figurer dans le GROUP BY. SELECT ville, COUNT(*) FROM clients; sans GROUP BY provoque une erreur.")
      ]
    },
    {
      title: "4. HAVING : filtrer les groupes",
      blocks: [
        txt("WHERE filtre les lignes avant le regroupement. Pour filtrer sur le résultat d'une agrégation, on utilise HAVING, qui s'applique après GROUP BY."),
        code(`SELECT client_id, SUM(montant) AS total
FROM commandes
GROUP BY client_id
HAVING SUM(montant) > 20000;`, "Les clients dont le total dépasse 20000"),
        txt("On obtient le client 1 (23000) et le client 2 (25000). Le client 4 (12000) est écarté."),
        tip("WHERE = filtre les lignes. HAVING = filtre les groupes. On ne peut pas écrire WHERE SUM(montant) > 20000.")
      ]
    },
    {
      title: "5. Arrondir, renommer et trier un résultat agrégé",
      blocks: [
        ex(
          "Arrondir une moyenne",
          "SELECT ROUND(AVG(age), 2) AS age_moyen\nFROM clients;",
          "(28 + 35 + 22 + 41) / 4 = 31,5 : on obtient 31.50. ROUND(valeur, nombre_de_décimales)."
        ),
        code(`SELECT ville, COUNT(*) AS nb_clients
FROM clients
GROUP BY ville
ORDER BY COUNT(*) DESC;`, "Les villes classées par nombre de clients décroissant"),
        tip("AS donne un nom lisible à une colonne calculée. ORDER BY peut trier sur une agrégation ou sur son alias.")
      ]
    },
    {
      title: "6. À retenir",
      blocks: [
        list(
          "COUNT, SUM, AVG, MIN, MAX résument des lignes en une valeur.",
          "GROUP BY crée un groupe pour chaque valeur distincte.",
          "HAVING filtre les groupes, WHERE filtre les lignes.",
          "Les NULL sont ignorés par COUNT(colonne), SUM, AVG, MIN et MAX.",
          "Chaque colonne non agrégée du SELECT doit apparaître dans GROUP BY."
        )
      ]
    }
  ]
};

courses.avance.intermediaire = {
  summary: "Maîtriser WHERE contre HAVING, les sous-requêtes, EXISTS, les CTE, UNION et les agrégats conditionnels.",
  duration: "18 min",
  sections: [
    {
      title: "1. WHERE contre HAVING, ordre des opérations",
      blocks: [
        txt("Voici l'ordre dans lequel SQL traite une requête avec regroupement :"),
        code("FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY", "Ordre d'exécution"),
        code(`SELECT client_id, SUM(montant) AS total
FROM commandes
WHERE statut = 'payee'          -- 1) filtre les lignes
GROUP BY client_id              -- 2) regroupe
HAVING SUM(montant) > 10000;    -- 3) filtre les groupes`, "Les deux filtres dans la même requête"),
        txt("Ici, seules les commandes payées sont additionnées, puis on ne garde que les clients dont le total dépasse 10000 : le client 1 (23000) et le client 4 (12000)."),
        tip("Si une condition porte sur une colonne simple, mets-la dans WHERE (plus efficace). Si elle porte sur un calcul d'agrégation, mets-la dans HAVING.")
      ]
    },
    {
      title: "2. Les sous-requêtes",
      blocks: [
        txt("Une sous-requête est une requête placée à l'intérieur d'une autre, entre parenthèses. Elle fournit une valeur ou une liste à la requête principale."),
        ex(
          "Les commandes supérieures à la moyenne",
          "SELECT id, montant\nFROM commandes\nWHERE montant > (SELECT AVG(montant) FROM commandes);",
          "La moyenne vaut 15000 : seule la commande 103 (25000) la dépasse. On ne peut pas écrire directement WHERE montant > AVG(montant)."
        ),
        ex(
          "Les clients qui ont commandé",
          "SELECT nom\nFROM clients\nWHERE id IN (SELECT client_id FROM commandes);",
          "Awa, Moussa et Ibrahima. IN compare à la liste produite par la sous-requête."
        ),
        code(`SELECT AVG(total) AS moyenne_par_client
FROM (
  SELECT client_id, SUM(montant) AS total
  FROM commandes
  GROUP BY client_id
) AS t;`, "Table dérivée : une sous-requête dans le FROM. Résultat : (23000 + 25000 + 12000) / 3 = 20000"),
        warn("Une sous-requête utilisée comme valeur unique (scalaire) doit retourner une seule ligne et une seule colonne, sinon la requête échoue.")
      ]
    },
    {
      title: "3. Sous-requête corrélée avec EXISTS",
      blocks: [
        txt("Une sous-requête corrélée dépend de la ligne de la requête externe : elle est réévaluée pour chaque ligne."),
        code(`SELECT c.nom
FROM clients c
WHERE EXISTS (
  SELECT 1
  FROM commandes o
  WHERE o.client_id = c.id AND o.montant > 20000
);`, "Les clients ayant au moins une commande de plus de 20000 : Moussa"),
        tip("EXISTS s'arrête dès qu'il trouve une ligne : c'est souvent plus efficace que IN sur de gros volumes.")
      ]
    },
    {
      title: "4. Les CTE : WITH pour structurer",
      blocks: [
        txt("Une CTE (Common Table Expression) est une requête nommée, définie avec WITH, qu'on réutilise ensuite comme une table. Elle rend les requêtes complexes lisibles, étape par étape."),
        code(`WITH totaux AS (
  SELECT client_id, SUM(montant) AS total
  FROM commandes
  GROUP BY client_id
)
SELECT c.nom, t.total
FROM clients c
JOIN totaux t ON t.client_id = c.id
WHERE t.total > 20000;`, "Awa (23000) et Moussa (25000)"),
        txt("On peut définir plusieurs CTE en les séparant par une virgule :"),
        code(`WITH payees AS (
  SELECT * FROM commandes WHERE statut = 'payee'
),
totaux AS (
  SELECT client_id, SUM(montant) AS total
  FROM payees
  GROUP BY client_id
)
SELECT * FROM totaux;`, "Deux CTE enchaînées"),
        tip("Lis une CTE comme une recette : étape 1, étape 2, puis le résultat final.")
      ]
    },
    {
      title: "5. UNION, UNION ALL et agrégats conditionnels",
      blocks: [
        txt("UNION empile les résultats de deux requêtes qui ont le même nombre de colonnes."),
        list(
          "UNION supprime les doublons.",
          "UNION ALL conserve tout, y compris les doublons (et il est plus rapide)."
        ),
        code("SELECT ville FROM clients\nUNION\nSELECT ville FROM fournisseurs;", "Toutes les villes, sans doublon"),
        txt("CASE WHEN dans un agrégat permet de calculer plusieurs totaux conditionnels en une seule requête :"),
        code(`SELECT
  SUM(CASE WHEN statut = 'payee'   THEN montant ELSE 0 END) AS total_paye,
  SUM(CASE WHEN statut = 'annulee' THEN montant ELSE 0 END) AS total_annule
FROM commandes;`, "35000 payés et 25000 annulés"),
        tip("Chaque ligne passe dans le CASE : on additionne le montant uniquement si la condition est vraie, sinon 0.")
      ]
    },
    {
      title: "6. À retenir",
      blocks: [
        list(
          "WHERE filtre les lignes avant le regroupement, HAVING filtre les groupes après.",
          "Une sous-requête fournit une valeur, une liste ou une table à la requête principale.",
          "EXISTS teste l'existence d'une ligne, sans doublons.",
          "WITH nom AS (...) définit une CTE : un résultat nommé et réutilisable.",
          "UNION supprime les doublons, UNION ALL les garde."
        )
      ]
    }
  ]
};

courses.avance.avance = {
  summary: "Fonctions de fenêtre : ROW_NUMBER, RANK, PARTITION BY, LAG, LEAD, cumuls, moyennes mobiles et CTE récursives.",
  duration: "22 min",
  sections: [
    {
      title: "1. L'idée des fonctions de fenêtre",
      blocks: [
        txt("GROUP BY regroupe les lignes : on perd le détail. Une fonction de fenêtre calcule une valeur sur un ensemble de lignes tout en conservant chaque ligne. Elle se reconnaît au mot-clé OVER."),
        code(`id | nom     | departement  | salaire
---+---------+--------------+--------
1  | Awa     | Informatique | 800000
2  | Moussa  | Informatique | 800000
3  | Fatou   | Informatique | 600000
4  | Ibra    | Marketing    | 700000
5  | Aminata | Marketing    | 650000`, "Table employes"),
        code(`SELECT nom, departement, salaire,
       SUM(salaire) OVER (PARTITION BY departement) AS total_dept
FROM employes;`, "Le total du département, affiché sur chaque ligne"),
        code(`nom     | departement  | salaire | total_dept
--------+--------------+---------+-----------
Awa     | Informatique | 800000  | 2200000
Moussa  | Informatique | 800000  | 2200000
Fatou   | Informatique | 600000  | 2200000
Ibra    | Marketing    | 700000  | 1350000
Aminata | Marketing    | 650000  | 1350000`, "Aucune ligne n'a disparu"),
        tip("OVER (PARTITION BY …) joue le rôle d'un GROUP BY, mais sans réduire le nombre de lignes.")
      ]
    },
    {
      title: "2. Classer : ROW_NUMBER, RANK et DENSE_RANK",
      blocks: [
        code(`SELECT nom, salaire,
       ROW_NUMBER() OVER (ORDER BY salaire DESC) AS numero,
       RANK()       OVER (ORDER BY salaire DESC) AS rang,
       DENSE_RANK() OVER (ORDER BY salaire DESC) AS rang_dense
FROM employes;`, "Trois façons de classer"),
        code(`nom     | salaire | numero | rang | rang_dense
--------+---------+--------+------+-----------
Awa     | 800000  | 1      | 1    | 1
Moussa  | 800000  | 2      | 1    | 1
Ibra    | 700000  | 3      | 3    | 2
Aminata | 650000  | 4      | 4    | 3
Fatou   | 600000  | 5      | 5    | 4`, "Résultat (Awa et Moussa sont ex æquo)"),
        list(
          "ROW_NUMBER : numérote chaque ligne différemment (1, 2, 3, 4, 5), même en cas d'égalité.",
          "RANK : les ex æquo ont le même rang, puis il y a un « trou » (1, 1, 3).",
          "DENSE_RANK : les ex æquo ont le même rang, sans trou (1, 1, 2)."
        )
      ]
    },
    {
      title: "3. PARTITION BY : un classement par groupe",
      blocks: [
        txt("Avec PARTITION BY, le classement recommence à 1 dans chaque groupe. C'est la technique pour trouver, par exemple, le mieux payé de chaque département."),
        code(`WITH classement AS (
  SELECT nom, departement, salaire,
         ROW_NUMBER() OVER (
           PARTITION BY departement
           ORDER BY salaire DESC, id
         ) AS rang
  FROM employes
)
SELECT nom, departement, salaire
FROM classement
WHERE rang = 1;`, "Le mieux payé par département : Awa (Informatique) et Ibra (Marketing)"),
        txt("En changeant la condition en WHERE rang <= 3, on obtient le top 3 de chaque département."),
        warn("On ne peut pas écrire WHERE ROW_NUMBER() OVER (...) = 1 directement : WHERE est évalué avant les fonctions de fenêtre. Il faut calculer le rang dans une CTE ou une sous-requête, puis filtrer dessus.")
      ]
    },
    {
      title: "4. LAG, LEAD, cumuls et moyennes mobiles",
      blocks: [
        code(`mois | montant
-----+--------
Jan  | 100
Fév  | 120
Mar  | 90`, "Table ventes"),
        code(`SELECT mois, montant,
       LAG(montant)  OVER (ORDER BY id) AS mois_precedent,
       LEAD(montant) OVER (ORDER BY id) AS mois_suivant
FROM ventes;`, "LAG lit la ligne précédente, LEAD la ligne suivante"),
        code(`SELECT mois, montant,
       montant - LAG(montant) OVER (ORDER BY id) AS evolution
FROM ventes;`, "Évolution d'un mois à l'autre : NULL, +20, -30"),
        code(`SELECT mois, montant,
       SUM(montant) OVER (ORDER BY id) AS cumul
FROM ventes;`, "Total cumulé : 100, 220, 310"),
        code(`SELECT mois, montant,
       AVG(montant) OVER (
         ORDER BY id
         ROWS BETWEEN 1 PRECEDING AND CURRENT ROW
       ) AS moyenne_mobile
FROM ventes;`, "Moyenne mobile sur 2 mois : 100, 110, 105"),
        tip("ROWS BETWEEN 1 PRECEDING AND CURRENT ROW définit la fenêtre : la ligne courante et celle d'avant.")
      ]
    },
    {
      title: "5. NTILE et COUNT(*) OVER ()",
      blocks: [
        txt("NTILE(n) répartit les lignes en n groupes de taille à peu près égale : pratique pour créer des quartiles (NTILE(4)) ou des tranches."),
        code(`SELECT nom, salaire,
       NTILE(2) OVER (ORDER BY salaire DESC) AS moitie
FROM employes;`, "La moitié la mieux payée (1) et l'autre moitié (2)"),
        code(`SELECT nom,
       COUNT(*) OVER () AS nb_total_employes
FROM employes;`, "OVER () vide : toute la table forme la fenêtre. Le total (5) est répété sur chaque ligne")
      ]
    },
    {
      title: "6. CTE récursives : parcourir une hiérarchie",
      blocks: [
        txt("Une CTE récursive s'appelle elle-même jusqu'à épuisement des niveaux. Elle sert à parcourir des hiérarchies : organigramme, catégories imbriquées. On reprend la table equipe du cours sur les jointures."),
        code(`WITH RECURSIVE hierarchie AS (
  -- point de départ : le directeur (sans manager)
  SELECT id, nom, manager_id, 1 AS niveau
  FROM equipe
  WHERE manager_id IS NULL

  UNION ALL

  -- étape récursive : les subordonnés du niveau précédent
  SELECT e.id, e.nom, e.manager_id, h.niveau + 1
  FROM equipe e
  JOIN hierarchie h ON e.manager_id = h.id
)
SELECT nom, niveau FROM hierarchie;`, "Résultat : Mame (1), Cheikh (2), Aminata (2), Omar (3)"),
        tip("Sous SQL Server, on écrit simplement WITH (sans le mot RECURSIVE).")
      ]
    },
    {
      title: "7. Bonnes pratiques",
      blocks: [
        list(
          "Choisis la bonne fonction : ROW_NUMBER pour un identifiant unique, RANK ou DENSE_RANK quand les égalités comptent.",
          "Ajoute toujours un critère de départage dans ORDER BY (par exemple l'id) pour des résultats stables.",
          "Pour filtrer sur le résultat d'une fonction de fenêtre, passe par une CTE.",
          "Utilise PARTITION BY pour recommencer le calcul dans chaque groupe.",
          "Les fonctions de fenêtre conservent toutes les lignes : c'est leur différence majeure avec GROUP BY."
        )
      ]
    }
  ]
};

/* ------------------------------------------------------------
   Fonctions utilisées par l'application
------------------------------------------------------------ */

export function getCourse(theme, level) {
  return courses[theme]?.[level] || emptyCourse();
}

export function hasContent(course) {
  return Boolean(course) && Array.isArray(course.sections) && course.sections.length > 0;
}
