import td from 'testdouble';
import { Type, Provider, ValueProvider, ClassProvider } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TestScenario } from 'test/TestScenario';
import { ContextId, ContextIdFactory } from '@nestjs/core';

export class UnitTestScenario<TSubject> extends TestScenario {
  public readonly contextId: ContextId;
  public readonly subject: TSubject;

  public constructor(
    module: TestingModule,
    contextId: ContextId,
    subject: TSubject,
  ) {
    super(module);
    this.contextId = contextId;
    this.subject = subject;
  }

  public static builder<TSubject>(
    subjectType: Type<TSubject>,
  ): UnitTestScenarioBuilder<TSubject> {
    return new UnitTestScenarioBuilder(subjectType);
  }
}

export class UnitTestScenarioBuilder<TSubject> {
  private readonly subjectType: Type<TSubject>;
  private readonly providers: (Provider | Type<unknown>)[];

  public constructor(subjectType: Type<TSubject>) {
    this.subjectType = subjectType;
    this.providers = [{ provide: subjectType, useClass: subjectType }];
  }

  public addProvider<T>(provider: Type<T>): this {
    this.providers.push(provider);
    return this;
  }

  public addProviderFor<T>(
    provide: ClassProvider['provide'],
    classProvider: Type<T>,
  ): this {
    this.providers.push({ provide, useClass: classProvider });
    return this;
  }

  public addProviderValue<TProvider>(
    provide: ValueProvider['provide'],
    provider: TProvider,
  ): this {
    this.providers.push({ provide, useValue: provider });
    return this;
  }

  public addProviderMock(provide: ValueProvider['provide']): this {
    this.providers.push({ provide, useValue: td.object() });
    return this;
  }

  public async build(): Promise<UnitTestScenario<TSubject>> {
    const module = await Test.createTestingModule({
      providers: this.providers,
    }).compile();
    const contextId = ContextIdFactory.create();
    const subject = await module.resolve(this.subjectType, contextId, {
      strict: false,
    });
    return new UnitTestScenario(module, contextId, subject);
  }
}
