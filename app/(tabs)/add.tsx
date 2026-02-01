import LocationPicker from "@/components/LocationPicker";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const CATEGORIES = [
    "Free",
    "Tip Optional",
    "Pay To Experience",
    "House Sale",
    "After-Hours Sale",
    "Popup Vendor",
    "Other Moment",
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
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [isNow, setIsNow] = useState(false);
    const [imageAsset, setImageAsset] =
        useState<ImagePicker.ImagePickerAsset | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [venue, setVenue] = useState("");
    const [organizer, setOrganizer] = useState("");
    const [contactEmail, setContactEmail] = useState("");

    const parseTimeToEpochSeconds = (
        dateText: string,
        timeText: string,
    ): number | null => {
        const dateMatch = dateText
            .trim()
            .match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (!dateMatch) return null;
        const month = Number(dateMatch[1]) - 1;
        const day = Number(dateMatch[2]);
        const year = Number(dateMatch[3]);

        const timeMatch = timeText
            .trim()
            .match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/);
        if (!timeMatch) return null;
        let hour = Number(timeMatch[1]);
        const minute = Number(timeMatch[2]);
        const meridiem = timeMatch[3].toLowerCase();
        if (hour < 1 || hour > 12 || minute > 59) return null;
        if (meridiem === "pm" && hour !== 12) hour += 12;
        if (meridiem === "am" && hour === 12) hour = 0;

        const dateObj = new Date(year, month, day, hour, minute, 0, 0);
        if (Number.isNaN(dateObj.getTime())) return null;
        return Math.floor(dateObj.getTime() / 1000);
    };

    const canUseCustomTime = !isNow;

    const takePhoto = async () => {
        try {
            const permission =
                await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
                Alert.alert(
                    "Camera Permission",
                    "Please enable camera access to take a photo.",
                );
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setImageAsset(result.assets[0]);
            }
        } catch (error) {
            console.error("Failed to launch camera:", error);
            Alert.alert("Error", "Unable to open camera.");
        }
    };

    const pickFromLibrary = async () => {
        try {
            const permission =
                await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                Alert.alert(
                    "Photos Permission",
                    "Please enable photo library access to select a photo.",
                );
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setImageAsset(result.assets[0]);
            }
        } catch (error) {
            console.error("Failed to open photo library:", error);
            Alert.alert("Error", "Unable to open photo library.");
        }
    };

    const handleSubmit = async () => {
        if (submitting) return;
        // Validation (unchanged)
        if (!title.trim()) {
            Alert.alert("Missing Information", "Please enter a moment title");
            return;
        }
        if (!selectedCategory) {
            Alert.alert("Missing Information", "Please select a category");
            return;
        }
        // if (!selectedLocation) {
        //     Alert.alert("Missing Information", "Please select a location");
        //     return;
        // }
        // if (selectedLocation === "Other" && !customLocation.trim()) {
        //     Alert.alert(
        //         "Missing Information",
        //         "Please enter a custom location",
        //     );
        //     return;
        // }
        if (!latitude || !longitude) {
            Alert.alert(
                "Missing Information",
                "Please select a location on the map",
            );
            return;
        }
        if (!imageAsset) {
            Alert.alert("Missing Information", "Please take a photo.");
            return;
        }
        if (canUseCustomTime) {
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
        }

        const startTimestamp = isNow
            ? Math.floor(Date.now() / 1000)
            : parseTimeToEpochSeconds(date, startTime);
        const endTimestamp = isNow
            ? null
            : parseTimeToEpochSeconds(date, endTime);

        if (!startTimestamp || (canUseCustomTime && !endTimestamp)) {
            Alert.alert(
                "Invalid Date/Time",
                "Use MM/DD/YYYY and times like 7:00 PM.",
            );
            return;
        }

        const eventData = {
            name: title.trim(),
            description: description.trim() || null,
            category: selectedCategory,
            vibes: [],
            lat: latitude,
            lng: longitude,
            start_time: startTimestamp,
            end_time: endTimestamp,
            image_keys: [],
        };

        try {
            setSubmitting(true);
            const response = await fetch("http://localhost:8000/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(eventData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to create event");
            }

            const created = await response.json();
            const eventId = created.event_id;
            if (!eventId) {
                throw new Error("Missing event_id in response");
            }

            const contentType = imageAsset.mimeType || "image/jpeg";
            const uploadUrlResponse = await fetch(
                `http://localhost:8000/events/image-upload-url?event_id=${encodeURIComponent(
                    eventId,
                )}&content_type=${encodeURIComponent(contentType)}`,
                { method: "POST" },
            );

            if (!uploadUrlResponse.ok) {
                const errorText = await uploadUrlResponse.text();
                throw new Error(errorText || "Failed to get upload URL");
            }

            const uploadData = await uploadUrlResponse.json();
            const uploadUrl = uploadData.upload_url;
            const objectKey = uploadData.object_key;
            if (!uploadUrl || !objectKey) {
                throw new Error("Upload URL response missing fields");
            }

            const imageResponse = await fetch(imageAsset.uri);
            const imageBlob = await imageResponse.blob();
            const uploadResponse = await fetch(uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": contentType },
                body: imageBlob,
            });

            if (!uploadResponse.ok) {
                throw new Error("Image upload failed");
            }

            const attachResponse = await fetch(
                `http://localhost:8000/events/${encodeURIComponent(eventId)}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ image_keys: [objectKey] }),
                },
            );

            if (!attachResponse.ok) {
                const errorText = await attachResponse.text();
                throw new Error(errorText || "Failed to attach image");
            }

            Alert.alert("Success", "Your moment has been submitted!", [
                {
                    text: "OK",
                    onPress: () => {
                        setTitle("");
                        setDescription("");
                        setSelectedCategory("");
                        setLatitude(null);
                        setLongitude(null);
                        setDate("");
                        setStartTime("");
                        setEndTime("");
                        setIsNow(false);
                        setImageAsset(null);
                    },
                },
            ]);
        } catch (error) {
            console.error("Failed to create event:", error);
            Alert.alert(
                "Submission Failed",
                "We couldn’t submit your event. Please try again.",
            );
        } finally {
            setSubmitting(false);
        }
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
                        <ThemedText style={styles.title}>
                            Create a Moment
                        </ThemedText>
                        <ThemedText style={styles.subtitle}>
                            What's happening in your community?
                        </ThemedText>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Event Title */}
                        <View style={styles.inputGroup}>
                            <ThemedText style={styles.label}>
                                Moment Title *
                            </ThemedText>
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="e.g., Summer Jazz Night"
                                placeholderTextColor="#8E8A83"
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>

                        {/* Location Picker with Map */}
                        <LocationPicker
                            onLocationSelect={(lat, lng, addr) => {
                                setLatitude(lat);
                                setLongitude(lng);
                            }}
                            initialLatitude={latitude || undefined}
                            initialLongitude={longitude || undefined}
                        />

                        {/* Time */}
                        <View style={styles.inputGroup}>
                            <ThemedText style={styles.label}>Time *</ThemedText>
                            <View style={styles.timeToggleRow}>
                                <TouchableOpacity
                                    style={[
                                        styles.timeToggle,
                                        !isNow && styles.timeToggleActive,
                                    ]}
                                    onPress={() => setIsNow(false)}
                                    activeOpacity={0.85}
                                >
                                    <ThemedText
                                        style={[
                                            styles.timeToggleText,
                                            !isNow &&
                                                styles.timeToggleTextActive,
                                        ]}
                                    >
                                        Set a time
                                    </ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.timeToggle,
                                        isNow && styles.timeToggleActive,
                                    ]}
                                    onPress={() => setIsNow(true)}
                                    activeOpacity={0.85}
                                >
                                    <ThemedText
                                        style={[
                                            styles.timeToggleText,
                                            isNow &&
                                                styles.timeToggleTextActive,
                                        ]}
                                    >
                                        Now
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {canUseCustomTime && (
                            <>
                                {/* Date */}
                                <View style={styles.inputGroup}>
                                    <ThemedText style={styles.label}>
                                        Date *
                                    </ThemedText>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            { color: colors.text },
                                        ]}
                                        placeholder="MM/DD/YYYY"
                                        placeholderTextColor="#8E8A83"
                                        value={date}
                                        onChangeText={setDate}
                                    />
                                </View>

                                {/* Start and End Time */}
                                <View style={styles.rowInputs}>
                                    <View
                                        style={[
                                            styles.inputGroup,
                                            styles.halfWidth,
                                        ]}
                                    >
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

                                    <View
                                        style={[
                                            styles.inputGroup,
                                            styles.halfWidth,
                                        ]}
                                    >
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
                            </>
                        )}

                        {/* Category */}
                        <View style={styles.inputGroup}>
                            <ThemedText style={styles.label}>
                                Monetary Category *
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

                        {/* Photo */}
                        <View style={styles.inputGroup}>
                            <ThemedText style={styles.label}>
                                Event Photo *
                            </ThemedText>
                            {imageAsset ? (
                                <View style={styles.photoPreviewWrap}>
                                    <Image
                                        source={{ uri: imageAsset.uri }}
                                        style={styles.photoPreview}
                                    />
                                    <View style={styles.photoActionRow}>
                                        <TouchableOpacity
                                            style={styles.photoAction}
                                            onPress={takePhoto}
                                            activeOpacity={0.9}
                                        >
                                            <ThemedText
                                                style={styles.photoActionText}
                                            >
                                                Retake photo
                                            </ThemedText>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.photoAction}
                                            onPress={pickFromLibrary}
                                            activeOpacity={0.9}
                                        >
                                            <ThemedText
                                                style={styles.photoActionText}
                                            >
                                                Choose from library
                                            </ThemedText>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.photoButtonRow}>
                                    <TouchableOpacity
                                        style={styles.photoButton}
                                        onPress={takePhoto}
                                        activeOpacity={0.9}
                                    >
                                        <ThemedText
                                            style={styles.photoButtonText}
                                        >
                                            Take a photo
                                        </ThemedText>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.photoButton}
                                        onPress={pickFromLibrary}
                                        activeOpacity={0.9}
                                    >
                                        <ThemedText
                                            style={styles.photoButtonText}
                                        >
                                            Choose from library
                                        </ThemedText>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        {/* Organizer */}
                        {/*<View style={styles.inputGroup}>
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
                        </View>*/}

                        {/* Contact Email */}
                        {/*<View style={styles.inputGroup}>
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
                        </View>*/}

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                submitting && styles.submitButtonDisabled,
                            ]}
                            onPress={handleSubmit}
                            activeOpacity={0.9}
                            disabled={submitting}
                        >
                            <ThemedText style={styles.submitButtonText}>
                                {submitting ? "Submitting..." : "Create Moment"}
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
            fontFamily: "Fraunces",
            fontSize: 16,
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
            flexDirection: "row",
            flexWrap: "wrap",
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
        timeToggleRow: {
            flexDirection: "row",
            gap: 10,
        },
        timeToggle: {
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 999,
            backgroundColor: "rgba(246,243,232,0.65)",
            borderWidth: 1,
            borderColor: "rgba(43,42,39,0.10)",
        },
        timeToggleActive: {
            backgroundColor: "rgba(81,176,165,0.20)",
            borderColor: "rgba(81,176,165,0.18)",
        },
        timeToggleText: {
            fontSize: 14,
            color: "#2B2A27",
            opacity: 0.82,
        },
        timeToggleTextActive: {
            color: "#2B2A27",
            opacity: 1,
        },

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
        submitButtonDisabled: {
            opacity: 0.7,
        },
        photoButton: {
            flex: 1,
            borderRadius: 16,
            paddingVertical: 14,
            alignItems: "center",
            backgroundColor: "rgba(246,243,232,0.70)",
            borderWidth: 1,
            borderColor: "rgba(43,42,39,0.10)",
        },
        photoButtonText: {
            fontFamily: "FrauncesSemiBold",
            fontSize: 15,
            color: "#2B2A27",
        },
        photoButtonRow: {
            flexDirection: "row",
            gap: 10,
        },
        photoPreviewWrap: {
            gap: 10,
        },
        photoPreview: {
            width: "100%",
            height: 220,
            borderRadius: 18,
        },
        photoActionRow: {
            flexDirection: "row",
            gap: 10,
            flexWrap: "wrap",
        },
        photoAction: {
            alignSelf: "flex-start",
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 999,
            backgroundColor: "rgba(81,176,165,0.20)",
            borderWidth: 1,
            borderColor: "rgba(81,176,165,0.18)",
        },
        photoActionText: {
            fontSize: 14,
            color: "#2B2A27",
        },

        disclaimer: {
            marginTop: 16,
            fontSize: 13,
            opacity: 0.6,
            textAlign: "center",
            color: "#35332F",
        },
    });
