import { ServiceBroker, Context, Errors } from 'moleculer'
import auth from '../services/auth.service'
import { User } from '../models/db/entity/user'
import { Any, Connection, createConnection, getConnection } from 'typeorm'
import {LoginResponse} from '../controllers/responses/auth.response'

import { getConnectionManager } from 'typeorm'
import UserController from '../controllers/user.controller'
import bcrypt  from  'bcryptjs'
import UserService from '../services/user.service'

describe('auth actions', () => {
  const broker = new ServiceBroker({ logger: false })
  const authService = broker.createService(auth)
  const userService = broker.createService(UserService)
 
  afterAll(() => {     
    broker.stop()
  })

  beforeAll(async () => {
    await broker.start()                  
  })


  /**implemted just for intruduce how to correct coding */
  describe('auth create user action',()=>{
    beforeAll(async()=>{
      const existUser:User = await broker.call('user.fetchUserByEmailAddress',{email:'email@gmail.com'})     
      if(existUser){
        const dbConnection = getConnectionManager().get('main')      
        await dbConnection.getRepository(User).delete(existUser)
      }
    })

    it('should create user with valid data',async () => {              
      try{                       
        const result:LoginResponse = await broker.call('auth.createUser',{
          email: 'email1@gmail.com',
          password: '12345678' 
        })
        expect(result.token_type).toBe('bearer') 
      }catch(err){
        expect(err.statusCode).toBe(400)
      }         
    })

    const inputData = [
      [ 'emailgmailcom', '12345678' ,422],
      [ 'emailgmail.com', '12345678' ,422],
      [ 'email@gmailcom', '12345678' ,422],
      [ 'email@gmail.com', '12345678' ,200],
      [ 'email@gmail.com', '1245' ,422],
      [ null, '12345678' ,422],
      [ 'email@gmail.com', '' ,422],
      [ null, null ,422]
    ]
        
    it.each(inputData)('should not create user with invalid data',async (email,password,result) => {   
      try{                       
        const returnData:LoginResponse = await broker.call('auth.createUser',{
          email: email,
          password: password 
        })     
        expect(returnData.token_type).toBe('bearer') 
      }catch(err){   
        expect(err.code).toBe(result)
        expect(err.type).toBe('VALIDATION_ERROR')
      }            
    })
  })

  describe('auth login by email action',()=>{
    beforeAll(async()=>{
      const existUser:User = await broker.call('user.fetchUserByEmailAddress',{email:'email3@gmail.com'})     
      if(!existUser){ 
        const tempUser = await broker.call('auth.createUser',{email: 'email3@gmail.com', password: '12345678' })            
      }
    })   

    it('should be return a token for valid user info',async()=>{                         
      const result:LoginResponse = await broker.call('auth.login',{
        email: 'email3@gmail.com',
        password: '12345678' 
      })
      expect(result.token_type).toBe('bearer')                   
    })

    it('should be return an error for not exist user',async()=>{                           
      try{         
        const result:LoginResponse = await broker.call('auth.login',{
          email: 'email---@gmail.com',
          password: '12345678' 
        })
        throw new Error('this code must be thow an error')                
      }catch(err)
      {
        expect(err.statusCode).toBe(500)
      }  
    })
  })

  describe('auth reset password actions',()=>{
    const token = '345345325423453gw4453453453453453454312345678987'
    beforeAll(async()=>{
      let existUser:User = await broker.call('user.fetchUserByEmailAddress',{email:'email3@gmail.com'})     
      if(!existUser){ 
        existUser = await broker.call('auth.createUser',{email: 'email3@gmail.com', password: '12345678' })            
      }
             
      const controller = (new UserController(broker))
      await controller.updateUserResetPasswordToken(existUser,token)
    })   

    it('should open reset password page with valid token',async()=>{
      const result = await broker.call('auth.resetPassword',{
        token: token
      })
      expect(result).toBe(true)
    })

    it('should not open reset password page with invalid token',async()=>{
      try{
        await broker.call('auth.resetPassword',{
          token: '000000000000000000000000000000000000000000000000'
        })
      } catch(err){
        expect(err.statusCode).toBe(500)
      }            
    })

    it('should change user password corectly',async()=>{
      const result = await broker.call('auth.resetPasswordDo',{
        token:token ,
        currentPassword:'12345678', 
        newPassword:'12345679',
        confirmPassword:'12345679'   
      })
      const controller = (new UserController(broker))
      const user =await controller.fetchUserDataByEmailAddress('email3@gmail.com')
      const hashPassword = bcrypt.hashSync('12345679', user.salt)
      expect(user.password).toBe(hashPassword)
      //undo change for next tests
      await controller.updateUserResetPasswordToken(user,token)
    })

    const inputData = [
      [ '', '12345678','12345678' ,422],
      [ '12345678', '','12345678' ,422],
      [ '12345678', '12345679','' ,422],
      [ '12345679', '12345679','12345679' ,200]
    ]
        
    it.each(inputData)('should work with varius case of password data',async (currentPassword,newPassword,confirmPassword,result) => {   
      try{
        const returnData:LoginResponse = await broker.call('auth.resetPasswordDo',{
          token:token,
          currentPassword: currentPassword,
          newPassword: newPassword,
          confirmPassword: confirmPassword 
        })     
        expect(returnData).toBe(true) 
      }catch(err){              
        expect(err.code).toBe(result)
        expect(err.type).toBe('VALIDATION_ERROR')
      }            
    })
  })

  describe('forget password action',()=>{
    it('should raise email send event after call that action',async()=>{
      broker.emit = jest.fn()
      await broker.call('auth.forgetPassword',{email: 'email3@gmail.com'})          
      expect(broker.emit).toHaveBeenCalledWith('email.send', expect.objectContaining({to: 'email3@gmail.com'}))
    })
  })

})