import { Injectable } from '@nestjs/common';
import {
  RateLimitBackend,
  ConsumeResult,
} from '../application/RateLimitBackend';
import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';
import { DefaultMap } from 'shared/domain/DefaultMap';

@Injectable()
export class MemoryRateLimitBackend extends RateLimitBackend {
  private readonly resources: DefaultMap<string, RateLimiterMemory>;

  public constructor() {
    super();
    const options = super.getConfig();
    this.resources = DefaultMap.empty(
      (resourceKey: string) =>
        new RateLimiterMemory({
          keyPrefix: resourceKey,
          points: options.requestsPerPeriod,
          duration: options.periodSeconds * 1000,
          blockDuration: options.banSeconds,
        }),
    );
  }

  public async consume(
    resourceKey: string,
    consumerKey: string,
  ): Promise<ConsumeResult> {
    const resource = this.resources.get(resourceKey);
    return resource
      .consume(consumerKey)
      .then((result) => this.mapConsumeRequestResult(true, result))
      .catch((resultOrError) => {
        if (!(resultOrError instanceof RateLimiterRes)) {
          throw resultOrError;
        }
        return this.mapConsumeRequestResult(false, resultOrError);
      });
  }

  private mapConsumeRequestResult(
    success: boolean,
    result: RateLimiterRes,
  ): ConsumeResult {
    return {
      success,
      retryAfterSeconds: result.msBeforeNext / 1000,
      consumedRequests: result.consumedPoints,
      remainingRequests: result.remainingPoints,
      totalRequests: result.consumedPoints + result.remainingPoints,
    };
  }
}
