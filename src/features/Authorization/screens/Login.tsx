import React, {memo, useCallback, useMemo, useState} from 'react'
import {
  ImageStyle,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native'
import {Input} from '../../../shared/components/Input.tsx'
import {Button} from '../../../shared/components/Button.tsx'
import {colors} from '../../../shared/theme/colors.ts'
import {faVideo} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome'
import {useAuthStore} from '../common/authStore.ts'
import {isLoading} from '../../../shared/requests/Loading.ts'

type TProps = {}

export const Login = memo(({}: TProps) => {
  const {credentials, login} = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const passwordRef = React.useRef<TextInput>(null)

  const isLogining = useMemo(() => isLoading(credentials.loadingState), [credentials.loadingState])

  const onLoginPress = useCallback(() =>
    login(email, password), [email, password])
  const onSubmitEmail = useCallback(() => passwordRef.current?.focus(), [email])

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <FontAwesomeIcon icon={faVideo} size={40} color={colors.primary}/>
        <Text style={styles.header}>Video Chat</Text>
      </View>
      <View style={styles.inputContainer}>
        <Text>Email Address</Text>
        <Input
          placeholder={'Enter your email'}
          inputMode={'email'}
          enterKeyHint={'next'}
          onChangeText={setEmail}
          onSubmitEditing={onSubmitEmail}/>
      </View>
      <View style={styles.inputContainer}>
        <Text>Password</Text>
        <Input
          ref={passwordRef}
          placeholder={'Enter your password'}
          enterKeyHint={'go'}
          secureTextEntry
          onChangeText={setPassword}
          onSubmitEditing={onLoginPress}/>
      </View>
      <View style={styles.errorContainer}>
        <Text style={styles.error}>{credentials?.error?.message}</Text>
      </View>
      <Button text={'Login'} isLoading={isLogining} onPress={onLoginPress}/>
    </View>
    </TouchableWithoutFeedback>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
  } as ViewStyle,
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
  } as TextStyle,
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
    marginTop: 150,
  } as ViewStyle,
  header: {
    fontSize: 32,
    fontWeight: '500',
  } as TextStyle,
  error: {
    fontSize: 12,
    color: colors.negative,
    fontWeight: '200',
  } as TextStyle,
  errorContainer: {
    height: 72,
    justifyContent: 'center',
  } as ViewStyle,
  inputContainer: {
    gap: 8,
    alignSelf: 'stretch',
    marginTop: 16,
    marginBottom: 3,
  } as ViewStyle,
  icon: {
    backgroundColor: '#6B8A4D',
    width: 32,
    height: 32,
    resizeMode: 'contain',
  } as ImageStyle,
})
