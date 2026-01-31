import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useState } from "react";
import {
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
        <ThemedView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <ThemedText type="title" style={styles.title}>
                        Events
                    </ThemedText>
                    <ThemedText style={styles.subtitle}>
                        Discover what's happening nearby
                    </ThemedText>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search events..."
                        placeholderTextColor={
                            colorScheme === "dark" ? colors.icon : "#8B6B5C"
                        }
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Category Filter */}
                <View style={styles.filterSection}>
                    <ThemedText style={styles.filterLabel}>Category</ThemedText>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.filterScroll}
                    >
                        {CATEGORIES.map((category) => (
                            <TouchableOpacity
                                key={category}
                                style={[
                                    styles.filterChip,
                                    selectedCategory === category &&
                                        styles.filterChipActive,
                                ]}
                                onPress={() => setSelectedCategory(category)}
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
                    <ThemedText style={styles.filterLabel}>Location</ThemedText>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.filterScroll}
                    >
                        {LOCATIONS.map((location) => (
                            <TouchableOpacity
                                key={location}
                                style={[
                                    styles.filterChip,
                                    selectedLocation === location &&
                                        styles.filterChipActive,
                                ]}
                                onPress={() => setSelectedLocation(location)}
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
                            >
                                <View style={styles.eventHeader}>
                                    <View style={styles.eventTitleContainer}>
                                        <ThemedText
                                            type="defaultSemiBold"
                                            style={styles.eventTitle}
                                        >
                                            {event.title}
                                        </ThemedText>
                                        <View style={styles.eventMeta}>
                                            <View
                                                style={[
                                                    styles.categoryBadge,
                                                    {
                                                        backgroundColor:
                                                            colors.accent,
                                                    },
                                                ]}
                                            >
                                                <ThemedText
                                                    style={styles.categoryText}
                                                >
                                                    {event.category}
                                                </ThemedText>
                                            </View>
                                            <ThemedText
                                                style={styles.locationText}
                                            >
                                                📍 {event.location}
                                            </ThemedText>
                                        </View>
                                    </View>
                                </View>

                                <ThemedText style={styles.eventDescription}>
                                    {event.description}
                                </ThemedText>

                                <View style={styles.eventFooter}>
                                    <ThemedText style={styles.eventDate}>
                                        🗓️ {event.date}
                                    </ThemedText>
                                    <ThemedText style={styles.eventTime}>
                                        🕐 {event.time}
                                    </ThemedText>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </ScrollView>
        </ThemedView>
    );
}

const createStyles = (colors: typeof Colors.light | typeof Colors.dark) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        scrollView: {
            flex: 1,
        },
        header: {
            paddingHorizontal: 20,
            paddingTop: 60,
            paddingBottom: 20,
        },
        title: {
            fontSize: 36,
            fontWeight: "bold",
            marginBottom: 8,
        },
        subtitle: {
            fontSize: 16,
            opacity: 0.7,
        },
        searchContainer: {
            paddingHorizontal: 20,
            marginBottom: 20,
        },
        searchInput: {
            backgroundColor:
                colors.background === "#F6F3E8" ? "#FFFFFF" : "#1A1410",
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            borderWidth: 1,
            borderColor: colors.icon,
        },
        filterSection: {
            marginBottom: 20,
        },
        filterLabel: {
            fontSize: 14,
            fontWeight: "600",
            paddingHorizontal: 20,
            marginBottom: 12,
            opacity: 0.8,
        },
        filterScroll: {
            paddingLeft: 20,
        },
        filterChip: {
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 20,
            marginRight: 10,
            backgroundColor:
                colors.background === "#F6F3E8" ? "#FFFFFF" : "#1A1410",
            borderWidth: 1,
            borderColor: colors.icon,
        },
        filterChipActive: {
            backgroundColor: colors.tint,
            borderColor: colors.tint,
        },
        filterChipText: {
            fontSize: 14,
            fontWeight: "500",
        },
        filterChipTextActive: {
            color: colors.background === "#F6F3E8" ? "#0F0A08" : "#F6F3E8",
            fontWeight: "600",
        },
        eventsContainer: {
            paddingHorizontal: 20,
            paddingBottom: 40,
        },
        eventCard: {
            backgroundColor:
                colors.background === "#F6F3E8" ? "#FFFFFF" : "#1A1410",
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: colors.icon,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        eventHeader: {
            marginBottom: 12,
        },
        eventTitleContainer: {
            gap: 8,
        },
        eventTitle: {
            fontSize: 18,
            marginBottom: 4,
        },
        eventMeta: {
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
        },
        categoryBadge: {
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 12,
        },
        categoryText: {
            fontSize: 12,
            fontWeight: "600",
            color: "#0F0A08",
        },
        locationText: {
            fontSize: 13,
            opacity: 0.7,
        },
        eventDescription: {
            fontSize: 14,
            lineHeight: 20,
            marginBottom: 12,
            opacity: 0.8,
        },
        eventFooter: {
            flexDirection: "row",
            justifyContent: "space-between",
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: colors.icon,
            opacity: 0.7,
        },
        eventDate: {
            fontSize: 13,
        },
        eventTime: {
            fontSize: 13,
        },
        emptyState: {
            paddingVertical: 60,
            alignItems: "center",
        },
        emptyStateText: {
            fontSize: 16,
            opacity: 0.6,
            textAlign: "center",
        },
    });
