import { defineConfig, env } from '@prisma/config';
import dotenv from 'dotenv';
import { expand } from 'dotenv-expand';

expand(dotenv.config()); // for docker compose vars

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
