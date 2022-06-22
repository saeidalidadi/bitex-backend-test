
// eslint-disable-next-line @typescript-eslint/no-namespace
namespace EmailRequests {
  export interface SendMailRequest {
    to: string,
    subject:string,
    body:string
  }

}

export default EmailRequests
