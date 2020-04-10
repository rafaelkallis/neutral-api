import 'reflect-metadata';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ServiceExplorer } from 'shared/utility/application/ServiceExplorer';
import { Command } from 'shared/command/Command';
import { getHandleCommandMetadataItems } from 'shared/command/HandleCommand';
import { CommandHandler } from 'shared/command/CommandHandler';

/**
 *
 */
@Injectable()
export class CommandMediator implements OnModuleInit {
  private readonly logger: Logger;
  private readonly serviceExplorer: ServiceExplorer;
  private readonly commandHandlers: Map<
    Function,
    CommandHandler<unknown, Command<unknown>>
  >;

  public constructor(serviceExplorer: ServiceExplorer) {
    this.logger = new Logger(CommandMediator.name, true);
    this.serviceExplorer = serviceExplorer;
    this.commandHandlers = new Map();
  }

  public async onModuleInit(): Promise<void> {
    await this.registerCommandHandlers();
  }

  private async registerCommandHandlers(): Promise<void> {
    for (const service of this.serviceExplorer.exploreServices()) {
      const metadataItems = getHandleCommandMetadataItems(service);
      if (metadataItems.length === 0) {
        continue;
      }
      this.logger.log(service.constructor.name);
      for (const { commandType, propertyKey } of metadataItems) {
        if (this.commandHandlers.has(commandType)) {
          throw new Error(
            `Command handler for ${commandType.name} already registered, only 1 command handler allowed per command`,
          );
        }
        const commandHandler: CommandHandler<unknown, Command<unknown>> = {
          async handleCommand(command: Command<unknown>): Promise<unknown> {
            return await (service as any)[propertyKey](command);
          },
        };
        this.commandHandlers.set(commandType, commandHandler);
        this.logger.log(
          `Registered {${
            commandType.name
          }, ${propertyKey.toString()}()} command handler`,
        );
      }
    }
    this.logger.log('Command handlers successfully registered');
  }
}
