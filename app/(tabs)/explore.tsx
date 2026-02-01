import MapScreen from "@/components/MapScreen";
import StripeGate from "@/components/StripeGate";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { StyleSheet } from "react-native";

export default function ExploreScreen() {
    return (
        <ThemedView style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedText type="title" style={styles.title}>
                    Explore
                </ThemedText>
            </ThemedView>
            <ThemedView style={styles.mapContainer}>
                <StripeGate>                    
            <MapScreen />
                </StripeGate>
            </ThemedView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 70,
        paddingBottom: 16,
        zIndex: 10,
        alignItems: "center",
    },
    title: {
        fontFamily: "FrauncesBold",
        fontSize: 40,
        letterSpacing: -0.3,
        fontWeight: "bold",
    },
    mapContainer: {
        flex: 1,
    },
});
