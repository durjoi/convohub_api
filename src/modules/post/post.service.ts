import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { LoggerService } from 'src/common/logger/logger.service';
// import { RabbitMQProvider } from 'src/common/providers/rabbitmq/rabbitmq.provider';
import { RabbitmqService } from 'src/common/providers/rabbitmq/rabbitmq.service';
import { Post } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from 'src/common/providers/redis/redis.service';

@Injectable()
export class PostService {
  constructor(
    private readonly logger: LoggerService,
    private readonly rabbitmqService: RabbitmqService,
    private readonly redisService: RedisService,
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
  ) {}

  async create(createPostDto: CreatePostDto) {
    const post = new Post();

    post.title = createPostDto.title;
    post.content = createPostDto.content;

    const savedPost = await this.postRepository.save(post);

    // clear redis cache
    await this.redisService.deleteCache('feed');

    this.logger.log(`Post Created ${savedPost.id}`);
    return savedPost;
  }

  async findAll(page, perPage) {
    const skip = perPage * (page - 1);

    if (page == 1) {
      console.log('checking cache');
      const cacheData = await this.redisService.getCache('feed');

      if (cacheData) {
        console.log('returning feed from cache');
        return cacheData;
      }
    }

    console.log('getting feed from DB');
    const [posts, total] = await this.postRepository.findAndCount({
      order: {
        createdAt: 'DESC',
      },
      skip: skip,
      take: perPage,
    });

    const responseData = {
      data: posts,
      total: total,
      currentPage: page,
      perPage: perPage,
      totalPage: Math.ceil(total / perPage),
    };

    console.log('adding feed to cache');
    if (page == 1) {
      await this.redisService.setCache('feed', responseData, 3600);
    }

    console.log('returning feed from DB');
    return responseData;
  }

  async findAllCache(page, perPage) {
    let cachedFeed = null;
    if (page == 1) {
      // check redis
      cachedFeed = await this.redisService.getCache('feed');

      if (cachedFeed) {
        console.log('getting feed from cache');
        return cachedFeed;
      }
    }

    const skip = perPage * (page - 1);
    console.log('getting feed from DB');

    const [posts, total] = await this.postRepository.findAndCount({
      order: {
        createdAt: 'DESC',
      },
      skip: skip,
      take: perPage,
    });

    const responseData = {
      data: posts,
      total: total,
      currentPage: page,
      perPage: perPage,
      totalPage: Math.ceil(total / perPage),
    };

    // if page is 1 then add it to cache
    if (page == 1) {
      console.log('adding feed to the cache');

      await this.redisService.setCache('feed', responseData, 3600);
    }

    return responseData;
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
