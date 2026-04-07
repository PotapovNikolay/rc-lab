'use client';

import { useEffect, useState } from 'react';
import { useHealth } from '@/shared/hooks';
import {
  UI_SETTINGS_STORAGE_KEY,
  applyTheme,
  getUiSettings,
  type UiTheme,
} from '@/shared/lib/runtimeConfig';

type LocalSettings = {
  apiUrl: string;
  apiToken: string;
  drafts: number;
  cooldown: number;
  theme: UiTheme;
};

function useSettingsPageView() {
  const { data: health, refetch, isFetching } = useHealth();
  const [settings, setSettings] = useState<LocalSettings>(() => getUiSettings());

  useEffect(() => {
    const loaded = getUiSettings();
    setSettings(loaded);
    applyTheme(loaded.theme);
  }, []);

  const saveLocal = () => {
    localStorage.setItem(UI_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    applyTheme(settings.theme);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
        <p className="text-sm text-slate-300">
          Local runtime settings control the API endpoint and optional access token used
          by the UI for protected requests.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <label className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">API URL</p>
          <input
            className="mt-2 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm"
            value={settings.apiUrl}
            onChange={(event) =>
              setSettings((prev) => ({ ...prev, apiUrl: event.target.value }))
            }
          />
        </label>

        <label className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Access Token</p>
          <input
            className="mt-2 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm"
            value={settings.apiToken}
            onChange={(event) =>
              setSettings((prev) => ({ ...prev, apiToken: event.target.value }))
            }
          />
        </label>

        <label className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
            Drafts Per Combination
          </p>
          <input
            type="number"
            min={1}
            max={5}
            className="mt-2 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm"
            value={settings.drafts}
            onChange={(event) =>
              setSettings((prev) => ({ ...prev, drafts: Number(event.target.value) }))
            }
          />
        </label>

        <label className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
            Cooldown (seconds)
          </p>
          <input
            type="number"
            min={1}
            max={30}
            className="mt-2 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm"
            value={settings.cooldown}
            onChange={(event) =>
              setSettings((prev) => ({ ...prev, cooldown: Number(event.target.value) }))
            }
          />
        </label>

        <label className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Theme</p>
          <select
            className="mt-2 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm"
            value={settings.theme}
            onChange={(event) =>
              setSettings((prev) => ({
                ...prev,
                theme: event.target.value as UiTheme,
              }))
            }
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </label>
      </section>

      <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
        <button
          type="button"
          onClick={saveLocal}
          className="rounded-lg border border-emerald-500/60 bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-100"
        >
          Save Local Settings
        </button>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-lg border border-sky-500/60 bg-sky-500/20 px-4 py-2 text-sm font-semibold text-sky-100"
        >
          {isFetching ? 'Checking...' : 'Check Connection'}
        </button>
        <p className="text-sm text-slate-400">
          API: <span className="font-semibold text-slate-100">{health?.api ?? 'unknown'}</span> |
          ComfyUI:{' '}
          <span className="font-semibold text-slate-100">{health?.comfyui ?? 'unknown'}</span>
        </p>
      </section>
    </div>
  );
}

export default function SettingsPage() {
  return useSettingsPageView();
}
