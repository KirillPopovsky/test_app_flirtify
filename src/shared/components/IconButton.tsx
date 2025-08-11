import React, {memo} from 'react'
import {StyleSheet, TouchableOpacity, ViewStyle} from 'react-native'
import {colors} from '../theme/colors.ts'
// @ts-ignore
import {FontAwesomeIcon, IconProp} from '@fortawesome/react-native-fontawesome'

type TProps = {
  onPress?: () => void,
  icon: IconProp,
}

export const IconButton = memo(({icon, onPress}: TProps) => {

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <FontAwesomeIcon icon={icon} size={20} color={colors.white}/>
    </TouchableOpacity>
  )
})

const styles = StyleSheet.create({
  container: {
    height: 36,
    width: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  } as ViewStyle,

})
