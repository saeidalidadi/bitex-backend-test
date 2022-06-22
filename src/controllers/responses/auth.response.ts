 
export interface LoginResponse {
        access_token: string,
        refresh_token: string,
        token_type: 'bearer',
        expires_in: number
      }
      
export interface JWTPayload {
        id: number,
        type: 'access' | 'refresh',
        privileges: string[]
      }
 