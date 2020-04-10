import { Type } from '@nestjs/common';
import { Command } from './Command';

export const HANDLE_COMMAND_METADATA = Symbol('HANDLE_COMMAND_METADATA');

/**
 * Handle Domain Event Metadata Item
 */
export class HandleCommandMetadataItem<T, TCommand extends Command<T>> {
  public readonly commandType: Type<TCommand>;
  public readonly propertyKey: string | symbol;

  public constructor(
    commandType: Type<TCommand>,
    propertyKey: string | symbol,
  ) {
    this.commandType = commandType;
    this.propertyKey = propertyKey;
  }
}

/**
 *
 */
export function getHandleCommandMetadataItems<T, TCommand extends Command<T>>(
  target: object,
): ReadonlyArray<HandleCommandMetadataItem<T, TCommand>> {
  let metadataItems:
    | HandleCommandMetadataItem<T, TCommand>[]
    | undefined = Reflect.getMetadata(
    HANDLE_COMMAND_METADATA,
    target.constructor,
  );
  if (!metadataItems?.length) {
    metadataItems = [];
  }
  return metadataItems;
}

/**
 * Handle Command
 */
export function HandleCommand<T, TCommand extends Command<T>>(
  commandType: Type<TCommand>,
): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    if (!(commandType.prototype instanceof Command)) {
      throw new TypeError(
        `${commandType.name} is not a command, did you extend @${Command.name}?`,
      );
    }
    const existingMetadataItems = getHandleCommandMetadataItems(target);
    const newMetadataItem = new HandleCommandMetadataItem(
      commandType,
      propertyKey,
    );
    Reflect.defineMetadata(
      HANDLE_COMMAND_METADATA,
      [...existingMetadataItems, newMetadataItem],
      target.constructor,
    );
  };
}
