import { Module } from '@nestjs/common';

import * as dotenv from 'dotenv';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RabbitmqService } from './rabbitmq.service';
dotenv.config();

@Module({
  imports: [
    // RabbitMQModule.forRoot({
    //   exchanges: [
    //     {
    //       name: 'post-exchange',
    //       type: 'topic',
    //     },
    //   ],
    //   uri: process.env.RMQ_URL || '',
    //   connectionInitOptions: {
    //     wait: false,
    //   },
    //   enableControllerDiscovery: true,
    // }),
  ],
  exports: [RabbitMQModule, RabbitmqService],
  providers: [RabbitmqService],
})
export class RabbitmqModule {}
