import type { ReactNode } from 'react';
import { SceneSlot } from './components/SceneSlot';
import { MotionButton } from './components/MotionButton';
import { ThemeButton } from './components/ThemeButton';
import { BobaPicker } from './components/BobaPicker';
import { ExploreSceneButton, SceneExplorerProvider } from './components/SceneExplorer';
import { coursework, experience, links, projects, skills } from './content';

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
  return <a className="brand" href="#top" aria-label="Daniel Lam, back to top"><span className="brand-mark" aria-hidden="true">dl<span>✦</span></span><span>Daniel Lam<span className="brand-dot">.</span></span></a>;
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

/** Replace this component's inner artwork with a real screenshot when available. */
export function TransitPreview() {
  return <div className="project-preview transit-preview" id="transit-preview" role="img" aria-label="Concept preview: transit dashboard with schematic routes and vehicle status panels; not an actual product screenshot.">
    <div className="transit-console">
      <div className="console-toolbar"><span className="mini-logo"><Icon name="window" />TransitOps</span><span className="console-toolbar-right"><i /><i /><i /></span></div>
      <div className="transit-layout"><div className="console-sidebar"><span className="sidebar-active">▦</span><span>⌁</span><span>☷</span><span>◷</span></div><div className="transit-dashboard"><div className="map-header"><span>Route overview</span><span>MONTRÉAL</span></div><svg className="route-map" viewBox="0 0 400 180" aria-hidden="true"><defs><pattern id="transit-grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0v30" fill="none" stroke="#e9e3ee" /></pattern></defs><rect width="400" height="180" fill="url(#transit-grid)" /><path d="M-10 145h92q28 0 28-28V73q0-27 27-27h98q25 0 25 25v30q0 25 25 25h130" fill="none" stroke="#9976db" strokeWidth="9" /><path d="M20-10v59q0 29 29 29h26q28 0 28 28v64h180q27 0 27-27V-10" fill="none" stroke="#8ac5a4" strokeWidth="9" /><path d="M-10 113h41q27 0 27-27V0m137 190V0" fill="none" stroke="#ecbc8d" strokeWidth="6" />{[[110, 92], [195, 46], [280, 126], [80, 170], [310, 58]].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="7" fill="white" stroke="#554965" strokeWidth="3" />)}<g transform="translate(142 35)"><rect width="25" height="19" rx="4" fill="#6D4CCF" /><rect x="4" y="3" width="17" height="7" rx="1" fill="#faf7ff" /><circle cx="6" cy="17" r="2" fill="#292638" /><circle cx="19" cy="17" r="2" fill="#292638" /></g></svg><div className="dashboard-metrics"><span><i className="metric-dot mint-dot" />Vehicle activity</span><span><i className="metric-dot peach-dot" />Update health</span><span><i className="metric-dot purple-dot" />Route gaps</span></div></div></div>
    </div><span className="concept-label">Concept preview</span>
  </div>;
}

/** Replace this component's inner artwork with a real screenshot when available. */
export function CampusPreview() {
  return <div className="project-preview campus-preview" id="campus-preview" role="img" aria-label="Concept preview: a campus navigation app with a classroom route inside a handheld console; not an actual product screenshot.">
    <div className="campus-preview-copy"><span className="pixel-label">NEXT STOP</span><strong>Your next<br />classroom.</strong><span className="little-route" aria-hidden="true">● ─ ─ ─ ◇</span></div>
    <div className="campus-device"><div className="device-speaker" /><div className="device-screen"><div className="campus-app-top"><span>GitToCampus</span><span>✦</span></div><svg viewBox="0 0 200 235" aria-hidden="true"><rect width="200" height="235" fill="#f4f6ed" /><path d="M0 75h200M50 0v235M150 0v235M0 174h200" stroke="#fff" strokeWidth="18" /><g fill="#dfded1" stroke="#c8c8bc" strokeWidth="1"><rect x="8" y="15" width="27" height="38" rx="4" /><rect x="72" y="13" width="54" height="37" rx="5" /><rect x="73" y="95" width="50" height="57" rx="5" /><rect x="165" y="99" width="28" height="54" rx="3" /><rect x="71" y="194" width="57" height="32" rx="4" /><rect x="10" y="102" width="25" height="41" rx="3" /></g><path d="M49 208V76h101v36" fill="none" stroke="#7956bd" strokeWidth="6" strokeLinejoin="round" strokeDasharray="8 5" /><circle cx="49" cy="208" r="10" fill="#e9e0fc" /><circle cx="49" cy="208" r="5" fill="#7956bd" /><path d="M138 100a12 12 0 1 1 24 0c0 9-12 20-12 20s-12-11-12-20Z" fill="#7956bd" /><circle cx="150" cy="99" r="4" fill="#fff" /><g fill="#9bc5a1"><circle cx="182" cy="33" r="10" /><circle cx="17" cy="210" r="9" /><circle cx="178" cy="204" r="12" /></g></svg><div className="campus-route-label"><span>↱</span><span>Find your classroom<small>Campus navigation</small></span></div></div><div className="device-controls" aria-hidden="true"><span className="dpad" /><span className="device-button" /><span className="device-button second" /></div></div>
    <PixelStar className="campus-star" /><span className="concept-label">Concept preview</span>
  </div>;
}

function ProjectCard({ project }: { project: typeof projects[number] }) {
  return <article className="project-card">{project.id === 'transit' ? <TransitPreview /> : <CampusPreview />}<div className="project-body"><div className="project-topline"><span className={`project-status status-${project.id}`}>{project.id === 'transit' ? <span className="status-dot" /> : <Icon name="star" />}{project.status}</span><span className="project-date">{project.dates}</span></div><h3>{project.title}</h3><p className="project-caption">{project.caption}</p><p className="project-description">{project.description}</p><ul className="tech-badges" aria-label="Technologies">{project.tech.map(tech => <li key={tech}>{tech}</li>)}</ul><details className="project-details"><summary>Inside the build<span aria-hidden="true">+</span></summary><ul>{project.details.map(detail => <li key={detail}>{detail}</li>)}</ul></details><a className="project-link" href={project.url} target="_blank" rel="noreferrer">View repository<Icon name="external" /><span className="sr-only"> for {project.title} (opens in a new tab)</span></a></div></article>;
}

export default function App() {
  return <SceneExplorerProvider>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header"><div className="nav-shell"><Brand /><nav className="main-nav" aria-label="Main navigation"><a href="#about">About</a><a href="#skills">Skills</a><a href="#projects">Projects</a><a href="#experience">Experience</a><a href="#contact">Contact</a></nav><div className="nav-actions"><ThemeButton /><MotionButton /><a className="nav-hello" href={`mailto:${links.email}`}>Say hello<Icon name="external" /></a></div></div></header>
    <main id="main">
      <section className="hero shell" id="top" aria-labelledby="hero-title">
        <div className="hero-art"><span className="hero-hello pixel-label"><span aria-hidden="true">✦</span> HELLO, WORLD!</span><div className="hero-orbit" aria-hidden="true" /><SceneSlot kind="hero" /><ExploreSceneButton kind="hero" className="hero-explore" /><span className="hero-sticker"><Icon name="heart" />Code, curiosity & boba.</span><PixelStar className="hero-star-one" /><PixelStar className="hero-star-two" /></div>
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-line" />SOFTWARE DEVELOPER & CURIOUS HUMAN</p>
          <h1 id="hero-title"><span>Daniel</span><span>Lam<span className="name-dot">.</span><PixelStar className="name-star" /></span></h1>
          <p className="hero-value">I build reliable backend services, data pipelines, and intuitive web and mobile applications.</p>
          <div className="hero-actions"><a className="button button-primary" href="#projects">View my work<Icon name="arrow" /></a><a className="button button-secondary" href="#contact">Get in touch<Icon name="mail" /></a></div>
          <a className="resume-link hero-resume" href={links.resume} download="Daniel_Lam_CV_SWE.pdf"><Icon name="download" />Download résumé<span>PDF</span></a>
          <p className="hero-footnote"><span aria-hidden="true">⌁</span> Software Engineering Co-op student<br className="mobile-break" /> at Concordia University</p>
        </div>
        <a href="#about" className="scroll-cue"><span className="scroll-mouse" aria-hidden="true" />A little more about me<span aria-hidden="true">↓</span></a>
      </section>
      <div className="chapter-divider shell" aria-hidden="true"><span /><PixelStar /><span /></div>
      <section className="section shell about-section" id="about" aria-labelledby="about-title"><div className="about-layout"><div className="about-scene"><SceneWindow kind="about" label="THE BOBA BREAK" caption="A little sip of happiness." /><ul className="interest-tags" aria-label="Personal interests"><li><Icon name="boba" />Boba enthusiast</li><li><Icon name="gym" />Gym regular</li><li><Icon name="game" />PC gamer</li></ul></div><div className="about-copy content-layer"><SectionLabel number="01">A LITTLE ABOUT ME</SectionLabel><h2 id="about-title">A developer, with<br />a side of <span className="underline-accent">boba.</span></h2><p>I’m Daniel, a Software Engineering Co-op student at Concordia University in Montreal. I’ve worked on Go services for 5G systems, maritime data pipelines, responsive campaign interfaces, and mobile apps.</p><p>I enjoy making complex systems easier to work with—from reliable backends to thoughtful interfaces—and helping teams build them together. Away from the keyboard, you’ll find me grabbing boba, lifting at the gym, or gaming on my PC.</p><div className="education-card"><div className="education-icon" aria-hidden="true">⌘</div><div><h3>Concordia University</h3><p>Bachelor of Engineering in Software Engineering (Co-op)</p><p className="education-meta">September 2022 – Present <span>·</span> Montreal, QC</p><details><summary>Relevant coursework<span aria-hidden="true">+</span></summary><p>{coursework.join(' · ')}</p></details></div></div></div></div></section>
      <section className="section shell skills-section" id="skills" aria-labelledby="skills-title"><div className="skills-layout"><div className="skills-scene"><SceneWindow kind="skills" label="THE GAMING CORNER" caption="Curiosity is always in the toolkit." /></div><div className="skills-content content-layer"><SectionLabel number="02">MY TOOLKIT</SectionLabel><h2 id="skills-title">The tools behind<br />the things I build<span className="purple-text">.</span></h2><p className="section-intro">A mix of backend foundations, data tools, and thoughtful interfaces.</p><div className="skills-grid">{skills.map(group => <article className="skill-card" key={group.title}><h3><span className="skill-icon"><Icon name={group.icon} /></span>{group.title}</h3><ul>{group.items.map(skill => <li key={skill}>{skill}</li>)}</ul></article>)}</div></div></div></section>
      <section className="section shell projects-section" id="projects" aria-labelledby="projects-title"><div className="projects-heading"><div className="projects-scene"><SceneWindow kind="projects" label="THE FOCUS DESK" caption="Code. Sip. Recharge. Repeat." /></div><div className="projects-intro content-layer"><SectionLabel number="03">SELECTED WORK</SectionLabel><h2 id="projects-title">Built to solve<br />something <span className="underline-accent">real.</span></h2><p className="section-intro">Two projects that bring together practical problems, thoughtful interfaces, and the systems behind them.</p><span className="project-count"><span aria-hidden="true">⌁</span> A closer look at what I’ve been building</span></div></div><div className="project-grid content-layer">{projects.map(project => <ProjectCard key={project.id} project={project} />)}</div></section>
      <section className="section shell experience-section" id="experience" aria-labelledby="experience-title"><div className="experience-layout"><div className="experience-intro"><SceneWindow kind="experience" label="THE TRAINING ROOM" caption="Good work takes a few reps." /><div className="experience-heading content-layer"><SectionLabel number="04">EXPERIENCE</SectionLabel><h2 id="experience-title">Where I’ve<br />put in the reps<span className="purple-text">.</span></h2><p className="section-intro">Building, learning, and contributing alongside teams in Montreal.</p></div></div><ol className="experience-timeline content-layer">{experience.map(job => <li className="experience-entry" key={job.company}><div className={`company-mark tone-${job.tone}`} aria-hidden="true">{job.initial}</div><div className="job-content"><p className="experience-date">{job.dates}</p><h3>{job.company}</h3><p className="job-role">{job.role}<span>Montreal, QC</span></p><p className="job-description">{job.description}</p><p className="job-highlight"><Icon name="star" />{job.highlight}</p><details><summary>More about this role<span aria-hidden="true">+</span></summary><ul>{job.details.map(detail => <li key={detail}>{detail}</li>)}</ul></details></div></li>)}</ol></div></section>
      <section className="contact-section shell" id="contact" aria-labelledby="contact-title"><div className="contact-panel"><div className="contact-copy content-layer"><SectionLabel number="05">LET’S CONNECT</SectionLabel><h2 id="contact-title">Good things start<br />with a <span className="underline-accent">hello.</span></h2><p>Have a software engineering opportunity or something interesting to build together? I’d love to hear about it.</p><a className="contact-email" href={`mailto:${links.email}`}>{links.email}<Icon name="external" /></a><div className="contact-actions"><a className="button button-primary" href={`mailto:${links.email}`}>Let’s talk<Icon name="arrow" /></a><a className="resume-link" href={links.resume} download="Daniel_Lam_CV_SWE.pdf"><Icon name="download" />Download résumé<span>PDF</span></a></div></div><div className="contact-art" aria-hidden="true"><PixelStar className="contact-star-one" /><span className="mail-shadow" /><div className="pixel-envelope"><span className="envelope-back" /><span className="envelope-note"><svg viewBox="0 0 40 34"><path d="M0 4h4V0h12v4h8V0h12v4h4v16h-4v4h-4v4h-4v4h-4v2h-8v-2h-4v-4H8v-4H4v-4H0Z" fill="currentColor" /></svg></span><span className="envelope-front" /></div><PixelStar className="contact-star-two" /><span className="contact-art-label pixel-label">SAY HELLO!</span></div></div></section>
    </main>
    <footer className="site-footer shell content-layer"><Brand /><p>Made with care, code & a little boba.</p><nav aria-label="Social links"><a href={links.github} target="_blank" rel="noreferrer">GitHub<Icon name="external" /><span className="sr-only"> (opens in a new tab)</span></a><a href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn<Icon name="external" /><span className="sr-only"> (opens in a new tab)</span></a><a href={`mailto:${links.email}`}>Email<Icon name="external" /></a></nav></footer>
  </SceneExplorerProvider>;
}
