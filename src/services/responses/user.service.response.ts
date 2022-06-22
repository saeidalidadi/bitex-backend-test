import { User } from '../../models/db/entity/user'


// eslint-disable-next-line @typescript-eslint/no-namespace
namespace UserServiceResponse {

  export type CreateNewUser = User

  export type EditUser = User
}

export default UserServiceResponse
