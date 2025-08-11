import React, {memo} from 'react'
import {StyleSheet, Text, TextStyle, View, ViewStyle} from 'react-native'
import {colors} from '../theme/colors.ts'

type TProps = {
  text: string,
}

export const Header = memo(({text}: TProps) => {

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>{text}</Text>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    height: 44,
    paddingHorizontal: 16,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomColor: colors.border,
  } as ViewStyle,
  headerTitle: {
    fontSize: 24,
    fontWeight: '500',
  } as TextStyle,
})
