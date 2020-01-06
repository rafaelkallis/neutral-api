import { Module, forwardRef } from '@nestjs/common';

import { TestUtils } from 'test/test-utils';
import { PrimitiveFaker } from 'test/fakers/primitive-faker';
import { ObjectFaker } from 'test/fakers/object-faker';
import { EntityFaker } from 'test/fakers/entity-faker';
import { UserModule } from 'user/user.module';
import { ProjectModule } from 'project/project.module';
import { RoleModule } from 'role/role.module';

/**
 * Test Module
 */
@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => ProjectModule),
    forwardRef(() => RoleModule),
  ],
  providers: [TestUtils, EntityFaker, PrimitiveFaker, ObjectFaker],
  exports: [TestUtils, EntityFaker, PrimitiveFaker, ObjectFaker],
})
export class TestModule {}
