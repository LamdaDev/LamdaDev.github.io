import type { SceneKind } from './runtime/sequence';

export type SceneDetail = { id: string; label: string; title: string; body: string };

/** Personal details use only information Daniel has supplied for this portfolio. */
export const sceneDetails: Record<SceneKind, readonly SceneDetail[]> = {
  hero: [
    { id: 'hero-greeting', label: 'Greeting', title: 'Hello from Montreal', body: 'I’m Daniel, a Software Engineering Co-op student at Concordia University in Montreal. Welcome to my little corner of the web.' },
    { id: 'hero-gamepad', label: 'Gamepad', title: 'A little player two energy', body: 'PC gaming is one of my hobbies. That’s why this portfolio has a small arcade streak running through it.' },
    { id: 'hero-star', label: 'Star', title: 'A team effort worth celebrating', body: 'Our professor awarded GitToCampus first place in the cohort. I led the 11-member Agile team behind the campus navigation app.' },
  ],
  about: [
    { id: 'about-menu', label: 'Menu', title: 'Boba belongs on the menu', body: 'Drinking boba is one of my hobbies, so the About section gets its own miniature boba shop. Pull up a seat.' },
    { id: 'about-drink', label: 'Tea cup', title: 'You’re choosing this round', body: 'Milk tea, matcha, or taro? Use the flavor buttons in the About section to change Daniel’s drink. The cup in this little world never runs out.' },
    { id: 'about-shelf', label: 'Shelf', title: 'Three things outside the code', body: 'Boba, weight lifting, and PC gaming: three of my interests, each with a place in these miniature scenes.' },
  ],
  skills: [
    { id: 'skills-monitor', label: 'Monitor', title: 'After the build finishes', body: 'I enjoy gaming on my PC. This scene gives that hobby a little headset, a glowing monitor, and an arcade game of its own.' },
    { id: 'skills-tower', label: 'PC tower', title: 'A different kind of toolkit', body: 'Away from the game, my toolkit includes Go, Python, TypeScript, React, and PostgreSQL, across backend, data, web, and mobile work.' },
    { id: 'skills-keyboard', label: 'Keyboard', title: 'Better with a team', body: 'I led an 11-member Agile team on GitToCampus, connecting mobile interfaces, classroom navigation, maps, and calendar information.' },
  ],
  projects: [
    { id: 'projects-monitor', label: 'Code screen', title: 'On the workbench', body: 'I’m building TransitOps Montreal with Go, React, TypeScript, and PostgreSQL to make transit route health easier to understand. It’s a work in progress.' },
    { id: 'projects-drink', label: 'Coke Zero', title: 'A tiny desk ritual', body: 'Code, Coke Zero, a short nap, repeat. A tiny desk-sized take on work and recharging.' },
    { id: 'projects-lamp', label: 'Desk lamp', title: 'Different problems, same curiosity', body: 'My work spans Go backend services at Ericsson, Python and SQL data pipelines at CSL, and responsive interfaces at Ubisoft.' },
  ],
  experience: [
    { id: 'experience-barbell', label: 'Barbell', title: 'A few reps away from the keyboard', body: 'Weight lifting is one of my hobbies. That’s the reason the Experience section lives in a miniature gym.' },
    { id: 'experience-water', label: 'Water', title: 'There’s room for a breather', body: 'The little gym loop includes both lifting and resting with water. Even this animated Daniel gets a pause between sets.' },
    { id: 'experience-towel', label: 'Towel', title: 'Reset, then try again', body: 'Think of this towel as a small reminder to regroup. In software, I bring that same spirit to iteration and working with a team.' },
  ],
};

export const sceneDetailLabels: Record<SceneKind, string> = {
  hero: 'welcome scene', about: 'boba shop', skills: 'gaming corner', projects: 'coding desk', experience: 'training room',
};
