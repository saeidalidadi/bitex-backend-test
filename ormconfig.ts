
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions'

require('dotenv')
const sqliteConnection: SqliteConnectionOptions = {
  name: process.env.DB_CONNECTION_NAME,
  type: 'sqlite',
  database: process.env.DB_SCHEMA,
  synchronize: true,
  logging: false,
  dropSchema: true,
  cache: {
    type: 'ioredis',
    options: {
      port: Number(process.env.REDIS_PORT) || 6379,
      host: process.env.REDIS_HOST || 'localhost',
      password: process.env.REDIS_PASSWORD || ''
    }
  },
  entities: [
    'src/models/db/entity/**/*.ts'
  ],
  migrations: [
    'src/models/db/migration/**/*.ts'
  ],
  subscribers: [
    'src/models/db/subscriber/**/*.ts'
  ]
}
export const TypeOrmDatabaseConfig =   sqliteConnection  