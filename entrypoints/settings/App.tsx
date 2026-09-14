import {
  ANCHOR_LABELS,
  LAYER_SHORTCUTS,
  IMAGE_SHORTCUTS,
  PANEL_CORNERS,
  SETTINGS_DEFAULTS,
  matchupSettings,
} from "@/utils/matchup-settings";
import {
  FIXED_SHORTCUTS,
  SHORTCUT_DEFAULTS,
  SHORTCUT_LABELS,
  isBindableKey,
  restoreSettings,
  shortcutLabel,
} from "@/utils/matchup-settings";
import { clampPercent } from "@/utils/clamp";
import { cn } from "@/utils/cn";
import { useEffect, useState } from "react";
import type { MatchupSettings, ShortcutAction } from "@/utils/matchup-settings";
import type { LayerSettings } from "@/utils/matchup-state";
import type { ReactNode } from "react";
import { LogoMark } from "@/components/icons";

const Section = ({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) => (
  <section className="flex flex-col gap-2">
    <div>
      <h2 className="text-sm font-bold text-ink mb-1">{title}</h2>
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </div>
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

const listClass =
  "rounded-xl bg-surface flex flex-col divide-y divide-black/5";

const kbdClass =
  "text-sm text-muted rounded-md min-w-12 px-2 py-0.5 text-center";

/**
 * One rebindable row. Clicking the key starts capture; the next bindable key
 * takes it, Escape cancels, Tab leaves without binding so the page stays
 * keyboard-navigable.
 */
const ShortcutRow = ({
  label,
  code,
  capturing,
  conflict,
  onStartCapture,
}: {
  label: string;
  code: string;
  capturing: boolean;
  conflict?: string;
  onStartCapture: () => void;
}) => (
  <li className="flex flex-col gap-1 px-3 py-2.5">
    <div className="flex items-center justify-between gap-4">
      <span className="text-[13px]">{label}</span>
      <button
        type="button"
        onClick={onStartCapture}
        aria-label={`Change shortcut for ${label}, currently ${shortcutLabel(code)}`}
        className={cn(
          kbdClass,
          capturing
            ? "bg-accent-yellow text-ink"
            : "hover:bg-surface-strong bg-white",
        )}
      >
        {capturing ? "Press a key…" : shortcutLabel(code)}
      </button>
    </div>
    {conflict && <span className="text-accent-red text-xs">{conflict}</span>}
  </li>
);

const selectClass =
  "h-8 rounded-xl bg-surface text-sm text-ink w-44 px-3 outline-none";
const numberClass =
  "h-8 rounded-xl bg-surface text-sm text-ink w-24 px-3 text-right tabular-nums outline-none";

export default function App() {
  const [settings, setSettings] = useState<MatchupSettings>(SETTINGS_DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    matchupSettings
      .getValue()
      .then((stored) => setSettings(restoreSettings(stored)))
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void matchupSettings.setValue(settings);
  }, [settings, hydrated]);

  const [capturing, setCapturing] = useState<ShortcutAction>();
  const [conflict, setConflict] = useState<{
    action: ShortcutAction;
    message: string;
  }>();

  useEffect(() => {
    if (!capturing) return;
    const onKeyDown = (event: KeyboardEvent) => {
      // Tab falls through on purpose, so capture never traps the keyboard.
      if (event.key === "Tab") {
        setCapturing(undefined);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        setCapturing(undefined);
        setConflict(undefined);
        return;
      }
      // Modifiers on their own, arrows, function keys: keep listening rather
      // than binding something the ⌥ scheme can't express.
      if (!isBindableKey(event.code)) return;
      event.preventDefault();

      const taken = (Object.keys(settings.shortcuts) as ShortcutAction[]).find(
        (action) =>
          action !== capturing && settings.shortcuts[action] === event.code,
      );
      if (taken) {
        setConflict({
          action: capturing,
          message: `${shortcutLabel(event.code)} is already used by ${SHORTCUT_LABELS[taken]}.`,
        });
        return;
      }
      setSettings((current) => ({
        ...current,
        shortcuts: { ...current.shortcuts, [capturing]: event.code },
      }));
      setCapturing(undefined);
      setConflict(undefined);
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [capturing, settings.shortcuts]);

  const startCapture = (action: ShortcutAction) => {
    setConflict(undefined);
    setCapturing((current) => (current === action ? undefined : action));
  };

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

          <Row label="Frame" hint="What position is measured from">
            <select
              value={defaults.pinned ? "window" : "page"}
              onChange={(event) =>
                patchLayer({ pinned: event.currentTarget.value === "window" })
              }
              className={selectClass}
            >
              <option value="page">page</option>
              <option value="window">window</option>
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
                className="accent-accent-yellow size-4"
              />
            </Row>
          ))}
        </Section>

        <Section
          title="Shortcuts"
          hint="Every shortcut is ⌥ plus the key shown."
        >
          <ul className={listClass}>
            {IMAGE_SHORTCUTS.map(({ action, label }) => (
              <ShortcutRow
                key={action}
                label={label}
                code={settings.shortcuts[action]}
                capturing={capturing === action}
                conflict={
                  conflict?.action === action ? conflict.message : undefined
                }
                onStartCapture={() => startCapture(action)}
              />
            ))}
            {FIXED_SHORTCUTS.map((shortcut) => (
              <li
                key={shortcut.keys}
                className="flex items-center justify-between px-3 py-2.5"
              >
                <span className="text-[13px]">{shortcut.label}</span>
                <kbd className={cn(kbdClass, "text-disabled")}>
                  {shortcut.keys}
                </kbd>
              </li>
            ))}
          </ul>

          <ul className={listClass}>
            {LAYER_SHORTCUTS.map(({ action, label }) => (
              <ShortcutRow
                key={action}
                label={label}
                code={settings.shortcuts[action]}
                capturing={capturing === action}
                conflict={
                  conflict?.action === action ? conflict.message : undefined
                }
                onStartCapture={() => startCapture(action)}
              />
            ))}
          </ul>

          <div className="flex items-center justify-center gap-4 px-1 mt-2">
            <button
              type="button"
              onClick={() => {
                setCapturing(undefined);
                setConflict(undefined);
                setSettings((current) => ({
                  ...current,
                  shortcuts: SHORTCUT_DEFAULTS,
                }));
              }}
              className="text-muted hover:text-ink rounded-md text-xs focus-visible:ring-offset-2"
            >
              Reset to defaults
            </button>
          </div>
        </Section>
      </div>
    </main>
  );
}
