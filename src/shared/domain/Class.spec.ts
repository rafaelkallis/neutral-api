import { ClassHierarchyIterable } from './Class';

describe(ClassHierarchyIterable.name, () => {
  class A {}
  class AA extends A {}
  class AAA extends AA {}
  class AAB extends AA {}
  class AB extends A {}
  class ABA extends AB {}
  class ABB extends AB {}
  class ABC extends AB {}

  test('should iterate over class hierarchy', () => {
    expect(Array.from(ClassHierarchyIterable.of(A))).toEqual([A]);
    expect(Array.from(ClassHierarchyIterable.of(AA))).toEqual([AA, A]);
    expect(Array.from(ClassHierarchyIterable.of(AAA))).toEqual([AAA, AA, A]);
    expect(Array.from(ClassHierarchyIterable.of(AAB))).toEqual([AAB, AA, A]);
    expect(Array.from(ClassHierarchyIterable.of(AB))).toEqual([AB, A]);
    expect(Array.from(ClassHierarchyIterable.of(ABA))).toEqual([ABA, AB, A]);
    expect(Array.from(ClassHierarchyIterable.of(ABB))).toEqual([ABB, AB, A]);
    expect(Array.from(ClassHierarchyIterable.of(ABC))).toEqual([ABC, AB, A]);
  });
});
