import { Injectable } from '@nestjs/common';
import os from 'os';

export interface MemoryMetrics {
  availableMemoryBytes: number;
  usedMemoryBytes: number;
}

@Injectable()
export class PerformanceMeasurer {
  public measureMemory(): MemoryMetrics {
    return {
      availableMemoryBytes: os.freemem(),
      usedMemoryBytes: process.memoryUsage().rss,
    };
  }
}
