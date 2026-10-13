export interface RenderMetric {
  id: string;
  phase: 'mount' | 'update' | 'nested-update';
  actualDuration: number;
  baseDuration: number;
  startTime: number;
  commitTime: number;
  timestamp: number;
}

class PerformanceTracker {
  private metrics: RenderMetric[] = [];
  private renderCounts: Map<string, number> = new Map();

  /**
   * Profiler onRender callback conforming to React Profiler spec
   */
  public onRender = (
    id: string,
    phase: 'mount' | 'update' | 'nested-update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) => {
    const metric: RenderMetric = {
      id,
      phase,
      actualDuration: Math.round(actualDuration * 100) / 100,
      baseDuration: Math.round(baseDuration * 100) / 100,
      startTime: Math.round(startTime * 100) / 100,
      commitTime: Math.round(commitTime * 100) / 100,
      timestamp: Date.now(),
    };

    this.metrics.push(metric);
    this.renderCounts.set(id, (this.renderCounts.get(id) || 0) + 1);

    // Keep memory bounded to last 200 records
    if (this.metrics.length > 200) {
      this.metrics.shift();
    }
  };

  public getSummary() {
    const summary: Record<
      string,
      { count: number; totalDurationMs: number; avgDurationMs: number }
    > = {};

    this.metrics.forEach(m => {
      if (!summary[m.id]) {
        summary[m.id] = { count: 0, totalDurationMs: 0, avgDurationMs: 0 };
      }
      summary[m.id].count += 1;
      summary[m.id].totalDurationMs += m.actualDuration;
    });

    Object.keys(summary).forEach(id => {
      const item = summary[id];
      item.avgDurationMs =
        Math.round((item.totalDurationMs / Math.max(item.count, 1)) * 100) / 100;
      item.totalDurationMs = Math.round(item.totalDurationMs * 100) / 100;
    });

    return summary;
  }

  public getMetrics(): RenderMetric[] {
    return [...this.metrics];
  }

  public clear(): void {
    this.metrics = [];
    this.renderCounts.clear();
  }
}

export const perfTracker = new PerformanceTracker();
