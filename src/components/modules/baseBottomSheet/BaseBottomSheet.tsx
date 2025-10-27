/* eslint-disable react-native/no-inline-styles */
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useMemo,
  useEffect,
} from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Colors } from "@/theme/colors";

export type BaseBottomSheetRef = {
  present: () => void;
  dismiss: () => void;
  expand: () => void;
  collapse: () => void;
  snapToIndex: (index: number) => void;
};

type Props = {
  title?: string;
  children?: React.ReactNode;
  /** Optional: Custom snap points (e.g., ["25%", "50%", "80%"]) */
  snapPoints?: (string | number)[];
  /** Optional: Start open or closed */
  initialIndex?: number;
};

const BaseBottomSheet = forwardRef<BaseBottomSheetRef, Props>(
  ({ title, children, snapPoints, initialIndex = -1 }, ref) => {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const [isOpen, setIsOpen] = useState(false);
    const opacity = useSharedValue(0);

    const memoizedSnapPoints = useMemo(() => snapPoints || [], [snapPoints]);

    useImperativeHandle(ref, () => ({
      present: () => {
        setIsOpen(true);
        bottomSheetRef.current?.expand();
      },
      dismiss: () => {
        bottomSheetRef.current?.close();
        setIsOpen(false);
      },
      expand: () => {
        setIsOpen(true);
        bottomSheetRef.current?.expand();
      },
      collapse: () => {
        bottomSheetRef.current?.collapse();
      },
      snapToIndex: (index: number) => {
        setIsOpen(true);
        bottomSheetRef.current?.snapToIndex(index);
      },
    }));

    const handleSheetChange = (index: number) => {
      const open = index >= 0;
      setIsOpen(open);
      opacity.value = withTiming(open ? 1 : 0, { duration: 250 });
    };

    // Fade style for overlay
    const animatedOverlayStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
    }));

    // Keep overlay visible while animation plays out
    useEffect(() => {
      if (isOpen) opacity.value = withTiming(1, { duration: 250 });
      else opacity.value = withTiming(0, { duration: 250 });
    }, [isOpen]);

    return (
      <Portal>
        {/* 🩵 Animated overlay with fade effect */}
        {isOpen && (
          <Animated.View
            style={[styles.overlay, animatedOverlayStyle]}
          >
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => {
                bottomSheetRef.current?.close();
                setIsOpen(false);
              }}
            />
          </Animated.View>
        )}

        <BottomSheet
          ref={bottomSheetRef}
          index={initialIndex}
          snapPoints={memoizedSnapPoints.length > 0 ? memoizedSnapPoints : undefined}
          enableDynamicSizing={memoizedSnapPoints.length === 0}
          enablePanDownToClose
          onChange={handleSheetChange}
          backgroundStyle={styles.sheetBackground}
        >
          <BottomSheetView style={styles.contentContainer}>
            {title && <Text style={styles.title}>{title}</Text>}
            {children}
          </BottomSheetView>
        </BottomSheet>
      </Portal>
    );
  }
);

export default BaseBottomSheet;

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  contentContainer: {
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
    color: Colors.gray
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
});
