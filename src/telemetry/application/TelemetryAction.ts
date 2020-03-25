export const TELEMETRY_ACTION_METADATA = Symbol('TELEMETRY_ACTION_METADATA');

/**
 * Telemetry Action Metadata
 */
export class TelemetryActionMetadataItem {
  public readonly actionName: string;
  public readonly propertyKey: string | symbol;

  public constructor(actionName: string, propertyKey: string | symbol) {
    this.actionName = actionName;
    this.propertyKey = propertyKey;
  }
}

/**
 *
 */
export function getTelemetryActionMetadataItems(
  target: object,
): ReadonlyArray<TelemetryActionMetadataItem> {
  let metadataItems:
    | TelemetryActionMetadataItem[]
    | undefined = Reflect.getMetadata(
    TELEMETRY_ACTION_METADATA,
    target.constructor,
  );
  if (!metadataItems?.length) {
    metadataItems = [];
  }
  return metadataItems;
}

/**
 *
 */
export function TelemetryAction(actionName?: string): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    actionName = actionName || propertyKey.toString();
    const existingMetadataItems = getTelemetryActionMetadataItems(target);
    const newMetadataItem = new TelemetryActionMetadataItem(
      actionName,
      propertyKey,
    );
    Reflect.defineMetadata(
      TELEMETRY_ACTION_METADATA,
      [...existingMetadataItems, newMetadataItem],
      target.constructor,
    );
  };
}
