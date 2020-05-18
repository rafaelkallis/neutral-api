import { TestingModule } from '@nestjs/testing';
import { PrimitiveFaker } from 'test/PrimitiveFaker';
import { ModelFaker } from 'test/ModelFaker';

export abstract class TestScenario {
  public readonly module: TestingModule;
  public readonly primitiveFaker: PrimitiveFaker;
  public readonly modelFaker: ModelFaker;

  public constructor(module: TestingModule) {
    this.module = module;
    this.primitiveFaker = new PrimitiveFaker();
    this.modelFaker = new ModelFaker(this.primitiveFaker);
  }
}
