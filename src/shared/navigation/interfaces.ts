import {
  NavigationContainerRef,
  RouteProp,
  useNavigation as useDefaultNavigation,
  useRoute as useDefaultRoute,
} from '@react-navigation/native'
import {Pages} from './screens.ts'
import {NativeStackNavigationProp} from '@react-navigation/native-stack'

export type RootStackParamList = {
  [Pages.AuthStack]: undefined
  [Pages.MainStack]: undefined

  [Pages.Login]: undefined
  [Pages.RoomList]: undefined
  [Pages.RoomCall]: { roomId: string }

}

export type INavigate = <RouteName extends keyof RootStackParamList>(
  // tslint:disable-next-line:trailing-comma
  //@ts-ignore
  ...args: RootStackParamList[RouteName] extends undefined ? [RouteName] : [RouteName, RootStackParamList[RouteName]]
) => void

export interface IRootNavRef extends NavigationContainerRef<RootStackParamList> {
  navigate: INavigate;
}

export interface IRootNavProp extends NativeStackNavigationProp<RootStackParamList> {
  navigate: INavigate;
}

export const useNavigation = () => useDefaultNavigation<IRootNavProp>()
export const useRoute = <T extends keyof RootStackParamList>() => useDefaultRoute<RouteProp<RootStackParamList, T>>()
