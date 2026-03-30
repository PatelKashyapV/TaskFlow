// TaskEr Background Service Worker (Manifest V3)
// Handles chrome.alarms for due-date notifications and badge counter updates.

const ALARM_PREFIX = "tasker_task_";

// ── Notification when alarm fires ────────────────────────────────────────────
chrome.alarms.onAlarm.addListener((alarm) => {
  if (!alarm.name.startsWith(ALARM_PREFIX)) return;

  const taskId = alarm.name.replace(ALARM_PREFIX, "");

  // Retrieve task data from storage to build the notification
  chrome.storage.local.get(["tasks"], ({ tasks = [] }) => {
    const task = tasks.find((t) => String(t.id) === taskId);
    if (!task) return;

    chrome.notifications.create(`notif_${taskId}`, {
      type: "basic",
      iconUrl: "icons/icon128.png",
      title: "⏰ Task Due Soon — TaskEr",
      message: task.text,
      priority: 2,
    });
  });
});

// ── Message handler from popup ────────────────────────────────────────────────
// Popup sends messages to:
//   { type: "SYNC_ALARMS", tasks: [...] }  — re-sync all due-date alarms
//   { type: "SET_BADGE", count: N }        — update toolbar badge
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "SYNC_ALARMS") {
    syncAlarms(msg.tasks || []);
  }

  if (msg.type === "SET_BADGE") {
    const text = msg.count > 0 ? String(msg.count) : "";
    chrome.action.setBadgeText({ text });
    chrome.action.setBadgeBackgroundColor({ color: "#ff4d4d" });
  }
});

// ── Sync alarms to match current tasks ───────────────────────────────────────
function syncAlarms(tasks) {
  // Clear all existing TaskEr alarms first
  chrome.alarms.getAll((alarms) => {
    alarms
      .filter((a) => a.name.startsWith(ALARM_PREFIX))
      .forEach((a) => chrome.alarms.clear(a.name));

    // Create a new alarm 5 minutes before each active task's due date
    const now = Date.now();
    tasks.forEach((task) => {
      if (!task.dueDate) return;
      const fireAt = new Date(task.dueDate).getTime() - 5 * 60 * 1000;
      if (fireAt > now) {
        chrome.alarms.create(`${ALARM_PREFIX}${task.id}`, {
          when: fireAt,
        });
      }
    });
  });
}
