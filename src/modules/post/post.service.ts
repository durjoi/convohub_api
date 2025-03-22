import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { LoggerService } from 'src/common/logger/logger.service';
// import { RabbitMQProvider } from 'src/common/providers/rabbitmq/rabbitmq.provider';
import { RabbitmqService } from 'src/common/providers/rabbitmq/rabbitmq.service';

@Injectable()
export class PostService {
  constructor(
    private readonly logger: LoggerService,
    private readonly rabbitmqService: RabbitmqService,
  ) {}

  async create(createPostDto: CreatePostDto) {
    await this.rabbitmqService.publish(
      'post-exchange',
      'post_created_routing_key',
      {
        data: {
          title: 'Test title',
          content: 'Test content',
          user: 'Test user',
        },
      },
    );
    return createPostDto;
  }

  async findAll() {
    try {
      //
    } catch (err) {
      this.logger.error(err);
    }
    this.logger.log('Test debug log');
    return `This action returns all post`;
  }

  findOne(id: number) {
    return `This action returns a #${id} post`;
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
