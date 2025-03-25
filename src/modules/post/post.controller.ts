import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Version,
  Query,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @RabbitSubscribe({
    exchange: 'post-exchange',
    routingKey: 'post_created_routing_key',
    queue: 'post_notification_queue',
  })
  public async postCreateNotification(message) {
    console.log(`Received message: ${message.data}`);
  }

  @Post()
  @Version('1')
  create(@Body() createPostDto: CreatePostDto) {
    return this.postService.create(createPostDto);
  }

  @Get()
  @Version('1')
  async findAll(
    @Query('page') page: number,
    @Query('perPage') perPage: number,
  ) {
    return await this.postService.findAll(
      page ? +page : 1,
      perPage ? +perPage : 10,
    );
  }

  @Get(':id')
  @Version('1')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(+id);
  }

  @Patch(':id')
  @Version('1')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(+id, updatePostDto);
  }

  @Delete(':id')
  @Version('1')
  remove(@Param('id') id: string) {
    return this.postService.remove(+id);
  }
}
