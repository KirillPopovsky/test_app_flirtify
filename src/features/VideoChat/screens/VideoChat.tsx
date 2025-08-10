import React, {memo, useMemo} from "react";
import {Text, View, ViewStyle, StyleSheet} from "react-native";
import * as mediasoupClient from "mediasoup-client";

type TProps = {
}

export const VideoChat = memo(({}: TProps) => {
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <Text>VideoChat</Text>
    </View>
  );
});

const useStyles = () => {

  return useMemo(() =>
    StyleSheet.create({
      container: {} as ViewStyle,
    }), []);
};
