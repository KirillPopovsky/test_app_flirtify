import React, {memo} from 'react'
import {StyleSheet, Text, View, ViewStyle} from 'react-native'
import {EndCallButton} from '../components/EndCallButton.tsx'
import {StreamView} from '../components/StreamView.tsx'
import {colors} from '../../../shared/theme/colors.ts'
import {useRoomClient} from '../common/useRoomClient.ts'
import {StreamsView} from '../components/StreamsView.tsx'

type TProps = {}

export const RoomCall = memo(({}: TProps) => {
  const {onEndCallPress, localStream, remoteStreams} = useRoomClient()

  return (
    <View style={styles.container}>
      <View style={styles.endCallButton}>
        <EndCallButton onPress={onEndCallPress}/>
      </View>
      <StreamView style={styles.localStream} stream={localStream}/>
      {remoteStreams.length < 2 ?<StreamView style={styles.remoteStream} stream={remoteStreams[0]}/>:
        <StreamsView style={styles.remoteStream} streams={remoteStreams}/>}
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
  } as ViewStyle,
  endCallButton: {
    position: 'absolute',
    bottom: 48,
    alignSelf: 'center',
    zIndex: 10,
  } as ViewStyle,
  remoteStream: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  } as ViewStyle,
  localStream: {
    position: 'absolute',
    right: 16,
    bottom: 150,
    zIndex: 2,
    width: 120,
    height: 200,
    borderColor: colors.border,
    borderWidth: .3,
    borderRadius: 16,
    backgroundColor: colors.streamLocalBackground,
  } as ViewStyle,
})
