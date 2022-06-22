import { BrokerOptions, Errors, MetricRegistry, ServiceBroker, LogLevels } from 'moleculer'
import { createConnection, ConnectionOptions } from 'typeorm'
import { TypeOrmDatabaseConfig } from './ormconfig'
import winston from 'winston'

export = async (): Promise<BrokerOptions> => {

  await createConnection(TypeOrmDatabaseConfig).catch(err=>{
    console.log(err)
  })

  const brokerConfig: BrokerOptions = {
    namespace: 'bitex-test',
    nodeID: 'main',
    metadata: {},
    logger: {
      type: 'winston',
      options: {
        level: <LogLevels>process.env.MOLECULER_LOG_LEVEL || 'info',
        winston: {
          format: winston.format.cli(),
          transports: [
            new winston.transports.Console(),
            new winston.transports.File({ filename: './logs/moleculer.log', format: winston.format.uncolorize() })
          ]
        }
      }
    },
    transporter: null, // "AMQP"
    cacher: {
      type: 'Redis',
      options: {
        prefix: process.env.CACHE_MOLECULER_PREFIX,
        ttl: 60,
        monitor: false,
        redis: {
          host: process.env.REDIS_HOST,
          port: Number(process.env.REDIS_PORT),
          password: process.env.REDIS_PASSWORD
        }
      }
    },
    serializer: 'JSON',

    requestTimeout: 50 * 1000,

    retryPolicy: {
      enabled: false,
      retries: 5,
      delay: 100,
      maxDelay: 1000,
      factor: 2,
      check: (err: Errors.MoleculerError): boolean => err && !!err.retryable
    },

    maxCallLevel: 100,
    heartbeatInterval: 10,
    heartbeatTimeout: 30,

    contextParamsCloning: false,

    tracking: {
      enabled: false,
      shutdownTimeout: 5000
    },

    disableBalancer: false,

    registry: {
      strategy: 'RoundRobin',
      preferLocal: true
    },

    circuitBreaker: {
      enabled: false,
      threshold: 0.5,
      minRequestCount: 20,
      windowTime: 60,
      halfOpenTime: 10 * 1000,
      check: (err: Errors.MoleculerError): boolean => err && err.code >= 500
    },

    bulkhead: {
      enabled: false,
      concurrency: 10,
      maxQueueSize: 100
    },

    validator: {
      type: 'Fastest'
    },
    errorHandler: null,

    middlewares: [],

    created: (broker: ServiceBroker): void => console.log('Created ', broker.nodeID)
  }
  return brokerConfig
}
