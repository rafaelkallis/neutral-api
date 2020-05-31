import { BiMap } from './BiMap';

describe(BiMap, () => {
  let biMap: BiMap<number, string>;

  beforeEach(() => {
    biMap = BiMap.empty();
  });

  test('get', () => {
    biMap.put(1, 'one');
    biMap.put(2, 'two');
    biMap.put(3, 'three');

    expect(biMap.get(1)).toBe('one');
    expect(biMap.get(2)).toBe('two');
    expect(biMap.get(3)).toBe('three');
    expect(biMap.get(4)).toBe(null);
  });

  test('getReverse', () => {
    biMap.put(1, 'one');
    biMap.put(2, 'two');
    biMap.put(3, 'three');

    expect(biMap.inverse().get('one')).toBe(1);
    expect(biMap.inverse().get('two')).toBe(2);
    expect(biMap.inverse().get('three')).toBe(3);
    expect(biMap.inverse().get('four')).toBe(null);
  });
});
