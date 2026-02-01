import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useState } from "react";
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Event {
    id: number;
    title: string;
    category: string;
    location: string;
    date: string;
    time: string;
    description: string;
}

const MOCK_EVENTS: Event[] = [
    {
        id: 1,
        title: "Summer Jazz Festival",
        category: "Music",
        location: "Providence",
        date: "Feb 15, 2026",
        time: "7:00 PM",
        description: "Live jazz performances under the stars",
    },
    {
        id: 2,
        title: "Tech Innovation Summit",
        category: "Technology",
        location: "Warwick",
        date: "Feb 20, 2026",
        time: "9:00 AM",
        description: "Leading tech innovators discuss the future",
    },
    {
        id: 3,
        title: "Local Farmers Market",
        category: "Food",
        location: "Newport",
        date: "Feb 8, 2026",
        time: "8:00 AM",
        description: "Fresh produce and local artisan goods",
    },
    {
        id: 4,
        title: "Art Gallery Opening",
        category: "Art",
        location: "Providence",
        date: "Feb 12, 2026",
        time: "6:00 PM",
        description: "Contemporary art exhibition featuring local artists",
    },
    {
        id: 5,
        title: "Community Yoga Session",
        category: "Wellness",
        location: "Warwick",
        date: "Feb 10, 2026",
        time: "7:00 AM",
        description: "Start your day with mindful movement",
    },
    {
        id: 6,
        title: "Food Truck Rally",
        category: "Food",
        location: "Providence",
        date: "Feb 18, 2026",
        time: "12:00 PM",
        description: "Taste cuisines from around the world",
    },
    {
        id: 7,
        title: "Live Music Night",
        category: "Music",
        location: "Newport",
        date: "Feb 14, 2026",
        time: "8:00 PM",
        description: "Local bands and acoustic performances",
    },
    {
        id: 8,
        title: "Startup Pitch Competition",
        category: "Technology",
        location: "Providence",
        date: "Feb 25, 2026",
        time: "2:00 PM",
        description: "Watch entrepreneurs pitch their ideas",
    },
];

const CATEGORIES = ["All", "Music", "Food", "Technology", "Art", "Wellness"];
const LOCATIONS = ["All", "Providence", "Warwick", "Newport"];

export default function EventsScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? "light"];

    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedLocation, setSelectedLocation] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredEvents = MOCK_EVENTS.filter((event) => {
        const matchesCategory =
            selectedCategory === "All" || event.category === selectedCategory;
        const matchesLocation =
            selectedLocation === "All" || event.location === selectedLocation;
        const matchesSearch =
            event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesLocation && matchesSearch;
    });

    const styles = createStyles(colors);

    return (
        <ImageBackground
            source={require("@/assets/images/bg.png")}
            style={styles.background}
            resizeMode="cover"
        >
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

                    {/* Location Filter */}
                    <View style={styles.filterSection}>
                        <ThemedText style={styles.filterLabel}>
                            Location
                        </ThemedText>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.filterRow}
                        >
                            {LOCATIONS.map((location) => (
                                <TouchableOpacity
                                    key={location}
                                    style={[
                                        styles.filterChip,
                                        selectedLocation === location &&
                                            styles.filterChipActive,
                                    ]}
                                    onPress={() =>
                                        setSelectedLocation(location)
                                    }
                                    activeOpacity={0.85}
                                >
                                    <ThemedText
                                        style={[
                                            styles.filterChipText,
                                            selectedLocation === location &&
                                                styles.filterChipTextActive,
                                        ]}
                                    >
                                        {location}
                                    </ThemedText>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Events List */}
                    <View style={styles.eventsContainer}>
                        {filteredEvents.length === 0 ? (
                            <View style={styles.emptyState}>
                                <ThemedText style={styles.emptyStateText}>
                                    No events found matching your filters
                                </ThemedText>
                            </View>
                        ) : (
                            filteredEvents.map((event) => (
                                <TouchableOpacity
                                    key={event.id}
                                    style={styles.eventCard}
                                    activeOpacity={0.92}
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
                                            {event.title}
                                        </ThemedText>
                                    </View>

                                    {/* Location */}
                                    <ThemedText style={styles.locationText}>
                                        📍 {event.location}
                                    </ThemedText>

                                    {/* Description */}
                                    <ThemedText style={styles.eventDescription}>
                                        {event.description}
                                    </ThemedText>

                                    {/* Footer */}
                                    <View style={styles.eventFooter}>
                                        <ThemedText style={styles.eventMeta}>
                                            🗓️ {event.date}
                                        </ThemedText>
                                        <ThemedText style={styles.eventMeta}>
                                            🕐 {event.time}
                                        </ThemedText>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                </ScrollView>
            </ThemedView>
        </ImageBackground>
    );
}

/**
 * Palette (from you):
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
            fontFamily: "FrauncesSemiBold",
            fontSize: 18,
            lineHeight: 24,
            opacity: 0.75,
            marginTop: 6,
            color: "#35332F",
            textAlign: "center",
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
        eventMeta: {
            fontSize: 13.5,
            opacity: 0.75,
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

        container: {
            flex: 1,
            backgroundColor: "transparent", // IMPORTANT
        },
    });
