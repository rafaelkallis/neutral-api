import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ServiceExplorer } from 'shared/utility/application/ServiceExplorer';
import { getTelemetryActionMetadataItems } from 'shared/telemetry/application/TelemetryAction';
import { TelemetryClient } from 'shared/telemetry/application/TelemetryClient';
import { InvocationProxy } from 'shared/utility/application/InvocationProxy';
import { TelemetryActionInvocationHandler } from 'shared/telemetry/application/TelemetryActionInvocationHandler';

@Injectable()
export class TelemetryActionManager implements OnModuleInit {
  private readonly logger: Logger;
  private readonly serviceExplorer: ServiceExplorer;
  private readonly invocationProxy: InvocationProxy;
  private readonly telemetryClient: TelemetryClient;

  public constructor(
    serviceExplorer: ServiceExplorer,
    invocationProxy: InvocationProxy,
    telemetryClient: TelemetryClient,
  ) {
    this.logger = new Logger(TelemetryActionManager.name);
    this.serviceExplorer = serviceExplorer;
    this.invocationProxy = invocationProxy;
    this.telemetryClient = telemetryClient;
  }

  public onModuleInit(): void {
    this.registerTelemetryActions();
  }

  private registerTelemetryActions() {
    for (const service of this.serviceExplorer.exploreServices()) {
      const telemetryActionMetadataItems = getTelemetryActionMetadataItems(
        service,
      );
      if (telemetryActionMetadataItems.length === 0) {
        continue;
      }
      this.logger.log(service.constructor.name);
      for (const { actionName, propertyKey } of telemetryActionMetadataItems) {
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
    }
  }
}
