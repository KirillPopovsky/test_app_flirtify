import React, {memo} from 'react'
import {ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle} from 'react-native'
import {colors} from '../theme/colors.ts'

type TProps = {
  text: string,
  isLoading?: boolean,
  onPress?: () => void,
}

export const Button = memo(({text, isLoading,onPress }: TProps) => {

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.text}>{text}</Text>
      {isLoading && <ActivityIndicator size={'small'} color={'white'}/>}
    </TouchableOpacity>
  )
})

const styles = StyleSheet.create({
  container: {
    height: 44,
    paddingHorizontal: 16,
    alignSelf: 'stretch',
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
    borderRadius: 18,
  } as ViewStyle,
  text:{
    color: 'white',
    fontSize: 14,
  }
})
