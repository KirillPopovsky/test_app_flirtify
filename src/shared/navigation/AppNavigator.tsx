import {createNativeStackNavigator} from '@react-navigation/native-stack'
import {Pages} from './screens.ts'
import {AuthorizationStack} from './stacks/AuthorizationStack.tsx'
import {MainStack} from './stacks/MainStack.tsx'
import {useAuthState} from '../../features/Authorization/common/authState.ts'

const Stack = createNativeStackNavigator()
export const AppNavigator = () => {
  const isAuth = useAuthState().credentials.data.content.token;
  const initialRouteName = !isAuth ? Pages.AuthStack : Pages.MainStack;
  return (
    <Stack.Navigator screenOptions={{headerShown: false}} initialRouteName={initialRouteName}>
      <Stack.Screen name={Pages.AuthStack} component={AuthorizationStack}/>
      <Stack.Screen name={Pages.MainStack} component={MainStack}/>
    </Stack.Navigator>
  )
}
