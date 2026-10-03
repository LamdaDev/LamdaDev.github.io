import { experience, projects, skills } from './content';

const frenchSkillTitles = ['Langages', 'Interfaces Web et mobiles', 'Backend et infrastructure', 'Infonuagique et données', 'Outils de développement', 'Et aussi'];

export const frContent = {
  skills: skills.map((skill, index) => ({ ...skill, title: frenchSkillTitles[index] })),
  coursework: ['Architecture des ordinateurs', 'Structures de données et algorithmes', 'Systèmes d’exploitation', 'Intelligence artificielle', 'Apprentissage profond', 'Bases de données', 'Programmation orientée objet'],
  projects: [
    {
      ...projects[0],
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
  experience: [
    {
      ...experience[0],
      role: 'Stagiaire en développement logiciel',
      dates: 'Janvier 2026 – Août 2026',
      description: 'Développement de la logique de gestion des défaillances en Go pour un microservice 5G, conteneurisé avec Docker et déployé sur Kubernetes.',
      highlight: '10+ composants migrés de C++ vers Go · 99 % de couverture de code dans SonarCloud',
      details: [
        'Gestion de 6 événements de déclenchement et de résolution d’alarmes pour 3 conditions de défaillance, et publication de télémétrie dans Kafka.',
        'Refactorisation et migration de 10+ composants de service de C++ vers Go, avec sérialisation JSON personnalisée, évaluation de politiques par masques de bits et recherche de groupes TAI.',
        'Prise en charge du rôle de Scrum Master après une réorganisation de l’équipe, avec animation des mêlées quotidiennes et de la planification des sprints, et résolution des obstacles rencontrés par les collègues.',
      ],
    },
    {
      ...experience[1],
      role: 'Stagiaire en développement logiciel',
      dates: 'Mai 2024 – Août 2024 et Mai 2025 – Août 2025',
      description: 'Création de pipelines ETL évolutifs en Python et SQL dans Databricks, Azure et SQL Server pour migrer des données de production sur les expéditions vers Snowflake pour les opérations de logistique maritime.',
      highlight: '30,000,000+ enregistrements d’expédition migrés · 60 minutes gagnées par exécution du flux de travail',
      details: [
        'Migration de 30,000,000+ enregistrements de production sur les expéditions vers Snowflake pour les opérations de logistique maritime.',
        'Migration de 10,000+ enregistrements SharePoint et de 10+ jeux de données Power BI vers Databricks.',
        'Normalisation des sources de données et réduction du temps d’exécution des flux de travail Azure DevOps de 60 minutes par exécution.',
      ],
    },
    {
      ...experience[2],
      role: 'Stagiaire en développement d’interfaces Web',
      dates: 'Septembre 2023 – Décembre 2023',
      description: 'Développement de modèles adaptatifs en HTML/CSS/JavaScript avec AMPScript et Salesforce Marketing Cloud pour des campagnes clients par lots, de cycle de vie et en temps réel.',
      highlight: 'Composants de contenu réutilisables pour des campagnes internationales',
      details: [
        'Création de composants de contenu réutilisables pour la localisation, améliorant la maintenabilité et la cohérence des campagnes de marketing internationales.',
      ],
    },
    {
      ...experience[3],
      role: 'Stagiaire en développement logiciel',
      dates: 'Avril 2022 – Juillet 2022',
      description: 'Conversion des exigences en maquettes Figma et création de nouvelles interfaces mobiles avec Flutter pour une application de point de vente.',
      highlight: 'Des exigences Figma aux interfaces mobiles fonctionnelles',
      details: [
        'Développement de nouvelles fonctionnalités en Dart et prise en main rapide du langage et de l’environnement macOS dès la première semaine.',
      ],
    },
  ],
};
