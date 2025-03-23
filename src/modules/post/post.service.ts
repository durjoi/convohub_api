import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { LoggerService } from 'src/common/logger/logger.service';
// import { RabbitMQProvider } from 'src/common/providers/rabbitmq/rabbitmq.provider';
import { RabbitmqService } from 'src/common/providers/rabbitmq/rabbitmq.service';
import { Post } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PostService {
  constructor(
    private readonly logger: LoggerService,
    private readonly rabbitmqService: RabbitmqService,
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
  ) { }

  async create(createPostDto: CreatePostDto) {
    const post = new Post();

    post.title = createPostDto.title;
    post.content = createPostDto.content;

    const savedPost = await this.postRepository.save(post);

    this.logger.log(`Post Created ${savedPost.id}`);
    return savedPost;
  }

  async findAll(page, perPage) {
    const skip = perPage * (page - 1);

    const [posts, total] = await this.postRepository.findAndCount({
      order: {
        createdAt: 'DESC',
      },
      skip: skip,
      take: perPage,
    });

    return {
      data: posts,
      total: total,
      currentPage: page,
      perPage: perPage,
      totalPage: Math.ceil(total / perPage),
    };
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
