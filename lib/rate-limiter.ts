/**
 * Rate Limiter for Login Attempts
 * Prevents brute force attacks on master password
 */

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

const defaultConfig: RateLimitConfig = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 30 * 60 * 1000, // 30 minutes
};

class RateLimiter {
  private attempts: number[] = [];
  private blockedUntil: number | null = null;

  constructor(private config: RateLimitConfig = defaultConfig) {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('hackvault_rate_limit');
      if (stored) {
        const data = JSON.parse(stored);
        this.attempts = data.attempts || [];
        this.blockedUntil = data.blockedUntil || null;
      }
    } catch (error) {
      console.error('Failed to load rate limit data:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('hackvault_rate_limit', JSON.stringify({
        attempts: this.attempts,
        blockedUntil: this.blockedUntil,
      }));
    } catch (error) {
      console.error('Failed to save rate limit data:', error);
    }
  }

  private cleanOldAttempts() {
    const now = Date.now();
    const cutoff = now - this.config.windowMs;
    this.attempts = this.attempts.filter(timestamp => timestamp > cutoff);
  }

  isBlocked(): boolean {
    if (this.blockedUntil && Date.now() < this.blockedUntil) {
      return true;
    }
    if (this.blockedUntil && Date.now() >= this.blockedUntil) {
      this.blockedUntil = null;
      this.attempts = [];
      this.saveToStorage();
    }
    return false;
  }

  recordAttempt(): { allowed: boolean; remainingAttempts: number; resetTime?: Date } {
    if (this.isBlocked()) {
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: new Date(this.blockedUntil!),
      };
    }

    this.cleanOldAttempts();
    this.attempts.push(Date.now());
    this.saveToStorage();

    const remainingAttempts = this.config.maxAttempts - this.attempts.length;

    if (this.attempts.length >= this.config.maxAttempts) {
      this.blockedUntil = Date.now() + this.config.blockDurationMs;
      this.saveToStorage();
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: new Date(this.blockedUntil),
      };
    }

    return {
      allowed: true,
      remainingAttempts,
    };
  }

  reset() {
    this.attempts = [];
    this.blockedUntil = null;
    this.saveToStorage();
  }

  getRemainingTime(): number {
    if (!this.blockedUntil) return 0;
    const remaining = this.blockedUntil - Date.now();
    return Math.max(0, remaining);
  }

  getRemainingTimeString(): string {
    const ms = this.getRemainingTime();
    if (ms === 0) return '0s';

    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }
}

export const loginRateLimiter = new RateLimiter();
