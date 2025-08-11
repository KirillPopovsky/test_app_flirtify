import React, {memo, useCallback, useState} from 'react'
import {FlatList, SafeAreaView, StyleSheet, Text, TextStyle, View, ViewStyle} from 'react-native'
import {Header} from '../../../shared/components/Header.tsx'
import {Input} from '../../../shared/components/Input.tsx'
import {IconButton} from '../../../shared/components/IconButton.tsx'
import {faVideo} from '@fortawesome/free-solid-svg-icons'
import {CallHistoryElement} from '../components/CallHistoryElement.tsx'
import {ListRenderItemInfo} from '@react-native/virtualized-lists/Lists/VirtualizedList'
import {Button} from '../../../shared/components/Button.tsx'
import {colors} from '../../../shared/theme/colors.ts'
import {useAuthStore} from '../../Authorization/common/authStore.ts'
import {useNavigation} from '../../../shared/navigation/interfaces.ts'
import {Pages} from '../../../shared/navigation/screens.ts'
import {useVideoChatStore} from '../common/useVideoChatStore.ts'
import {PermissionChecker} from '../components/PermissionChecker.tsx'

type TProps = {}

export const RoomList = memo(({}: TProps) => {
  const [roomId, setRoomId] = useState('')
  const  navigation = useNavigation()
  const {logout} = useAuthStore()
  const {handleJoinRoom, rooms} = useVideoChatStore()

  const onJoinRecentRoomPress = useCallback((roomId: string) => navigation.navigate(Pages.RoomCall, {roomId}), [])
  const onJoinRoomPress = useCallback(() => {
    navigation.navigate(Pages.RoomCall, {roomId})
    handleJoinRoom(roomId)
  }, [roomId, handleJoinRoom])

  const renderRoom = useCallback(({item}: ListRenderItemInfo<string>) =>
    <CallHistoryElement roomId={item} onPress={onJoinRecentRoomPress}/>, [])

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Header text={'Video Chat'}/>
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Input
              placeholder={'Enter room id'}
              onChangeText={setRoomId}
              inputMode={'text'}
              onSubmitEditing={onJoinRoomPress}
            />
          </View>
          <IconButton icon={faVideo} onPress={onJoinRoomPress}/>
        </View>
        <Text style={styles.recentRoomsLabel}>Recent rooms</Text>
        <FlatList data={rooms} renderItem={renderRoom}/>
        <PermissionChecker/>
        <Button text={'Logout'} color={colors.negative} onPress={logout}/>
      </View>
    </SafeAreaView>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    paddingHorizontal: 16,
  } as ViewStyle,
  inputWrapper: {flex: 1} as ViewStyle,
  inputContainer: {
    marginTop: 16,
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    gap: 8,
  } as ViewStyle,
  recentRoomsLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
  } as TextStyle,
})
