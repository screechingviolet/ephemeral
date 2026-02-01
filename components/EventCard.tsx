import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";

interface Event {
    event_id: string;
    name: string;
    description: string;
    tags?: string[];
    lat: number;
    lng: number;
    start_time: number;
    end_time?: number;
    status: string;
    recipient_id?: string | null;
    _distance_m?: number;
    image_keys?: string[];
}

interface EventCardProps {
    event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
    // Format timestamp to readable date
    const formatDate = (timestamp: number): string => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    // Format timestamp to readable time
    const formatTime = (timestamp: number): string => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    // Format distance
    const formatDistance = (meters?: number): string => {
        if (!meters) return "";
        if (meters < 1000) {
            return `${Math.round(meters)}m away`;
        }
        return `${(meters / 1000).toFixed(1)}km away`;
    };

    return (
        <View style={styles.eventCard}>
            {/* Title row */}
            <View style={styles.eventHeader}>
                {event.tags && event.tags.length > 0 && (
                    <View style={styles.badge}>
                        <ThemedText style={styles.badgeText}>
                            {event.tags[0]}
                        </ThemedText>
                    </View>
                )}
                <ThemedText style={styles.eventTitle}>
                    {event.name}
                </ThemedText>
            </View>

            {/* Distance */}
            {event._distance_m !== undefined && (
                <ThemedText style={styles.locationText}>
                    📍 {formatDistance(event._distance_m)}
                </ThemedText>
            )}

            {/* Description */}
            <ThemedText style={styles.eventDescription}>
                {event.description}
            </ThemedText>

            {/* Footer */}
            <View style={styles.eventFooter}>
                <ThemedText style={styles.eventMeta}>
                    🗓️ {formatDate(event.start_time)}
                </ThemedText>
                <ThemedText style={styles.eventMeta}>
                    🕐 {formatTime(event.start_time)}
                </ThemedText>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    eventCard: {
        borderRadius: 20,
        padding: 16,
        marginVertical: 8,
        backgroundColor: "rgba(246,243,232,0.85)",
        borderWidth: 1,
        borderColor: "rgba(43,42,39,0.12)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    eventHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 8,
        flexWrap: "wrap",
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
        backgroundColor: "rgba(81,176,165,0.25)",
        borderWidth: 1,
        borderColor: "rgba(81,176,165,0.2)",
    },
    badgeText: {
        fontSize: 11,
        color: "#2B2A27",
        opacity: 0.9,
        fontWeight: "600",
    },
    eventTitle: {
        fontFamily: "FrauncesSemiBold",
        fontSize: 18,
        lineHeight: 24,
        color: "#2B2A27",
        letterSpacing: -0.15,
        flex: 1,
    },
    locationText: {
        fontSize: 13,
        opacity: 0.75,
        marginBottom: 6,
        color: "#35332F",
    },
    eventDescription: {
        fontSize: 14,
        lineHeight: 20,
        opacity: 0.82,
        marginBottom: 12,
        color: "#2B2A27",
    },
    eventFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: "rgba(43,42,39,0.08)",
    },
    eventMeta: {
        fontSize: 12.5,
        opacity: 0.75,
        color: "#35332F",
    },
});