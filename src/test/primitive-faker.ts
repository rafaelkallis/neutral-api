import * as faker from 'faker';

export const primitiveFaker = {
  id() {
    return String(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
  },
  email() {
    return `${this.id()}@example.com`;
  },
  timestampUnix() {
    return Math.floor(faker.date.recent().getTime() / 1000);
  },
  word() {
    return faker.lorem.word();
  },
  words() {
    return faker.lorem.words();
  },
  sentence() {
    return faker.lorem.sentence();
  },
  paragraph() {
    return faker.lorem.paragraph();
  },
};
