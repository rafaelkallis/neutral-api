import td from 'testdouble';
import { User } from 'user/domain/User';
import {
  GetAuthUserDataZipQuery,
  GetAuthUserDataZipQueryHandler,
} from 'user/application/queries/GetAuthUserDataZipQuery';
import { UnitTestScenario } from 'test/UnitTestScenario';
import {
  ArchiveFactory,
  ArchiveBuilder,
  Archive,
} from 'shared/archive/application/ArchiveFactory';
import {
  ObjectStorage,
  GetReturn,
} from 'shared/object-storage/application/ObjectStorage';
import { JsonSerializer } from 'shared/serialization/json/JsonSerializer';
import { Avatar } from 'user/domain/value-objects/Avatar';

describe(GetAuthUserDataZipQuery.name, () => {
  let scenario: UnitTestScenario<GetAuthUserDataZipQueryHandler>;
  let getAuthUserDataZipQueryHandler: GetAuthUserDataZipQueryHandler;
  let getAuthUserDataZipQuery: GetAuthUserDataZipQuery;
  let archiveFactory: ArchiveFactory;
  let archiveBuilder: ArchiveBuilder;
  let archive: Archive;
  let authUser: User;
  let serializedAuthUser: Buffer;
  let avatarResult: GetReturn;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(GetAuthUserDataZipQueryHandler)
      .addProviderMock(ArchiveFactory)
      .addProviderMock(JsonSerializer)
      .addProviderMock(ObjectStorage)
      .build();
    getAuthUserDataZipQueryHandler = scenario.subject;
    archiveFactory = scenario.module.get(ArchiveFactory);
    archiveBuilder = td.object();
    td.when(archiveFactory.createArchiveBuilder()).thenReturn(archiveBuilder);
    archive = td.object();
    td.when(archiveBuilder.build()).thenResolve(archive);

    authUser = scenario.modelFaker.user();
    authUser.avatar = Avatar.create();

    serializedAuthUser = td.object();
    const jsonSerializer = scenario.module.get(JsonSerializer);
    td.when(jsonSerializer.serialize(authUser)).thenResolve(serializedAuthUser);

    avatarResult = { file: td.object(), contentType: '' };
    const objectStorage = scenario.module.get(ObjectStorage);
    td.when(
      objectStorage.get({
        containerName: 'avatars',
        key: authUser.avatar.value,
      }),
    ).thenResolve(avatarResult);

    getAuthUserDataZipQuery = new GetAuthUserDataZipQuery(authUser);
  });

  test('happy path', async () => {
    const actualArchive = await getAuthUserDataZipQueryHandler.handle(
      getAuthUserDataZipQuery,
    );
    expect(actualArchive).toBe(archive);
    td.verify(archiveBuilder.addBuffer('user.json', serializedAuthUser));
    td.verify(archiveBuilder.addFile('avatar', avatarResult.file));
  });
});
