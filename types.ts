
export type Tab = 'proxy' | 'ai' | 'games' | 'music' | 'settings';

export enum Backend {
  ULTRAVIOLET = 'UltraViolet',
  SCRAMJET = 'Scramjet',
  OTHER = 'Rammerhead Backend'
}

export interface QuickApp {
  name: string;
  url: string;
  icon: string;
  isCustom?: boolean;
}

export interface Settings {
  background: string;
  customBackground: string | null;
  activeEffect: 'none' | 'rain' | 'stars' | 'grid';
  rainSeed: number;
  glowIntensity: number;
  brandColor: string;
  panicKey: string | null;
  panicAction: 'redirect' | 'close';
  cloakEnabled: boolean;
  cloakTitle: string;
  cloakIcon: string;
  backend: Backend;
  customApps: QuickApp[];
  adblockEnabled: boolean;
}

export const CLOAK_PRESETS = [
  { name: 'Google', title: 'Google', icon: 'https://www.google.com/favicon.ico' },
  { name: 'Google Drive', title: 'My Drive - Google Drive', icon: 'https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png' },
  { name: 'Canvas', title: 'Dashboard', icon: 'https://du11hjcvx0uqb.cloudfront.net/br/dist/images/favicon-e106157072.ico' },
  { name: 'Clever', title: 'Clever | Portal', icon: 'https://assets.clever.com/launchpad/8061327/favicon.ico' },
];

export const DEFAULT_BACKGROUNDS = [
  { name: 'Default Black', url: 'black' },
  { name: 'Mountain View', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1920' },
  { name: 'Ocean View', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1920' },
  { name: 'Snowy Mountain View', url: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&q=80&w=1920' }
];
