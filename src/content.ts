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
  { title: 'Also in the mix', icon: 'star', items: ['Figma', 'Power BI', 'Azure DevOps', 'AMPScript', 'Salesforce Marketing Cloud', 'GeoJSON', 'GTFS', 'Google Maps', 'Google Calendar'] },
] as const;

export const coursework = ['Computer Architecture', 'Data Structures & Algorithms', 'Operating Systems', 'Artificial Intelligence', 'Deep Learning', 'Databases', 'Object-Oriented Programming'];

export const projects = [
  {
    id: 'transit', title: 'TransitOps Montreal', dates: 'July 2026 – Present', status: 'In progress',
    caption: 'A clearer picture of route health.',
    description: 'A transit operations dashboard being built to surface vehicle activity, stale updates, service gaps, and potential bus bunching from live or simulated STM snapshots.',
    tech: ['Go', 'React', 'TypeScript', 'PostgreSQL', 'GTFS'],
    details: ['Building a full-stack dashboard and ingestion pipeline using public GTFS data.', 'Implementing metrics for active vehicles, outdated location updates, route gaps, and bus bunching risk.', 'Designing an LLM operations analyst that recommends service actions from telemetry using an agentic loop. This feature is still in the design stage.'],
    url: 'https://github.com/LamdaDev/TransitOps-Montreal',
  },
  {
    id: 'campus', title: 'GitToCampus', dates: 'January 2026 – April 2026', status: '1st in cohort',
    caption: 'From campus to your classroom.',
    description: 'A mobile campus navigation app that helps students find practical routes and classrooms, with useful map and calendar information. I led an 11-member Agile team as Technical Lead.',
    tech: ['React Native', 'TypeScript', 'Expo', 'GeoJSON', 'Google Maps', 'Google Calendar'],
    details: ['Translated Figma mockups into mobile UI using React Native, TypeScript, and Expo.', 'Implemented classroom navigation using Dijkstra’s algorithm and processed GeoJSON coordinate data.', 'Integrated Google Maps and Google Calendar for campus routing.', 'Awarded first place in the cohort by the professor.'],
    url: 'https://github.com/LamdaDev/GitToCampus',
  },
] as const;

export const experience = [
  {
    company: 'Ericsson', logo: '/assets/companies/ericsson.png', tone: 'lavender', role: 'Software Developer Intern', dates: 'January 2026 – August 2026',
    description: 'Developed fault management logic in Go for a 5G microservice, containerized with Docker and deployed on Kubernetes.',
    highlight: '10+ components migrated from C++ to Go · 99% code coverage in SonarCloud',
    details: ['Handled 6 raise/clear alarm events across 3 fault conditions and published fault telemetry to Kafka.', 'Refactored and migrated 10+ service components from C++ to Go, implementing custom JSON serialization, bitmask-based policy evaluation, and TAI group lookup logic.', 'Assumed Scrum Master responsibilities after a team reorganization, leading daily stand-ups and sprint planning while removing blockers for teammates.'],
  },
  {
    company: 'The CSL Group Inc.', logo: '/assets/companies/csl-group.png', tone: 'mint', role: 'Software Developer Intern', dates: 'May 2024 – August 2024 and May 2025 – August 2025',
    description: 'Built scalable Python and SQL ETL pipelines across Databricks, Azure, and SQL Server to migrate production shipment data into Snowflake for maritime logistics operations.',
    highlight: '30,000,000+ shipment records migrated · 60 minutes saved per workflow run',
    details: ['Migrated 30,000,000+ production shipment records into Snowflake for maritime logistics operations.', 'Migrated 10,000+ SharePoint records and 10+ Power BI datasets into Databricks.', 'Standardized data sources and reduced Azure DevOps workflow runtime by 60 minutes per run.'],
  },
  {
    company: 'Ubisoft', logo: '/assets/companies/ubisoft.png', tone: 'peach', role: 'Frontend Developer Intern', dates: 'September 2023 – December 2023',
    description: 'Developed responsive HTML/CSS/JavaScript templates with AMPScript and Salesforce Marketing Cloud for batch, lifecycle, and real-time customer campaigns.',
    highlight: 'Reusable content components for international campaigns',
    details: ['Implemented reusable content components for localization, improving maintainability and consistency across international marketing campaigns.'],
  },
  {
    company: 'Categen Ventures', logo: '/assets/companies/categen.png', tone: 'blue', role: 'Software Developer Intern', dates: 'April 2022 – July 2022',
    description: 'Translated requirements into Figma mockups and built new mobile interfaces in Flutter for a point-of-sale app.',
    highlight: 'From Figma requirements to functional mobile interfaces',
    details: ['Built new features in Dart, quickly ramping up on the language and the macOS environment within the first week.'],
  },
] as const;
