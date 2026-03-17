import React from "react";
import { View, Text } from "react-native";
import Svg, { Circle, Line, Polygon, Path } from "react-native-svg";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

interface TarotCardProps {
  cardName?: string;
  arcana?: string;
  reversed?: boolean;
  isRevealed: boolean;
}

const CARD_WIDTH = 120;
const CARD_HEIGHT = 200;

function CardBack() {
  return (
    <View
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundColor: Colors.night200,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: Colors.goldBorder,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Gold sigil pattern */}
      <Svg width={CARD_WIDTH} height={CARD_HEIGHT} viewBox="0 0 120 200">
        {/* Outer border */}
        <Path
          d="M8,8 L112,8 L112,192 L8,192 Z"
          fill="none"
          stroke="rgba(201,168,76,0.25)"
          strokeWidth="1"
        />
        {/* Inner border */}
        <Path
          d="M14,14 L106,14 L106,186 L14,186 Z"
          fill="none"
          stroke="rgba(201,168,76,0.15)"
          strokeWidth="0.5"
        />
        {/* Center circle */}
        <Circle
          cx="60"
          cy="100"
          r="28"
          fill="none"
          stroke="rgba(201,168,76,0.3)"
          strokeWidth="1"
        />
        {/* Star of David / hexagram */}
        <Polygon
          points="60,72 73,95 87,95 75,115 73,138 60,124 47,138 45,115 33,95 47,95"
          fill="none"
          stroke="rgba(201,168,76,0.2)"
          strokeWidth="0.8"
        />
        {/* Diagonal lines for pattern */}
        <Line
          x1="14"
          y1="14"
          x2="106"
          y2="186"
          stroke="rgba(201,168,76,0.06)"
          strokeWidth="0.5"
        />
        <Line
          x1="106"
          y1="14"
          x2="14"
          y2="186"
          stroke="rgba(201,168,76,0.06)"
          strokeWidth="0.5"
        />
        {/* Corner flourishes */}
        <Circle cx="22" cy="22" r="4" fill="none" stroke="rgba(201,168,76,0.3)" strokeWidth="0.8" />
        <Circle cx="98" cy="22" r="4" fill="none" stroke="rgba(201,168,76,0.3)" strokeWidth="0.8" />
        <Circle cx="22" cy="178" r="4" fill="none" stroke="rgba(201,168,76,0.3)" strokeWidth="0.8" />
        <Circle cx="98" cy="178" r="4" fill="none" stroke="rgba(201,168,76,0.3)" strokeWidth="0.8" />
        {/* Center dot */}
        <Circle cx="60" cy="100" r="3" fill="rgba(201,168,76,0.4)" />
      </Svg>
    </View>
  );
}

function CardFace({
  cardName,
  arcana,
  reversed,
}: {
  cardName: string;
  arcana: string;
  reversed: boolean;
}) {
  return (
    <View
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundColor: Colors.night200,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: Colors.gold,
        alignItems: "center",
        justifyContent: "space-between",
        padding: 10,
        transform: reversed ? [{ rotate: "180deg" }] : [],
      }}
    >
      {/* Arcana label top */}
      <View
        style={{
          paddingVertical: 3,
          paddingHorizontal: 8,
          backgroundColor: Colors.goldSurface,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: Colors.goldBorder,
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.bodyBold,
            fontSize: 9,
            color: Colors.gold,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          {arcana}
        </Text>
      </View>

      {/* Center sigil */}
      <Svg width={60} height={60} viewBox="0 0 60 60">
        <Circle cx="30" cy="30" r="24" fill="none" stroke={Colors.gold} strokeWidth="0.8" opacity={0.4} />
        <Polygon
          points="30,6 43,25 57,25 46,38 50,56 30,46 10,56 14,38 3,25 17,25"
          fill="none"
          stroke={Colors.gold}
          strokeWidth="0.8"
          opacity={0.3}
        />
        <Circle cx="30" cy="30" r="5" fill={Colors.goldSurface} stroke={Colors.gold} strokeWidth="1" opacity={0.6} />
      </Svg>

      {/* Card name */}
      <Text
        style={{
          fontFamily: Fonts.display,
          fontSize: 10,
          color: Colors.textPrimary,
          textAlign: "center",
          letterSpacing: 0.8,
          lineHeight: 14,
        }}
        numberOfLines={2}
      >
        {cardName}
      </Text>

      {/* Reversed badge */}
      {reversed && (
        <View
          style={{
            position: "absolute",
            bottom: 8,
            right: 8,
            backgroundColor: "rgba(255,100,100,0.15)",
            borderRadius: 6,
            paddingHorizontal: 5,
            paddingVertical: 2,
          }}
        >
          <Text
            style={{
              fontFamily: Fonts.bodyBold,
              fontSize: 8,
              color: Colors.error,
              letterSpacing: 0.5,
            }}
          >
            REV
          </Text>
        </View>
      )}
    </View>
  );
}

export function TarotCard({
  cardName = "",
  arcana = "",
  reversed = false,
  isRevealed,
}: TarotCardProps) {
  if (!isRevealed) {
    return <CardBack />;
  }

  return (
    <CardFace
      cardName={cardName}
      arcana={arcana}
      reversed={reversed}
    />
  );
}
