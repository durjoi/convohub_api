import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { LoggerService } from 'src/common/logger/logger.service';
import { RabbitmqModule } from 'src/common/providers/rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitmqModule],
  controllers: [PostController],
  providers: [PostService, LoggerService, RabbitmqModule],
})
export class PostModule {}
