export const UI_SETTINGS_STORAGE_KEY = 'ai-factory-ui-settings';

export type UiTheme = 'dark' | 'light';

export type UiSettings = {
  apiUrl: string;
  apiToken: string;
  drafts: number;
  cooldown: number;
  theme: UiTheme;
};

type RuntimeSettings = Pick<UiSettings, 'apiUrl' | 'apiToken'>;

const DEFAULT_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const DEFAULT_API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || '';
const DEFAULT_DRAFTS = 1;
const DEFAULT_COOLDOWN = 5;
const DEFAULT_THEME: UiTheme = 'dark';

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const parseSettings = (raw: string | null): UiSettings => {
  if (!raw) {
    return {
      apiUrl: DEFAULT_API_URL,
      apiToken: DEFAULT_API_TOKEN,
      drafts: DEFAULT_DRAFTS,
      cooldown: DEFAULT_COOLDOWN,
      theme: DEFAULT_THEME,
    };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<UiSettings>;
    return {
      apiUrl: parsed.apiUrl || DEFAULT_API_URL,
      apiToken: parsed.apiToken || DEFAULT_API_TOKEN,
      drafts: clamp(Number(parsed.drafts) || DEFAULT_DRAFTS, 1, 5),
      cooldown: clamp(Number(parsed.cooldown) || DEFAULT_COOLDOWN, 1, 30),
      theme: parsed.theme === 'light' ? 'light' : 'dark',
    };
  } catch {
    return {
      apiUrl: DEFAULT_API_URL,
      apiToken: DEFAULT_API_TOKEN,
      drafts: DEFAULT_DRAFTS,
      cooldown: DEFAULT_COOLDOWN,
      theme: DEFAULT_THEME,
    };
  }
};

export function getRuntimeSettings(): RuntimeSettings {
  const settings = getUiSettings();
  return {
    apiUrl: settings.apiUrl,
    apiToken: settings.apiToken,
  };
}

export function getUiSettings(): UiSettings {
  if (typeof window === 'undefined') {
    return {
      apiUrl: DEFAULT_API_URL,
      apiToken: DEFAULT_API_TOKEN,
      drafts: DEFAULT_DRAFTS,
      cooldown: DEFAULT_COOLDOWN,
      theme: DEFAULT_THEME,
    };
  }

  return parseSettings(localStorage.getItem(UI_SETTINGS_STORAGE_KEY));
}

export function applyTheme(theme: UiTheme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
}
