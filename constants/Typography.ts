import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  PlayfairDisplay_700Bold,
  PlayfairDisplay_600SemiBold,
} from "@expo-google-fonts/playfair-display";

// Font map passed to useFonts() in _layout.tsx
export const FontMap = {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_600SemiBold,
};

// Semantic aliases used in styles throughout the app
export const Fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semiBold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  heading: "PlayfairDisplay_700Bold",
  headingSemiBold: "PlayfairDisplay_600SemiBold",
} as const;

export type FontWeight = keyof typeof Fonts;
