/**
 * Auto-Lock Feature
 * Automatically locks vault after period of inactivity
 */

import { config } from './config';

type LockCallback = () => void;

class AutoLockManager {
  private timeout: NodeJS.Timeout | null = null;
  private lockCallback: LockCallback | null = null;
  private enabled: boolean = true;
  private timeoutDuration: number = config.security.sessionTimeout;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadSettings();
      this.setupEventListeners();
    }
  }

  private loadSettings() {
    try {
      const settings = localStorage.getItem('hackvault_autolock_settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        this.enabled = parsed.enabled !== false;
        this.timeoutDuration = parsed.timeoutDuration || this.timeoutDuration;
      }
    } catch (error) {
      console.error('Failed to load auto-lock settings:', error);
    }
  }

  private saveSettings() {
    try {
      localStorage.setItem('hackvault_autolock_settings', JSON.stringify({
        enabled: this.enabled,
        timeoutDuration: this.timeoutDuration,
      }));
    } catch (error) {
      console.error('Failed to save auto-lock settings:', error);
    }
  }

  private setupEventListeners() {
    // Events that reset the timer
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, () => this.resetTimer(), { passive: true });
    });
  }

  start(callback: LockCallback) {
    this.lockCallback = callback;
    this.resetTimer();
  }

  stop() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.lockCallback = null;
  }

  resetTimer() {
    if (!this.enabled || !this.lockCallback) return;

    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.timeout = setTimeout(() => {
      if (this.lockCallback) {
        this.lockCallback();
      }
    }, this.timeoutDuration);
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    this.saveSettings();
    
    if (!enabled) {
      this.stop();
    }
  }

  setTimeoutDuration(ms: number) {
    this.timeoutDuration = ms;
    this.saveSettings();
    this.resetTimer();
  }

  getSettings() {
    return {
      enabled: this.enabled,
      timeoutDuration: this.timeoutDuration,
    };
  }
}

export const autoLockManager = new AutoLockManager();
