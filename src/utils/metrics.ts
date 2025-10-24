import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const windowWidth = width;
export const windowHeight = height;

const guidelineBaseWidth = 390;
const guidelineBaseHeight = 844;

const horizontalScale = (size: any) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: any) => (height / guidelineBaseHeight) * size;
const moderateScale = (size: any, factor = 0.5) =>
  size + (horizontalScale(size) - size) * factor;

export { horizontalScale, verticalScale, moderateScale };
