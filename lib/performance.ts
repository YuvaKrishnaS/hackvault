/**
 * Performance Monitoring
 * Tracks app performance metrics
 */

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private startTimes: Map<string, number> = new Map();

  startMeasure(name: string) {
    this.startTimes.set(name, performance.now());
  }

  endMeasure(name: string) {
    const startTime = this.startTimes.get(name);
    if (!startTime) {
      console.warn(`No start time found for metric: ${name}`);
      return;
    }

    const duration = performance.now() - startTime;
    this.metrics.push({
      name,
      duration,
      timestamp: Date.now(),
    });

    this.startTimes.delete(name);

    // Log slow operations in development
    if (process.env.NODE_ENV === 'development' && duration > 1000) {
      console.warn(`⚠️ Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
    }
  }

  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startMeasure(name);
    try {
      const result = await fn();
      this.endMeasure(name);
      return result;
    } catch (error) {
      this.endMeasure(name);
      throw error;
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getAverageTime(name: string): number {
    const filtered = this.metrics.filter(m => m.name === name);
    if (filtered.length === 0) return 0;

    const total = filtered.reduce((sum, m) => sum + m.duration, 0);
    return total / filtered.length;
  }

  clearMetrics() {
    this.metrics = [];
  }

  logSummary() {
    const summary: Record<string, { count: number; avg: number; total: number }> = {};

    this.metrics.forEach(metric => {
      if (!summary[metric.name]) {
        summary[metric.name] = { count: 0, avg: 0, total: 0 };
      }
      summary[metric.name].count++;
      summary[metric.name].total += metric.duration;
    });

    Object.keys(summary).forEach(name => {
      summary[name].avg = summary[name].total / summary[name].count;
    });

    console.table(summary);
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Helper to measure component render time
export function usePerformance(componentName: string) {
  if (typeof window === 'undefined') return;
  
  performanceMonitor.startMeasure(`${componentName}_render`);
  
  return () => {
    performanceMonitor.endMeasure(`${componentName}_render`);
  };
}
