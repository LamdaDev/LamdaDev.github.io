import type { ReactNode } from 'react';
import { SceneSlot } from './components/SceneSlot';
import { MotionButton } from './components/MotionButton';
import { ThemeButton } from './components/ThemeButton';
import { BobaPicker } from './components/BobaPicker';
import { LanguageToggle } from './components/LanguageToggle';
import { MusicPlayer } from './components/MusicPlayer';
import { ExploreSceneButton, SceneExplorerProvider } from './components/SceneExplorer';
import { coursework, experience, links, projects, skills } from './content';
import { frContent } from './content.fr';
import { LanguageProvider, useLanguage, type Language } from './i18n';
type IconName = 'arrow' | 'external' | 'download' | 'code' | 'window' | 'server' | 'data' | 'tool' | 'star' | 'heart' | 'mail' | 'boba' | 'gym' | 'game';

function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
    external: <><path d="M14 4h6v6M20 4 10 14" /><path d="M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5" /></>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4" /></>,
    code: <><path d="m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18" /></>,
    window: <><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M3 9h18M7 7h.01M10 7h.01" /></>,
    server: <><rect x="3" y="3" width="18" height="7" rx="2" /><rect x="3" y="14" width="18" height="7" rx="2" /><path d="M7 6.5h.01M7 17.5h.01m4-11h6m-6 11h6" /></>,
    data: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0" /></>,
    tool: <><path d="m13 6 5 5M5 19l8-8M3 21l3-1-2-2-1 3ZM14 3l7 7-3 3-7-7 3-3Z" /></>,
    star: <path d="M10 2h4v6h6v4h-6v6h-4v-6H4V8h6V2Z" />,
    heart: <path d="M12 20 3.5 11.5C-2 6 6 0 12 6c6-6 14 0 8.5 5.5L12 20Z" />,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 6 9 7 9-7" /></>,
    boba: <><path d="M6 7h12l-2 14H8L6 7Zm-1 0h14M12 7l2-6h4" /><path d="M10 16h.01M14 17h.01M12 12h.01" /></>,
    gym: <><path d="M7 12h10M4 7v10m3-12v14M17 5v14m3-12v10M2 12h2m16 0h2" /></>,
    game: <><path d="M7 7h10c3 0 7 14 2 12l-4-4H9l-4 4C0 21 4 7 7 7Z" /><path d="M8 10v4m-2-2h4m6-1h.01m2 2h.01" /></>,
  };
  return <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function PixelStar({ className = '' }: { className?: string }) {
  return <svg viewBox="0 0 32 32" className={`pixel-star ${className}`} aria-hidden="true"><path fill="currentColor" d="M12 0h8v8h4v4h8v8h-8v4h-4v8h-8v-8H8v-4H0v-8h8V8h4Z" /></svg>;
}

function Brand() {
  const { text } = useLanguage();
  return <a className="brand" href="#top" aria-label={text('Daniel Lam, back to top', 'Daniel Lam, retour en haut')}><span className="brand-mark" aria-hidden="true">dl<span>✦</span></span><span>Daniel Lam<span className="brand-dot">.</span></span></a>;
}

function SectionLabel({ number, children }: { number: string; children: ReactNode }) {
  return <p className="section-label"><span>{number}</span>{children}</p>;
}

function SceneWindow({ kind, label, caption }: { kind: 'about' | 'skills' | 'projects' | 'experience'; label: string; caption: string }) {
  return <figure className={`scene-window scene-window--${kind}`}>
    <div className="window-bar"><span className="window-dots" aria-hidden="true"><i /><i /><i /></span><span>{label}</span><ExploreSceneButton kind={kind} className="window-corner" /></div>
    <SceneSlot kind={kind} />
    {kind === 'about' && <BobaPicker />}
    <figcaption><span className="caption-dot" aria-hidden="true" />{caption}</figcaption>
  </figure>;
}

export function TransitPreview() {
  const { text } = useLanguage();
  return <div className="project-preview project-preview--screenshot project-preview--transit" id="transit-preview">
    <div className="project-browser-bar"><span className="project-browser-dots" aria-hidden="true"><i /><i /><i /></span><span>{text('TransitOps / route health', 'TransitOps / état des lignes')}</span><a href="/assets/projects/transitops.png" target="_blank" rel="noreferrer" aria-label={text('Open the full TransitOps screenshot in a new tab', 'Ouvrir la capture complète de TransitOps dans un nouvel onglet')}><Icon name="external" /></a></div>
    <a className="project-dashboard-frame" href="/assets/projects/transitops.png" target="_blank" rel="noreferrer" aria-label={text('View the full TransitOps dashboard screenshot (opens in a new tab)', 'Voir la capture complète du tableau de bord TransitOps (nouvel onglet)')}>
      <img src="/assets/projects/transitops.png" alt={text('TransitOps Montreal dashboard showing route 24 Sherbrooke, vehicle locations, operational insights, and a route health timeline', 'Tableau de bord TransitOps Montreal montrant la ligne 24 Sherbrooke, la position des véhicules, des observations opérationnelles et une chronologie de l’état de la ligne')} width="1902" height="905" loading="lazy" decoding="async" />
    </a>
  </div>;
}

export function CampusPreview() {
  const { text } = useLanguage();
  return <div className="project-preview project-preview--screenshot project-preview--campus" id="campus-preview">
    <span className="project-device-label">{text('MOBILE APP', 'APPLICATION MOBILE')}</span>
    <a className="project-phone" href="/assets/projects/gittocampus.png" target="_blank" rel="noreferrer" aria-label={text('View the full GitToCampus mobile screenshot (opens in a new tab)', 'Voir la capture complète de GitToCampus sur mobile (nouvel onglet)')}>
      <img src="/assets/projects/gittocampus.png" alt={text("GitToCampus mobile app showing Concordia's downtown campus buildings on a map and the destination search field", 'Application GitToCampus montrant les bâtiments du campus de Concordia au centre-ville sur une carte et le champ de recherche de destination')} width="221" height="455" loading="lazy" decoding="async" />
    </a>
    <a className="project-device-note" href="/assets/projects/gittocampus.png" target="_blank" rel="noreferrer">{text('View full screenshot', 'Voir la capture complète')}<Icon name="external" /><span className="sr-only">{text(' (opens in a new tab)', ' (nouvel onglet)')}</span></a>
  </div>;
}

type PortfolioProject = {
  id: string; title: string; dates: string; status: string; caption: string;
  description: string; tech: readonly string[]; details: readonly string[]; url: string;
};

function ProjectCard({ project }: { project: PortfolioProject }) {
  const { text } = useLanguage();
  return <article className={`project-card project-card--${project.id}`}>
    {project.id === 'transit' ? <TransitPreview /> : <CampusPreview />}
    <div className="project-body">
      <div className="project-topline"><span className={`project-status status-${project.id}`}>{project.id === 'transit' ? <span className="status-dot" /> : <Icon name="star" />}{project.status}</span><span className="project-date">{project.dates}</span></div>
      <h3>{project.title}</h3><p className="project-caption">{project.caption}</p><p className="project-description">{project.description}</p>
      <ul className="tech-badges" aria-label={text('Technologies', 'Technologies utilisées')}>{project.tech.map(tech => <li key={tech}>{tech}</li>)}</ul>
      <details className="project-details" open={project.id === 'campus'}><summary>{text('Inside the build', 'Dans les coulisses du projet')}<span aria-hidden="true">+</span></summary><ul>{project.details.map((detail, index) => <li key={index}>{detail}</li>)}</ul></details>
      <a className="project-link" href={project.url} target="_blank" rel="noreferrer">{text('View repository', 'Voir le dépôt')}<Icon name="external" /><span className="sr-only">{text(` for ${project.title} (opens in a new tab)`, ` de ${project.title} (nouvel onglet)`)}</span></a>
    </div>
  </article>;
}

function ResumeLink({ hero = false }: { hero?: boolean }) {
  const { language, text } = useLanguage();
  return <a className={`resume-link${hero ? ' hero-resume' : ''}`} href={links.resume} download="Daniel_Lam_CV_SWE.pdf"
    aria-label={language === 'fr' ? 'Télécharger le CV de Daniel Lam en anglais (PDF)' : undefined}>
    <Icon name="download" />{text('Download résumé', 'Télécharger mon CV')}<span>{text('PDF', 'PDF · EN')}</span>
  </a>;
}

function Portfolio() {
  const { language, text } = useLanguage();
  const content = language === 'fr' ? frContent : { coursework, experience, projects, skills };
  return <SceneExplorerProvider>
    <a className="skip-link" href="#main">{text('Skip to content', 'Aller au contenu')}</a>
    <header className="site-header"><div className="nav-shell"><Brand />
      <nav className="main-nav" aria-label={text('Main navigation', 'Navigation principale')}>
        <div className="nav-about"><MusicPlayer /><a href="#about">{text('About', 'À propos')}</a></div><a href="#skills">{text('Skills', 'Compétences')}</a><a href="#projects">{text('Projects', 'Projets')}</a><a href="#experience">{text('Experience', 'Expérience')}</a><a href="#contact">Contact</a>
      </nav>
      <div className="nav-actions"><LanguageToggle /><ThemeButton /><MotionButton /><a className="nav-hello" href={`mailto:${links.email}`}>{text('Say hello', 'Dire bonjour')}<Icon name="external" /></a></div>
    </div></header>
    <main id="main">
      <section className="hero shell" id="top" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-line" />{text('SOFTWARE DEVELOPER & CURIOUS HUMAN', 'DÉVELOPPEUR ET ESPRIT CURIEUX')}</p>
          <h1 id="hero-title"><span>Daniel</span><span>Lam<span className="name-dot">.</span><PixelStar className="name-star" /></span></h1>
          <p className="hero-value">{text('I build reliable backend services, data pipelines, and intuitive web and mobile applications.', 'Je crée des services backend fiables, des pipelines de données et des applications Web et mobiles intuitives.')}</p>
          <div className="hero-actions"><a className="button button-primary" href="#projects">{text('View my work', 'Voir mes projets')}<Icon name="arrow" /></a><a className="button button-secondary" href="#contact">{text('Get in touch', 'Me contacter')}<Icon name="mail" /></a></div>
          <ResumeLink hero />
          <p className="hero-footnote"><span aria-hidden="true">⌁</span>{text(' Software Engineering Co-op student', ' Étudiant en génie logiciel au programme coop')}<br className="mobile-break" />{text(' at Concordia University', ' à l’Université Concordia')}</p>
        </div>
        <div className="hero-art"><span className="hero-hello pixel-label"><span aria-hidden="true">✦</span> {text('HELLO, WORLD!', 'BONJOUR, LE MONDE !')}</span><div className="hero-orbit" aria-hidden="true" /><SceneSlot kind="hero" /><ExploreSceneButton kind="hero" className="hero-explore" /><span className="hero-sticker"><Icon name="heart" />{text('Code, curiosity & boba.', 'Code, curiosité et boba.')}</span><PixelStar className="hero-star-one" /><PixelStar className="hero-star-two" /></div>
        <a href="#about" className="scroll-cue"><span className="scroll-mouse" aria-hidden="true" />{text('A little more about me', 'Un peu plus sur moi')}<span aria-hidden="true">↓</span></a>
      </section>
      <div className="chapter-divider shell" aria-hidden="true"><span /><PixelStar /><span /></div>
      <section className="section shell about-section" id="about" aria-labelledby="about-title"><div className="about-layout">
        <div className="about-scene"><SceneWindow kind="about" label={text('THE BOBA BREAK', 'LA PAUSE BOBA')} caption={text('A little sip of happiness.', 'Une petite gorgée de bonheur.')} />
          <ul className="interest-tags" aria-label={text('Personal interests', 'Centres d’intérêt')}><li><Icon name="boba" />{text('Boba enthusiast', 'Amateur de boba')}</li><li><Icon name="gym" />{text('Gym regular', 'Habitué du gym')}</li><li><Icon name="game" />{text('PC gamer', 'Joueur sur PC')}</li></ul>
        </div>
        <div className="about-copy content-layer"><SectionLabel number="01">{text('A LITTLE ABOUT ME', 'QUELQUES MOTS SUR MOI')}</SectionLabel>
          <h2 id="about-title">{text('A developer, with', 'Un développeur, avec')}<br />{text('a side of ', 'une touche de ')}<span className="underline-accent">boba.</span></h2>
          <p>{text('I’m Daniel, a Software Engineering Co-op student at Concordia University in Montreal. I’ve worked on Go services for 5G systems, maritime data pipelines, responsive campaign interfaces, and mobile apps.', 'Je m’appelle Daniel et j’étudie en génie logiciel au programme coop de l’Université Concordia, à Montréal. J’ai travaillé sur des services Go pour des systèmes 5G, des pipelines de données maritimes, des interfaces de campagne adaptatives et des applications mobiles.')}</p>
          <p>{text('I enjoy making complex systems easier to work with, from reliable backends to thoughtful interfaces, and helping teams build them together. Away from the keyboard, you’ll find me grabbing boba, lifting at the gym, or gaming on my PC.', 'J’aime rendre les systèmes complexes plus simples à utiliser, des services backend fiables aux interfaces bien pensées, et aider les équipes à les construire ensemble. Loin du clavier, je prends un boba, je m’entraîne au gym ou je joue sur mon PC.')}</p>
          <div className="education-card"><div className="education-icon" aria-hidden="true">⌘</div><div><h3>{text('Concordia University', 'Université Concordia')}</h3><p>{text('Bachelor of Engineering in Software Engineering (Co-op)', 'Baccalauréat en génie logiciel (programme coop)')}</p><p className="education-meta">{text('September 2022 – May 2027 (expected)', 'Septembre 2022 – mai 2027 (prévu)')} <span>·</span> {text('Montreal, QC', 'Montréal, QC')}</p><details><summary>{text('Relevant coursework', 'Cours pertinents')}<span aria-hidden="true">+</span></summary><p>{content.coursework.join(' · ')}</p></details></div></div>
        </div>
      </div></section>
      <section className="section shell skills-section" id="skills" aria-labelledby="skills-title"><div className="skills-layout">
        <div className="skills-scene"><SceneWindow kind="skills" label={text('THE GAMING CORNER', 'LE COIN GAMING')} caption={text('Curiosity is always in the toolkit.', 'La curiosité fait toujours partie des outils.')} /></div>
        <div className="skills-content content-layer"><SectionLabel number="02">{text('MY TOOLKIT', 'MA BOÎTE À OUTILS')}</SectionLabel><h2 id="skills-title">{text('The tools behind', 'Les outils derrière')}<br />{text('the things I build', 'mes projets')}<span className="purple-text">.</span></h2><p className="section-intro">{text('A mix of backend foundations, data tools, and thoughtful interfaces.', 'Des bases backend solides, des outils de données et des interfaces bien pensées.')}</p>
          <div className="skills-grid">{content.skills.map((group, index) => <article className="skill-card" key={index}><h3><span className="skill-icon"><Icon name={group.icon as IconName} /></span>{group.title}</h3><ul>{group.items.map(skill => <li key={skill}>{skill}</li>)}</ul></article>)}</div>
        </div>
      </div></section>
      <section className="section shell projects-section" id="projects" aria-labelledby="projects-title"><div className="projects-heading">
        <div className="projects-scene"><SceneWindow kind="projects" label={text('THE FOCUS DESK', 'LE BUREAU DE TRAVAIL')} caption={text('Code. Sip. Recharge. Repeat.', 'Coder. Boire. Recharger. Recommencer.')} /></div>
        <div className="projects-intro content-layer"><SectionLabel number="03">{text('SELECTED WORK', 'PROJETS CHOISIS')}</SectionLabel><h2 id="projects-title">{text('Built to solve', 'Des projets pour résoudre')}<br />{text('something ', 'des problèmes ')}<span className="underline-accent">{text('real.', 'concrets.')}</span></h2><p className="section-intro">{text('Two projects that bring together practical problems, thoughtful interfaces, and the systems behind them.', 'Deux projets qui réunissent des problèmes concrets, des interfaces bien pensées et les systèmes qui les soutiennent.')}</p><span className="project-count"><span aria-hidden="true">⌁</span>{text(' A closer look at what I’ve been building', ' Un aperçu de ce que je construis')}</span></div>
      </div><div className="project-grid content-layer">{content.projects.map(project => <ProjectCard key={project.id} project={project} />)}</div></section>
      <section className="section shell experience-section" id="experience" aria-labelledby="experience-title"><div className="experience-layout">
        <div className="experience-intro"><SceneWindow kind="experience" label={text('THE TRAINING ROOM', 'LA SALLE D’ENTRAÎNEMENT')} caption={text('Good work takes a few reps.', 'Le bon travail demande quelques répétitions.')} /><div className="experience-heading content-layer"><SectionLabel number="04">{text('EXPERIENCE', 'EXPÉRIENCE')}</SectionLabel><h2 id="experience-title">{text('Where I’ve', 'Là où j’ai')}<br />{text('put in the reps', 'fait mes preuves')}<span className="purple-text">.</span></h2><p className="section-intro">{text('Building, learning, and contributing alongside teams in Montreal.', 'Construire, apprendre et contribuer avec des équipes à Montréal.')}</p></div></div>
        <ol className="experience-timeline content-layer">{content.experience.map(job => <li className="experience-entry" key={job.company}><div className={`company-mark tone-${job.tone}`} aria-hidden="true"><img className="company-logo" src={job.logo} alt="" width="128" height="128" loading="lazy" decoding="async" /></div><div className="job-content"><p className="experience-date">{job.dates}</p><h3>{job.company}</h3><p className="job-role">{job.role}<span>{text('Montreal, QC', 'Montréal, QC')}</span></p><p className="job-description">{job.description}</p><p className="job-highlight"><Icon name="star" />{job.highlight}</p><details><summary>{text('More about this role', 'En savoir plus sur ce poste')}<span aria-hidden="true">+</span></summary><ul>{job.details.map((detail, index) => <li key={index}>{detail}</li>)}</ul></details></div></li>)}</ol>
      </div></section>
      <section className="contact-section shell" id="contact" aria-labelledby="contact-title"><div className="contact-panel"><div className="contact-copy content-layer"><SectionLabel number="05">{text('LET’S CONNECT', 'FAISONS CONNAISSANCE')}</SectionLabel><h2 id="contact-title">{text('Good things start', 'Les bonnes idées commencent')}<br />{text('with a ', 'par un ')}<span className="underline-accent">{text('hello.', 'bonjour.')}</span></h2><p>{text('Have a software engineering opportunity or something interesting to build together? I’d love to hear about it.', 'Vous avez une occasion en génie logiciel ou un projet intéressant à construire ensemble ? J’aimerais en discuter.')}</p><a className="contact-email" href={`mailto:${links.email}`}>{links.email}<Icon name="external" /></a><div className="contact-actions"><a className="button button-primary" href={`mailto:${links.email}`}>{text('Let’s talk', 'Discutons')}<Icon name="arrow" /></a><ResumeLink /></div></div><div className="contact-art" aria-hidden="true"><PixelStar className="contact-star-one" /><span className="mail-shadow"></span><div className="pixel-envelope"><span className="envelope-back"></span><span className="envelope-note"><svg viewBox="0 0 40 34"><path d="M0 4h4V0h12v4h8V0h12v4h4v16h-4v4h-4v4h-4v4h-4v2h-8v-2h-4v-4H8v-4H4v-4H0Z" fill="currentColor" /></svg></span><span className="envelope-front"></span></div><PixelStar className="contact-star-two" /><span className="contact-art-label pixel-label">{text('SAY HELLO!', 'DITES BONJOUR !')}</span></div></div></section>
    </main>
    <footer className="site-footer shell content-layer"><Brand /><p>{text('Made with care, code & a little boba.', 'Fait avec soin, du code et un peu de boba.')}<span className="footer-language">{text(' English or French, make yourself at home.', ' En français ou en anglais, faites comme chez vous.')}</span></p><nav aria-label={text('Social links', 'Liens sociaux')}><a href={links.github} target="_blank" rel="noreferrer">GitHub<Icon name="external" /><span className="sr-only">{text(' (opens in a new tab)', ' (nouvel onglet)')}</span></a><a href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn<Icon name="external" /><span className="sr-only">{text(' (opens in a new tab)', ' (nouvel onglet)')}</span></a><a href={`mailto:${links.email}`}>{text('Email', 'Courriel')}<Icon name="external" /></a></nav></footer>
  </SceneExplorerProvider>;
}

export default function App({ initialLanguage = 'en' }: { initialLanguage?: Language }) {
  return <LanguageProvider initialLanguage={initialLanguage}><Portfolio /></LanguageProvider>;
}