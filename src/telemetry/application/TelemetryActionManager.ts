import { Injectable, OnModuleInit } from '@nestjs/common';
import { ServiceExplorer } from 'common/application/ServiceExplorer';
import { getTelemetryActionMetadataItems } from 'telemetry/application/TelemetryAction';

@Injectable()
export class TelemetryActionManager implements OnModuleInit {
  private readonly serviceExplorer: ServiceExplorer;

  public constructor(serviceExplorer: ServiceExplorer) {
    this.serviceExplorer = serviceExplorer;
  }

  public onModuleInit(): void {
    this.configureActionTelemetry();
  }

  private configureActionTelemetry() {
    for (const service of this.serviceExplorer.exploreServices()) {
      const telemetryActionMetadataItems = getTelemetryActionMetadataItems(
        service,
      );
      for (const _telemetryActionMetadata of telemetryActionMetadataItems) {
        // TODO patch method
      }
    }
  }
}
