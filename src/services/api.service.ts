import { IncomingMessage, ServerResponse } from 'http'
import { Service, ServiceBroker, Context } from 'moleculer'
import ApiGateway  from 'moleculer-web'
import { BBError } from '../../bitex'
import AuthController from '../controllers/auth.controller'
import UserController from '../controllers/user.controller'
import { User } from '../models/db/entity/user'


class CustomIncomingMessage extends IncomingMessage {
  public $action: Record<string, unknown>
}

export default class ApiService extends Service {

  public constructor(broker: ServiceBroker) {
    super(broker)
    this.parseServiceSchema({
      name: 'api',
      mixins: [ApiGateway],
      settings: {
        port: process.env.SERVER_PORT || 3001,
        routes: [{
          path: '/api',
          whitelist: [
            '**'
          ],
          use: [],
          mergeParams: true,
          authentication: true,
          authorization: true,
          autoAliases: true,

          aliases: {},

          callingOptions: {},

          bodyParsers: {
            json: {
              strict: false,
              limit: '1MB'
            },
            urlencoded: {
              extended: true,
              limit: '1MB'
            }
          },

          mappingPolicy: 'all',
          logging: true,

          onBeforeCall(
            ctx: Context<never, { request: IncomingMessage, clientIp: string | string[] }>,
            route: never,
            req: IncomingMessage,
            res: ServerResponse
          ) {
            ctx.meta.request = req
           
            ctx.meta.clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress 
          }
        }],
        log4XXResponses: false,
        logRequestParams: null,
        logResponseData: null,
        assets: {
          folder: 'public',
          options: {}
        },

        onError(req: IncomingMessage, res: ServerResponse, err: Error) {
          if (err instanceof BBError) {
            res.writeHead(err.statusCode, { 'Content-Type': 'application/json' }).write(err.stringify())
          } else {
            res.writeHead(400, { 'Content-Type': 'application/json' }).write(JSON.stringify(err))
          }
          res.end()
        }
      },

      methods: {
        async authenticate(
          ctx: Context,
          route: Record<string, undefined>,
          req: CustomIncomingMessage
        ): Promise<User> {
          const auth = req.headers.authorization
          if (auth && auth.startsWith('Bearer')) {
            const accessToken = auth.slice(7)
            const authController = new AuthController(broker)
            try {
              const tokenValidationResult = (await authController.decryptToken(accessToken))
              if (tokenValidationResult.type === 'refresh') {
                throw BBError.InternalServerError
              }
              const userController = new UserController(broker)
              const userId = tokenValidationResult.id
              const user = await userController.fetchUserById(userId)
              return user
            } catch (error) {
              if (req.$action.auth) {
                throw error
              }
              return null
            }
          } else {
            return null
          }
        },

        async authorize(
          ctx: Context<unknown, { user: User }>,
          route: Record<string, undefined>,
          req: CustomIncomingMessage
        ): Promise<void> {
          const user = ctx.meta.user
          if (req.$action.auth && !user) {
            throw BBError.AccessDenied
          }
        }
      }
    })
  }
}
