import React from 'react'
import {AppNavigator} from './src/shared/navigation/AppNavigator.tsx'
import {NavigationContainer} from '@react-navigation/native'

export default function App() {

  return (
    <NavigationContainer>
      <AppNavigator/>
    </NavigationContainer>
  )
}
