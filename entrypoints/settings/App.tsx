import {
  ANCHOR_LABELS,
  HOTKEYS,
  PANEL_CORNERS,
  SETTINGS_DEFAULTS,
  matchupSettings,
} from "@/utils/matchup-settings";
import { useEffect, useState } from "react";
import type { MatchupSettings } from "@/utils/matchup-settings";
import type { LayerSettings } from "@/utils/matchup-state";
import type { ReactNode } from "react";

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section className="flex flex-col gap-3">
    <h2 className="text-panel-title text-ink">{title}</h2>
    {children}
  </section>
);

const Row = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) => (
  <label className="flex items-center justify-between gap-4">
    <span className="flex flex-col">
      <span className="font-sans text-[13px] text-ink">{label}</span>
      {hint && <span className="text-micro text-muted">{hint}</span>}
    </span>
    {children}
  </label>
);

const selectClass =
  "h-control rounded-control bg-surface text-value text-ink w-44 px-3 font-mono outline-none focus-visible:ring-[1.5px] focus-visible:ring-accent-blue";
const numberClass =
  "h-control rounded-control bg-surface text-value text-ink w-24 px-3 text-right font-mono outline-none focus-visible:ring-[1.5px] focus-visible:ring-accent-blue";

export default function App() {
  const [settings, setSettings] = useState<MatchupSettings>(SETTINGS_DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    matchupSettings
      .getValue()
      .then((stored) => setSettings({ ...SETTINGS_DEFAULTS, ...stored }))
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void matchupSettings.setValue(settings);
  }, [settings, hydrated]);

  const patchLayer = (next: Partial<LayerSettings>) =>
    setSettings((current) => ({
      ...current,
      layerDefaults: { ...current.layerDefaults, ...next },
    }));

  const defaults = settings.layerDefaults;

  return (
    <main className="bg-canvas text-ink min-h-screen font-sans">
      <div className="mx-auto flex max-w-xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-col gap-1">
          <span className="text-panel-title text-ink flex items-center gap-2">
            <span className="text-[15px] leading-none">🥊</span> Matchup
          </span>
          <h1 className="font-sans text-[22px] font-semibold tracking-[-0.02em]">
            Settings
          </h1>
        </header>

        <Section title="Panel">
          <Row
            label="Position"
            hint="Where the panel opens until you drag it somewhere else"
          >
            <select
              value={settings.panelPosition}
              onChange={(event) => {
                // Read before the updater runs: React clears currentTarget once the
                // handler returns, and a functional update is invoked after that.
                const panelPosition = event.currentTarget
                  .value as MatchupSettings["panelPosition"];
                setSettings((current) => ({ ...current, panelPosition }));
              }}
              className={selectClass}
            >
              {PANEL_CORNERS.map((corner) => (
                <option key={corner.value} value={corner.value}>
                  {corner.label}
                </option>
              ))}
            </select>
          </Row>
        </Section>

        <Section title="New layers">
          <Row label="Anchor">
            <select
              value={
                defaults.anchor === null ? "none" : String(defaults.anchor)
              }
              onChange={(event) =>
                patchLayer({
                  anchor:
                    event.currentTarget.value === "none"
                      ? null
                      : Number(event.currentTarget.value),
                })
              }
              className={selectClass}
            >
              <option value="none">Free position</option>
              {ANCHOR_LABELS.map((label, index) => (
                <option key={label} value={index}>
                  {label}
                </option>
              ))}
            </select>
          </Row>

          <Row label="Scale">
            <input
              value={defaults.scale}
              inputMode="decimal"
              onChange={(event) =>
                patchLayer({
                  scale: event.currentTarget.value.replace(/[^0-9.]/g, ""),
                })
              }
              className={numberClass}
            />
          </Row>

          <Row label="Opacity" hint="Percent">
            <input
              value={defaults.opacity}
              inputMode="numeric"
              onChange={(event) =>
                patchLayer({
                  opacity: Math.min(
                    100,
                    Math.max(
                      0,
                      Number(
                        event.currentTarget.value.replace(/[^0-9]/g, ""),
                      ) || 0,
                    ),
                  ),
                })
              }
              className={numberClass}
            />
          </Row>

          {(
            [
              ["visible", "Visible"],
              ["locked", "Locked"],
              ["difference", "Difference blending"],
            ] as const
          ).map(([key, label]) => (
            <Row key={key} label={label}>
              <input
                type="checkbox"
                checked={defaults[key]}
                onChange={(event) =>
                  patchLayer({ [key]: event.currentTarget.checked })
                }
                className="accent-accent-blue size-4"
              />
            </Row>
          ))}
        </Section>

        <Section title="Hotkeys">
          <ul className="rounded-control bg-surface flex flex-col divide-y divide-black/5">
            {HOTKEYS.map((hotkey) => (
              <li
                key={hotkey.keys}
                className="flex items-center justify-between px-3 py-2.5"
              >
                <span className="font-sans text-[13px]">{hotkey.action}</span>
                <kbd className="text-value text-muted font-mono">
                  {hotkey.keys}
                </kbd>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </main>
  );
}
