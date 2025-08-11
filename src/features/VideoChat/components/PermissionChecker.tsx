import React, {memo, useCallback, useEffect} from 'react'
import {Linking, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle} from 'react-native'
import {usePermissionCheck} from '../common/usePermissionCheck.ts'
import {colors} from '../../../shared/theme/colors.ts'

type TProps = {}

export const PermissionChecker = memo(({}: TProps) => {
  const {isDenied, checkPermission} = usePermissionCheck()

  useEffect(() => {
    checkPermission()
  }, [])

  const onOpenSettingsPress = useCallback(() => {
    Linking.openSettings()
  }, [])

  return (
    isDenied ?
      <TouchableOpacity style={styles.container} onPress={onOpenSettingsPress}>
        <Text style={styles.text}>Permission to mic and camera are not granted.
          <Text style={styles.textLink}> Open settings </Text>
          to grant permissions
        </Text>
      </TouchableOpacity> : null
  )
})

const styles = StyleSheet.create({
  container: {
    margin: 24,
  } as ViewStyle,
  text: {
    fontSize: 14,
    textAlign: 'center',
  } as TextStyle,
  textLink: {
    fontSize: 14,
    color: colors.link,
  } as TextStyle,
})
