import React, {memo, useCallback} from 'react'
import {StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle} from 'react-native'
import {colors} from '../../../shared/theme/colors.ts'

type TProps = {
  roomId: string,
  onPress: (roomId: string) => void,
}

export const CallHistoryElement = memo(({roomId, onPress}: TProps) => {

  const onJoinPress = useCallback(() => {
    onPress(roomId)
  }, [roomId, onPress])

  return (
    <View style={styles.container}>
      <Text style={styles.roomText}>{roomId}</Text>
      <TouchableOpacity style={styles.button} onPress={onJoinPress}>
        <Text style={styles.joinText}>Join</Text>
      </TouchableOpacity>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    gap: 8,
    borderRadius: 18,
    marginVertical: 8,
  } as ViewStyle,
  button: {
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 18,
  } as ViewStyle,
  roomText: {
    fontSize: 16,
    fontWeight: '500',
  } as TextStyle,
  joinText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.white,
  } as TextStyle,
})
