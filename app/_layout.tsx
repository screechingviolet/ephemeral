import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
    anchor: "(tabs)",
};

// Prevent splash from auto-hiding before fonts load
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const colorScheme = useColorScheme();

    const [fontsLoaded] = useFonts({
        FrauncesItalic: require("../assets/fonts/Fraunces-Italic-VariableFont_SOFT,WONK,opsz,wght.ttf"),
        FrauncesSoft: require("../assets/fonts/Fraunces-VariableFont_SOFT,WONK,opsz,wght.ttf"),
        Fraunces: require("../assets/fonts/Fraunces_72pt_SuperSoft-Regular.ttf"),
        FrauncesBold: require("../assets/fonts/Fraunces_72pt_SuperSoft-Bold.ttf"),
        FrauncesSemiBold: require("../assets/fonts/Fraunces_72pt_SuperSoft-SemiBold.ttf"),
        FrauncesThin: require("../assets/fonts/Fraunces_72pt_SuperSoft-Thin.ttf"),
    });

    // Hide splash once fonts are ready
    if (fontsLoaded) {
        SplashScreen.hideAsync();
    } else {
        return null;
    }

    return (
        <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                    name="modal"
                    options={{ presentation: "modal", title: "Modal" }}
                />
            </Stack>
            <StatusBar style="auto" />
        </ThemeProvider>
    );
}
