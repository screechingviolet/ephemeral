import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import StripeGate from "@/components/StripeGate";
import TipButton from "@/components/TipButton";
import { DEMO_CONNECT_ACCOUNT_ID } from "@/constants/payments";
import { Colors } from "@/constants/theme";
import { API_BASE_URL } from "@/constants/api";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useEffect, useState } from "react";
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  Pressable,
  Linking,
} from "react-native";
import * as Location from "expo-location";

interface Event {
    event_id: string;
    name: string;
    category: string;
    description: string;
    lat: number;
    lng: number;
    start_time: number;
    end_time?: number;
    status: string;
    recipient_id?: string | null;
    _distance_m?: number;
}

const CATEGORIES = [
    "All",
    "Free",
    "Tip Optional",
    "Pay To Experience",
    "House Sale",
    "After-Hours Sale",
    "Popup Vendor",
    "Other Moment",
];

// Replace with your actual API endpoint
export default function EventsScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? "light"];

    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);

    // Get user location
    useEffect(() => {
        (async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") {
                    Alert.alert(
                        "Permission Denied",
                        "Location permission is required to find nearby events"
                    );
                    setLoading(false);
                    return;
                }

                let currentLocation = await Location.getCurrentPositionAsync({});
                setLocation({
                    latitude: currentLocation.coords.latitude,
                    longitude: currentLocation.coords.longitude,
                });
            } catch (error) {
                console.error("Error getting location:", error);
                Alert.alert("Error", "Failed to get your location");
                setLoading(false);
            }
        })();
    }, []);

    const fetchEvents = async (
        latitude: number,
        longitude: number,
    ): Promise<void> => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                lat: latitude.toString(),
                lng: longitude.toString(),
                radius_m: "4500", // 10km radius, adjust as needed
                active_only: "true",
                limit: "50",
                sort: "distance",
                ts: Date.now().toString(),
            });

            const response = await fetch(
                `${API_BASE_URL}/events/nearby?${params}`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch events");
            }

            const data: Event[] = await response.json();
            setEvents(data);
        } catch (error) {
            console.error("Error fetching events:", error);
            Alert.alert("Error", "Failed to load events. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Fetch events from API
    useEffect(() => {
        if (!location) return;
        fetchEvents(location.latitude, location.longitude);
    }, [location]);

    // Filter events based on category and search
    const filteredEvents = events.filter((event) => {
        const matchesCategory =
            selectedCategory === "All" ||
            event.category === selectedCategory;
        const matchesSearch =
            event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

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

    const styles = createStyles(colors);

    return (
        <ImageBackground
            source={require("@/assets/images/bg.png")}
            style={styles.background}
            resizeMode="cover"
        >
            <StripeGate>
                <ThemedView style={styles.container}>
                    <ScrollView
                        style={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                    >
                    {/* Header */}
                    <View style={styles.header}>
                        <ThemedText style={styles.title}>Moments</ThemedText>
                        <ThemedText style={styles.subtitle}>
                            Discover what’s happening nearby
                        </ThemedText>
                        <Pressable
                            onPress={() => {
                                if (location) {
                                    fetchEvents(location.latitude, location.longitude);
                                }
                            }}
                            style={styles.refreshButton}
                        >
                            <ThemedText style={styles.refreshButtonText}>↻</ThemedText>
                        </Pressable>
                    </View>

                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <View style={styles.searchBar}>
                            <ThemedText style={styles.searchIcon}>⌕</ThemedText>
                            <TextInput
                                style={[
                                    styles.searchInput,
                                    { color: colors.text },
                                ]}
                                placeholder="Search moments..."
                                placeholderTextColor="#8E8A83"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                    </View>

                    {/* Category Filter */}
                    <View style={styles.filterSection}>
                        <ThemedText style={styles.filterLabel}>
                            Category
                        </ThemedText>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.filterRow}
                        >
                            {CATEGORIES.map((category) => (
                                <TouchableOpacity
                                    key={category}
                                    style={[
                                        styles.filterChip,
                                        selectedCategory === category &&
                                            styles.filterChipActive,
                                    ]}
                                    onPress={() =>
                                        setSelectedCategory(category)
                                    }
                                    activeOpacity={0.85}
                                >
                                    <ThemedText
                                        style={[
                                            styles.filterChipText,
                                            selectedCategory === category &&
                                                styles.filterChipTextActive,
                                        ]}
                                    >
                                        {category}
                                    </ThemedText>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Events List */}
                    <View style={styles.eventsContainer}>
                        {loading ? (
                            <View style={styles.loadingState}>
                                <ActivityIndicator
                                    size="large"
                                    color="#6E1352"
                                />
                                <ThemedText style={styles.loadingText}>
                                    Finding moments near you...
                                </ThemedText>
                            </View>
                        ) : filteredEvents.length === 0 ? (
                            <View style={styles.emptyState}>
                                <ThemedText style={styles.emptyStateText}>
                                    No events found matching your filters
                                </ThemedText>
                            </View>
                        ) : (
                            filteredEvents.map((event) => (
                                <View
                                    key={event.event_id}
                                    style={styles.eventCard}
                                >
                                    {/* Title row */}
                                    <View style={styles.eventHeader}>
                                        
                                            <View style={styles.badge}>
                                                <ThemedText
                                                    style={styles.badgeText}
                                                >
                                                    {event.category}
                                                </ThemedText>
                                            </View>
                                        
                                        <ThemedText style={styles.eventTitle}>
                                            {event.name}
                                        </ThemedText>
                                    </View>

                                    {/* Distance */}
                                    {event._distance_m !== undefined && (
                                        <ThemedText
                                            style={styles.locationText}
                                        >
                                            {formatDistance(event._distance_m)}
                                        </ThemedText>
                                    )}

                                    {/* Description */}
                                    <ThemedText
                                        style={styles.eventDescription}
                                    >
                                        {event.description}
                                    </ThemedText>

                                    {/* Footer */}
                                    <View style={styles.eventFooter}>
                                        <ThemedText style={styles.eventMeta}>
                                            {formatDate(event.start_time)}
                                        </ThemedText>
                                        <ThemedText style={styles.eventMeta}>
                                            {formatTime(event.start_time)}
                                        </ThemedText>
                                    </View>

                                    <View style={styles.tipRow}>
                                        <TipButton
                                            recipientId={event.recipient_id}
                                            label="Tip $5"
                                            buttonStyle={styles.tipButton}
                                        />
                                        <TouchableOpacity
                                            style={styles.routeButton}
                                            onPress={() => {
                                                const url = `http://maps.apple.com/?daddr=${event.lat},${event.lng}`;
                                                Linking.openURL(url);
                                            }}
                                        >
                                            <ThemedText style={styles.routeButtonText}>
                                                🧭 Route
                                            </ThemedText>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                </ScrollView>
            </ThemedView>
            </StripeGate>
        </ImageBackground>
    );
}

/**
 * Plum   #6E1352
 * Mauve  #AC515F
 * Almond #E98E58
 * Linen  #F6F3E8
 * Ash    #B9D3C2
 * Teal   #51B0A5
 */
const createStyles = (colors: typeof Colors.light | typeof Colors.dark) =>
    StyleSheet.create({
        container: { flex: 1 },
        scrollView: { flex: 1 },

        // --- header ---
    header: {
        paddingHorizontal: 20,
        paddingTop: 70,
        paddingBottom: 18,
        alignItems: "center",
    },
        title: {
            fontFamily: "FrauncesBold",
            fontSize: 40,
            lineHeight: 58,
            letterSpacing: -0.3,
            color: "#2B2A27",
        },
    subtitle: {
        fontFamily: "Fraunces",
        fontSize: 16,
        lineHeight: 24,
        opacity: 0.75,
        marginTop: 6,
        color: "#35332F",
        textAlign: "center",
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

        // --- search ---
        searchContainer: {
            paddingHorizontal: 20,
            marginBottom: 18,
        },
        searchBar: {
            flexDirection: "row",
            alignItems: "center",
            height: 54,
            borderRadius: 26,
            backgroundColor: "rgba(246,243,232,0.70)", // linen glass
            borderWidth: 1,
            borderColor: "rgba(43,42,39,0.10)",
            paddingHorizontal: 14,
        },
        searchIcon: {
            fontSize: 16,
            opacity: 0.55,
            marginRight: 10,
            color: "#2B2A27",
        },
        searchInput: {
            flex: 1,
            fontSize: 16,
            paddingVertical: 0,
            color: "#2B2A27",
        },

        // --- filters ---
        filterSection: { marginBottom: 16 },
        filterLabel: {
            paddingHorizontal: 20,
            marginBottom: 10,
            fontFamily: "Fraunces",
            fontSize: 18,
            lineHeight: 22,
            color: "#2B2A27",
            opacity: 0.9,
        },
        filterRow: {
            paddingHorizontal: 20,
            gap: 10,
        },
        filterChip: {
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 999,
            backgroundColor: "rgba(246,243,232,0.65)",
            borderWidth: 1,
            borderColor: "rgba(43,42,39,0.10)",
        },
        filterChipActive: {
            backgroundColor: "rgba(172,81,95,0.22)", // mauve tint
            borderColor: "rgba(172,81,95,0.18)",
        },
        filterChipText: {
            fontSize: 14,
            color: "#2B2A27",
            opacity: 0.82,
        },
        filterChipTextActive: {
            color: "#6E1352", // plum
            opacity: 1,
        },

        // --- cards ---
        eventsContainer: {
            paddingHorizontal: 20,
            paddingBottom: 50,
            paddingTop: 6,
            gap: 16,
        },
        eventCard: {
            borderRadius: 26,
            padding: 18,
            backgroundColor: "rgba(246,243,232,0.62)",
            borderWidth: 1,
            borderColor: "rgba(43,42,39,0.08)",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.06,
            shadowRadius: 20,
            elevation: 2,
        },
        eventHeader: {
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginBottom: 10,
            flexWrap: "wrap",
        },
        badge: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 999,
            backgroundColor: "rgba(81,176,165,0.20)", // teal tint
            borderWidth: 1,
            borderColor: "rgba(81,176,165,0.18)",
        },
        badgeText: {
            fontSize: 12,
            color: "#2B2A27",
            opacity: 0.9,
        },
        eventTitle: {
            fontFamily: "FrauncesSemiBold",
            fontSize: 22,
            lineHeight: 28,
            color: "#2B2A27",
            letterSpacing: -0.15,
        },
        locationText: {
            fontSize: 14,
            opacity: 0.75,
            marginBottom: 8,
            color: "#35332F",
        },
        eventDescription: {
            fontSize: 15,
            lineHeight: 21,
            opacity: 0.82,
            marginBottom: 14,
            color: "#2B2A27",
        },
        eventFooter: {
            flexDirection: "row",
            justifyContent: "space-between",
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: "rgba(43,42,39,0.08)",
        },
        tipRow: {
            marginTop: 12,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 10,
        },
        tipButton: {
            minWidth: 140,
        },
        routeButton: {
            minWidth: 110,
            height: 44,
            paddingHorizontal: 16,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(81,176,165,0.20)",
            borderWidth: 1,
            borderColor: "rgba(81,176,165,0.25)",
        },
        routeButtonText: {
            fontSize: 14,
            fontWeight: "600",
            color: "#0F0A08",
        },
        eventMeta: {
            fontSize: 13.5,
            opacity: 0.75,
            color: "#35332F",
        },

        // --- loading ---
        loadingState: {
            paddingVertical: 60,
            alignItems: "center",
            gap: 16,
        },
        loadingText: {
            fontSize: 16,
            opacity: 0.65,
            textAlign: "center",
            color: "#35332F",
        },

        // --- empty ---
        emptyState: { paddingVertical: 60, alignItems: "center" },
        emptyStateText: {
            fontSize: 16,
            opacity: 0.65,
            textAlign: "center",
            color: "#35332F",
        },

        background: {
            flex: 1,
        },
    });
