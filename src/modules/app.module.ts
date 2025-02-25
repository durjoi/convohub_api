import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { LoggerService } from 'src/common/logger/logger.service';
import { PrometheusController } from 'src/modules/prometheus.controller';
import { PrometheusService } from 'src/common/metrics/prometheus.service';
import { HttpLoggerMiddleware } from 'src/common/middleware/http-logger.middleware';
import { MetricsMiddleware } from 'src/common/middleware/metrics.middleware';
dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      username: process.env.MYSQL_USERNAME,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      autoLoadEntities: true,
      // synchronize: true,
    }),
  ],
  controllers: [PrometheusController],
  providers: [LoggerService, PrometheusService],
  exports: [PrometheusService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
    consumer.apply(MetricsMiddleware).forRoutes('*');
  }
}
