import { TestingModule } from '@nestjs/testing';
import { PrimitiveFaker } from 'test/PrimitiveFaker';
import { ModelFaker } from 'test/ModelFaker';
import { ValueObjectFaker } from 'test/ValueObjectFaker';

export class TestScenario {
  public readonly module: TestingModule;
  public readonly primitiveFaker: PrimitiveFaker;
  public readonly valueObjectFaker: ValueObjectFaker;
  public readonly modelFaker: ModelFaker;

  public constructor(module: TestingModule) {
    this.module = module;
    this.primitiveFaker = new PrimitiveFaker();
    this.valueObjectFaker = new ValueObjectFaker(this.primitiveFaker);
    this.modelFaker = new ModelFaker(this.primitiveFaker);
  }
}
