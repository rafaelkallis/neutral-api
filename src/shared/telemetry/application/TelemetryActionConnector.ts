import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { TelemetryAction } from 'shared/telemetry/application/TelemetryAction';
import { TelemetryClient } from 'shared/telemetry/application/TelemetryClient';
import { InvocationProxy } from 'shared/utility/application/InvocationProxy';
import { TelemetryActionInvocationHandler } from 'shared/telemetry/application/TelemetryActionInvocationHandler';
import { ServiceLocator } from 'shared/utility/application/ServiceLocator';
import { ClassHierarchyIterable } from 'shared/domain/Class';

@Injectable()
export class TelemetryActionConnector implements OnModuleInit {
  private readonly logger: Logger;
  private readonly serviceLocator: ServiceLocator;
  private readonly invocationProxy: InvocationProxy;
  private readonly telemetryClient: TelemetryClient;

  public constructor(
    serviceLocator: ServiceLocator,
    invocationProxy: InvocationProxy,
    telemetryClient: TelemetryClient,
  ) {
    this.logger = new Logger(TelemetryActionConnector.name);
    this.serviceLocator = serviceLocator;
    this.invocationProxy = invocationProxy;
    this.telemetryClient = telemetryClient;
  }

  public async onModuleInit(): Promise<void> {
    await this.registerTelemetryActions();
  }

  private async registerTelemetryActions(): Promise<void> {
    for (const clazz of TelemetryAction.registry.keys()) {
      this.logger.log(clazz.name);
      const metadataItems = TelemetryAction.registry.get(clazz);
      for (const hierarchyClass of ClassHierarchyIterable.of(clazz)) {
        const service = await this.serviceLocator.getServiceOrNull(
          hierarchyClass,
        );
        if (!service) {
          continue;
        }
        for (const { actionName, propertyKey } of metadataItems) {
          const invocationHandler = new TelemetryActionInvocationHandler(
            this.telemetryClient,
            actionName,
          );
          this.invocationProxy.proxyInvocation(
            service,
            propertyKey,
            invocationHandler,
          );
          this.logger.log(
            `Registered {"${actionName}", ${propertyKey.toString()}()} telemetry action`,
          );
        }
        break;
      }
    }
  }
}
