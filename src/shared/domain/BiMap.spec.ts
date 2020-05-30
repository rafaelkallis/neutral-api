import { BiMap } from './BiMap';

describe(BiMap, () => {
  let biMap: BiMap<number, string>;

  beforeEach(() => {
    biMap = new BiMap();
  });

  test('get', () => {
    biMap.put(1, 'one');
    biMap.put(2, 'two');
    biMap.put(3, 'three');

    expect(biMap.get(1)).toBe('one');
    expect(biMap.get(2)).toBe('two');
    expect(biMap.get(3)).toBe('three');
  });

  test('getReverse', () => {
    biMap.put(1, 'one');
    biMap.put(2, 'two');
    biMap.put(3, 'three');

    expect(biMap.getReverse('one')).toBe(1);
    expect(biMap.getReverse('two')).toBe(2);
    expect(biMap.getReverse('three')).toBe(3);
  });
});
