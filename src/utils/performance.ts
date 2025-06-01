/**
 * Performance monitoring utilities for the Pantheon application
 */

// Performance tracking
const performanceMetrics = new Map<string, number[]>();

export function trackRenderTime(componentName: string, startTime: number): void {
  const endTime = performance.now();
  const renderTime = endTime - startTime;
  
  if (!performanceMetrics.has(componentName)) {
    performanceMetrics.set(componentName, []);
  }
  
  const metrics = performanceMetrics.get(componentName)!;
  metrics.push(renderTime);
  
  // Keep only last 50 measurements to prevent memory leaks
  if (metrics.length > 50) {
    metrics.shift();
  }
  
  // Log slow renders in development
  if (process.env.NODE_ENV === 'development' && renderTime > 16) {
    console.warn(`Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
  }
}

export function getPerformanceReport(): Record<string, { avg: number; max: number; count: number }> {
  const report: Record<string, { avg: number; max: number; count: number }> = {};
  
  for (const [componentName, metrics] of performanceMetrics.entries()) {
    const avg = metrics.reduce((sum, time) => sum + time, 0) / metrics.length;
    const max = Math.max(...metrics);
    
    report[componentName] = {
      avg: Number(avg.toFixed(2)),
      max: Number(max.toFixed(2)),
      count: metrics.length
    };
  }
  
  return report;
}

// React DevTools Profiler hook
export function usePerformanceProfiler(componentName: string) {
  if (process.env.NODE_ENV === 'development') {
    const startTime = performance.now();
    
    return () => {
      trackRenderTime(componentName, startTime);
    };
  }
  
  return () => { /* no-op */ }; // No-op in production
}

// Memory usage tracking
export function trackMemoryUsage(): void {
  if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
    const memory = (performance as any).memory;
    console.log('Memory usage:', {
      used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
    });
  }
}

// Bundle size optimization helpers
export function analyzeImports(): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('Loaded modules:', Object.keys(require.cache || {}).length);
  }
}

// Cleanup function for when app unmounts
export function clearPerformanceMetrics(): void {
  performanceMetrics.clear();
} 