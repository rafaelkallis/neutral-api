import { InversableMap } from './InversableMap';

describe(InversableMap.name, () => {
  let map: InversableMap<number, string>;

  beforeEach(() => {
    map = InversableMap.empty();
  });

  test('.get(key)', () => {
    map.set(1, 'one');
    map.set(2, 'two');
    map.set(3, 'three');

    expect(map.get(1)).toBe('one');
    expect(map.get(2)).toBe('two');
    expect(map.get(3)).toBe('three');
    expect(map.get(4)).toBeUndefined();
  });

  test('inverse().get(key)', () => {
    map.set(1, 'a');
    map.set(2, 'a');
    map.set(3, 'b');

    expect(map.inverse().get('a')).toEqual([1, 2]);
    expect(map.inverse().get('b')).toEqual([3]);
    expect(map.inverse().get('c')).toBeUndefined();
  });
});
