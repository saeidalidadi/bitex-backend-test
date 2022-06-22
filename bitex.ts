
export class BBError extends Error {

  public errorCode: number
  private uri: string
  private retryable = false
  public statusCode = 400

  constructor(message: string, code: number, uri: string, statusCode: number, retryable = false) {
    super(message)
    this.errorCode = code
    this.uri = uri
    this.statusCode = statusCode
    this.retryable = retryable
  }

  public stringify(): string {
    return JSON.stringify({
      message: this.message,
      code: this.errorCode,
      uri: this.uri,
      retryable: this.retryable
    })
  }

  static InternalServerError = new BBError('Internal Server Error', 50_000, '', 500, true)
  static DataBaseServerError = new BBError('Database Server Error', 50_001, '', 500, true)
  static TransporterServerError = new BBError('Transporter Server Error',50_002, '', 500, true)
  static RedisServerError = new BBError('Redis Server Error',50_003, '', 500, true)


  static AccessDenied = new BBError('Access Denied', -1, '', 401, false)
  static TokenExpired = new BBError('Access Token Expired', -2, '', 401, false)
 
}
