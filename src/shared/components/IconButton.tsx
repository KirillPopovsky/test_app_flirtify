import React, {memo, useMemo} from 'react'
import {StyleSheet, TouchableOpacity, ViewStyle} from 'react-native'
import {colors} from '../theme/colors.ts'
// @ts-ignore
import {FontAwesomeIcon, IconProp} from '@fortawesome/react-native-fontawesome'

type TProps = {
  onPress?: () => void,
  icon: IconProp,
  disabled?: boolean,
}

export const IconButton = memo(({icon, onPress, disabled}: TProps) => {

  const style = useMemo(() => disabled ? styles.containerDisabled : styles.container, [disabled])
  return (
    <TouchableOpacity disabled={disabled} style={style} onPress={onPress}>
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
  containerDisabled: {
    height: 36,
    width: 36,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  } as ViewStyle,

})
