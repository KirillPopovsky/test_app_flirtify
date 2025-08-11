import {AuthInvalidCredentialsError} from '../../../shared/requests/Errors.ts'
import {BaseRequest} from '../../../shared/requests/BaseRequest.ts'

class AuthAPI extends BaseRequest{
  async signIn(email: string, passwords: string): Promise<string> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if(email !== '' && passwords !== ''){
          //this.fetch('login', {email, password})
          const token = Math.random().toString(36).substring(2, 16);
          resolve(token);
        } else {
          reject(new AuthInvalidCredentialsError())
        }

      }, 2000);
    });
  }
}

export const authAPI = new AuthAPI('https://api.example.com/auth/');
