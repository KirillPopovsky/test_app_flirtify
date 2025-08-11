import {createNativeStackNavigator} from '@react-navigation/native-stack'
import React from 'react'
import {Pages} from '../screens.ts'
import {View} from 'react-native'
import {RoomList} from '../../../features/VideoChat/screens/RoomList.tsx'
import {RoomCall} from '../../../features/VideoChat/screens/RoomCall.tsx'

const Stack = createNativeStackNavigator()
export const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name={Pages.RoomList} component={RoomList} />
      <Stack.Screen name={Pages.RoomCall} component={RoomCall} />
    </Stack.Navigator>
  )
}
