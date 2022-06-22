

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace AuthServiceRequests {

  export interface resetPasswordRequest {
    token: string,
  }

  export interface resetPasswordDoRequest {
    token: string,
    currentPassword:string,
    newPassword:string,
    confirmPassword:string,
  }
  
  export interface ValidateEmailAndPasswordRequest{
    email:string,
    password: string
  }

  export interface ForgetPasswordRequest{
    email:string,
  }

  export interface ResetPasswordRequest{
    currentPassword:string,
    newPassword:string,
    confirmPassword:string
  }
}

export default AuthServiceRequests
