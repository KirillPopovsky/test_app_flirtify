import {isAndroid, isIos} from '../../../shared/theme/common.ts'
import {check, PERMISSIONS, RESULTS} from 'react-native-permissions'
import {useState} from 'react'

export const usePermissionCheck = () => {
  const [isDenied, setIsDenied] = useState(false)
  const checkPermission = async () => {
    if (isIos) {
      const resultCamera = await check(PERMISSIONS.IOS.CAMERA)
      if (resultCamera === RESULTS.BLOCKED || resultCamera === RESULTS.DENIED) {
        setIsDenied(true)
      }
      const resultMic = await check(PERMISSIONS.IOS.MICROPHONE)
      if (resultMic === RESULTS.BLOCKED || resultMic === RESULTS.DENIED) {
        setIsDenied(true)
      }
    } else if (isAndroid) {
      const resultCamera = await check(PERMISSIONS.ANDROID.CAMERA)
      if (resultCamera === RESULTS.BLOCKED || resultCamera === RESULTS.DENIED) {
        setIsDenied(true)
      }
      const resultMic = await check(PERMISSIONS.ANDROID.RECORD_AUDIO)
      if (resultMic === RESULTS.BLOCKED || resultMic === RESULTS.DENIED) {
        setIsDenied(true)
      }
    }

  }

  return {isDenied, checkPermission}
}
