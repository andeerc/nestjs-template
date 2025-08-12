import type { Knex } from 'knex';
import * as dotenv from 'dotenv';

dotenv.config();

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'enterprise_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: __dirname + "/src/infrastructure/database/migrations",
      tableName: "migrations",
      loadExtensions: [".ts"]
    },
    seeds: {
      directory: __dirname + "/src/infrastructure/database/seeds",
      loadExtensions: [".ts"]
    }

  },

  staging: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: __dirname + "/src/infrastructure/database/migrations",
      tableName: "migrations",
      loadExtensions: [".js"]
    },
    seeds: {
      directory: __dirname + "/src/infrastructure/database/seeds",
      loadExtensions: [".js"]
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: __dirname + "/src/infrastructure/database/migrations",
      tableName: "migrations",
      loadExtensions: [".js"]
    },
    seeds: {
      directory: __dirname + "/src/infrastructure/database/seeds",
      loadExtensions: [".js"]
    }
  }
};

module.exports = config;