import React, {memo, useCallback, useEffect} from 'react'
import {AppState, Linking, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle} from 'react-native'
import {usePermissionCheck} from '../common/usePermissionCheck.ts'
import {colors} from '../../../shared/theme/colors.ts'

type TProps = {}

export const PermissionChecker = memo(({}: TProps) => {
  const {isDenied, checkPermission} = usePermissionCheck()
  const appState = AppState

  useEffect(() => {
    checkPermission()
    const subscription = AppState.addEventListener('change', checkPermission)
    return () => subscription.remove()
  }, [])

  const onOpenSettingsPress = useCallback(() => Linking.openSettings(), [])

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

    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
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
