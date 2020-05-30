import { TestingModule } from '@nestjs/testing';
import { PrimitiveFaker } from 'test/PrimitiveFaker';
import { ModelFaker } from 'test/ModelFaker';
import { ValueObjectFaker } from 'test/ValueObjectFaker';
import { ContextId } from '@nestjs/core';

export abstract class TestScenario {
  public readonly module: TestingModule;
  public readonly contextId: ContextId;
  public readonly primitiveFaker: PrimitiveFaker;
  public readonly valueObjectFaker: ValueObjectFaker;
  public readonly modelFaker: ModelFaker;

  public constructor(module: TestingModule, contextId: ContextId) {
    this.module = module;
    this.contextId = contextId;
    this.primitiveFaker = new PrimitiveFaker();
    this.valueObjectFaker = new ValueObjectFaker(this.primitiveFaker);
    this.modelFaker = new ModelFaker(this.primitiveFaker);
  }
}
