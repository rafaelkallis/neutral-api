import td from 'testdouble';
import { InternalUser } from 'user/domain/User';
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
import { ObjectMapper } from 'shared/object-mapper/ObjectMapper';
import { UserDto } from '../dto/UserDto';

describe(GetAuthUserDataZipQuery.name, () => {
  let scenario: UnitTestScenario<GetAuthUserDataZipQueryHandler>;
  let getAuthUserDataZipQueryHandler: GetAuthUserDataZipQueryHandler;
  let getAuthUserDataZipQuery: GetAuthUserDataZipQuery;
  let archiveFactory: ArchiveFactory;
  let archiveBuilder: ArchiveBuilder;
  let archive: Archive;
  let authUser: InternalUser;
  let serializedAuthUser: Buffer;
  let avatarResult: GetReturn;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(GetAuthUserDataZipQueryHandler)
      .addProviderMock(ArchiveFactory)
      .addProviderMock(ObjectMapper)
      .addProviderMock(JsonSerializer)
      .addProviderMock(ObjectStorage)
      .build();
    getAuthUserDataZipQueryHandler = scenario.subject;
    archiveFactory = scenario.module.get(ArchiveFactory);
    archiveBuilder = td.object();
    td.when(archiveFactory.createArchiveBuilder()).thenReturn(archiveBuilder);

    authUser = scenario.modelFaker.user();
    authUser.avatar = Avatar.create();

    const objectMapper = scenario.module.get(ObjectMapper);
    const authUserDto: UserDto = td.object();
    td.when(objectMapper.map(authUser, UserDto)).thenResolve(authUserDto);

    serializedAuthUser = td.object();
    const jsonSerializer = scenario.module.get(JsonSerializer);
    td.when(jsonSerializer.serialize(authUserDto)).thenResolve(
      serializedAuthUser,
    );

    avatarResult = { file: td.object(), contentType: '' };
    const objectStorage = scenario.module.get(ObjectStorage);
    td.when(
      objectStorage.get({
        containerName: 'avatars',
        key: authUser.avatar.value,
      }),
    ).thenResolve(avatarResult);

    archive = td.object();
    td.when(archiveBuilder.build()).thenResolve(archive);

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
