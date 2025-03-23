import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { LoggerService } from 'src/common/logger/logger.service';
import { RabbitmqModule } from 'src/common/providers/rabbitmq/rabbitmq.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';

@Module({
  imports: [RabbitmqModule, TypeOrmModule.forFeature([Post])],
  controllers: [PostController],
  providers: [PostService, LoggerService, RabbitmqModule],
})
export class PostModule { }
