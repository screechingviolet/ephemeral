import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useState } from "react";
import {
  Alert,
  ImageBackground,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const CATEGORIES = [
    "Free Entry - Tip Optional",
    "Ticketed",
    "Free Entry - No Payment",
    "After-Hours",
];

const LOCATIONS = ["Providence", "Warwick", "Newport", "Other"];

export default function AddEventScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? "light"];

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedLocation, setSelectedLocation] = useState("");
    const [customLocation, setCustomLocation] = useState("");
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [venue, setVenue] = useState("");
    const [organizer, setOrganizer] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [minimumPrice, setMinimumPrice] = useState("");

    const handleSubmit = () => {
        // Validation (unchanged)
        if (!title.trim()) {
            Alert.alert("Missing Information", "Please enter a moment title");
            return;
        }
        if (!selectedCategory) {
            Alert.alert("Missing Information", "Please select a category");
            return;
        }
        if (!selectedLocation) {
            Alert.alert("Missing Information", "Please select a location");
            return;
        }
        if (selectedLocation === "Other" && !customLocation.trim()) {
            Alert.alert(
                "Missing Information",
                "Please enter a custom location",
            );
            return;
        }
        if (!date.trim()) {
            Alert.alert("Missing Information", "Please enter a date");
            return;
        }
        if (!startTime.trim()) {
            Alert.alert("Missing Information", "Please enter a start time");
            return;
        }
        if (!endTime.trim()) {
            Alert.alert("Missing Information", "Please enter an end time");
            return;
        }
        if (selectedCategory === "Ticketed" && !minimumPrice.trim()) {
            Alert.alert(
                "Missing Information",
                "Please enter a minimum price for ticketed events",
            );
            return;
        }

        // TODO: Submit event to backend
        const eventData = {
            title,
            description,
            category: selectedCategory,
            location:
                selectedLocation === "Other"
                    ? customLocation
                    : selectedLocation,
            date,
            startTime,
            endTime,
            venue,
            organizer,
            contactEmail,
            ...(selectedCategory === "Ticketed" && { minimumPrice }),
        };

        console.log("Moment submitted:", eventData);

        Alert.alert("Success", "Your moment has been submitted!", [
            {
                text: "OK",
                onPress: () => {
                    // Reset form (unchanged)
                    setTitle("");
                    setDescription("");
                    setSelectedCategory("");
                    setSelectedLocation("");
                    setCustomLocation("");
                    setDate("");
                    setStartTime("");
                    setEndTime("");
                    setVenue("");
                    setOrganizer("");
                    setContactEmail("");
                    setMinimumPrice("");
                },
            },
        ]);
    };

    const styles = createStyles(colors);

    return (
        <ImageBackground
            source={require("@/assets/images/bg.png")}
            style={styles.background}
            resizeMode="cover"
        >
            {/* Optional subtle linen wash for readability */}
            <View pointerEvents="none" style={styles.overlay} />

            <ThemedView style={styles.container}>
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header (same vibe as Events page) */}
                    <View style={styles.header}>
                        <ThemedText style={styles.title}>Add Event</ThemedText>
                        <ThemedText style={styles.subtitle}>
                            Share what's happening in your community
                        </ThemedText>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Event Title */}
                        <View style={styles.inputGroup}>
                            <ThemedText style={styles.label}>
                                Event Title *
                            </ThemedText>
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="e.g., Summer Jazz Night"
                                placeholderTextColor="#8E8A83"
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>

                        {/* Category */}
                        <View style={styles.inputGroup}>
                            <ThemedText style={styles.label}>
                                Category *
                            </ThemedText>
                            <View style={styles.categoryGrid}>
                                {CATEGORIES.map((category) => (
                                    <TouchableOpacity
                                        key={category}
                                        style={[
                                            styles.chip,
                                            selectedCategory === category &&
                                                styles.chipActive,
                                        ]}
                                        onPress={() =>
                                            setSelectedCategory(category)
                                        }
                                        activeOpacity={0.85}
                                    >
                                        <ThemedText
                                            style={[
                                                styles.chipText,
                                                selectedCategory === category &&
                                                    styles.chipTextActive,
                                            ]}
                                        >
                                            {category}
                                        </ThemedText>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Location */}
                        <View style={styles.inputGroup}>
                            <ThemedText style={styles.label}>
                                Location *
                            </ThemedText>

                            <View style={styles.locationGrid}>
                                {LOCATIONS.map((location) => (
                                    <TouchableOpacity
                                        key={location}
                                        style={[
                                            styles.chip,
                                            selectedLocation === location &&
                                                styles.locationChipActive,
                                        ]}
                                        onPress={() =>
                                            setSelectedLocation(location)
                                        }
                                        activeOpacity={0.85}
                                    >
                                        <ThemedText
                                            style={[
                                                styles.chipText,
                                                selectedLocation === location &&
                                                    styles.locationChipTextActive,
                                            ]}
                                        >
                                            {location}
                                        </ThemedText>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {selectedLocation === "Other" && (
                                <TextInput
                                    style={[
                                        styles.input,
                                        styles.inputMarginTop,
                                        { color: colors.text },
                                    ]}
                                    placeholder="Enter location"
                                    placeholderTextColor="#8E8A83"
                                    value={customLocation}
                                    onChangeText={setCustomLocation}
                                />
                            )}

                            {/* Placeholder for address entry and map selection */}
                            <View style={styles.placeholderCard}>
                                <ThemedText style={styles.placeholderText}>
                                    📍 Address entry and map selection coming
                                    soon
                                </ThemedText>
                            </View>
                        </View>

                        {/* Venue */}
                        <View style={styles.inputGroup}>
                            <ThemedText style={styles.label}>
                                Venue Name
                            </ThemedText>
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="e.g., The Rooftop Bar"
                                placeholderTextColor="#8E8A83"
                                value={venue}
                                onChangeText={setVenue}
                            />
                        </View>

                        {/* Date */}
                        <View style={styles.inputGroup}>
                            <ThemedText style={styles.label}>Date *</ThemedText>
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="MM/DD/YYYY"
                                placeholderTextColor="#8E8A83"
                                value={date}
                                onChangeText={setDate}
                            />
                        </View>

                        {/* Start and End Time */}
                        <View style={styles.rowInputs}>
                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <ThemedText style={styles.label}>
                                    Start Time *
                                </ThemedText>
                                <TextInput
                                    style={[
                                        styles.input,
                                        { color: colors.text },
                                    ]}
                                    placeholder="7:00 PM"
                                    placeholderTextColor="#8E8A83"
                                    value={startTime}
                                    onChangeText={setStartTime}
                                />
                            </View>

                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <ThemedText style={styles.label}>
                                    End Time *
                                </ThemedText>
                                <TextInput
                                    style={[
                                        styles.input,
                                        { color: colors.text },
                                    ]}
                                    placeholder="11:00 PM"
                                    placeholderTextColor="#8E8A83"
                                    value={endTime}
                                    onChangeText={setEndTime}
                                />
                            </View>
                        </View>

                        {/* Minimum Price (conditional) */}
                        {selectedCategory === "Ticketed" && (
                            <View style={styles.inputGroup}>
                                <ThemedText style={styles.label}>
                                    Minimum Price *
                                </ThemedText>
                                <TextInput
                                    style={[
                                        styles.input,
                                        { color: colors.text },
                                    ]}
                                    placeholder="$0.00"
                                    placeholderTextColor="#8E8A83"
                                    value={minimumPrice}
                                    onChangeText={setMinimumPrice}
                                    keyboardType="decimal-pad"
                                />
                            </View>
                        )}

                        {/* Description */}
                        <View style={styles.inputGroup}>
                            <ThemedText style={styles.label}>
                                Description
                            </ThemedText>
                            <TextInput
                                style={[
                                    styles.input,
                                    styles.textArea,
                                    { color: colors.text },
                                ]}
                                placeholder="Tell people what to expect..."
                                placeholderTextColor="#8E8A83"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Organizer */}
                        <View style={styles.inputGroup}>
                            <ThemedText style={styles.label}>
                                Organizer Name
                            </ThemedText>
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="Your name or organization"
                                placeholderTextColor="#8E8A83"
                                value={organizer}
                                onChangeText={setOrganizer}
                            />
                        </View>

                        {/* Contact Email */}
                        <View style={styles.inputGroup}>
                            <ThemedText style={styles.label}>
                                Contact Email
                            </ThemedText>
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="contact@example.com"
                                placeholderTextColor="#8E8A83"
                                value={contactEmail}
                                onChangeText={setContactEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmit}
                            activeOpacity={0.9}
                        >
                            <ThemedText style={styles.submitButtonText}>
                                Create Event
                            </ThemedText>
                        </TouchableOpacity>

                        <ThemedText style={styles.disclaimer}>
                            * Required fields
                        </ThemedText>
                    </View>
                </ScrollView>
            </ThemedView>
        </ImageBackground>
    );
}

const createStyles = (colors: typeof Colors.light | typeof Colors.dark) =>
    StyleSheet.create({
        background: { flex: 1 },

        // subtle readability wash (keeps bg visible)
        overlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(246,243,232,0.18)",
        },

        container: {
            flex: 1,
            backgroundColor: "transparent",
        },
        scrollView: { flex: 1 },

        // Header matches Events page
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

        form: {
            paddingHorizontal: 20,
            paddingBottom: 60,
            paddingTop: 6,
            gap: 2,
        },

        inputGroup: {
            marginBottom: 18,
        },

        label: {
            fontFamily: "FrauncesSemiBold",
            fontSize: 16,
            lineHeight: 20,
            color: "#2B2A27",
            opacity: 0.9,
            marginBottom: 10,
        },

        // Glassy input (matches Events search)
        input: {
            backgroundColor: "rgba(246,243,232,0.70)",
            borderRadius: 18,
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontSize: 16,
            borderWidth: 1,
            borderColor: "rgba(43,42,39,0.10)",
        },
        inputMarginTop: { marginTop: 12 },

        textArea: {
            minHeight: 120,
            paddingTop: 14,
        },

        // Chips (shared)
        categoryGrid: {
            gap: 10,
        },
        locationGrid: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 10,
        },
        chip: {
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 999,
            backgroundColor: "rgba(246,243,232,0.65)",
            borderWidth: 1,
            borderColor: "rgba(43,42,39,0.10)",
            alignSelf: "flex-start",
        },
        chipActive: {
            backgroundColor: "rgba(172,81,95,0.22)", // mauve tint
            borderColor: "rgba(172,81,95,0.18)",
        },
        chipText: {
            fontSize: 14,
            color: "#2B2A27",
            opacity: 0.82,
        },
        chipTextActive: {
            color: "#6E1352", // plum
            opacity: 1,
        },

        // location active uses teal-ish tint like your Events badges
        locationChipActive: {
            backgroundColor: "rgba(81,176,165,0.20)",
            borderColor: "rgba(81,176,165,0.18)",
        },
        locationChipTextActive: {
            color: "#2B2A27",
            opacity: 1,
        },

        // Placeholder card styled like event cards
        placeholderCard: {
            marginTop: 16,
            padding: 18,
            backgroundColor: "rgba(246,243,232,0.62)",
            borderRadius: 22,
            borderWidth: 1,
            borderColor: "rgba(43,42,39,0.08)",
            alignItems: "center",
        },
        placeholderText: {
            fontSize: 14,
            opacity: 0.65,
            textAlign: "center",
            color: "#35332F",
        },

        rowInputs: {
            flexDirection: "row",
            gap: 12,
        },
        halfWidth: { flex: 1 },

        // Submit button matches “premium” look (dark off-black)
        submitButton: {
            marginTop: 10,
            borderRadius: 22,
            paddingVertical: 16,
            alignItems: "center",
            backgroundColor: "#2B2A27",
            borderWidth: 1,
            borderColor: "rgba(43,42,39,0.14)",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.08,
            shadowRadius: 18,
            elevation: 2,
        },
        submitButtonText: {
            fontFamily: "FrauncesSemiBold",
            fontSize: 16,
            color: "#F6F3E8",
            letterSpacing: -0.1,
        },

        disclaimer: {
            marginTop: 16,
            fontSize: 13,
            opacity: 0.6,
            textAlign: "center",
            color: "#35332F",
        },
    });
