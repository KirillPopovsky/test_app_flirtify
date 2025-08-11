import {Dimensions, Platform, StatusBar} from "react-native";

const windowDimensions = Dimensions.get("window");

export const isIos = Platform.OS == "ios";
export const isAndroid = Platform.OS == "android";

export const windowWidth = windowDimensions.width;
export const windowHeight = windowDimensions.height - (!isIos ? StatusBar.currentHeight || 0 : 0);
