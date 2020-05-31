import { Map } from './Map';

describe(Map, () => {
  let map: Map<number, string>;

  beforeEach(() => {
    map = Map.empty();
  });

  test('get', () => {
    map.put(1, 'one');
    map.put(2, 'two');
    map.put(3, 'three');

    expect(map.get(1)).toBe('one');
    expect(map.get(2)).toBe('two');
    expect(map.get(3)).toBe('three');
    expect(map.get(4)).toBe(null);
  });

  test('getReverse', () => {
    map.put(1, 'a');
    map.put(2, 'a');
    map.put(3, 'b');

    expect(map.inverse().get('a')).toEqual([1, 2]);
    expect(map.inverse().get('b')).toEqual([3]);
    expect(map.inverse().get('c')).toEqual(null);
  });
});
