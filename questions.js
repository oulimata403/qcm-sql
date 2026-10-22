export const quizData = {
  fondamentaux: {
    title: "Fondamentaux SQL",
    description: "SELECT, WHERE, ORDER BY, DISTINCT, NULL, LIKE et filtres.",
    levels: {
      debutant: [
        {
          text: "Quelle commande SQL permet de lire les données d'une table ?",
          options: ["UPDATE", "DELETE", "SELECT", "INSERT"],
          correct: "SELECT",
          explanation: "SELECT récupère et affiche des données."
        },
        {
          text: "Quelle clause indique la table interrogée ?",
          options: ["WHERE", "FROM", "HAVING", "ORDER BY"],
          correct: "FROM",
          explanation: "FROM indique la table source de la requête."
        },
        {
          text: "Quelle clause filtre les lignes selon une condition ?",
          options: ["ORDER BY", "DISTINCT", "WHERE", "GROUP BY"],
          correct: "WHERE",
          explanation: "WHERE conserve uniquement les lignes respectant une condition."
        },
        {
          text: "Quelle requête affiche toutes les colonnes de clients ?",
          options: [
            "GET * clients;",
            "SELECT * FROM clients;",
            "SHOW clients;",
            "SELECT clients;"
          ],
          correct: "SELECT * FROM clients;",
          explanation: "L'astérisque représente toutes les colonnes."
        },
        {
          text: "Quel mot-clé retire les doublons dans un résultat ?",
          options: ["REMOVE", "UNIQUE", "DISTINCT", "FILTER"],
          correct: "DISTINCT",
          explanation: "DISTINCT affiche une seule fois chaque valeur identique."
        },
        {
          text: "Quelle condition sélectionne les prix supérieurs à 1000 ?",
          options: [
            "WHERE prix = 1000",
            "WHERE prix < 1000",
            "WHERE prix > 1000",
            "ORDER BY prix > 1000"
          ],
          correct: "WHERE prix > 1000",
          explanation: "Le signe > signifie strictement supérieur à."
        },
        {
          text: "Quel symbole signifie égal à en SQL ?",
          options: ["=>", "=", "==", ":="],
          correct: "=",
          explanation: "SQL utilise le signe = pour comparer deux valeurs."
        },
        {
          text: "Quelle requête affiche nom et email des clients ?",
          options: [
            "FROM clients SELECT nom, email;",
            "SELECT nom, email FROM clients;",
            "GET nom, email FROM clients;",
            "SELECT clients FROM nom, email;"
          ],
          correct: "SELECT nom, email FROM clients;",
          explanation: "SELECT choisit les colonnes et FROM indique la table."
        },
        {
          text: "Quelle clause permet de trier les résultats ?",
          options: ["DISTINCT", "GROUP BY", "ORDER BY", "WHERE"],
          correct: "ORDER BY",
          explanation: "ORDER BY classe les résultats selon une colonne."
        },
        {
          text: "Que signifie ORDER BY prix DESC ?",
          options: [
            "Trier les prix du plus grand au plus petit",
            "Supprimer les prix",
            "Filtrer les prix élevés",
            "Trier les prix du plus petit au plus grand"
          ],
          correct: "Trier les prix du plus grand au plus petit",
          explanation: "DESC signifie ordre décroissant."
        }
      ],

      intermediaire: [
        {
          text: "Comment vérifier qu'une colonne ne contient aucune valeur ?",
          options: ["colonne EMPTY", "colonne IS NULL", "colonne = NULL", "colonne == NULL"],
          correct: "colonne IS NULL",
          explanation: "Une valeur absente est représentée par NULL et se teste avec IS NULL."
        },
        {
          text: "Quel opérateur vérifie qu'une valeur appartient à une liste ?",
          options: ["BETWEEN", "LIKE", "IN", "ORDER BY"],
          correct: "IN",
          explanation: "IN compare une valeur à plusieurs possibilités."
        },
        {
          text: "À quoi sert LIKE ?",
          options: [
            "Créer une table",
            "Chercher du texte selon un modèle",
            "Supprimer les doublons",
            "Additionner deux colonnes"
          ],
          correct: "Chercher du texte selon un modèle",
          explanation: "LIKE permet une recherche de texte utilisant des motifs."
        },
        {
          text: "Dans LIKE 'Da%', que représente % ?",
          options: [
            "Un seul caractère obligatoire",
            "Un chiffre",
            "Zéro, un ou plusieurs caractères",
            "Un espace obligatoire"
          ],
          correct: "Zéro, un ou plusieurs caractères",
          explanation: "% représente une suite de caractères, y compris vide."
        },
        {
          text: "Quelle condition sélectionne les âges de 18 à 30 inclus ?",
          options: [
            "WHERE age = 18 TO 30",
            "WHERE age BETWEEN 18 AND 30",
            "WHERE age > 18 OR age < 30",
            "WHERE age IN 18, 30"
          ],
          correct: "WHERE age BETWEEN 18 AND 30",
          explanation: "BETWEEN inclut les deux bornes."
        },
        {
          text: "Dans SQL Server, quelle requête retourne 5 lignes maximum ?",
          options: [
            "SELECT FIRST 5 * FROM clients;",
            "SELECT TOP 5 * FROM clients;",
            "SELECT LIMIT 5 FROM clients;",
            "SELECT * FIRST 5 clients;"
          ],
          correct: "SELECT TOP 5 * FROM clients;",
          explanation: "SQL Server utilise TOP pour limiter le nombre de lignes."
        },
        {
          text: "Comment trier les noms de A à Z ?",
          options: [
            "GROUP BY nom ASC",
            "WHERE nom ASC",
            "ORDER BY nom DESC",
            "ORDER BY nom ASC"
          ],
          correct: "ORDER BY nom ASC",
          explanation: "ASC signifie croissant."
        },
        {
          text: "Quelle condition sélectionne les clients hors de Dakar ?",
          options: [
            "WHERE ville NOT 'Dakar'",
            "WHERE ville <> 'Dakar'",
            "WHERE ville =! 'Dakar'",
            "WHERE ville DIFFERENT 'Dakar'"
          ],
          correct: "WHERE ville <> 'Dakar'",
          explanation: "<> signifie différent de."
        },
        {
          text: "Quel mot-clé sert à donner un alias à une colonne ?",
          options: ["RENAME", "AS", "TO", "NAME"],
          correct: "AS",
          explanation: "AS permet de donner un nom temporaire à une colonne ou table."
        },
        {
          text: "Quelle expression applique une réduction de 10 % ?",
          options: [
            "prix + 0.90",
            "prix / 10",
            "prix * 0.90",
            "prix - 10"
          ],
          correct: "prix * 0.90",
          explanation: "Conserver 90 % du prix revient à multiplier par 0.90."
        }
      ],

      avance: [
        {
          text: "Quelle condition sélectionne les lignes avec une valeur existante ?",
          options: [
            "WHERE colonne != NULL",
            "WHERE colonne IS NOT NULL",
            "WHERE colonne NOT EMPTY",
            "WHERE colonne <> NULL"
          ],
          correct: "WHERE colonne IS NOT NULL",
          explanation: "IS NOT NULL vérifie la présence d'une valeur."
        },
        {
          text: "Que fait COUNT(colonne) face à NULL ?",
          options: [
            "Il compte la ligne",
            "Il transforme NULL en 0",
            "Il ne compte pas cette valeur",
            "Il arrête la requête"
          ],
          correct: "Il ne compte pas cette valeur",
          explanation: "COUNT(colonne) ignore les valeurs NULL."
        },
        {
          text: "Quelle fonction SQL Server remplace NULL par 0 ?",
          options: [
            "REPLACE NULL WITH 0",
            "ISNULL(colonne, 0)",
            "NULLTOZERO(colonne)",
            "EMPTY(colonne, 0)"
          ],
          correct: "ISNULL(colonne, 0)",
          explanation: "ISNULL utilise une valeur de remplacement si la valeur initiale est NULL."
        },
        {
          text: "Quelle condition sélectionne les noms qui commencent par M ?",
          options: [
            "WHERE nom LIKE '%M'",
            "WHERE nom = 'M%'",
            "WHERE nom LIKE 'M%'",
            "WHERE nom LIKE '_M_'"
          ],
          correct: "WHERE nom LIKE 'M%'",
          explanation: "M% signifie commence par M puis contient zéro ou plusieurs caractères."
        },
        {
          text: "Que sélectionne NOT BETWEEN 100 AND 500 ?",
          options: [
            "Les valeurs sous 100 ou au-dessus de 500",
            "Les valeurs de 100 à 500",
            "Toutes les lignes",
            "Uniquement 100 et 500"
          ],
          correct: "Les valeurs sous 100 ou au-dessus de 500",
          explanation: "NOT BETWEEN exclut l'intervalle donné."
        },
        {
          text: "Pourquoi 'Dakar' est-il placé entre guillemets ?",
          options: [
            "C'est une valeur texte",
            "C'est une colonne",
            "C'est obligatoirement un nombre",
            "Cela supprime les espaces"
          ],
          correct: "C'est une valeur texte",
          explanation: "Les textes SQL doivent être écrits entre apostrophes."
        },
        {
          text: "Quelle condition sélectionne Dakar et Saint-Louis ?",
          options: [
            "WHERE ville = ('Dakar', 'Saint-Louis')",
            "WHERE ville IN ('Dakar', 'Saint-Louis')",
            "WHERE ville BETWEEN 'Dakar' AND 'Saint-Louis'",
            "WHERE ville LIKE ('Dakar', 'Saint-Louis')"
          ],
          correct: "WHERE ville IN ('Dakar', 'Saint-Louis')",
          explanation: "IN vérifie qu'une valeur appartient à une liste."
        },
        {
          text: "Pourquoi employer l'alias clients AS c ?",
          options: [
            "Pour supprimer clients",
            "Pour rendre la requête plus courte et claire",
            "Pour copier la table",
            "Pour modifier les données"
          ],
          correct: "Pour rendre la requête plus courte et claire",
          explanation: "Un alias est un nom temporaire qui simplifie les requêtes."
        },
        {
          text: "Quelle condition recherche un email terminé par @gmail.com ?",
          options: [
            "WHERE email LIKE '@gmail.com%'",
            "WHERE email = '%@gmail.com'",
            "WHERE email LIKE '%@gmail.com'",
            "WHERE email IN '@gmail.com'"
          ],
          correct: "WHERE email LIKE '%@gmail.com'",
          explanation: "% représente les caractères avant @gmail.com."
        },
        {
          text: "Pourquoi préférer les colonnes utiles à SELECT * ?",
          options: [
            "Pour éviter de récupérer des données inutiles",
            "Parce que SELECT * est interdit",
            "Pour supprimer NULL",
            "Pour créer automatiquement un index"
          ],
          correct: "Pour éviter de récupérer des données inutiles",
          explanation: "La requête devient plus claire et peut récupérer moins de données."
        }
      ]
    }
  },

  jointures: {
    title: "Jointures SQL",
    description: "INNER JOIN, LEFT JOIN, RIGHT JOIN et relations entre tables.",
    levels: {
      debutant: [
        {
          text: "Pourquoi utilise-t-on une jointure SQL ?",
          options: [
            "Pour modifier un mot de passe",
            "Pour relier les données de plusieurs tables",
            "Pour supprimer une table",
            "Pour créer une base"
          ],
          correct: "Pour relier les données de plusieurs tables",
          explanation: "Une jointure combine les données de tables ayant une relation."
        },
        {
          text: "Quelle jointure garde les lignes correspondantes dans les deux tables ?",
          options: ["LEFT JOIN", "CROSS JOIN", "INNER JOIN", "RIGHT JOIN"],
          correct: "INNER JOIN",
          explanation: "INNER JOIN conserve uniquement les correspondances."
        },
        {
          text: "Quelle jointure garde toutes les lignes de gauche ?",
          options: ["RIGHT JOIN", "LEFT JOIN", "INNER JOIN", "CROSS JOIN"],
          correct: "LEFT JOIN",
          explanation: "LEFT JOIN conserve toute la table écrite à gauche."
        },
        {
          text: "Quelle relation relie généralement Clients et Commandes ?",
          options: [
            "Clients.ville = Commandes.montant",
            "Clients.id_client = Commandes.id_client",
            "Clients.nom = Commandes.date_commande",
            "Clients.email = Commandes.prix"
          ],
          correct: "Clients.id_client = Commandes.id_client",
          explanation: "id_client relie une commande à son client."
        },
        {
          text: "Quel mot-clé précise la condition d'une jointure ?",
          options: ["ON", "WHERE", "AS", "FROM"],
          correct: "ON",
          explanation: "ON définit les colonnes qui doivent correspondre."
        },
        {
          text: "Dans LEFT JOIN sans correspondance à droite, que voit-on ?",
          options: [
            "La ligne de gauche est supprimée",
            "Les valeurs de droite sont NULL",
            "La requête échoue",
            "La ligne est déplacée"
          ],
          correct: "Les valeurs de droite sont NULL",
          explanation: "LEFT JOIN garde la ligne de gauche et met NULL à droite."
        },
        {
          text: "Quelle table est entièrement conservée avec LEFT JOIN ?",
          options: [
            "La table de droite",
            "La table située avant LEFT JOIN",
            "La plus petite table",
            "La table avec des NULL"
          ],
          correct: "La table située avant LEFT JOIN",
          explanation: "La table de gauche est écrite avant LEFT JOIN."
        },
        {
          text: "Un client possédant plusieurs commandes est une relation :",
          options: ["Aucune relation", "Un-à-plusieurs", "Un-à-zéro", "Plusieurs-à-zéro"],
          correct: "Un-à-plusieurs",
          explanation: "Un client peut correspondre à plusieurs commandes."
        },
        {
          text: "Qu'est-ce qu'une clé primaire ?",
          options: [
            "Une colonne de tri",
            "Une colonne qui identifie une ligne de façon unique",
            "Une colonne contenant toujours du texte",
            "Une colonne avec des doublons"
          ],
          correct: "Une colonne qui identifie une ligne de façon unique",
          explanation: "Une clé primaire permet d'identifier une ligne sans ambiguïté."
        },
        {
          text: "Quelle requête est une jointure correcte ?",
          options: [
            "SELECT clients + commandes;",
            "SELECT * FROM clients INNER JOIN commandes ON clients.id_client = commandes.id_client;",
            "MERGE clients WITH commandes;",
            "SELECT * FROM clients JOIN commandes;"
          ],
          correct: "SELECT * FROM clients INNER JOIN commandes ON clients.id_client = commandes.id_client;",
          explanation: "Il faut les tables et la condition ON."
        }
      ],

      intermediaire: [
        {
          text: "Quelle jointure conserve toutes les lignes de droite ?",
          options: ["INNER JOIN", "RIGHT JOIN", "LEFT JOIN", "CROSS JOIN"],
          correct: "RIGHT JOIN",
          explanation: "RIGHT JOIN conserve la table placée à droite."
        },
        {
          text: "Que fait FULL OUTER JOIN ?",
          options: [
            "Il conserve les lignes des deux tables, correspondantes ou non",
            "Il conserve seulement les lignes identiques",
            "Il supprime les lignes sans correspondance",
            "Il crée une nouvelle base"
          ],
          correct: "Il conserve les lignes des deux tables, correspondantes ou non",
          explanation: "FULL OUTER JOIN rassemble toutes les lignes des deux côtés."
        },
        {
          text: "Comment rechercher les clients sans commande ?",
          options: [
            "INNER JOIN puis WHERE id_commande IS NULL",
            "LEFT JOIN puis WHERE commandes.id_commande IS NULL",
            "CROSS JOIN commandes",
            "ORDER BY commandes.id_commande"
          ],
          correct: "LEFT JOIN puis WHERE commandes.id_commande IS NULL",
          explanation: "Sans commande correspondante, les colonnes de commandes valent NULL."
        },
        {
          text: "Pourquoi employer les alias c et co ?",
          options: [
            "Pour éviter ON",
            "Pour rendre une requête plus courte et lisible",
            "Pour supprimer des colonnes",
            "Pour créer une clé primaire"
          ],
          correct: "Pour rendre une requête plus courte et lisible",
          explanation: "Les alias simplifient les noms de tables."
        },
        {
          text: "Quel risque existe si une commande a plusieurs lignes de détail ?",
          options: [
            "Le résultat peut contenir plusieurs lignes pour une commande",
            "Les commandes sont supprimées",
            "Toutes les valeurs deviennent NULL",
            "La requête devient automatiquement LEFT JOIN"
          ],
          correct: "Le résultat peut contenir plusieurs lignes pour une commande",
          explanation: "Une relation un-à-plusieurs peut multiplier les lignes."
        },
        {
          text: "Quelle condition de jointure est généralement correcte ?",
          options: [
            "Relier une date à un nom",
            "Relier une clé primaire à une clé étrangère",
            "Relier une ville à un prix",
            "Relier deux colonnes sans relation"
          ],
          correct: "Relier une clé primaire à une clé étrangère",
          explanation: "Les clés permettent de relier les tables de manière fiable."
        },
        {
          text: "Que signifie c.id_client ?",
          options: [
            "La colonne id_client de la table aliasée c",
            "Une nouvelle base",
            "Une fonction SQL",
            "Une colonne supprimée"
          ],
          correct: "La colonne id_client de la table aliasée c",
          explanation: "La notation alias.colonne identifie précisément une colonne."
        },
        {
          text: "Pourquoi préciser la table avant une colonne nom ?",
          options: [
            "Cela crée une clé primaire",
            "Plusieurs tables peuvent contenir une colonne nom",
            "SQL interdit nom",
            "Cela trie automatiquement"
          ],
          correct: "Plusieurs tables peuvent contenir une colonne nom",
          explanation: "Cela évite une ambiguïté entre les tables."
        },
        {
          text: "Quelle jointure crée toutes les combinaisons possibles ?",
          options: ["CROSS JOIN", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN"],
          correct: "CROSS JOIN",
          explanation: "CROSS JOIN associe chaque ligne de la première table à chaque ligne de la seconde."
        },
        {
          text: "Pourquoi CROSS JOIN peut-il produire énormément de lignes ?",
          options: [
            "Il ignore les tables",
            "Il combine chaque ligne avec chaque ligne de l'autre table",
            "Il supprime les doublons",
            "Il filtre les valeurs NULL"
          ],
          correct: "Il combine chaque ligne avec chaque ligne de l'autre table",
          explanation: "Le nombre de lignes est multiplié entre les deux tables."
        }
      ],

      avance: [
        {
          text: "Quel risque existe avec INNER JOIN si certaines données ne correspondent pas ?",
          options: [
            "Les tables sont supprimées",
            "Les lignes sans correspondance ne sont pas affichées",
            "Toutes les valeurs deviennent NULL",
            "Les colonnes changent de nom"
          ],
          correct: "Les lignes sans correspondance ne sont pas affichées",
          explanation: "INNER JOIN ne conserve que les lignes ayant une correspondance."
        },
        {
          text: "Comment trouver les lignes à gauche absentes à droite ?",
          options: [
            "CROSS JOIN puis GROUP BY",
            "LEFT JOIN puis WHERE colonne_droite IS NULL",
            "INNER JOIN puis ORDER BY",
            "DELETE JOIN"
          ],
          correct: "LEFT JOIN puis WHERE colonne_droite IS NULL",
          explanation: "NULL à droite indique qu'aucune correspondance n'a été trouvée."
        },
        {
          text: "Comment relier une table à elle-même ?",
          options: ["Avec une auto-jointure", "Sans ON", "Avec DELETE JOIN", "Avec CROSS JOIN obligatoire"],
          correct: "Avec une auto-jointure",
          explanation: "Une auto-jointure utilise la même table avec deux alias."
        },
        {
          text: "Dans employés e LEFT JOIN employés m, m peut représenter :",
          options: [
            "Le manager de e",
            "Une base de données",
            "Une colonne supprimée",
            "Un ordre de tri"
          ],
          correct: "Le manager de e",
          explanation: "La table employés représente ici deux rôles différents."
        },
        {
          text: "Pourquoi être prudent avant SUM ou COUNT après une jointure ?",
          options: [
            "SUM ne fonctionne pas avec JOIN",
            "Les lignes multipliées peuvent fausser les calculs",
            "COUNT transforme les valeurs en texte",
            "Les jointures sont supprimées"
          ],
          correct: "Les lignes multipliées peuvent fausser les calculs",
          explanation: "Une relation un-à-plusieurs peut gonfler une somme ou un comptage."
        },
        {
          text: "Quelle bonne pratique évite des erreurs de jointure ?",
          options: [
            "Éviter ON",
            "Toujours utiliser CROSS JOIN",
            "Vérifier les clés et la cardinalité",
            "Ne jamais utiliser d'alias"
          ],
          correct: "Vérifier les clés et la cardinalité",
          explanation: "Il faut comprendre si une relation est un-à-un ou un-à-plusieurs."
        },
        {
          text: "Qu'est-ce qu'une relation plusieurs-à-plusieurs ?",
          options: [
            "Aucune table ne possède de clé",
            "Plusieurs lignes peuvent être liées à plusieurs lignes de l'autre table",
            "Une ligne est liée à une seule ligne",
            "Toutes les valeurs sont NULL"
          ],
          correct: "Plusieurs lignes peuvent être liées à plusieurs lignes de l'autre table",
          explanation: "Une telle relation utilise souvent une table de liaison."
        },
        {
          text: "Quelle table est souvent utilisée pour une relation plusieurs-à-plusieurs ?",
          options: [
            "Une table de liaison avec les clés des deux tables",
            "Une table vide",
            "Une table sans clé",
            "Une table contenant seulement des dates"
          ],
          correct: "Une table de liaison avec les clés des deux tables",
          explanation: "La table de liaison enregistre les associations entre les entités."
        },
        {
          text: "Que signifie NULL dans les colonnes de droite après LEFT JOIN ?",
          options: [
            "La requête est supprimée",
            "Aucune correspondance n'existe dans la table de droite",
            "La table de gauche est vide",
            "Le tri est incorrect"
          ],
          correct: "Aucune correspondance n'existe dans la table de droite",
          explanation: "LEFT JOIN garde la ligne de gauche même si rien n'est trouvé à droite."
        },
        {
          text: "Pourquoi éviter SELECT * dans une jointure complexe ?",
          options: [
            "JOIN interdit SELECT *",
            "Plusieurs colonnes peuvent avoir le même nom",
            "SQL supprime les données",
            "Les alias ne fonctionnent plus"
          ],
          correct: "Plusieurs colonnes peuvent avoir le même nom",
          explanation: "Choisir clairement les colonnes rend le résultat moins ambigu."
        }
      ]
    }
  },

  avance: {
    title: "SQL avancé",
    description: "Agrégations, GROUP BY, HAVING, CTE, sous-requêtes et fenêtres.",
    levels: {
      debutant: [
        {
          text: "Quelle fonction compte toutes les lignes ?",
          options: ["SUM(*)", "COUNT(*)", "TOTAL(*)", "NUMBER(*)"],
          correct: "COUNT(*)",
          explanation: "COUNT(*) compte toutes les lignes du résultat."
        },
        {
          text: "Quelle fonction calcule une somme ?",
          options: ["AVG()", "MAX()", "SUM()", "COUNT()"],
          correct: "SUM()",
          explanation: "SUM() additionne les valeurs numériques."
        },
        {
          text: "Quelle fonction calcule une moyenne ?",
          options: ["MIN()", "AVG()", "SUM()", "COUNT()"],
          correct: "AVG()",
          explanation: "AVG() calcule la moyenne d'une colonne numérique."
        },
        {
          text: "Quelle fonction retourne la plus grande valeur ?",
          options: ["COUNT()", "MAX()", "MIN()", "AVG()"],
          correct: "MAX()",
          explanation: "MAX() retourne la plus grande valeur."
        },
        {
          text: "Quelle fonction retourne la plus petite valeur ?",
          options: ["SUM()", "AVG()", "MIN()", "MAX()"],
          correct: "MIN()",
          explanation: "MIN() retourne la plus petite valeur."
        },
        {
          text: "À quoi sert GROUP BY ?",
          options: [
            "Supprimer une table",
            "Regrouper les lignes avant un calcul d'agrégation",
            "Modifier une clé",
            "Trier uniquement"
          ],
          correct: "Regrouper les lignes avant un calcul d'agrégation",
          explanation: "GROUP BY crée des groupes pour COUNT, SUM ou AVG."
        },
        {
          text: "Quelle requête compte les clients ?",
          options: [
            "SELECT SUM(*) FROM clients;",
            "COUNT clients;",
            "SELECT COUNT(*) FROM clients;",
            "SELECT CLIENTS COUNT;"
          ],
          correct: "SELECT COUNT(*) FROM clients;",
          explanation: "COUNT(*) compte les lignes de la table."
        },
        {
          text: "Quelle requête calcule le chiffre d'affaires total ?",
          options: [
            "SELECT MAX(montant) FROM commandes;",
            "SELECT SUM(montant) FROM commandes;",
            "SELECT montant FROM commandes;",
            "SELECT COUNT(montant) FROM commandes;"
          ],
          correct: "SELECT SUM(montant) FROM commandes;",
          explanation: "SUM additionne tous les montants."
        },
        {
          text: "Que fait GROUP BY ville ?",
          options: [
            "Il supprime ville",
            "Il crée un groupe pour chaque ville",
            "Il remplace les villes par NULL",
            "Il trie les villes obligatoirement"
          ],
          correct: "Il crée un groupe pour chaque ville",
          explanation: "Cela permet par exemple de compter les clients dans chaque ville."
        },
        {
          text: "Quelle clause filtre les groupes après GROUP BY ?",
          options: ["WHERE", "HAVING", "FROM", "ORDER BY"],
          correct: "HAVING",
          explanation: "HAVING s'applique aux groupes déjà créés."
        }
      ],

      intermediaire: [
        {
          text: "Quelle différence entre WHERE et HAVING ?",
          options: [
            "WHERE filtre avant GROUP BY, HAVING filtre après",
            "HAVING trie les données",
            "WHERE sert seulement avec JOIN",
            "Il n'y a aucune différence"
          ],
          correct: "WHERE filtre avant GROUP BY, HAVING filtre après",
          explanation: "WHERE filtre les lignes, HAVING filtre les groupes."
        },
        {
          text: "Quelle requête affiche les villes avec plus de 10 clients ?",
          options: [
            "SELECT ville FROM clients WHERE COUNT(*) > 10;",
            "SELECT ville, COUNT(*) FROM clients GROUP BY ville HAVING COUNT(*) > 10;",
            "SELECT ville FROM clients GROUP BY COUNT(*) > 10;",
            "SELECT ville, COUNT(*) FROM clients HAVING COUNT(*) > 10;"
          ],
          correct: "SELECT ville, COUNT(*) FROM clients GROUP BY ville HAVING COUNT(*) > 10;",
          explanation: "GROUP BY forme les groupes et HAVING filtre le COUNT."
        },
        {
          text: "Qu'est-ce qu'une sous-requête ?",
          options: [
            "Une copie de table",
            "Une requête à l'intérieur d'une autre requête",
            "Un type de jointure",
            "Une base temporaire"
          ],
          correct: "Une requête à l'intérieur d'une autre requête",
          explanation: "Une sous-requête fournit un résultat à une requête principale."
        },
        {
          text: "Quel mot-clé commence une CTE dans SQL Server ?",
          options: ["TEMP", "DEFINE", "WITH", "CREATE CTE"],
          correct: "WITH",
          explanation: "Une CTE commence par WITH nom AS (...)."
        },
        {
          text: "Pourquoi utiliser une CTE ?",
          options: [
            "Pour empêcher les jointures",
            "Pour structurer une requête complexe",
            "Pour supprimer automatiquement les doublons",
            "Pour remplacer les tables"
          ],
          correct: "Pour structurer une requête complexe",
          explanation: "Une CTE découpe un raisonnement SQL en étapes lisibles."
        },
        {
          text: "Quelle requête donne le salaire moyen par département ?",
          options: [
            "SELECT departement FROM employes WHERE AVG(salaire);",
            "SELECT departement, AVG(salaire) FROM employes GROUP BY departement;",
            "SELECT salaire FROM employes GROUP BY AVG(departement);",
            "SELECT AVG(departement, salaire) FROM employes;"
          ],
          correct: "SELECT departement, AVG(salaire) FROM employes GROUP BY departement;",
          explanation: "Chaque département devient un groupe pour calculer sa moyenne."
        },
        {
          text: "Que retourne COUNT(colonne) ?",
          options: [
            "Le nombre de valeurs non NULL",
            "La somme de la colonne",
            "Toutes les lignes sans exception",
            "La valeur maximale"
          ],
          correct: "Le nombre de valeurs non NULL",
          explanation: "COUNT(colonne) ignore NULL."
        },
        {
          text: "Quelle clause trie un résultat agrégé ?",
          options: ["DISTINCT", "ORDER BY", "ON", "WHERE"],
          correct: "ORDER BY",
          explanation: "ORDER BY trie le résultat final, même après GROUP BY."
        },
        {
          text: "Que fait SELECT DISTINCT ville FROM clients ?",
          options: [
            "Supprime les clients",
            "Compte les villes",
            "Affiche chaque ville une seule fois",
            "Trie toujours les villes"
          ],
          correct: "Affiche chaque ville une seule fois",
          explanation: "DISTINCT élimine les répétitions."
        },
        {
          text: "Quelle condition sélectionne les produits plus chers que la moyenne ?",
          options: [
            "WHERE prix > AVG(prix)",
            "ORDER BY AVG(prix)",
            "WHERE prix > (SELECT AVG(prix) FROM produits)",
            "HAVING prix > AVG(prix)"
          ],
          correct: "WHERE prix > (SELECT AVG(prix) FROM produits)",
          explanation: "La sous-requête calcule d'abord la moyenne générale."
        }
      ],

      avance: [
        {
          text: "Quelle fonction attribue un numéro unique aux lignes ?",
          options: ["COUNT()", "ROW_NUMBER()", "SUM()", "RANK_TABLE()"],
          correct: "ROW_NUMBER()",
          explanation: "ROW_NUMBER numérote les lignes suivant un ordre."
        },
        {
          text: "Quel est le rôle de PARTITION BY ?", 
          options: [
            "Créer un classement séparé dans chaque groupe",
            "Supprimer les départements",
            "Créer une nouvelle table",
            "Trier les départements"
          ],
          correct: "Créer un classement séparé dans chaque groupe",
          explanation: "PARTITION BY redémarre le calcul dans chaque groupe."
        },
        {
          text: "Avec ORDER BY salaire DESC, qui obtient le numéro 1 ?",
          options: [
            "Le plus petit salaire",
            "Le salaire moyen",
            "Le plus grand salaire",
            "Un salaire aléatoire"
          ],
          correct: "Le plus grand salaire",
          explanation: "DESC trie de la valeur la plus grande vers la plus petite."
        },
        {
          text: "Différence entre RANK() et ROW_NUMBER() en cas d'égalité ?",
          options: [
            "Aucune différence",
            "RANK donne le même rang, ROW_NUMBER donne des numéros différents",
            "ROW_NUMBER supprime les égalités",
            "RANK ne trie pas"
          ],
          correct: "RANK donne le même rang, ROW_NUMBER donne des numéros différents",
          explanation: "RANK conserve les égalités tandis que ROW_NUMBER numérote chaque ligne."
        },
        {
          text: "Quelle expression calcule une somme cumulative ?",
          options: [
            "SUM(montant) OVER (ORDER BY date_commande)",
            "COUNT(*) GROUP BY date_commande",
            "DISTINCT SUM(date_commande)",
            "ORDER BY SUM()"
          ],
          correct: "SUM(montant) OVER (ORDER BY date_commande)",
          explanation: "SUM avec OVER et ORDER BY calcule un total progressif."
        },
        {
          text: "Pourquoi une fonction de fenêtre diffère de GROUP BY ?",
          options: [
            "Elle conserve les lignes individuelles",
            "Elle supprime les lignes",
            "Elle remplace JOIN",
            "Elle interdit ORDER BY"
          ],
          correct: "Elle conserve les lignes individuelles",
          explanation: "GROUP BY réduit les lignes, une fonction de fenêtre les conserve."
        },
        {
          text: "Quelle syntaxe crée une CTE ventes_par_client ?",
          options: [
            "CTE ventes_par_client = SELECT ...",
            "WITH ventes_par_client AS (SELECT ...)",
            "CREATE ventes_par_client AS (SELECT ...)",
            "TEMP ventes_par_client FROM SELECT ..."
          ],
          correct: "WITH ventes_par_client AS (SELECT ...)",
          explanation: "WITH nom AS (...) est la syntaxe standard d'une CTE."
        },
        {
          text: "Quel est un usage pertinent d'une sous-requête dans WHERE ?",
          options: [
            "Comparer une valeur à une moyenne calculée",
            "Créer une clé primaire",
            "Renommer une colonne sans AS",
            "Remplacer automatiquement LEFT JOIN"
          ],
          correct: "Comparer une valeur à une moyenne calculée",
          explanation: "Une sous-requête peut fournir une valeur de comparaison."
        },
        {
          text: "Que permet EXISTS ?",
          options: [
            "Trier les résultats",
            "Vérifier si une sous-requête retourne une ligne",
            "Supprimer les doublons",
            "Compter toutes les lignes"
          ],
          correct: "Vérifier si une sous-requête retourne une ligne",
          explanation: "EXISTS est vrai lorsqu'au moins une ligne est trouvée."
        },
        {
          text: "Comment trouver le meilleur salaire de chaque département ?",
          options: [
            "SELECT DISTINCT salaire",
            "ROW_NUMBER() avec PARTITION BY departement et ORDER BY salaire DESC",
            "DELETE avec GROUP BY",
            "ORDER BY salaire seulement"
          ],
          correct: "ROW_NUMBER() avec PARTITION BY departement et ORDER BY salaire DESC",
          explanation: "Chaque département est classé séparément et le premier rang est le meilleur salaire."
        }
      ]
    }
  }
};

export const themeOrder = ["fondamentaux", "jointures", "avance"];
export const levelOrder = ["debutant", "intermediaire", "avance"];
