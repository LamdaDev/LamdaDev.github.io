import { experience, moreProjects, projects, skills } from './content';

const frenchSkillTitles = ['Langages', 'Interfaces Web et mobiles', 'Backend et infrastructure', 'Infonuagique et données', 'Outils de développement', 'Et aussi'];

export const frContent = {
  skills: skills.map((skill, index) => ({ ...skill, title: frenchSkillTitles[index] })),
  coursework: ['Architecture des ordinateurs', 'Structures de données et algorithmes', 'Systèmes d’exploitation', 'Intelligence artificielle', 'Apprentissage profond', 'Bases de données', 'Programmation orientée objet'],
  projects: [
    {
      ...projects[0],
      dates: 'Septembre 2026',
      status: '4 prix au hackathon',
      caption: 'Pratiquez de vraies conversations avant de devoir les vivre.',
      description: 'Un simulateur ludique d’apprentissage des langues pour pratiquer de vraies conversations avec des personnages animés par l’IA, d’un café parisien à un restaurant de ramen, en six langues. Je l’ai conçu seul au hackathon Hack the Hill III, où il a remporté 4 prix :',
      awards: [
        { icon: '🥉', name: 'Gagnant du défi général : troisième place' },
        { icon: '🎙️', name: 'Meilleur projet conçu avec ElevenLabs', note: 'Meilleure utilisation d’ElevenLabs' },
        { icon: '📚', name: 'Meilleur projet éducatif', note: 'MathemaTech : l’éducation pour tous' },
        { icon: '🎨', name: 'Meilleure UI/UX' },
      ],
      details: [
        'Création d’un simulateur d’apprentissage des langues avec TypeScript, React, Next.js et ElevenLabs pour des conversations propulsées par l’IA en anglais, en français, en espagnol, en mandarin, en coréen et en japonais.',
        'Conception d’agents d’IA déterministes qui prennent en charge plus de 17 milliards de milliards de conversations, vérifiées par plus de 1\u00a0600 tests automatisés.',
        'Développement d’une analyse de la parole qui évalue les apprenants selon 5 compétences, dont le débit, le vocabulaire et les mots de remplissage.',
      ],
    },
    {
      ...projects[1],
      dates: 'Janvier 2026 – Avril 2026',
      status: '1re place de la cohorte',
      caption: 'Du campus à votre salle de cours.',
      description: 'Une application mobile de navigation sur le campus qui aide les étudiants à trouver des itinéraires pratiques et des salles de cours, avec des cartes et des renseignements de calendrier utiles. J’ai dirigé une équipe Agile de 11 personnes comme responsable technique.',
      details: [
        'Conversion de maquettes Figma en interfaces mobiles avec React Native, TypeScript et Expo.',
        'Implémentation de la navigation vers les salles de cours avec l’algorithme de Dijkstra et traitement de coordonnées GeoJSON.',
        'Intégration de Google Maps et Google Calendar pour les itinéraires sur le campus.',
        'Première place de la cohorte décernée par le professeur.',
      ],
    },
  ],
  moreProjects: [
    {
      ...moreProjects[0],
      dates: 'Juillet 2026 – Aujourd’hui',
      status: 'En cours',
      caption: 'Une vue plus claire de la fiabilité des lignes.',
      description: 'Un tableau de bord des opérations de transport en cours de développement pour suivre l’activité des véhicules, les mises à jour périmées, les écarts de service et les risques de regroupement d’autobus à partir de données STM réelles ou simulées.',
      details: [
        'Développement d’un tableau de bord complet et d’un pipeline d’ingestion à partir de données GTFS publiques.',
        'Mise en place d’indicateurs pour les véhicules actifs, les positions périmées, les écarts entre autobus et les risques de regroupement.',
        'Conception d’un analyste des opérations fondé sur un LLM qui recommande des actions à partir de la télémétrie grâce à une boucle agentique. Cette fonctionnalité est encore à l’étape de conception.',
      ],
    },
  ],
  experience: [
    {
      ...experience[0],
      role: 'Stagiaire en développement logiciel',
      dates: 'Janvier 2026 – Août 2026',
      description: 'Modernisation d’un microservice de découpage de réseau 5G avec Go, Docker et Kubernetes, et mise en place de sa gestion des défaillances avec de la télémétrie Kafka.',
      highlight: '10+ composants migrés de C++ vers Go · 99 % de couverture par tests unitaires · 130+ tests Robot Framework',
      details: [
        'Modernisation d’un microservice de découpage de réseau 5G avec Docker et Kubernetes, et migration de 10+ composants essentiels de C++ vers Go, avec une couverture de 99 % par tests unitaires.',
        'Mise en place de la gestion des défaillances avec de la télémétrie Kafka, puis conception et validation de 130+ tests Robot Framework, avec un taux de réussite de 100 %.',
        'Prise en charge du rôle de Scrum Master après une réorganisation de l’équipe, avec animation des mêlées quotidiennes et de la planification des sprints, et résolution des obstacles rencontrés par les collègues.',
      ],
    },
    {
      ...experience[1],
      role: 'Stagiaire en développement logiciel',
      dates: 'Mai 2024 – Août 2024 et Mai 2025 – Août 2025',
      description: 'Conception de pipelines ETL en Python et SQL avec Databricks et Azure DevOps pour migrer des enregistrements d’expédition en temps réel vers Snowflake, au service des opérations de logistique maritime.',
      highlight: 'Plus de 30 M d’enregistrements migrés · Temps d’exécution réduit de 60 minutes · 12 tableaux de bord Power BI validés',
      details: [
        'Conception de pipelines ETL avec Python, SQL, Databricks et Azure DevOps pour migrer plus de 30 millions d’enregistrements d’expédition en temps réel vers Snowflake, en réduisant le temps d’exécution de 60 minutes.',
        'Automatisation de la migration de plus de 10\u00a0000 enregistrements SharePoint vers Databricks et correction d’incohérences entre jeux de données pour reconfigurer et valider 12 tableaux de bord Power BI.',
      ],
    },
    {
      ...experience[2],
      role: 'Stagiaire en développement d’interfaces Web',
      dates: 'Septembre 2023 – Décembre 2023',
      description: 'Conversion de spécifications de design en modèles HTML, CSS et AMPscript dans Salesforce Marketing Cloud pour les campagnes CRM d’Ubisoft.',
      highlight: 'Campagnes CRM pour 7+ sorties majeures d’Ubisoft · Composants réutilisables pour les marchés internationaux',
      details: [
        'Conversion de spécifications de design en modèles HTML, CSS et AMPscript dans Salesforce Marketing Cloud pour des campagnes CRM soutenant 7+ sorties majeures d’Ubisoft.',
        'Conception de composants de courriel réutilisables et de modèles de localisation pour soutenir le développement évolutif de campagnes sur les marchés internationaux.',
      ],
    },
    {
      ...experience[3],
      role: 'Stagiaire en développement logiciel',
      dates: 'Avril 2022 – Juillet 2022',
      description: 'Conversion de maquettes Figma en un système de livraison pour point de vente, avec des interfaces mobiles développées en Dart et Flutter.',
      highlight: 'Un système de livraison pour point de vente bâti de A à Z',
      details: [
        'Création d’un système de livraison pour point de vente à partir de zéro, en transformant des maquettes Figma en fonctionnalités d’authentification, de plans de salle, de réservations, de commandes à emporter, de gestion des commandes et de gestion de la clientèle.',
        'Développement d’interfaces mobiles en Dart/Flutter, avec chargement différé et écrans squelettes pour améliorer l’UI/UX.',
      ],
    },
  ],
};
