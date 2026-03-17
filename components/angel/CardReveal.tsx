import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { TarotCard } from "./TarotCard";

interface CardRevealProps {
  cardName: string;
  arcana: string;
  reversed: boolean;
  onRevealComplete?: () => void;
}

export function CardReveal({
  cardName,
  arcana,
  reversed,
  onRevealComplete,
}: CardRevealProps) {
  const rotateY = useSharedValue(0);
  const isRevealed = useSharedValue(false);

  useEffect(() => {
    // Auto-flip after 800ms with 600ms spring animation
    const timeout = setTimeout(() => {
      rotateY.value = withSpring(180, {
        damping: 15,
        stiffness: 80,
        mass: 1.2,
      }, (finished) => {
        if (finished) {
          isRevealed.value = true;
          if (onRevealComplete) {
            onRevealComplete();
          }
        }
      });
    }, 800);

    return () => clearTimeout(timeout);
  }, []);

  // Front face (card back — visible when rotateY < 90)
  const backStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      rotateY.value,
      [0, 90],
      [0, 90],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ perspective: 800 }, { rotateY: `${rotation}deg` }],
      backfaceVisibility: "hidden",
      position: "absolute",
    };
  });

  // Face side (card front — visible when rotateY > 90)
  const frontStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      rotateY.value,
      [90, 180],
      [270, 360],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ perspective: 800 }, { rotateY: `${rotation}deg` }],
      backfaceVisibility: "hidden",
      position: "absolute",
    };
  });

  return (
    <View style={{ width: 120, height: 200, alignItems: "center", justifyContent: "center" }}>
      <Animated.View style={backStyle}>
        <TarotCard isRevealed={false} />
      </Animated.View>
      <Animated.View style={frontStyle}>
        <TarotCard
          cardName={cardName}
          arcana={arcana}
          reversed={reversed}
          isRevealed={true}
        />
      </Animated.View>
    </View>
  );
}
