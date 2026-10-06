export const links = {
  github: 'https://github.com/LamdaDev',
  linkedin: 'https://www.linkedin.com/in/lamdaniel1/',
  email: 'lam.daniel.123@hotmail.com',
  resume: '/assets/Daniel_Lam_CV_SWE.pdf',
} as const;

export const skills = [
  { title: 'Languages', icon: 'code', items: ['Go', 'TypeScript', 'JavaScript', 'Python', 'Java', 'C++', 'SQL', 'C#', 'Dart', 'Kotlin'] },
  { title: 'Frontend & Mobile', icon: 'window', items: ['React', 'React Native', 'Expo', 'HTML/CSS', 'Flutter'] },
  { title: 'Backend & Infrastructure', icon: 'server', items: ['Node.js', 'Express.js', 'REST APIs', 'Kubernetes', 'Docker', 'Kafka', 'Linux', 'CI/CD'] },
  { title: 'Cloud & Data', icon: 'data', items: ['AWS', 'Microsoft Azure', 'Databricks', 'Snowflake', 'PostgreSQL', 'SQL Server', 'MySQL', 'MongoDB', 'GraphQL'] },
  { title: 'Developer Tools', icon: 'tool', items: ['Git', 'GitLab', 'Gerrit', 'Jenkins', 'SonarCloud', 'Jest', 'Postman', 'Agile/Scrum'] },
  { title: 'Also in the mix', icon: 'star', items: ['Figma', 'Power BI', 'Azure DevOps', 'AMPscript', 'Salesforce Marketing Cloud', 'GeoJSON', 'GTFS', 'Google Maps', 'Google Calendar'] },
] as const;

export const coursework = ['Computer Architecture', 'Data Structures & Algorithms', 'Operating Systems', 'Artificial Intelligence', 'Deep Learning', 'Databases', 'Object-Oriented Programming'];

export const projects = [
  {
    id: 'babbli', title: 'Babbli', dates: 'September 2026', status: '4 hackathon awards',
    caption: 'Practice real conversations before you have to live them.',
    description: 'A gamified language-learning simulator where you practice real conversations with AI characters, from a Paris café to a ramen shop, in six languages. I built it solo at Hack the Hill III, where it won 4 awards:',
    awards: [
      { icon: '🥉', name: 'Winner of General Challenge: Third Place' },
      { icon: '🎙️', name: 'Best Project Built with ElevenLabs', note: 'Best Use of ElevenLabs' },
      { icon: '📚', name: 'Best Educational Project', note: 'MathemaTech: Education for Everyone' },
      { icon: '🎨', name: 'Best UI/UX' },
    ],
    tech: ['TypeScript', 'React', 'Next.js', 'ElevenLabs'],
    details: ['Built a language-learning simulator with TypeScript, React, Next.js, and ElevenLabs for AI-powered conversations in English, French, Spanish, Mandarin, Korean, and Japanese.', 'Engineered deterministic AI agents that support 17+ quintillion conversations, verified by 1,600+ automated tests.', 'Built speech analysis that scores learners based on 5 skills, including speaking pace, vocabulary, and filler words.'],
    links: [{ kind: 'site', url: 'https://babbli.study/' }, { kind: 'devpost', url: 'https://devpost.com/software/babbli' }, { kind: 'repo', url: 'https://github.com/LamdaDev/Babbli' }],
  },
  {
    id: 'campus', title: 'GitToCampus', dates: 'January 2026 – April 2026', status: '1st in cohort',
    caption: 'From campus to your classroom.',
    description: 'A mobile campus navigation app that helps students find practical routes and classrooms, with useful map and calendar information. I led an 11-member Agile team as Technical Lead.',
    tech: ['React Native', 'TypeScript', 'Expo', 'GeoJSON', 'Google Maps', 'Google Calendar'],
    details: ['Translated Figma mockups into mobile UI using React Native, TypeScript, and Expo.', 'Implemented classroom navigation using Dijkstra’s algorithm and processed GeoJSON coordinate data.', 'Integrated Google Maps and Google Calendar for campus routing.', 'Awarded first place in the cohort by the professor.'],
    links: [{ kind: 'repo', url: 'https://github.com/LamdaDev/GitToCampus' }],
  },
] as const;

/** Further work behind the "More Projects" disclosure at the end of the Projects section. */
export const moreProjects = [
  {
    id: 'transit', title: 'TransitOps Montreal', dates: 'July 2026 – Present', status: 'In progress',
    caption: 'A clearer picture of route health.',
    description: 'A transit operations dashboard being built to surface vehicle activity, stale updates, service gaps, and potential bus bunching from live or simulated STM snapshots.',
    tech: ['Go', 'React', 'TypeScript', 'PostgreSQL', 'GTFS'],
    details: ['Building a full-stack dashboard and ingestion pipeline using public GTFS data.', 'Implementing metrics for active vehicles, outdated location updates, route gaps, and bus bunching risk.', 'Designing an LLM operations analyst that recommends service actions from telemetry using an agentic loop. This feature is still in the design stage.'],
    links: [{ kind: 'repo', url: 'https://github.com/LamdaDev/TransitOps-Montreal' }],
  },
] as const;

export const experience = [
  {
    company: 'Ericsson', logo: '/assets/companies/ericsson.png', tone: 'lavender', role: 'Software Developer Intern', dates: 'January 2026 – August 2026',
    description: 'Modernized a 5G network-slicing microservice with Go, Docker, and Kubernetes, and implemented its fault management with Kafka telemetry.',
    highlight: '10+ components migrated from C++ to Go · 99% unit test coverage · 130+ Robot Framework tests',
    details: ['Modernized a 5G network-slicing microservice using Docker and Kubernetes, migrating 10+ core components from C++ to Go while achieving 99% unit test coverage.', 'Implemented fault management with Kafka telemetry, then designed and validated 130+ Robot Framework tests to achieve a 100% passing rate.', 'Assumed Scrum Master responsibilities after a team reorganization, leading daily stand-ups and sprint planning while removing blockers for teammates.'],
  },
  {
    company: 'The CSL Group Inc.', logo: '/assets/companies/csl-group.png', tone: 'mint', role: 'Software Developer Intern', dates: 'May 2024 – August 2024 and May 2025 – August 2025',
    description: 'Engineered Python and SQL ETL pipelines with Databricks and Azure DevOps, migrating real-time shipment records into Snowflake for maritime logistics operations.',
    highlight: '30M+ shipment records migrated · Runtime cut by 60 minutes · 12 Power BI dashboards validated',
    details: ['Engineered ETL pipelines using Python, SQL, Databricks, and Azure DevOps to migrate 30M+ real-time shipment records into Snowflake, cutting runtime by 60 minutes.', 'Automated the migration of 10K+ SharePoint records into Databricks and resolved dataset mismatches to reconfigure and validate 12 Power BI dashboards.'],
  },
  {
    company: 'Ubisoft', logo: '/assets/companies/ubisoft.png', tone: 'peach', role: 'Frontend Developer Intern', dates: 'September 2023 – December 2023',
    description: 'Translated design specifications into HTML, CSS, and AMPscript templates in Salesforce Marketing Cloud for Ubisoft’s CRM campaigns.',
    highlight: 'CRM campaigns for 7+ major Ubisoft releases · Reusable components for international markets',
    details: ['Translated design specifications into HTML, CSS, and AMPscript templates in Salesforce Marketing Cloud for CRM campaigns supporting 7+ major Ubisoft releases.', 'Architected reusable email components and localization templates to support scalable campaign development across international markets.'],
  },
  {
    company: 'Categen Ventures', logo: '/assets/companies/categen.png', tone: 'blue', role: 'Software Developer Intern', dates: 'April 2022 – July 2022',
    description: 'Translated Figma designs into a point-of-sale delivery system, building its mobile interfaces with Dart and Flutter.',
    highlight: 'A POS delivery system built from the ground up',
    details: ['Built a POS delivery system from the ground up, translating Figma designs into features for authentication, restaurant layouts, reservations, takeout, orders, and customer management.', 'Developed mobile interfaces in Dart/Flutter, adding lazy loading and skeleton screens to improve UI/UX.'],
  },
] as const;
