import {createNativeStackNavigator} from '@react-navigation/native-stack'
import React from 'react'
import {Pages} from '../screens.ts'
import {Login} from '../../../features/Authorization/screens/Login.tsx'

const Stack = createNativeStackNavigator()
export const AuthorizationStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name={Pages.Login} component={Login}/>
    </Stack.Navigator>
  )
}
