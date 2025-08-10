import React, {memo} from 'react'
import {StyleSheet, TextInput, TextInputProps, TextStyle, ViewStyle} from 'react-native'
import {colors} from '../theme/colors.ts'

export const Input = memo((props: TextInputProps) => {

  return (
      <TextInput
        placeholderTextColor={colors.placeholder}
        style={styles.input}
        {...props}
      />
  )
})

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 8,
  } as TextStyle,
})
