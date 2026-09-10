import {
  ANCHOR_LABELS,
  HOTKEYS,
  PANEL_CORNERS,
  SETTINGS_DEFAULTS,
  matchupSettings,
} from "@/utils/matchup-settings";
import { clampPercent } from "@/utils/clamp";
import { useEffect, useState } from "react";
import type { MatchupSettings } from "@/utils/matchup-settings";
import type { LayerSettings } from "@/utils/matchup-state";
import type { ReactNode } from "react";
import { LogoMark } from "@/components/icons";

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section className="flex flex-col gap-2">
    <h2 className="text-sm font-bold text-ink mb-1">{title}</h2>
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
  <label className="flex items-center justify-between gap-4 min-h-8">
    <span className="flex flex-col gap-0.5">
      <span className="text-sm text-ink">{label}</span>
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </span>
    {children}
  </label>
);

const selectClass =
  "h-control rounded-control bg-surface text-value text-ink w-44 px-3 outline-none focus-visible:ring-[1.5px] focus-visible:ring-accent-yellow";
const numberClass =
  "h-control rounded-control bg-surface text-value text-ink w-24 px-3 text-right tabular-nums outline-none focus-visible:ring-[1.5px] focus-visible:ring-accent-yellow";

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
      <div className="mx-auto flex max-w-md flex-col gap-8 px-6 py-10">
        <header className="flex flex-col gap-1">
          <LogoMark className="max-w-12" />
          <h1 className="text-xl font-semibold tracking-[-0.02em]">Settings</h1>
        </header>

        <Section title="Panel">
          <Row label="Position" hint="Where the panel opens">
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
              <option value="none">free position</option>
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

          <Row label="Opacity">
            <input
              value={defaults.opacity}
              inputMode="numeric"
              onChange={(event) =>
                patchLayer({
                  opacity: clampPercent(
                    Number(event.currentTarget.value.replace(/[^0-9]/g, "")) ||
                      0,
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
              ["difference", "Difference"],
            ] as const
          ).map(([key, label]) => (
            <Row key={key} label={label}>
              <input
                type="checkbox"
                checked={defaults[key]}
                onChange={(event) =>
                  patchLayer({ [key]: event.currentTarget.checked })
                }
                className="accent-accent-yellow size-4 outline-none focus-visible:ring-[1.5px] focus-visible:ring-accent-yellow"
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
                <span className="text-[13px]">{hotkey.action}</span>
                <kbd className="text-value text-muted">{hotkey.keys}</kbd>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </main>
  );
}
