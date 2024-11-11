let requestCount = 0;

document.getElementById("startButton").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    document.getElementById("statusText").textContent = "Connecting...";
    document.getElementById("startButton").style.display = "none";
    document.getElementById("stopButton").style.display = "inline-block";
    chrome.storage.local.set({ automationRunning: true, requestCount: 0 });

    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        files: ["content.js"],
      },
      () => {
        chrome.tabs.sendMessage(tabs[0].id, { type: "start-connecting" });
      }
    );
  });
});

document.getElementById("stopButton").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    document.getElementById("statusText").textContent = "Stopped";
    document.getElementById("startButton").style.display = "inline-block";
    document.getElementById("stopButton").style.display = "none";
    chrome.storage.local.set({ automationRunning: false });

    chrome.tabs.sendMessage(tabs[0].id, { type: "stop-connecting" });
  });
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "update-count") {
    requestCount = message.count;
    document.getElementById("countText").textContent = requestCount;
  }
});
