import { Injectable } from '@nestjs/common';

export interface ConsumeResult {
  readonly success: boolean;
  readonly retryAfterSeconds: number;
  readonly remainingRequests: number;
  readonly consumedRequests: number;
  readonly totalRequests: number;
}

export interface RateLimitBackendConfig {
  readonly requestsPerPeriod: number;
  readonly periodSeconds: number;
  readonly banSeconds: number;
}

@Injectable()
export abstract class RateLimitBackend {
  public abstract consume(
    resourceKey: string,
    consumerKey: string,
  ): Promise<ConsumeResult>;

  protected getConfig(): RateLimitBackendConfig {
    return {
      requestsPerPeriod: 10,
      periodSeconds: 1,
      banSeconds: 1,
    };
  }
}
