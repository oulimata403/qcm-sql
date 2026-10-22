// questions.js

export const themeOrder = [
  "fondamentaux",
  "jointures",
  "avance"
];

export const levelOrder = [
  "debutant",
  "intermediaire",
  "avance"
];

export const quizData = {
  fondamentaux: {
    title: "Fondamentaux SQL",
    description: "Les commandes essentielles de SQL.",
    levels: {
      debutant: [
        {
          text: "Quelle commande SQL permet de lire les données ?",
          options: [
            "UPDATE",
            "DELETE",
            "SELECT",
            "INSERT"
          ],
          correct: "SELECT",
          explanation: "SELECT permet de récupérer des données."
        },
        {
          text: "Quelle clause indique la table utilisée ?",
          options: [
            "WHERE",
            "FROM",
            "HAVING",
            "ORDER BY"
          ],
          correct: "FROM",
          explanation: "FROM indique la table source."
        },
        {
          text: "Quelle clause filtre les lignes ?",
          options: [
            "ORDER BY",
            "DISTINCT",
            "WHERE",
            "GROUP BY"
          ],
          correct: "WHERE",
          explanation: "WHERE filtre les lignes selon une condition."
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
          text: "Quel mot-clé supprime les doublons du résultat ?",
          options: [
            "REMOVE",
            "UNIQUE",
            "DISTINCT",
            "FILTER"
          ],
          correct: "DISTINCT",
          explanation: "DISTINCT affiche une seule fois chaque valeur."
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
          explanation: "Le signe > signifie supérieur à."
        },
        {
          text: "Quel symbole signifie égal à en SQL ?",
          options: [
            "=>",
            "=",
            "==",
            ":="
          ],
          correct: "=",
          explanation: "SQL utilise le symbole =."
        },
        {
          text: "Quelle requête affiche nom et email ?",
          options: [
            "FROM clients SELECT nom, email;",
            "SELECT nom, email FROM clients;",
            "GET nom, email FROM clients;",
            "SELECT clients FROM nom, email;"
          ],
          correct: "SELECT nom, email FROM clients;",
          explanation: "SELECT choisit les colonnes."
        },
        {
          text: "Quelle clause trie les résultats ?",
          options: [
            "DISTINCT",
            "GROUP BY",
            "ORDER BY",
            "WHERE"
          ],
          correct: "ORDER BY",
          explanation: "ORDER BY trie les résultats."
        },
        {
          text: "Que signifie ORDER BY prix DESC ?",
          options: [
            "Trier du plus grand au plus petit",
            "Supprimer les prix",
            "Filtrer les prix",
            "Trier du plus petit au plus grand"
          ],
          correct: "Trier du plus grand au plus petit",
          explanation: "DESC signifie décroissant."
        }
      ],

      intermediaire: [
        {
          text: "Comment vérifier une valeur NULL ?",
          options: [
            "colonne EMPTY",
            "colonne IS NULL",
            "colonne = NULL",
            "colonne == NULL"
          ],
          correct: "colonne IS NULL",
          explanation: "IS NULL teste une valeur absente."
        },
        {
          text: "Quel opérateur vérifie une liste de valeurs ?",
          options: [
            "BETWEEN",
            "LIKE",
            "IN",
            "ORDER BY"
          ],
          correct: "IN",
          explanation: "IN compare une valeur à plusieurs possibilités."
        },
        {
          text: "À quoi sert LIKE ?",
          options: [
            "Créer une table",
            "Rechercher du texte selon un modèle",
            "Supprimer des doublons",
            "Additionner des colonnes"
          ],
          correct: "Rechercher du texte selon un modèle",
          explanation: "LIKE recherche du texte avec des caractères génériques."
        },
        {
          text: "Dans LIKE 'Da%', que signifie % ?",
          options: [
            "Un caractère obligatoire",
            "Un chiffre",
            "Zéro ou plusieurs caractères",
            "Un espace"
          ],
          correct: "Zéro ou plusieurs caractères",
          explanation: "% représente une suite de caractères."
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
          explanation: "BETWEEN inclut les deux limites."
        },
        {
          text: "Quelle clause trie les noms de A à Z ?",
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
          text: "Quel mot-clé donne un alias ?",
          options: [
            "RENAME",
            "AS",
            "TO",
            "NAME"
          ],
          correct: "AS",
          explanation: "AS donne un nom temporaire."
        },
        {
          text: "Quelle condition sélectionne Dakar et Thiès ?",
          options: [
            "WHERE ville = ('Dakar', 'Thiès')",
            "WHERE ville IN ('Dakar', 'Thiès')",
            "WHERE ville BETWEEN 'Dakar' AND 'Thiès'",
            "WHERE ville LIKE ('Dakar', 'Thiès')"
          ],
          correct: "WHERE ville IN ('Dakar', 'Thiès')",
          explanation: "IN est adapté à une liste de valeurs."
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
          explanation: "90 % du prix correspond à prix * 0.90."
        }
      ],

      avance: [
        {
          text: "Quelle condition vérifie qu'une valeur existe ?",
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
          text: "Que fait COUNT(colonne) avec NULL ?",
          options: [
            "Il compte NULL",
            "Il remplace NULL par 0",
            "Il ignore NULL",
            "Il arrête la requête"
          ],
          correct: "Il ignore NULL",
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
          explanation: "ISNULL remplace NULL par une valeur donnée."
        },
        {
          text: "Quelle condition cherche les noms commençant par M ?",
          options: [
            "WHERE nom LIKE '%M'",
            "WHERE nom = 'M%'",
            "WHERE nom LIKE 'M%'",
            "WHERE nom LIKE '_M_'"
          ],
          correct: "WHERE nom LIKE 'M%'",
          explanation: "M% signifie que le texte commence par M."
        },
        {
          text: "Que sélectionne NOT BETWEEN 100 AND 500 ?",
          options: [
            "Les valeurs sous 100 ou au-dessus de 500",
            "Les valeurs entre 100 et 500",
            "Toutes les valeurs",
            "Uniquement 100 et 500"
          ],
          correct: "Les valeurs sous 100 ou au-dessus de 500",
          explanation: "NOT BETWEEN exclut l'intervalle."
        },
        {
          text: "Pourquoi utiliser 'Dakar' entre apostrophes ?",
          options: [
            "C'est une valeur texte",
            "C'est une colonne",
            "C'est un nombre",
            "Cela supprime les espaces"
          ],
          correct: "C'est une valeur texte",
          explanation: "Les chaînes de caractères utilisent des apostrophes."
        },
        {
          text: "Quelle condition cherche les emails Gmail ?",
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
          text: "Pourquoi utiliser un alias ?",
          options: [
            "Pour supprimer une table",
            "Pour raccourcir la requête",
            "Pour copier les données",
            "Pour modifier la base"
          ],
          correct: "Pour raccourcir la requête",
          explanation: "Un alias rend les requêtes plus lisibles."
        },
        {
          text: "Pourquoi éviter SELECT * ?",
          options: [
            "SELECT * est interdit",
            "Pour récupérer uniquement les colonnes utiles",
            "Pour supprimer NULL",
            "Pour créer un index"
          ],
          correct: "Pour récupérer uniquement les colonnes utiles",
          explanation: "La requête est plus claire et plus efficace."
        },
        {
          text: "Quelle condition exclut Dakar et Thiès ?",
          options: [
            "WHERE ville NOT IN ('Dakar', 'Thiès')",
            "WHERE ville DIFFERENT IN ('Dakar', 'Thiès')",
            "WHERE ville <> IN ('Dakar', 'Thiès')",
            "WHERE ville EXCEPT ('Dakar', 'Thiès')"
          ],
          correct: "WHERE ville NOT IN ('Dakar', 'Thiès')",
          explanation: "NOT IN exclut les valeurs indiquées."
        }
      ]
    }
  },

  jointures: {
    title: "Jointures SQL",
    description: "Relier plusieurs tables avec les jointures SQL.",
    levels: {
      debutant: [
        {
          text: "Pourquoi utilise-t-on une jointure SQL ?",
          options: [
            "Pour modifier un mot de passe",
            "Pour relier plusieurs tables",
            "Pour supprimer une table",
            "Pour créer une base"
          ],
          correct: "Pour relier plusieurs tables",
          explanation: "Une jointure combine les données de plusieurs tables."
        },
        {
          text: "Quelle jointure garde uniquement les correspondances ?",
          options: [
            "LEFT JOIN",
            "CROSS JOIN",
            "INNER JOIN",
            "RIGHT JOIN"
          ],
          correct: "INNER JOIN",
          explanation: "INNER JOIN conserve les lignes correspondantes."
        },
        {
          text: "Quelle jointure conserve toutes les lignes de gauche ?",
          options: [
            "RIGHT JOIN",
            "LEFT JOIN",
            "INNER JOIN",
            "CROSS JOIN"
          ],
          correct: "LEFT JOIN",
          explanation: "LEFT JOIN conserve toute la table de gauche."
        },
        {
          text: "Comment relier clients et commandes ?",
          options: [
            "clients.ville = commandes.montant",
            "clients.id_client = commandes.id_client",
            "clients.nom = commandes.date_commande",
            "clients.email = commandes.prix"
          ],
          correct: "clients.id_client = commandes.id_client",
          explanation: "La clé id_client relie les deux tables."
        },
        {
          text: "Quel mot-clé définit la condition de jointure ?",
          options: [
            "ON",
            "WHERE",
            "AS",
            "FROM"
          ],
          correct: "ON",
          explanation: "ON indique les colonnes correspondantes."
        },
        {
          text: "Que devient la table de droite sans correspondance dans LEFT JOIN ?",
          options: [
            "Elle est supprimée",
            "Ses colonnes valent NULL",
            "La requête échoue",
            "Elle est déplacée"
          ],
          correct: "Ses colonnes valent NULL",
          explanation: "La ligne gauche est conservée et les colonnes droites valent NULL."
        },
        {
          text: "Un client et plusieurs commandes représentent une relation :",
          options: [
            "Aucune relation",
            "Un-à-plusieurs",
            "Un-à-zéro",
            "Plusieurs-à-zéro"
          ],
          correct: "Un-à-plusieurs",
          explanation: "Un client peut posséder plusieurs commandes."
        },
        {
          text: "Qu'est-ce qu'une clé primaire ?",
          options: [
            "Une colonne qui identifie chaque ligne",
            "Une colonne toujours textuelle",
            "Une colonne avec des doublons",
            "Une colonne de tri"
          ],
          correct: "Une colonne qui identifie chaque ligne",
          explanation: "La clé primaire identifie une ligne de façon unique."
        },
        {
          text: "Quelle jointure est correctement écrite ?",
          options: [
            "SELECT clients + commandes;",
            "SELECT * FROM clients INNER JOIN commandes ON clients.id_client = commandes.id_client;",
            "MERGE clients WITH commandes;",
            "SELECT * FROM clients JOIN commandes;"
          ],
          correct: "SELECT * FROM clients INNER JOIN commandes ON clients.id_client = commandes.id_client;",
          explanation: "La requête utilise INNER JOIN et ON."
        },
        {
          text: "Quel alias peut représenter la table clients ?",
          options: [
            "clients AS c",
            "clients TO c",
            "clients NAME c",
            "clients RENAME c"
          ],
          correct: "clients AS c",
          explanation: "AS crée un alias de table."
        }
      ],

      intermediaire: [
        {
          text: "Quelle jointure conserve toutes les lignes de droite ?",
          options: [
            "INNER JOIN",
            "RIGHT JOIN",
            "LEFT JOIN",
            "CROSS JOIN"
          ],
          correct: "RIGHT JOIN",
          explanation: "RIGHT JOIN conserve toute la table droite."
        },
        {
          text: "Que fait FULL OUTER JOIN ?",
          options: [
            "Il conserve les lignes des deux tables",
            "Il conserve seulement les doublons",
            "Il supprime les lignes isolées",
            "Il crée une base"
          ],
          correct: "Il conserve les lignes des deux tables",
          explanation: "FULL OUTER JOIN conserve les lignes avec ou sans correspondance."
        },
        {
          text: "Comment trouver les clients sans commande ?",
          options: [
            "INNER JOIN puis IS NULL",
            "LEFT JOIN puis commandes.id_commande IS NULL",
            "CROSS JOIN",
            "ORDER BY"
          ],
          correct: "LEFT JOIN puis commandes.id_commande IS NULL",
          explanation: "NULL à droite signifie qu'aucune commande n'existe."
        },
        {
          text: "Pourquoi utiliser des alias ?",
          options: [
            "Pour éviter ON",
            "Pour rendre la requête plus lisible",
            "Pour supprimer les colonnes",
            "Pour créer une clé"
          ],
          correct: "Pour rendre la requête plus lisible",
          explanation: "Les alias raccourcissent les noms de tables."
        },
        {
          text: "Quel risque existe avec une relation un-à-plusieurs ?",
          options: [
            "Les lignes peuvent être multipliées",
            "Les tables sont supprimées",
            "Les valeurs deviennent NULL",
            "La jointure devient automatiquement LEFT"
          ],
          correct: "Les lignes peuvent être multipliées",
          explanation: "Une ligne peut apparaître plusieurs fois."
        },
        {
          text: "Quelle jointure retourne toutes les combinaisons possibles ?",
          options: [
            "CROSS JOIN",
            "INNER JOIN",
            "LEFT JOIN",
            "RIGHT JOIN"
          ],
          correct: "CROSS JOIN",
          explanation: "CROSS JOIN combine chaque ligne avec toutes les lignes opposées."
        },
        {
          text: "Que signifie c.id_client ?",
          options: [
            "La colonne id_client de la table c",
            "Une nouvelle table",
            "Une fonction",
            "Une valeur NULL"
          ],
          correct: "La colonne id_client de la table c",
          explanation: "La notation alias.colonne identifie la source."
        },
        {
          text: "Pourquoi qualifier une colonne nom avec la table ?",
          options: [
            "Plusieurs tables peuvent avoir une colonne nom",
            "SQL interdit nom",
            "Cela crée une table",
            "Cela supprime les doublons"
          ],
          correct: "Plusieurs tables peuvent avoir une colonne nom",
          explanation: "Cela évite les ambiguïtés."
        },
        {
          text: "Quelle condition recherche les clients sans commande ?",
          options: [
            "WHERE commandes.id IS NULL",
            "WHERE commandes.id IS NOT NULL",
            "HAVING clients.id",
            "ORDER BY commandes.id"
          ],
          correct: "WHERE commandes.id IS NULL",
          explanation: "Une valeur NULL à droite indique l'absence de correspondance."
        },
        {
          text: "Quel élément relie généralement deux tables ?",
          options: [
            "Une clé primaire et une clé étrangère",
            "Une ville et un prix",
            "Un nom et une date",
            "Deux colonnes aléatoires"
          ],
          correct: "Une clé primaire et une clé étrangère",
          explanation: "Les clés représentent la relation entre tables."
        }
      ],

      avance: [
        {
          text: "Quel est le risque d'un INNER JOIN avec des données manquantes ?",
          options: [
            "Les lignes sans correspondance disparaissent",
            "Les tables sont supprimées",
            "Tout devient NULL",
            "Les colonnes changent"
          ],
          correct: "Les lignes sans correspondance disparaissent",
          explanation: "INNER JOIN garde uniquement les correspondances."
        },
        {
          text: "Comment faire une auto-jointure ?",
          options: [
            "En utilisant deux alias d'une même table",
            "En supprimant ON",
            "Avec DELETE JOIN",
            "Avec deux bases différentes"
          ],
          correct: "En utilisant deux alias d'une même table",
          explanation: "Une auto-jointure compare une table avec elle-même."
        },
        {
          text: "Pourquoi vérifier la cardinalité d'une jointure ?",
          options: [
            "Pour prévoir le nombre de lignes retournées",
            "Pour supprimer les clés",
            "Pour empêcher SELECT",
            "Pour changer les types"
          ],
          correct: "Pour prévoir le nombre de lignes retournées",
          explanation: "La cardinalité indique comment les lignes se multiplient."
        },
        {
          text: "Quelle table sert souvent pour une relation plusieurs-à-plusieurs ?",
          options: [
            "Une table de liaison",
            "Une table vide",
            "Une table sans clé",
            "Une table uniquement de dates"
          ],
          correct: "Une table de liaison",
          explanation: "Elle contient les clés des deux tables associées."
        },
        {
          text: "Pourquoi une somme peut-elle être faussée après une jointure ?",
          options: [
            "Les lignes peuvent être dupliquées",
            "SUM devient du texte",
            "JOIN supprime les montants",
            "GROUP BY est obligatoire"
          ],
          correct: "Les lignes peuvent être dupliquées",
          explanation: "Une relation un-à-plusieurs peut répéter les montants."
        },
        {
          text: "Comment trouver les lignes présentes uniquement à gauche ?",
          options: [
            "LEFT JOIN puis WHERE colonne_droite IS NULL",
            "INNER JOIN puis ORDER BY",
            "CROSS JOIN",
            "RIGHT JOIN uniquement"
          ],
          correct: "LEFT JOIN puis WHERE colonne_droite IS NULL",
          explanation: "Les lignes absentes à droite contiennent NULL."
        },
        {
          text: "Pourquoi éviter SELECT * avec plusieurs tables ?",
          options: [
            "Il peut y avoir des colonnes ambiguës",
            "SELECT * est interdit",
            "JOIN ne fonctionnerait plus",
            "Les tables sont supprimées"
          ],
          correct: "Il peut y avoir des colonnes ambiguës",
          explanation: "Plusieurs tables peuvent avoir les mêmes noms de colonnes."
        },
        {
          text: "Quelle relation est plusieurs-à-plusieurs ?",
          options: [
            "Un client et une adresse unique",
            "Des étudiants et des cours",
            "Un pays et sa capitale",
            "Une commande et son client unique"
          ],
          correct: "Des étudiants et des cours",
          explanation: "Un étudiant suit plusieurs cours et un cours possède plusieurs étudiants."
        },
        {
          text: "Quel opérateur vérifie l'existence d'une correspondance ?",
          options: [
            "EXISTS",
            "MATCHES",
            "PRESENT",
            "FOUND"
          ],
          correct: "EXISTS",
          explanation: "EXISTS vérifie qu'une sous-requête retourne au moins une ligne."
        },
        {
          text: "Quel élément doit être vérifié avant une jointure complexe ?",
          options: [
            "Les clés et la relation entre les tables",
            "La couleur de la page",
            "Le nom du navigateur",
            "La taille de l'écran"
          ],
          correct: "Les clés et la relation entre les tables",
          explanation: "Il faut comprendre les relations avant de joindre les tables."
        }
      ]
    }
  },

  avance: {
    title: "SQL avancé",
    description: "Agrégations, CTE, sous-requêtes et fonctions de fenêtre.",
    levels: {
      debutant: [
        {
          text: "Quelle fonction compte les lignes ?",
          options: [
            "SUM(*)",
            "COUNT(*)",
            "TOTAL(*)",
            "NUMBER(*)"
          ],
          correct: "COUNT(*)",
          explanation: "COUNT(*) compte les lignes."
        },
        {
          text: "Quelle fonction calcule une somme ?",
          options: [
            "AVG()",
            "MAX()",
            "SUM()",
            "COUNT()"
          ],
          correct: "SUM()",
          explanation: "SUM additionne les valeurs."
        },
        {
          text: "Quelle fonction calcule une moyenne ?",
          options: [
            "MIN()",
            "AVG()",
            "SUM()",
            "COUNT()"
          ],
          correct: "AVG()",
          explanation: "AVG calcule une moyenne."
        },
        {
          text: "Quelle fonction retourne la plus grande valeur ?",
          options: [
            "COUNT()",
            "MAX()",
            "MIN()",
            "AVG()"
          ],
          correct: "MAX()",
          explanation: "MAX retourne la valeur maximale."
        },
        {
          text: "Quelle fonction retourne la plus petite valeur ?",
          options: [
            "SUM()",
            "AVG()",
            "MIN()",
            "MAX()"
          ],
          correct: "MIN()",
          explanation: "MIN retourne la valeur minimale."
        },
        {
          text: "À quoi sert GROUP BY ?",
          options: [
            "Supprimer une table",
            "Regrouper les lignes pour une agrégation",
            "Modifier une clé",
            "Trier les lignes uniquement"
          ],
          correct: "Regrouper les lignes pour une agrégation",
          explanation: "GROUP BY crée des groupes."
        },
        {
          text: "Quelle clause filtre les groupes ?",
          options: [
            "WHERE",
            "HAVING",
            "FROM",
            "ORDER BY"
          ],
          correct: "HAVING",
          explanation: "HAVING filtre après GROUP BY."
        },
        {
          text: "Que fait SELECT DISTINCT ville FROM clients ?",
          options: [
            "Supprime les clients",
            "Compte les villes",
            "Affiche chaque ville une seule fois",
            "Trie automatiquement les villes"
          ],
          correct: "Affiche chaque ville une seule fois",
          explanation: "DISTINCT supprime les répétitions."
        },
        {
          text: "Que signifie COUNT(colonne) ?",
          options: [
            "Le nombre de valeurs non NULL",
            "La somme",
            "Le maximum",
            "Toutes les lignes obligatoirement"
          ],
          correct: "Le nombre de valeurs non NULL",
          explanation: "COUNT(colonne) ignore les valeurs NULL."
        },
        {
          text: "Quel calcul donne le chiffre d'affaires total ?",
          options: [
            "MAX(montant)",
            "SUM(montant)",
            "COUNT(montant)",
            "AVG(montant)"
          ],
          correct: "SUM(montant)",
          explanation: "SUM additionne les montants."
        }
      ],

      intermediaire: [
        {
          text: "Quelle est la différence entre WHERE et HAVING ?",
          options: [
            "WHERE filtre avant GROUP BY et HAVING après",
            "HAVING trie seulement",
            "WHERE fonctionne uniquement avec JOIN",
            "Aucune différence"
          ],
          correct: "WHERE filtre avant GROUP BY et HAVING après",
          explanation: "WHERE filtre les lignes, HAVING filtre les groupes."
        },
        {
          text: "Qu'est-ce qu'une sous-requête ?",
          options: [
            "Une copie de table",
            "Une requête dans une autre requête",
            "Un type de clé",
            "Une jointure obligatoire"
          ],
          correct: "Une requête dans une autre requête",
          explanation: "Une sous-requête est imbriquée dans une requête principale."
        },
        {
          text: "Quel mot-clé commence une CTE ?",
          options: [
            "TEMP",
            "DEFINE",
            "WITH",
            "CREATE CTE"
          ],
          correct: "WITH",
          explanation: "Une CTE commence par WITH."
        },
        {
          text: "Pourquoi utiliser une CTE ?",
          options: [
            "Pour structurer une requête complexe",
            "Pour empêcher les jointures",
            "Pour supprimer les doublons automatiquement",
            "Pour remplacer toutes les tables"
          ],
          correct: "Pour structurer une requête complexe",
          explanation: "Une CTE rend une requête plus lisible."
        },
        {
          text: "Quel calcul donne la moyenne par département ?",
          options: [
            "AVG(departement)",
            "AVG(salaire) GROUP BY departement",
            "COUNT(departement)",
            "SUM(departement)"
          ],
          correct: "AVG(salaire) GROUP BY departement",
          explanation: "Les salaires sont regroupés par département."
        },
        {
          text: "Quelle clause trie les résultats agrégés ?",
          options: [
            "DISTINCT",
            "ORDER BY",
            "ON",
            "WHERE"
          ],
          correct: "ORDER BY",
          explanation: "ORDER BY trie le résultat final."
        },
        {
          text: "Quelle condition sélectionne les prix supérieurs à la moyenne ?",
          options: [
            "WHERE prix > AVG(prix)",
            "ORDER BY AVG(prix)",
            "WHERE prix > (SELECT AVG(prix) FROM produits)",
            "HAVING prix > AVG(prix)"
          ],
          correct: "WHERE prix > (SELECT AVG(prix) FROM produits)",
          explanation: "La sous-requête calcule la moyenne."
        },
        {
          text: "Quelle requête trouve les départements avec plus de 10 employés ?",
          options: [
            "WHERE COUNT(*) > 10",
            "GROUP BY departement HAVING COUNT(*) > 10",
            "ORDER BY COUNT(*) > 10",
            "DISTINCT COUNT(*) > 10"
          ],
          correct: "GROUP BY departement HAVING COUNT(*) > 10",
          explanation: "HAVING filtre les groupes après le comptage."
        },
        {
          text: "Que fait COUNT(*) ?",
          options: [
            "Compte toutes les lignes",
            "Compte seulement les textes",
            "Calcule une moyenne",
            "Retourne le maximum"
          ],
          correct: "Compte toutes les lignes",
          explanation: "COUNT(*) compte toutes les lignes du résultat."
        },
        {
          text: "Quel mot-clé donne un nom à une CTE ?",
          options: [
            "WITH nom AS",
            "CREATE nom AS",
            "TEMP nom",
            "NAME nom"
          ],
          correct: "WITH nom AS",
          explanation: "La syntaxe standard est WITH nom AS (...)."
        }
      ],

      avance: [
        {
          text: "Quelle fonction numérote les lignes ?",
          options: [
            "COUNT()",
            "ROW_NUMBER()",
            "SUM()",
            "RANK_TABLE()"
          ],
          correct: "ROW_NUMBER()",
          explanation: "ROW_NUMBER attribue un numéro aux lignes."
        },
        {
          text: "À quoi sert PARTITION BY ?",
          options: [
            "Créer un classement par groupe",
            "Supprimer les départements",
            "Créer une table",
            "Désactiver ORDER BY"
          ],
          correct: "Créer un classement par groupe",
          explanation: "PARTITION BY sépare le calcul par groupe."
        },
        {
          text: "Avec ORDER BY salaire DESC, qui est premier ?",
          options: [
            "Le plus petit salaire",
            "Le salaire moyen",
            "Le plus grand salaire",
            "Un salaire aléatoire"
          ],
          correct: "Le plus grand salaire",
          explanation: "DESC trie du plus grand au plus petit."
        },
        {
          text: "Quelle différence entre RANK et ROW_NUMBER ?",
          options: [
            "RANK conserve les égalités, ROW_NUMBER numérote chaque ligne",
            "Aucune",
            "ROW_NUMBER supprime les égalités",
            "RANK ne trie pas"
          ],
          correct: "RANK conserve les égalités, ROW_NUMBER numérote chaque ligne",
          explanation: "RANK attribue le même rang aux égalités."
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
          explanation: "OVER permet d'utiliser une fonction de fenêtre."
        },
        {
          text: "Quelle syntaxe crée une CTE ?",
          options: [
            "CTE nom = SELECT",
            "WITH nom AS (SELECT ...)",
            "CREATE CTE SELECT",
            "TEMP nom FROM SELECT"
          ],
          correct: "WITH nom AS (SELECT ...)",
          explanation: "WITH nom AS est la syntaxe d'une CTE."
        },
        {
          text: "Que permet EXISTS ?",
          options: [
            "Trier une table",
            "Vérifier qu'une sous-requête retourne une ligne",
            "Supprimer les doublons",
            "Calculer une somme"
          ],
          correct: "Vérifier qu'une sous-requête retourne une ligne",
          explanation: "EXISTS retourne vrai si une ligne existe."
        },
        {
          text: "Quelle technique trouve le meilleur salaire par département ?",
          options: [
            "ROW_NUMBER avec PARTITION BY",
            "SELECT DISTINCT uniquement",
            "DELETE avec GROUP BY",
            "ORDER BY global seulement"
          ],
          correct: "ROW_NUMBER avec PARTITION BY",
          explanation: "Le classement est séparé pour chaque département."
        },
        {
          text: "Quelle clause conserve les lignes individuelles avec une agrégation ?",
          options: [
            "GROUP BY seulement",
            "Une fonction de fenêtre avec OVER",
            "DISTINCT seulement",
            "HAVING seulement"
          ],
          correct: "Une fonction de fenêtre avec OVER",
          explanation: "Les fonctions de fenêtre calculent sans réduire les lignes."
        },
        {
          text: "Pourquoi utiliser une sous-requête ?",
          options: [
            "Pour fournir un résultat à une requête principale",
            "Pour supprimer la base",
            "Pour éviter toutes les colonnes",
            "Pour rendre les règles Firebase actives"
          ],
          correct: "Pour fournir un résultat à une requête principale",
          explanation: "Une sous-requête produit une valeur ou un ensemble utilisé ailleurs."
        }
      ]
    }
  }
};
