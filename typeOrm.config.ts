/* eslint-disable @typescript-eslint/no-unsafe-call */
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config();

export default new DataSource({
  type: 'mysql',
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  username: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  entities: [],
  migrationsTableName: 'typeorm_migrations',
  migrations: ['src/database/migrations/*.ts'],
});
