import React, {memo, useMemo} from 'react'
import {ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle} from 'react-native'
import {colors} from '../theme/colors.ts'

type TProps = {
  text: string,
  isLoading?: boolean,
  onPress?: () => void,
  color?: string,
}

export const Button = memo(({text, isLoading, onPress, color}: TProps) => {

  const buttonStyle = useMemo(() => [styles.container, {backgroundColor: color ?? colors.primary}], [color])

  return (
    <TouchableOpacity style={buttonStyle} onPress={onPress}>
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
    color: colors.white,
    fontSize: 14,
  }
})
