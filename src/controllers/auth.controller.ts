import { BBError } from '../../bitex'
import JWT from 'jsonwebtoken'
import { Context, ServiceBroker } from 'moleculer'
import { User } from '../models/db/entity/user'
import UserController, { BotStrategy } from './user.controller'
import Controller from './controller'
import { LoginResponse,JWTPayload } from './responses/auth.response'
import bcrypt  from  'bcryptjs'
import * as crypto from 'crypto'


export default class AuthController<Req = unknown, Res extends {} = {}> extends Controller {
  private expireTime: number

  constructor(broker: ServiceBroker, ctx?: Context<Req, Res>) {
    super(broker, ctx)
    this.expireTime = 3600
  }

  /**implemented just for introduce how to correct coding */
  public async createUser(email: string , password: string): Promise<LoginResponse>{
    if (!email || !password) {
      throw BBError.InternalServerError
    }
  
    let user: User = await this.context.call('user.fetchUserByEmailAddress', { email: email }, { meta: { $cache: false }})
    if (user) {
      throw BBError.InternalServerError
    }
 
    user = await this.context.call('user.createANewUserByEmail', { email: email,  password: password })
    return this.makeLoginToken(user)

  }

  public async loginUser(email: string , password: string): Promise<LoginResponse>{
    
    /**
     * @todo implement login logic
     */

    return this.makeLoginToken(user)

  }

  public async resetPassword(token:string, currentPassword:string, newPassword:string):Promise<boolean>{
      
    const userController = new UserController(this.broker)
    const user: User = await userController.fetchUserDataByToken(token)
    if (!user) {
      throw BBError.InternalServerError
    }
    
    /**
     * @todo implement check password and reset password
     */
   
  }

  public async forgetPassword(emailAddress:string):Promise<Boolean>{
    /**
     * @todo implement user exist check
     */
   
    const token:string = this.getForgetPasswordToken()
    const result = await new UserController(this.broker).updateUserToken(user,token)
    if (!result) {
      throw BBError.DataBaseServerError
    }

    const to:string = emailAddress 
    const subject = 'reset password email'
    const body = 'reset password email body'
    
    /**
     * @todo: implement send mail event call
     */
    
    return true 
  }

  /**
   * the following methods do not need to change
   */

  private getForgetPasswordToken():string{
    return crypto.randomBytes(48).toString('hex')
  }

  private makeLoginToken(user:User){
    
    const tokens: LoginResponse = {
      access_token: this.generateToken(user, 'access'),
      refresh_token: this.generateToken(user, 'refresh'),
      expires_in: this.expireTime,
      token_type: 'bearer'
    }
    return tokens

  }

  private generateToken(user: User, type: 'access' | 'refresh'): string {
    const jwtExpirySeconds = type === 'access' ? this.expireTime : this.expireTime * 100000
    const data: JWTPayload = {
      id: user.id,
      type: type,
      privileges: []
    }
    const token = JWT.sign(data, process.env.JWT_KEY, {
      algorithm: 'HS512',
      expiresIn: jwtExpirySeconds
    })
    return token
  }

  public async decryptToken(token: string): Promise<JWTPayload> {
    try {
      const decoded = JWT.verify(token, process.env.JWT_KEY, { algorithms: ['HS512'] })
      const result: JWTPayload = {
        id: (<JWTPayload>decoded).id,
        type: (<JWTPayload>decoded).type,
        privileges: (<JWTPayload>decoded).privileges
      }
      return result
    } catch (error) {
      if (error instanceof JWT.TokenExpiredError) {
        throw BBError.TokenExpired
      }
      throw BBError.AccessDenied
    }
  }
}
