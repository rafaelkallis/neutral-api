import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ServiceExplorer } from 'shared/utility/application/ServiceExplorer';
import { getTelemetryActionMetadataItems } from 'shared/telemetry/application/TelemetryAction';
import { TelemetryClient } from 'shared/telemetry/application/TelemetryClient';

@Injectable()
export class TelemetryActionManager implements OnModuleInit {
  private readonly logger: Logger;
  private readonly serviceExplorer: ServiceExplorer;
  private readonly telemetryClient: TelemetryClient;

  public constructor(
    serviceExplorer: ServiceExplorer,
    telemetryClient: TelemetryClient,
  ) {
    this.logger = new Logger(TelemetryActionManager.name);
    this.serviceExplorer = serviceExplorer;
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
        this.registerInterceptor(service, propertyKey, actionName);
        this.logger.log(
          `Registered {${actionName}, ${propertyKey.toString()}()} telemetry action`,
        );
      }
    }
  }

  private registerInterceptor(
    target: any,
    propertyKey: string | symbol,
    actionName: string,
  ): void {
    const originalFunction: Function = target[propertyKey].bind(target);
    target[propertyKey] = (...args: unknown[]) => {
      const telemetryAction = this.telemetryClient.createAction(actionName);
      try {
        const result = originalFunction(...args);
        const isPromise = typeof result.then === 'function';
        if (isPromise) {
          return result.finally(() => telemetryAction.end());
        } else {
          telemetryAction.end();
          return result;
        }
      } catch (error) {
        telemetryAction.end();
        throw error;
      }
    };
  }
}
