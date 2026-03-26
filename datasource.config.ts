import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { Environment } from './src/policy/entities/environment.entity';

config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Environment],
  migrations: ['dist/migrations/*.js'],
  synchronize: false, // Strict for migrations
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
