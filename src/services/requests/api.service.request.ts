import { User } from '../../models/db/entity/user'

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace ApiServiceRequest {
  export interface AuthenticatedMetaData {
      user: User,
      $statusCode: number
  }
}

export default ApiServiceRequest
