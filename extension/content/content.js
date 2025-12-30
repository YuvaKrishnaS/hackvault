// HackVault Content Script - Auto-fill and sync listener

console.log('HackVault content script loaded');

// Listen for sync messages from web app
window.addEventListener('message', (event) => {
  if (event.data.type === 'HACKVAULT_SYNC') {
    // Store passwords in Chrome storage
    chrome.storage.local.set({ 
      passwords: event.data.passwords,
      lastSync: Date.now()
    }, () => {
      console.log('HackVault: Passwords synced', event.data.passwords.length);
      showNotification('✓ Passwords synced to extension');
    });
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('HackVault: Received message', request);
  
  if (request.action === 'fillPassword') {
    const result = fillLoginForm(request.username, request.password);
    sendResponse({ success: result });
  } else if (request.action === 'getLocalStorage') {
    // Read from localStorage
    try {
      const passwords = localStorage.getItem('hackvault_passwords');
      sendResponse({ passwords: passwords ? JSON.parse(passwords) : [] });
    } catch (error) {
      sendResponse({ passwords: [] });
    }
  }
  return true;
});

// Find and fill login forms - Enhanced version
function fillLoginForm(username, password) {
  console.log('HackVault: Attempting to fill form');
  
  try {
    // Wait for page to be ready
    if (document.readyState !== 'complete') {
      window.addEventListener('load', () => fillLoginFormDelayed(username, password));
      return true;
    }
    
    return fillLoginFormDelayed(username, password);
  } catch (error) {
    console.error('HackVault: Error filling form', error);
    showNotification('✗ Failed to fill password');
    return false;
  }
}

function fillLoginFormDelayed(username, password) {
  // Multiple attempts with delay
  let attempts = 0;
  const maxAttempts = 3;
  
  const tryFill = () => {
    attempts++;
    console.log(`HackVault: Fill attempt ${attempts}/${maxAttempts}`);
    
    const filled = performFill(username, password);
    
    if (filled) {
      showNotification('✓ Password filled successfully');
      return true;
    }
    
    if (attempts < maxAttempts) {
      setTimeout(tryFill, 500);
      return false;
    } else {
      showNotification('✗ Could not find login fields');
      return false;
    }
  };
  
  return tryFill();
}

function performFill(username, password) {
  // Strategy 1: Look for common username fields
  const usernameSelectors = [
    'input[name="username"]',
    'input[name="email"]',
    'input[type="email"]',
    'input[type="text"][name*="user"]',
    'input[type="text"][name*="email"]',
    'input[autocomplete="username"]',
    'input[autocomplete="email"]',
    'input[placeholder*="username" i]',
    'input[placeholder*="email" i]',
    'input[placeholder*="phone" i]',
    'input[aria-label*="username" i]',
    'input[aria-label*="email" i]',
    'input[id*="username"]',
    'input[id*="email"]',
    'input[type="text"]' // Fallback
  ];
  
  // Strategy 2: Look for password fields
  const passwordSelectors = [
    'input[type="password"]',
    'input[name="password"]',
    'input[autocomplete="current-password"]',
    'input[autocomplete="new-password"]',
    'input[placeholder*="password" i]',
    'input[aria-label*="password" i]'
  ];
  
  let usernameField = null;
  let passwordField = null;
  
  // Find username field
  for (const selector of usernameSelectors) {
    const fields = document.querySelectorAll(selector);
    if (fields.length > 0) {
      // Get first visible field
      for (const field of fields) {
        if (isVisible(field)) {
          usernameField = field;
          console.log('HackVault: Found username field', selector);
          break;
        }
      }
      if (usernameField) break;
    }
  }
  
  // Find password field
  for (const selector of passwordSelectors) {
    const fields = document.querySelectorAll(selector);
    if (fields.length > 0) {
      for (const field of fields) {
        if (isVisible(field)) {
          passwordField = field;
          console.log('HackVault: Found password field', selector);
          break;
        }
      }
      if (passwordField) break;
    }
  }
  
  // Fill the fields
  let filled = false;
  
  if (usernameField) {
    setInputValue(usernameField, username);
    filled = true;
    console.log('HackVault: Filled username');
  }
  
  if (passwordField) {
    setInputValue(passwordField, password);
    filled = true;
    console.log('HackVault: Filled password');
  }
  
  return filled;
}

// Helper: Check if element is visible
function isVisible(element) {
  if (!element) return false;
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         style.opacity !== '0' &&
         element.offsetWidth > 0 &&
         element.offsetHeight > 0;
}

// Helper: Set input value properly (triggers all events)
function setInputValue(input, value) {
  // Focus the input
  input.focus();
  
  // Set value
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  ).set;
  nativeInputValueSetter.call(input, value);
  
  // Trigger events that frameworks listen to
  const events = [
    new Event('input', { bubbles: true }),
    new Event('change', { bubbles: true }),
    new Event('blur', { bubbles: true }),
    new KeyboardEvent('keydown', { bubbles: true }),
    new KeyboardEvent('keyup', { bubbles: true })
  ];
  
  events.forEach(event => input.dispatchEvent(event));
  
  // Blur after a small delay
  setTimeout(() => input.blur(), 100);
}

// Show notification overlay
function showNotification(message) {
  // Remove existing notification
  const existing = document.getElementById('hackvault-notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.id = 'hackvault-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #000;
    color: #fff;
    padding: 16px 24px;
    border: 3px solid #000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-weight: 900;
    font-size: 14px;
    z-index: 999999;
    box-shadow: 4px 4px 0px 0px rgba(0,0,0,1);
    animation: hackvault-slideIn 0.3s ease-out;
    pointer-events: none;
  `;
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'hackvault-slideOut 0.3s ease-out';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 2500);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
  @keyframes hackvault-slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes hackvault-slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
`;
document.head.appendChild(style);

console.log('HackVault: Content script ready');
