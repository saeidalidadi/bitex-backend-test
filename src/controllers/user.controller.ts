import { ServiceBroker } from 'moleculer'
import { getConnectionManager } from 'typeorm'
import { BBError } from '../../bitex'
import { User } from '../models/db/entity/user'
import Controller, { CachePrefix } from './controller'
import { createConnection } from 'typeorm'
import { TypeOrmDatabaseConfig } from '../../ormconfig'
import bcrypt  from  'bcryptjs'
 
export enum BotStrategy {
  CONSERVATIVE = 'conservative',
  MODERATE = 'moderate',
  AGGRESSIVE = 'aggressive'
}

export default class UserController extends Controller {

  constructor(broker: ServiceBroker) {
    super(broker)

  }
    
  public async updateUserPassword(user:User , password:string):Promise<boolean>{
    const newData = {
      ...user, 
      ...{
        password:password,
        resetPasswordToken:''
      }
    }
    try{
      const dbConnection = getConnectionManager().get('main')     
      const result = await dbConnection.getRepository(User).save(newData)
      await dbConnection.queryResultCache.remove([
        this.generateCacheName(user.resetPasswordToken, CachePrefix.FETCH_USER_TOKEN),
        this.generateCacheName(user.email, CachePrefix.FETCH_USER_EMAIL)
      ])
      return result ? true : false   
    }catch(err){
      console.log(err)
      throw BBError.DataBaseServerError      
    }
  }
  
  public async getUserByToken(token:string):Promise<boolean> {
    try{
      const dbConnection = getConnectionManager().get('main') 
      const result = await dbConnection.getRepository(User).findOne({resetPasswordToken : token})    
      return (result)? true: false
    }catch(err){
      console.log(err)
      return false 
    }    
  }

  public async updateUserToken(user:User, token:string): Promise<boolean>{
    try{
      const dbConnection = getConnectionManager().get('main') 
      user = {
        ...user,
        ...{ token: token}
      }
      await dbConnection.getRepository(User).save(user)
      
      return true
    }catch(err){
      console.log(err)
      return false 
    }    
  }

  public async updateUserResetPasswordToken(user:User , token:string):Promise<boolean>{
    user = {
      ...user, 
      ...{
        resetPasswordToken:token
      }
    }

    try{
      const dbConnection = getConnectionManager().get('main') 
      const result = await dbConnection.getRepository(User).save(user)
      await dbConnection.queryResultCache.remove([
        this.generateCacheName(token, CachePrefix.FETCH_USER_TOKEN)
      ])
      return result ? true : false 
    }catch(err){
      console.log(err)
      throw BBError.DataBaseServerError      
    }
  }

  public async fetchUserDataByToken(token: string): Promise<User | undefined> {    
    const dbConnection = getConnectionManager().get('main') 
    const user = await dbConnection.getRepository(User).findOne({resetPasswordToken:token}, {
      cache: {
        id: this.generateCacheName(token, CachePrefix.FETCH_USER_TOKEN),
        milliseconds: this.ormCacheTime
      }
    })   
    return user
  }

  public async fetchUserDataByEmailAddress(email: string): Promise<User | undefined> {
    
    if (!getConnectionManager().has('main'))
      await createConnection(TypeOrmDatabaseConfig) 
   
    const dbConnection = getConnectionManager().get('main') 
    const user = await dbConnection.getRepository(User).findOne({ email: email }, {
      cache: {
        id: this.generateCacheName(email, CachePrefix.FETCH_USER_EMAIL),
        milliseconds: this.ormCacheTime
      }
    })
   
    return user
  }


  public async fetchUserById(id: number): Promise<User | undefined> {
    const dbConnection = getConnectionManager().get('main')
    const user = await dbConnection.getRepository(User).findOne(id, {
      cache: {
        id: this.generateCacheName(id, CachePrefix.FETCH_USER_ID),
        milliseconds: this.ormCacheTime
      }
    })
    return user
  }

  public async createANewUserByEmailAndSaveToDb(email: string,password: string): Promise<User> {
    const userInDb = await this.fetchUserDataByEmailAddress(email)
    if (userInDb) {
      throw BBError.InternalServerError
    }
    try {
      const dbConnection = getConnectionManager().get('main')
      const user = new User()
      user.email = email

      const salt = bcrypt.genSaltSync()
      const hashPassword = bcrypt.hashSync(password, salt)

      user.password = hashPassword
      user.salt = salt
      await dbConnection.getRepository(User).save(user)

      await dbConnection.queryResultCache.remove([
        this.generateCacheName(user.email, CachePrefix.FETCH_USER_EMAIL)
      ])

      const userInDb = await this.fetchUserDataByEmailAddress(email)
      return userInDb
    } catch (error) {
      throw BBError.DataBaseServerError
    }
  }
  
}
