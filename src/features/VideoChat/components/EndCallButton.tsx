import React, {memo} from 'react'
import {StyleSheet, TouchableOpacity, ViewStyle} from 'react-native'
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome'
import {colors} from '../../../shared/theme/colors.ts'
import {faPhoneSlash} from '@fortawesome/free-solid-svg-icons'

type TProps = {
  onPress?: () => void,
}

export const EndCallButton = memo(({onPress}: TProps) => {

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <FontAwesomeIcon icon={faPhoneSlash} size={28} color={colors.white}/>
    </TouchableOpacity>
  )
})

const styles = StyleSheet.create({
  container: {
    height: 64,
    width: 64,
    backgroundColor: colors.negative,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
  } as ViewStyle,

})
