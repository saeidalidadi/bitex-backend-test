import { Subscription } from '../models/db/entity/subscription'
import { User } from '../models/db/entity/user'

class UserControllerProps {

}

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace UserControllerProps {
  export interface EditUser {
    email?: string,
    name?: string,
    location?: string
  }

  export interface BotStatus {
    botStatus: string
  }

  export interface UserDetails extends User {
    accountBalance?: number,
    latestSubscription?: Subscription
  }

  export interface AccountValue {
    accountValue: number
  }
}

export default UserControllerProps
