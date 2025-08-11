import React, {memo} from 'react'
import {ActivityIndicator, StyleSheet, View, ViewStyle} from 'react-native'
import {MediaStream, RTCView} from 'react-native-webrtc'
import {colors} from '../../../shared/theme/colors.ts'

type TProps = {
  style?: ViewStyle,
  stream?: MediaStream
}

export const StreamView = memo(({stream, style}: TProps) => {

  return (!!stream ?
      <RTCView
        streamURL={stream.toURL()}
        style={style}
        objectFit="cover"
      />
      : <View style={[styles.container, style]}>
        <ActivityIndicator size={'large'} color={'white'}/>
      </View>
  )
})
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.streamRemoteBackground,
  } as ViewStyle,
})
