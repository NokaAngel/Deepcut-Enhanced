const statusEl = document.querySelector("#status");
const nowPlayingEl = document.querySelector("#now-playing");
const toggleButtons = [
  ["#toggle-autobop", "autobop"],
  ["#toggle-queue", "autoQueue"],
  ["#toggle-nextdj", "nextDj"],
  ["#toggle-afk", "afk"],
  ["#toggle-mute", "tempMute"]
];

async function activeDeepcutTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return null;
  const url = new URL(tab.url || "about:blank");
  if (!/^(www\.)?deepcut\.live$/i.test(url.hostname)) return null;
  return tab;
}

async function send(command, payload = {}) {
  const tab = await activeDeepcutTab();
  if (!tab) {
    statusEl.textContent = "Open deepcut.live first";
    return null;
  }

  statusEl.textContent = "Connected";
  try {
    return await chrome.tabs.sendMessage(tab.id, { source: "deepcut-enhancer-popup", command, payload });
  } catch {
    statusEl.textContent = "Reload deepcut.live tab";
    return null;
  }
}

function setToggleState(key, enabled) {
  const match = toggleButtons.find(([, settingKey]) => settingKey === key);
  if (!match) return;
  document.querySelector(match[0])?.classList.toggle("is-on", Boolean(enabled));
}

async function refreshState() {
  const tab = await activeDeepcutTab();
  if (!tab) {
    statusEl.textContent = "Open deepcut.live first";
    nowPlayingEl.textContent = "No active room tab";
    return;
  }

  statusEl.textContent = "Connected";
  const response = await send("get-state");
  if (!response?.settings) return;
  toggleButtons.forEach(([, key]) => setToggleState(key, response.settings[key]));
  nowPlayingEl.textContent = response.nowPlaying || "Waiting for song info";
}

document.querySelector("#toggle-panel").addEventListener("click", () => send("toggle-panel"));
document.querySelector("#export-settings").addEventListener("click", () => send("export-settings"));

toggleButtons.forEach(([selector, key]) => {
  document.querySelector(selector).addEventListener("click", async () => {
    const response = await send("toggle-setting", { key });
    if (response?.settings) setToggleState(key, response.settings[key]);
  });
});

refreshState();
