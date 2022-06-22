import IORedis from 'ioredis'

export enum RedisKeyType {
  AuthenticationLoginRequestRandomString,
  AgentsDataCollectionChart,
  AgentsDataCollectionProfitTable,
  Binance
}

class Redis extends IORedis {
  private static instance: Redis

  private constructor() {
    const port = Number(process.env.REDIS_PORT) || 6379
    const host = process.env.REDIS_HOST || 'localhost'
    const password = process.env.REDIS_PASSWORD || ''
    super({
      port: port,
      host: host,
      password: password
    })

    this.on('connect', () => {
      console.log('Redis Connected')
    })

    this.on('error', () => {
      console.error('Redis Connected Failed')
    })
  }

  public static shared(): Redis {
    if (!Redis.instance) {
      Redis.instance = new Redis()
    }
    return Redis.instance
  }
}

export default Redis
