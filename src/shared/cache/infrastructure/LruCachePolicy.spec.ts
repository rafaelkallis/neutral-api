import { MemoryCacheClient } from './MemoryCacheClient';

describe('memory cache client', () => {
  let cacheClient: MemoryCacheClient;

  beforeEach(() => {
    cacheClient = new MemoryCacheClient();
  });

  test('integration', () => {
    const result = {};
    cacheClient.put('test', 'a', result);

    const optionalCacheHit = cacheClient.get('test', 'a');
    expect(optionalCacheHit.isPresent()).toBeTruthy();
    expect(optionalCacheHit.orElseThrow(Error)).toEqual(result);

    const optionalCacheMiss = cacheClient.get('test', 'b');
    expect(optionalCacheMiss.isPresent()).toBeFalsy();
  });
});
