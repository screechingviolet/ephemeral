import MapScreen from "@/components/MapScreen";
import StripeGate from "@/components/StripeGate";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Pressable, StyleSheet } from "react-native";
import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

export default function ExploreScreen() {
    const [refreshSignal, setRefreshSignal] = useState(0);
    const [openSignal, setOpenSignal] = useState(0);
    const params = useLocalSearchParams();
    const eventIdParam = Array.isArray(params.eventId)
        ? params.eventId[0]
        : params.eventId;

    useFocusEffect(() => {
        if (typeof eventIdParam === "string") {
            setOpenSignal((prev) => prev + 1);
        }
    });

    return (
        <ThemedView style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedText type="title" style={styles.title}>
                    Explore
                </ThemedText>
                <Pressable
                    onPress={() => setRefreshSignal((prev) => prev + 1)}
                    style={styles.refreshButton}
                >
                    <ThemedText style={styles.refreshButtonText}>↻</ThemedText>
                </Pressable>
            </ThemedView>
            <ThemedView style={styles.mapContainer}>
                <StripeGate>
                    <MapScreen
                        refreshSignal={refreshSignal}
                        selectedEventId={
                            typeof eventIdParam === "string"
                                ? eventIdParam
                                : undefined
                        }
                        openSignal={openSignal}
                    />
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
        justifyContent: "center",
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
    refreshButton: {
        position: "absolute",
        right: 20,
        top: 70,
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(246,243,232,0.9)",
        borderWidth: 1,
        borderColor: "rgba(43,42,39,0.12)",
    },
    refreshButtonText: {
        fontSize: 18,
        color: "#2B2A27",
        opacity: 0.8,
    },
});
