import { Context, Service, ServiceBroker } from 'moleculer'
import { BBError } from '../../bitex'
import UserController from '../controllers/user.controller'
import UserServiceRequests from './requests/user.service.request'
import UserServiceResponse from './responses/user.service.response'

export default class UserService extends Service {

  public constructor(broker: ServiceBroker) {
    super(broker)
    this.parseServiceSchema({
      name: 'user',
      version: 1,
      settings: {
        $noVersionPrefix: true
      }, 
      dependencies: [],
      actions: {

        fetchUserByEmailAddress: {
          cache: {
            enabled: true,
            keys: ['emailAddress']
          },
          async handler(ctx: Context<UserServiceRequests.createANewUserByEmail>): Promise<UserServiceResponse.EditUser> {
            const emailAddress = ctx.params.email
            const user = await new UserController(broker).fetchUserDataByEmailAddress(emailAddress)
            return user
          }
        },

        fetchUserDataByToken: {
          cache: {
            enabled: true,
            keys: ['token']
          },
          async handler(ctx:Context<UserServiceRequests.fetchUserDataByToken>): Promise<UserServiceResponse.EditUser> {
            const user =await new UserController(broker).fetchUserDataByToken(ctx.params.token)
            if (!user) {
              throw BBError.InternalServerError
            }
            return user
          }
        },

        createANewUserByEmail : {
          async handler(ctx: Context<UserServiceRequests.createANewUserByEmail>): Promise<UserServiceResponse.CreateNewUser> {            
            const user = await new UserController(this.broker).createANewUserByEmailAndSaveToDb(ctx.params.email, ctx.params.password)            
            return user
          }
        }
      }
    })
  }
}
