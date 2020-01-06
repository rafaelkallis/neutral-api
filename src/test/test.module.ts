import { Module } from '@nestjs/common';

import { TestUtils } from 'test/test-utils';
import { PrimitiveFaker } from 'test/fakers/primitive-faker';
import { ObjectFaker } from 'test/fakers/object-faker';
import { EntityFaker } from 'test/fakers/entity-faker';

/**
 * Test Module
 */
@Module({
  providers: [TestUtils, EntityFaker, PrimitiveFaker, ObjectFaker],
  exports: [TestUtils, EntityFaker, PrimitiveFaker, ObjectFaker],
})
export class TestModule {}
