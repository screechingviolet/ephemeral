import { useThemeColor } from "@/hooks/use-theme-color";
import { StyleSheet, Text, type TextProps } from "react-native";

export type ThemedTextProps = TextProps & {
    lightColor?: string;
    darkColor?: string;
    type?: "default" | "title" | "subtitle" | "bold" | "link";
};

export function ThemedText({
    style,
    lightColor,
    darkColor,
    type = "default",
    ...rest
}: ThemedTextProps) {
    const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

    return (
        <Text
            style={[
                { color },
                styles.base,
                type === "title" && styles.title,
                type === "subtitle" && styles.subtitle,
                type === "bold" && styles.bold,
                type === "link" && styles.link,
                style,
            ]}
            {...rest}
        />
    );
}

const styles = StyleSheet.create({
    base: {
        fontFamily: "FrauncesRegular",
        fontSize: 16,
        lineHeight: 24,
    },
    title: {
        fontFamily: "FrauncesBold",
        fontSize: 42,
        lineHeight: 52,
        letterSpacing: -0.4,
    },
    subtitle: {
        fontFamily: "FrauncesLight",
        fontSize: 18,
        lineHeight: 24,
        opacity: 0.8,
    },
    bold: {
        fontFamily: "FrauncesSemiBold",
    },
    link: {
        fontFamily: "FrauncesSemiBold",
        fontSize: 16,
        color: "#6E1352",
    },
});
