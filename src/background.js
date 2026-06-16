const notificationTargets = new Map();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.source !== "deepcut-enhancer" || message.command !== "notify-song") return;
  if (!sender.tab?.id) return;

  const tabId = sender.tab.id;
  const notificationId = `deepcut-enhancer-song-${tabId}`;
  const payload = message.payload || {};

  notificationTargets.set(notificationId, { tabId, key: payload.key });
  chrome.notifications.create(notificationId, {
    type: "basic",
    iconUrl: "src/icon-128.png",
    title: payload.title || "Deepcut Enhancer",
    message: payload.body || "New song",
    priority: 1,
    silent: true,
    buttons: [
      { title: "Bop" },
      { title: "Dislike" }
    ]
  }, () => sendResponse?.({ ok: !chrome.runtime.lastError }));

  return true;
});

chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  const target = notificationTargets.get(notificationId);
  if (!target) return;

  chrome.tabs.sendMessage(target.tabId, {
    source: "deepcut-enhancer-background",
    command: "vote",
    payload: {
      vote: buttonIndex === 1 ? "lame" : "bop"
    }
  });
  chrome.notifications.clear(notificationId);
});

chrome.notifications.onClicked.addListener((notificationId) => {
  const target = notificationTargets.get(notificationId);
  if (target) chrome.tabs.update(target.tabId, { active: true });
  chrome.notifications.clear(notificationId);
});

chrome.notifications.onClosed.addListener((notificationId) => {
  notificationTargets.delete(notificationId);
});
