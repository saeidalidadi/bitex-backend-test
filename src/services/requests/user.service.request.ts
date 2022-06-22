
// eslint-disable-next-line @typescript-eslint/no-namespace
namespace UserServiceRequests {

  export interface createANewUserByEmail {
    email: string,
    password: string
  }

  export interface EditUser {
    email?: string,
    name?: string,
    location?: string
  }
  export interface fetchUserDataByToken {
    token: string,
  }
}

export default UserServiceRequests
