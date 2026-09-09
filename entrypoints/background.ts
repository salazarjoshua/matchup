import { browser } from "wxt/browser";
import { defineBackground } from "wxt/utils/define-background";

/** Pages where content scripts can't run, so there is nothing to toggle. */
const RESTRICTED = [
  "about:",
  "chrome:",
  "edge:",
  "chrome-extension:",
  "https://chromewebstore.google.com",
];

export default defineBackground(() => {
  // Only extension pages may open the options page, so the panel asks us to.
  browser.runtime.onMessage.addListener((message: unknown) => {
    if ((message as { type?: string })?.type === "matchup:open-settings") {
      void browser.runtime.openOptionsPage();
    }
  });

  // No popup: the icon toggles the panel straight away, and again to close it.
  browser.action.onClicked.addListener(async (tab) => {
    if (
      !tab.id ||
      !tab.url ||
      RESTRICTED.some((prefix) => tab.url!.startsWith(prefix))
    )
      return;
    try {
      await browser.tabs.sendMessage(tab.id, { type: "matchup:toggle" });
    } catch {
      // The content script isn't in this tab yet — it only injects on load.
      await browser.action.setBadgeText({ tabId: tab.id, text: "!" });
      await browser.action.setTitle({
        tabId: tab.id,
        title: "Matchup — reload this page once, then try again",
      });
      setTimeout(() => {
        void browser.action.setBadgeText({ tabId: tab.id!, text: "" });
        void browser.action.setTitle({ tabId: tab.id!, title: "Matchup" });
      }, 4000);
    }
  });
});
