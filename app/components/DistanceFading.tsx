import Animated, { 
  useAnimatedStyle, 
  interpolate, 
  Extrapolation, 
  SharedValue, 
  useSharedValue
} from 'react-native-reanimated';

import { useAnimatedRef, measure, runOnUI } from 'react-native-reanimated';

interface DistanceFadingProps {
  // These must be the shared values from the parent
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  // How close the draggable needs to be to start the fade
  threshold?: number;
  // Optional: what the element should actually look like
  children?: React.ReactNode;
}

const DistanceFading = ({ 
  translateX, 
  translateY, 
  threshold = 150, 
  children 
}: DistanceFadingProps) => {
  const aRef = useAnimatedRef<Animated.View>();
  const targetX = useSharedValue(0);
  const targetY = useSharedValue(0);
  
  const updatePosition = () => {
    const measurement = measure(aRef);
    if (measurement) {
      // pageX and pageY are coordinates relative to the entire screen
      targetX.value = measurement.pageX + measurement.width / 2;
      targetY.value = measurement.pageY + measurement.height / 2;
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    const distance = Math.sqrt(
      Math.pow(translateX.value - targetX.value, 2) + 
      Math.pow(translateY.value - targetY.value, 2)
    );

    const opacity = interpolate(
      distance,
      [0, threshold], // From 0px away to 'threshold' px away
      [0, 1],         // Fade from 0 (invisible) to 1 (solid)
      Extrapolation.CLAMP
    );

    console.log('Distance:', distance);

    return { opacity };
  });

  return (
    <Animated.View 
    ref={aRef}
    onLayout={() => runOnUI(updatePosition)()}
    style={animatedStyle}>
      {children}
    </Animated.View>
  );
};

export default DistanceFading;