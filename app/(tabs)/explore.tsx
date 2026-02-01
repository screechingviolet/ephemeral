import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function MapScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? "light"];
    const styles = createStyles(colors);

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <ThemedText type="title" style={styles.title}>
                    Map
                </ThemedText>
                <ThemedText style={styles.subtitle}>
                    See what’s happening nearby
                </ThemedText>
            </View>

            {/* Map Placeholder */}
            <View style={styles.mapContainer}>
                <View style={styles.mapPlaceholder}>
                    <ThemedText style={styles.mapEmoji}>🗺️</ThemedText>
                    <ThemedText style={styles.mapText}>
                        Map view coming soon
                    </ThemedText>
                    <ThemedText style={styles.mapSubtext}>
                        This is where nearby temporary art will appear.
                    </ThemedText>
                </View>
            </View>

            {/* Optional bottom controls (future filters / recenter) */}
            <View style={styles.controls}>
                <TouchableOpacity style={styles.controlButton}>
                    <ThemedText style={styles.controlText}>Recenter</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlButton}>
                    <ThemedText style={styles.controlText}>Filters</ThemedText>
                </TouchableOpacity>
            </View>
        </ThemedView>
    );
}

const createStyles = (colors: typeof Colors.light | typeof Colors.dark) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },

        /* Header */
        header: {
            paddingHorizontal: 20,
            paddingTop: 60,
            paddingBottom: 20,
        },
        title: {
            fontSize: 36,
            marginBottom: 8,
        },
        subtitle: {
            fontSize: 16,
            opacity: 0.7,
        },

        /* Map area */
        mapContainer: {
            flex: 1,
            paddingHorizontal: 20,
            paddingBottom: 20,
        },
        mapPlaceholder: {
            flex: 1,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.icon,
            backgroundColor:
                colors.background === "#F6F3E8" ? "#FFFFFF" : "#1A1410",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
        },
        mapEmoji: {
            fontSize: 36,
            marginBottom: 12,
            opacity: 0.8,
        },
        mapText: {
            fontSize: 18,
            marginBottom: 6,
        },
        mapSubtext: {
            fontSize: 14,
            opacity: 0.6,
            textAlign: "center",
        },

        /* Bottom controls */
        controls: {
            flexDirection: "row",
            gap: 12,
            paddingHorizontal: 20,
            paddingBottom: 30,
        },
        controlButton: {
            flex: 1,
            paddingVertical: 14,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.icon,
            backgroundColor:
                colors.background === "#F6F3E8" ? "#FFFFFF" : "#1A1410",
            alignItems: "center",
        },
        controlText: {
            fontSize: 14,
            fontWeight: "500",
        },
    });
