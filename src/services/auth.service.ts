import { Context, Service, ServiceBroker } from 'moleculer'
import AuthController from '../controllers/auth.controller'
import AuthenticationRequests from './requests/auth.service.request'

export default class HealthChecker extends Service {

  public constructor(broker: ServiceBroker) {
    super(broker)
    this.parseServiceSchema({
      name: 'auth',
      version: 1,
      settings: {
        $noVersionPrefix: true
      },
      dependencies: [],
      actions: {
        check: {
          rest: '/',
          async handler(): Promise<string> {
            return 'Works'
          }
        },

        createUser:{
          rest: 'POST /auth/createUser', 
          params:{
            email:{type:'email'}, 
            password:{type:'string', min:6, max:50}
          },
          async handler(ctx: Context<AuthenticationRequests.ValidateEmailAndPasswordRequest>) {           
            const user = await new AuthController(broker,ctx).createUser(ctx.params.email, ctx.params.password)
            return user
          }
        },

        login:{
          rest: 'POST /auth/login', 
          params:{
            email:{type:'email'}, 
            password:{type:'string', min:6, max:50}
          },
          async handler(ctx: Context<AuthenticationRequests.ValidateEmailAndPasswordRequest>) {            
            const user = await new AuthController(broker,ctx).loginUser(ctx.params.email, ctx.params.password)
            return user
          }
        },

        forgetPassword:{
          rest :'POST /auth/forgetPassword',
          params:{
            email:{type:'email'}
          },
          async handler(ctx:Context<AuthenticationRequests.ForgetPasswordRequest>) {
            return await new AuthController(broker,ctx).forgetPassword(ctx.params.email)
          }
        },
        
        resetPassword:{
          rest: 'GET /auth/resetPassword',
          params:{
            token:{type:'string',min:48,max:48}
          },
          async handler(ctx:Context<AuthenticationRequests.resetPasswordRequest>) {
            await ctx.call('user.fetchUserDataByToken',{ token: ctx.params.token }, { meta: { $cache: false }}) 
            return true
          }
        },

        resetPasswordDo:{
          rest: 'POST /auth/resetPassword',
          params:{
            /** 
             * @todo implement service validation   
             */
             token:{type:'string',min:48,max:48},
             currentPassword:{type:'string', min:6, max:50},
             newPassword:{type:'string', min:6, max:50}
          },
          async handler(ctx:Context<AuthenticationRequests.resetPasswordDoRequest>) {            
            return await new AuthController(broker,ctx).resetPassword(
              ctx.params.token,
              ctx.params.currentPassword,
              ctx.params.newPassword)     
          }
        }
      }
    })
  }
}
