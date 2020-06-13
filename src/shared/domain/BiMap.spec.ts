import { BiMap } from './BiMap';

describe(BiMap.name, () => {
  let biMap: BiMap<number, string>;

  beforeEach(() => {
    biMap = BiMap.empty();
    biMap.set(1, 'one');
    biMap.set(2, 'two');
    biMap.set(3, 'three');
    biMap.set(4, 'two');
  });

  test('.get(key)', () => {
    expect(biMap.get(1)).toBe('one');
    expect(biMap.get(2)).toBe('two');
    expect(biMap.get(3)).toBe('three');
    expect(biMap.get(4)).toBe('two');
  });

  test('.inverse().get(key)', () => {
    expect(biMap.inverse().get('one')).toBe(1);
    expect(biMap.inverse().get('two')).toBe(4);
    expect(biMap.inverse().get('three')).toBe(3);
  });
});
