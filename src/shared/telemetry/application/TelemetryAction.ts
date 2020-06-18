import { Class } from 'shared/domain/Class';
import { DefaultMap } from 'shared/domain/DefaultMap';

export class TelemetryActionMetadataItem {
  public readonly actionName: string;
  public readonly propertyKey: string | symbol;

  public constructor(actionName: string, propertyKey: string | symbol) {
    this.actionName = actionName;
    this.propertyKey = propertyKey;
  }
}

const telemetryActionRegistry: DefaultMap<
  Class<object>,
  TelemetryActionMetadataItem[]
> = DefaultMap.empty(() => []);

export class TelemetryAction {
  public static registry = telemetryActionRegistry.asReadonly();

  public static register(actionName?: string): PropertyDecorator {
    return (target: object, propertyKey: string | symbol): void => {
      const targetClass: Class<object> = target.constructor;
      actionName =
        actionName || `${targetClass.name}.${propertyKey.toString()}()`;
      const metadataItems = telemetryActionRegistry.get(targetClass);
      metadataItems.push(
        new TelemetryActionMetadataItem(actionName, propertyKey),
      );
    };
  }
}
