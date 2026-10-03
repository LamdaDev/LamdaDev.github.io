import type { SceneKind } from './runtime/sequence';
import type { SceneDetail } from './sceneDetails';

/** French copies retain the original prop IDs so switching languages keeps selections. */
export const sceneDetailsFr: Record<SceneKind, readonly SceneDetail[]> = {
  hero: [
    { id: 'hero-greeting', label: 'Salutation', title: 'Bonjour de Montréal', body: 'Je suis Daniel, étudiant en génie logiciel en régime coopératif à l’Université Concordia, à Montréal. Bienvenue dans mon petit coin du Web.' },
    { id: 'hero-gamepad', label: 'Manette', title: 'Une petite touche de joueur deux', body: 'Les jeux sur PC font partie de mes loisirs. C’est pourquoi une petite ambiance arcade se glisse un peu partout dans ce portfolio.' },
    { id: 'hero-star', label: 'Étoile', title: 'Un travail d’équipe à célébrer', body: 'Notre professeur a attribué à GitToCampus la première place de la cohorte. J’ai dirigé l’équipe Agile de 11 personnes qui a créé cette application de navigation sur le campus.' },
  ],
  about: [
    { id: 'about-menu', label: 'Menu', title: 'Du boba au menu', body: 'Boire du boba fait partie de mes loisirs. La section À propos a donc sa propre petite boutique de boba. Prenez place !' },
    { id: 'about-drink', label: 'Gobelet', title: 'Cette fois, vous choisissez', body: 'Thé au lait, matcha ou taro ? Utilisez les boutons de saveur dans la section À propos pour changer la boisson de Daniel. Dans ce petit monde, le gobelet ne se vide jamais.' },
    { id: 'about-shelf', label: 'Étagère', title: 'Trois intérêts en dehors du code', body: 'Le boba, la musculation et les jeux sur PC : trois de mes intérêts qui ont chacun leur place dans ces scènes miniatures.' },
  ],
  skills: [
    { id: 'skills-monitor', label: 'Écran', title: 'Une fois la compilation terminée', body: 'J’aime jouer sur mon PC. Cette scène donne à ce loisir un petit casque, un écran lumineux et son propre jeu d’arcade.' },
    { id: 'skills-tower', label: 'Tour du PC', title: 'Une autre boîte à outils', body: 'En dehors du jeu, ma boîte à outils comprend Go, Python, TypeScript, React et PostgreSQL pour le développement côté serveur, les données, le Web et les applications mobiles.' },
    { id: 'skills-keyboard', label: 'Clavier', title: 'Mieux en équipe', body: 'J’ai dirigé une équipe Agile de 11 personnes sur GitToCampus, en réunissant les interfaces mobiles, la navigation vers les salles de classe, les cartes et les informations du calendrier.' },
  ],
  projects: [
    { id: 'projects-monitor', label: 'Écran de code', title: 'Sur l’établi', body: 'Je développe TransitOps Montreal avec Go, React, TypeScript et PostgreSQL pour faciliter la compréhension de l’état des lignes de transport en commun. Le projet est en cours.' },
    { id: 'projects-drink', label: 'Coke Zero', title: 'Un petit rituel au bureau', body: 'Code, Coke Zero, petite sieste, et on recommence. Une version miniature du travail et des pauses pour refaire le plein d’énergie.' },
    { id: 'projects-lamp', label: 'Lampe', title: 'Des défis différents, la même curiosité', body: 'Mon expérience comprend des services côté serveur en Go chez Ericsson, des pipelines de données en Python et SQL chez CSL et des interfaces adaptatives chez Ubisoft.' },
  ],
  experience: [
    { id: 'experience-barbell', label: 'Barre de musculation', title: 'Quelques répétitions loin du clavier', body: 'La musculation fait partie de mes loisirs. C’est pourquoi la section Expérience se trouve dans un petit gym.' },
    { id: 'experience-water', label: 'Eau', title: 'Il y a de la place pour une pause', body: 'La boucle du petit gym alterne les répétitions et les pauses avec de l’eau. Même ce Daniel animé prend un moment de repos entre les séries.' },
    { id: 'experience-towel', label: 'Serviette', title: 'Se reprendre, puis réessayer', body: 'Cette serviette est un petit rappel de prendre du recul. En développement logiciel, j’aborde les itérations et le travail d’équipe avec ce même esprit.' },
  ],
};

export const sceneDetailLabelsFr: Record<SceneKind, string> = {
  hero: 'la scène d’accueil', about: 'la boutique de boba', skills: 'le coin jeux', projects: 'le bureau de code', experience: 'la salle d’entraînement',
};
