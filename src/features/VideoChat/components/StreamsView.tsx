import React, {memo} from 'react'
import {StyleSheet, View, ViewStyle} from 'react-native'
import {MediaStream, RTCView} from 'react-native-webrtc'
import {colors} from '../../../shared/theme/colors.ts'
import {windowWidth} from '../../../shared/theme/common.ts'

type TProps = {
  streams?: MediaStream[]
  style?: ViewStyle,
}

export const StreamsView = memo(({streams, style}: TProps) => {

  return (
    <View style={[styles.container, style]}>{
      streams?.map(stream => <RTCView
        key={stream.id}
        streamURL={stream.toURL()}
        style={styles.containerItem}
        objectFit="cover"
      />)}
    </View>)
})
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.streamRemoteBackground,
    flexDirection: 'row',
    flexWrap: 'wrap',
  } as ViewStyle,
  containerItem: {
    width: windowWidth / 2,
    height: windowWidth,
  } as ViewStyle,
})
