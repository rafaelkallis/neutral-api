export abstract class CacheKeyComputer {
  public abstract computeKey(storeKey: string, entryKey: string): string;
}
