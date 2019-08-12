import * as faker from 'faker';

class PrimitiveFaker {
  /**
   * Creates a fake id
   */
  public id(): string {
    return String(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
  }

  /**
   * Creates a fake email address
   */
  public email(): string {
    return `${this.id()}@example.com`;
  }

  /**
   * Creates a fake unix timestamp
   */
  public timestampUnix(): number {
    return Math.floor(faker.date.recent().getTime() / 1000);
  }

  /**
   * Creates a fake word
   */
  public word(): string {
    return faker.lorem.word();
  }

  /**
   * Creates a sequence of fake words
   */
  public words(): string {
    return faker.lorem.words();
  }

  /**
   * Creates a sentence of fake words
   */
  public sentence(): string {
    return faker.lorem.sentence();
  }

  /**
   * Creates a paragraph of fake words
   */
  public paragraph(): string {
    return faker.lorem.paragraph();
  }
}

export const primitiveFaker = new PrimitiveFaker();
