import {useAuthState} from './authState.ts'
import {authAPI} from './authAPI.ts'
import {UnknownError} from '../../../shared/requests/Errors.ts'
import {useNavigation} from '../../../shared/navigation/interfaces.ts'
import {Pages} from '../../../shared/navigation/screens.ts'

export const useAuthStore = () => {
  const authState = useAuthState()
  const navigation = useNavigation()

  const login = async (email: string, password: string) => {
    try {
      authState.credentials.start()
      const token = await authAPI.signIn(email, password)
      authState.credentials.complete({token})
      navigation.replace(Pages.MainStack);
    } catch (e) {
      authState.credentials.fail(e instanceof Error ? e : new UnknownError())
    }
  }

  const logout = () => {
    authState.credentials.clear()
    navigation.replace(Pages.AuthStack);
  }

  return {login, logout, credentials: authState.credentials.data}
}
