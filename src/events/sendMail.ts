import { Context } from 'moleculer'
import EmailRequests from '../controllers/requests/email.request'

module.exports = {
  name: 'emailSend',
  events: {
    'email.send': {
      group: 'email',
      handler(ctx:Context<EmailRequests.SendMailRequest>) {
        console.log('i am calling with '+ ctx.params.to)
      }
    }
  }
}