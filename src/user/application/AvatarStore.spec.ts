import td from 'testdouble';
import { AvatarStore } from './AvatarStore';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { Avatar } from 'user/domain/value-objects/Avatar';
import { ObjectStorage } from 'shared/object-storage/application/ObjectStorage';

describe(AvatarStore.name, () => {
  let scenario: UnitTestScenario<AvatarStore>;
  let avatarStore: AvatarStore;
  let objectStorage: ObjectStorage;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(AvatarStore)
      .addProviderMock(ObjectStorage)
      .build();
    avatarStore = scenario.subject;
    objectStorage = scenario.module.get(ObjectStorage);
  });

  test('when put, should object storage put', async () => {
    await avatarStore.put(Avatar.create(), 'avatar file', 'image/png');
    td.verify(objectStorage.put(td.matchers.anything()));
  });

  test('when put with unsupported format, should fail', async () => {
    await expect(
      avatarStore.put(Avatar.create(), 'avatar file', 'text/plain'),
    ).rejects.toThrow();
    td.verify(objectStorage.put(td.matchers.anything()), { times: 0 });
  });
});
