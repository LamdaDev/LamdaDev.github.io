export const bobaFlavors = {
  'milk-tea': { label: 'Milk tea', tea: '#d7af88', top: '#ead0a8' },
  matcha: { label: 'Matcha', tea: '#82a95b', top: '#b6cf8f' },
  taro: { label: 'Taro', tea: '#b28ad0', top: '#d6bbea' },
} as const;

export type BobaFlavor = keyof typeof bobaFlavors;
export const defaultBobaFlavor: BobaFlavor = 'milk-tea';
export function bobaPreview(flavor: BobaFlavor) {
  return flavor === 'milk-tea' ? '/previews/about.png' : `/previews/about-${flavor}.png`;
}
