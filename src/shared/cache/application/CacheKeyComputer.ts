export abstract class CacheKeyComputer {
  public abstract computeKey(keyArgs: string[]): string;
}
