import { useState } from 'react';
import { browser } from 'wxt/browser';

const RESTRICTED = ['about:', 'chrome:', 'edge:', 'chrome-extension:', 'https://chromewebstore.google.com'];

export default function App() {
  const [problem, setProblem] = useState<string>();

  const togglePanel = async () => {
    const [tab] = await browser.tabs.query({ currentWindow: true, active: true });

    if (!tab?.id || !tab.url || RESTRICTED.some(prefix => tab.url!.startsWith(prefix))) {
      setProblem('Matchup can’t run on browser pages. Open a normal website and try again.');
      return;
    }

    try {
      await browser.tabs.sendMessage(tab.id, { type: 'matchup:toggle' });
      window.close();
    } catch {
      setProblem('Reload the page once, then try again.');
    }
  };

  return (
    <div className="bg-canvas flex w-[260px] flex-col gap-3 p-3 font-sans">
      <div className="flex items-center gap-2">
        <span className="text-[15px] leading-none">🥊</span>
        <span className="text-panel-title text-ink">Matchup</span>
      </div>
      <button
        type="button"
        onClick={togglePanel}
        className="h-control rounded-control bg-accent-blue text-tile-label text-white transition-colors duration-[120ms] ease-out hover:brightness-95">
        Toggle panel
      </button>
      {problem ? (
        <p className="text-micro text-error-ink leading-[1.4]">{problem}</p>
      ) : (
        <p className="text-micro text-muted leading-[1.4]">⌥V hide · ⌥L lock · ⌥D difference</p>
      )}
    </div>
  );
}
