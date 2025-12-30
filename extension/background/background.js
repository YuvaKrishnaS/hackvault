// HackVault Background Service Worker

console.log('HackVault background service worker started');

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('HackVault extension installed');
  
  // Create context menu only if available
  try {
    if (chrome.contextMenus) {
      chrome.contextMenus.create({
        id: 'hackvault-fill',
        title: 'Fill with HackVault',
        contexts: ['editable']
      }, () => {
        if (chrome.runtime.lastError) {
          console.log('Context menu creation skipped:', chrome.runtime.lastError.message);
        }
      });
    }
  } catch (error) {
    console.log('Context menu not available');
  }
});

// Context menu click handler
if (chrome.contextMenus) {
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'hackvault-fill') {
      chrome.action.openPopup();
    }
  });
}

// Listen for messages from web app
chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  if (request.action === 'syncPasswords') {
    chrome.storage.local.set({ passwords: request.passwords }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Keep service worker alive
let keepAlive = setInterval(() => {
  chrome.storage.local.get('keepAlive', () => {
    // This prevents service worker from being terminated
  });
}, 20000);

console.log('HackVault background service worker ready');
