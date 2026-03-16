import React from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  SharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

interface triggerZone {
    x: number; 
    y: number; 
    width: number; 
    height: number;
    onTrigger?: () => void;
    onHover?: () => void;
}

interface DraggableProps {
    children: React.ReactNode;
    translateX: SharedValue<number>;
    translateY: SharedValue<number>;
    style?: StyleProp<ViewStyle>;
    initialX?: number;
    initialY?: number;
    shouldRotate?: boolean;
    rotationFactor?: number;   // Control sensitivity (higher = less tilt)
    triggerZones?: triggerZone[];
}

const Draggable = ({ children, translateX, translateY, style, triggerZones = [], initialX = 0, initialY = 0, shouldRotate = false, rotationFactor = 25 }: DraggableProps) => {
    const layoutX = useSharedValue(0);
    const layoutY = useSharedValue(0);
    const context = useSharedValue({ x: 0, y: 0 });

    const screenOriginX = useSharedValue(0);
    const screenOriginY = useSharedValue(0);

    const gesture = Gesture.Pan()
        .onStart(() => {
            context.value = { x: layoutX.value, y: layoutY.value };
        })
        .onUpdate((event) => {
            layoutX.value = event.translationX + context.value.x;
            //layoutY.value = event.translationY + context.value.y;

            translateX.value = screenOriginX.value + layoutX.value;
            //translateY.value = screenOriginY.value + layoutY.value;
            
            triggerZones.forEach((triggerZone, index) => {
                const isInsideX = event.absoluteX >= triggerZone.x && event.absoluteX <= triggerZone.x + triggerZone.width;
                const isInsideY = event.absoluteY >= triggerZone.y && event.absoluteY <= triggerZone.y + triggerZone.height;

                if (isInsideX && isInsideY) { triggerZone.onHover?.() }
            });
        })
        .onEnd((event) => {
            triggerZones.forEach((triggerZone, index) => {
                const isInsideX = event.absoluteX >= triggerZone.x && event.absoluteX <= triggerZone.x + triggerZone.width;
                const isInsideY = event.absoluteY >= triggerZone.y && event.absoluteY <= triggerZone.y + triggerZone.height;

                if (isInsideX && isInsideY) { triggerZone.onTrigger?.() }
            });

            layoutX.value = withSpring(initialX);
            layoutY.value = withSpring(initialY);

            translateX.value = withSpring(screenOriginX.value);
            translateY.value = withSpring(screenOriginY.value);
        });

    const animatedStyle = useAnimatedStyle(() => {
        const rotation = shouldRotate ? `${layoutX.value / rotationFactor}deg` : '0deg';

        return {
            transform: [
                { translateX: layoutX.value },
                { translateY: layoutY.value },
                { rotate: rotation }, 
            ],
        };
    });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View 
        onLayout={(e) => {
            const { x, y, width, height } = e.nativeEvent.layout;
            // Calculate the true screen center once
            screenOriginX.value = x + width / 2;
            screenOriginY.value = y + height / 2;
            
            // Initialize the props so targets don't think it's at (0,0)
            translateX.value = screenOriginX.value;
            translateY.value = screenOriginY.value;
        }}
        style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
};

export default Draggable;