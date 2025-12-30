// HackVault Extension Popup
const WEB_APP_URL = 'http://localhost:3000';

// DOM Elements
const notConnectedState = document.getElementById('notConnected');
const passwordListState = document.getElementById('passwordList');
const loadingState = document.getElementById('loading');
const searchInput = document.getElementById('searchInput');
const passwordsContainer = document.getElementById('passwords');
const currentSiteDiv = document.getElementById('currentSite');
const openWebAppBtn = document.getElementById('openWebApp');
const openVaultBtn = document.getElementById('openVault');

let allPasswords = [];
let currentUrl = '';

// Initialize
async function init() {
  showLoading();
  
  // Get current tab URL
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.url) {
    try {
      currentUrl = new URL(tab.url).hostname;
    } catch {
      currentUrl = '';
    }
  }
  
  // Try to load passwords
  await loadPasswords();
  
  // Setup event listeners
  setupEventListeners();
}

function setupEventListeners() {
  openWebAppBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: WEB_APP_URL });
  });
  
  openVaultBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: WEB_APP_URL });
  });
  
  searchInput.addEventListener('input', (e) => {
    filterPasswords(e.target.value);
  });
}

// Load passwords from Chrome storage
// Load passwords from Chrome storage
async function loadPasswords() {
  try {
    // Method 1: Try Chrome storage (synced from content script)
    const result = await chrome.storage.local.get(['passwords', 'lastSync']);
    
    if (result.passwords && result.passwords.length > 0) {
      console.log('Loaded', result.passwords.length, 'passwords from Chrome storage');
      allPasswords = result.passwords;
      showPasswordList();
      displayPasswords(allPasswords);
      return;
    }
    
    // Method 2: Try to read from web app page if open (with error handling)
    try {
      const tabs = await chrome.tabs.query({});
      const webAppTab = tabs.find(t => t.url && t.url.includes('localhost:3000'));
      
      if (webAppTab) {
        try {
          const response = await chrome.tabs.sendMessage(webAppTab.id, {
            action: 'getLocalStorage'
          });
          
          if (response && response.passwords && response.passwords.length > 0) {
            console.log('Loaded', response.passwords.length, 'passwords from web app');
            allPasswords = response.passwords;
            await chrome.storage.local.set({ passwords: allPasswords, lastSync: Date.now() });
            showPasswordList();
            displayPasswords(allPasswords);
            return;
          }
        } catch (msgError) {
          // Content script not ready, ignore
          console.log('Content script not available (this is normal)');
        }
      }
    } catch (tabError) {
      console.log('Tab query failed (this is normal)');
    }
    
    // No passwords found
    console.log('No passwords found - please sync from web app');
    showNotConnected();
  } catch (error) {
    console.error('Error loading passwords:', error);
    showNotConnected();
  }
}

// Display passwords
function displayPasswords(passwords) {
  passwordsContainer.innerHTML = '';
  
  if (passwords.length === 0) {
    passwordsContainer.innerHTML = '<div class="no-results">No passwords found</div>';
    return;
  }
  
  // Filter by current site
  const sitePasswords = passwords.filter(p => {
    if (!p.url || !currentUrl) return false;
    try {
      const pwdHost = new URL(p.url).hostname;
      return pwdHost.includes(currentUrl) || currentUrl.includes(pwdHost);
    } catch {
      return false;
    }
  });
  
  // Show current site info if matches found
  if (sitePasswords.length > 0) {
    currentSiteDiv.classList.remove('hidden');
    currentSiteDiv.querySelector('.site-url').textContent = currentUrl;
    currentSiteDiv.querySelector('.site-count').textContent = 
      `${sitePasswords.length} password${sitePasswords.length !== 1 ? 's' : ''} available`;
    
    // Display site-specific passwords first
    sitePasswords.forEach(password => {
      passwordsContainer.appendChild(createPasswordElement(password, true));
    });
    
    // Add divider if there are other passwords
    const otherPasswords = passwords.filter(p => !sitePasswords.includes(p));
    if (otherPasswords.length > 0) {
      const divider = document.createElement('div');
      divider.style.cssText = 'border-top: 2px solid #000; margin: 16px 0;';
      passwordsContainer.appendChild(divider);
      
      otherPasswords.forEach(password => {
        passwordsContainer.appendChild(createPasswordElement(password, false));
      });
    }
  } else {
    currentSiteDiv.classList.add('hidden');
    passwords.forEach(password => {
      passwordsContainer.appendChild(createPasswordElement(password, false));
    });
  }
}

// Create password element
function createPasswordElement(password, highlight) {
  const div = document.createElement('div');
  div.className = 'password-item';
  if (highlight) {
    div.style.background = '#fffae6';
    div.style.borderColor = '#000';
    div.style.borderWidth = '3px';
  }
  
  div.innerHTML = `
    <div class="password-header">
      <div class="password-title">${escapeHtml(password.title)}</div>
      <div class="password-category">${escapeHtml(password.category)}</div>
    </div>
    <div class="password-username">${escapeHtml(password.username)}</div>
    ${password.url ? `<div class="password-url">${escapeHtml(password.url)}</div>` : ''}
  `;
  
  div.addEventListener('click', () => {
    fillPassword(password);
  });
  
  return div;
}
chrome.storage.local.set({ debug: true });
// Fill password in page
// Fill password in page
async function fillPassword(password) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.id) {
      alert('Cannot access current tab');
      return;
    }
    
    try {
      // Send message to content script
      await chrome.tabs.sendMessage(tab.id, {
        action: 'fillPassword',
        username: password.username,
        password: password.password
      });
      
      // Close popup after successful fill
      setTimeout(() => window.close(), 500);
    } catch (error) {
      console.error('Failed to fill password:', error);
      
      // Try injecting content script if not loaded
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content/content.js']
        });
        
        // Try again after injection
        setTimeout(async () => {
          try {
            await chrome.tabs.sendMessage(tab.id, {
              action: 'fillPassword',
              username: password.username,
              password: password.password
            });
            setTimeout(() => window.close(), 500);
          } catch (retryError) {
            alert('Auto-fill not available on this page. Password copied to clipboard instead.');
            navigator.clipboard.writeText(password.password);
          }
        }, 100);
      } catch (injectError) {
        // Fallback: copy to clipboard
        alert('Auto-fill not available on this page. Password copied to clipboard.');
        navigator.clipboard.writeText(password.password);
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    alert('An error occurred. Please try again.');
  }
}


// Filter passwords
function filterPasswords(query) {
  if (!query) {
    displayPasswords(allPasswords);
    return;
  }
  
  const filtered = allPasswords.filter(p => {
    const searchStr = `${p.title} ${p.username} ${p.url || ''}`.toLowerCase();
    return searchStr.includes(query.toLowerCase());
  });
  
  displayPasswords(filtered);
}

// UI State Management
function showLoading() {
  notConnectedState.classList.add('hidden');
  passwordListState.classList.add('hidden');
  loadingState.classList.remove('hidden');
}

function showNotConnected() {
  loadingState.classList.add('hidden');
  passwordListState.classList.add('hidden');
  notConnectedState.classList.remove('hidden');
}

function showPasswordList() {
  loadingState.classList.add('hidden');
  notConnectedState.classList.add('hidden');
  passwordListState.classList.remove('hidden');
}

// Helper
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}

// Initialize on load
init();
