let stopAutomation = false;
let requestCount = 0;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "start-connecting") {
    stopAutomation = false;
    requestCount = 0;
    chrome.storage.local.set({ automationRunning: true, requestCount: 0 });
    automateConnections();
  } else if (message.type === "stop-connecting") {
    stopAutomation = true;
    chrome.storage.local.set({ automationRunning: false });
  }
});

async function automateConnections() {
  const { automationRunning } = await chrome.storage.local.get(
    "automationRunning"
  );
  if (!automationRunning) return;
  const buttons = document.querySelectorAll("button[aria-label*='Invite']");

  for (let button of buttons) {
    if (stopAutomation) break;
    if (button.innerText.trim() === "Connect") {
      console.log("Attempting to click Connect button directly...");

      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      });

      button.dispatchEvent(clickEvent);
      requestCount++;
      chrome.storage.local.set({ requestCount });
      chrome.runtime.sendMessage({ type: "update-count", count: requestCount });
      await dismissAddNotePopup();
      await waitRandomTime();
    }
  }
}

async function dismissAddNotePopup() {
  return new Promise((resolve) => {
    const popupInterval = setInterval(() => {
      const modal = document.querySelector("div[role='dialog']");
      const sendWithoutNoteButton = modal?.querySelector(
        "button[aria-label='Send without a note']"
      );

      if (sendWithoutNoteButton) {
        console.log("Automatically sending request without a note...");
        sendWithoutNoteButton.click();
        clearInterval(popupInterval);
        resolve(true);
      }
    }, 500);

    setTimeout(() => {
      clearInterval(popupInterval);
      resolve(false);
    }, 10000);
  });
}

function waitRandomTime() {
  const delay = Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000;
  return new Promise((resolve) => setTimeout(resolve, delay));
}
