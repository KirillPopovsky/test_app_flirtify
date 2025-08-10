import {useAuthState} from './authState.ts'
import {authAPI} from './authAPI.ts'
import {UnknownError} from '../../../shared/requests/Errors.ts'

export const useAuthStore = () => {
  const authState = useAuthState()

  const login = async (email: string, password: string) => {
    try {
      authState.credentials.start()
      const token = await authAPI.signIn(email, password)
      authState.credentials.complete({token})
    } catch (e) {
      authState.credentials.fail(e instanceof Error ? e : new UnknownError())
    }
  }

  return {login, credentials: authState.credentials.data}
}
