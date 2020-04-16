import { Module } from '@nestjs/common';
import { SerializationModule } from 'shared/serialization/SerializationModule';
import { AmqpClient } from 'shared/amqp/AmqpClient';
import { AmqplibAmqpClient } from 'shared/amqp/AmqplibAmqpClient';
import { ConfigModule } from 'shared/config/ConfigModule';

/**
 * Amqp Module
 */
@Module({
  imports: [ConfigModule, SerializationModule],
  providers: [{ provide: AmqpClient, useClass: AmqplibAmqpClient }],
  exports: [AmqpClient],
})
export class AmqpModule {}
