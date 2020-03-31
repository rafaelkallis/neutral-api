import { Type } from '@nestjs/common';

/**
 * Mocks a class. Creates an instance with method implementations that return undefined.
 * @param type The class to mock.
 */
export function Mock<T>(type: Type<T>): T {
  const mock: any = Object.create(type.prototype);
  const properties = Object.getOwnPropertyNames(type.prototype);
  for (const property of properties) {
    if (property === 'constructor') {
      continue;
    }
    if (typeof mock[property] !== 'function') {
      continue;
    }
    mock[property] = () => {
      const error = new Error(
        `no implementation for mock ${type.name}.${property}()`,
      );
      error.stack = error.stack?.split('\n').slice(1).join('\n');
      throw error;
    };
  }
  return mock;
}
