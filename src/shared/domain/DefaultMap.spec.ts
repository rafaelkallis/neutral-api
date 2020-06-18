import { DefaultMap } from './DefaultMap';

describe(DefaultMap.name, () => {
  let map: DefaultMap<number, string>;

  beforeEach(() => {
    map = DefaultMap.empty((key) => String(key));
    map.set(1, 'a');
  });

  test('get', () => {
    expect(map.get(1)).toBe('a');
    expect(map.get(2)).toBe('2');
  });

  test('has', () => {
    expect(map.has(1)).toBeTruthy();
    expect(map.has(2)).toBeTruthy();
  });
});
