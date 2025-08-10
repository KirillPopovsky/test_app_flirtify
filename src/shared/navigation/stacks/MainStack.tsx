import {createNativeStackNavigator} from '@react-navigation/native-stack'
import React from 'react'
import {Pages} from '../screens.ts'
import {View} from 'react-native'

const Stack = createNativeStackNavigator()
export const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name={Pages.RoomList} component={View} />
      <Stack.Screen name={Pages.RoomCall} component={View} />
    </Stack.Navigator>
  )
}
