import { Context, ServiceBroker } from 'moleculer'
import { Connection } from 'typeorm'

export enum CachePrefix {
  FETCH_USER_TOKEN = 'fetch_user_by_token_',
  FETCH_USER_EMAIL = 'fetch_user_by_email_',
  FETCH_USER_ID = 'fetch_user_by_id_',
}


export default class Controller<Req = unknown, Res extends {} = {}> {
  private cachePrefix: string
  protected broker: ServiceBroker
  protected dbConnection: Connection
  protected ormCacheTime: 35e3
  protected context: Context<Req, Res>

  constructor(broker: ServiceBroker, ctx?: Context<Req, Res>, dbConnection?: Connection) {
    this.cachePrefix = process.env.CACHE_ORM_PREFIX
    this.broker = broker
    this.dbConnection = dbConnection
    this.context = ctx
  }

  protected generateCacheName(uid: unknown, type: CachePrefix): string {
    return `${this.cachePrefix}${type}${uid}`
  }
}
