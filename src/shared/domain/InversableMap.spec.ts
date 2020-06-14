import { InversableMap } from './InversableMap';

describe(InversableMap.name, () => {
  let map: InversableMap<number, string>;

  beforeEach(() => {
    map = InversableMap.empty();
    map.set(1, 'a');
    map.set(2, 'b');
    map.set(3, 'c');
    map.set(4, 'b');
  });

  test('inverse get', () => {
    expect(map.inverse().get('a')).toEqual([1]);
    expect(map.inverse().get('b')).toEqual([2, 4]);
    expect(map.inverse().get('c')).toEqual([3]);
    expect(map.inverse().get('d')).toBeUndefined();
  });

  test('inverse distinct get', () => {
    expect(map.inverseDistinct().get('a')).toBe(1);
    expect(map.inverseDistinct().get('b')).toBe(4);
    expect(map.inverseDistinct().get('c')).toBe(3);
    expect(map.inverseDistinct().get('d')).toBeUndefined();
  });
});
