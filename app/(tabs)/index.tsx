import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { EventCard } from "@/components/EventCard";
import { useRouter } from "expo-router";
import { API_BASE_URL } from "@/constants/api";

const PHRASES = [
  "fleeting moments",
  "temporary artwork",
  "pop-up stands",
  "live concerts",
  "hidden galleries",
  "street performances",
  "food trucks",
  "coworking sessions",
  "leftover sales"
];

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

type BackendResponse = {
    message: string;
    events: Event[];
};

type SearchBarProps = {
    bottom?: boolean;
    input: string;
    setInput: (text: string) => void;
    submit: () => void;
    canSend: boolean;
    disabledReason?: string | null;
};

const SearchBar = ({
    bottom,
    input,
    setInput,
    submit,
    canSend,
    disabledReason,
}: SearchBarProps) => (
    <View style={[styles.searchWrap, bottom && styles.searchWrapBottom]}>
        <View style={styles.searchBar}>
            <ThemedText style={styles.searchIcon}>⌕</ThemedText>
            <TextInput
                value={input}
                onChangeText={setInput}
                placeholder={
                    bottom
                        ? "Search for temporary art…"
                        : "Search for murals, pop-ups, performances…"
                }
                placeholderTextColor="#8E8A83"
                style={styles.searchInput}
                returnKeyType="search"
                onSubmitEditing={submit}
                autoCorrect={false}
                autoCapitalize="none"
            />
        </View>

        <Pressable
            onPress={submit}
            disabled={!canSend || !!disabledReason}
            style={[
                styles.searchBtn,
                (!canSend || !!disabledReason) && styles.searchBtnDisabled,
            ]}
        >
            <ThemedText style={styles.searchBtnText}>Go</ThemedText>
        </Pressable>
    </View>
);

// Parse message and split into text and event references
type MessagePart = 
    | { type: 'text'; content: string }
    | { type: 'event'; eventId: string };

function parseMessage(message: string): MessagePart[] {
    const parts: MessagePart[] = [];
    const regex = /\[Event ([^\]]+)\]/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(message)) !== null) {
        // Add text before the event reference
        if (match.index > lastIndex) {
            const textContent = message.slice(lastIndex, match.index);
            if (textContent.trim()) {
                parts.push({ type: 'text', content: textContent });
            }
        }

        // Add the event reference
        parts.push({ type: 'event', eventId: match[1] });
        lastIndex = regex.lastIndex;
    }

    // Add remaining text after last event
    if (lastIndex < message.length) {
        const textContent = message.slice(lastIndex);
        if (textContent.trim()) {
            parts.push({ type: 'text', content: textContent });
        }
    }

    return parts;
}

export default function HomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // landing -> answer
    const [phase, setPhase] = useState<"landing" | "answer">("landing");

    // Landing phrase animation
    const [phraseIndex, setPhraseIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (phase !== "landing") return;

        let isCancelled = false;

        const runCycle = () => {
            if (isCancelled) return;

            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: -10,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setPhraseIndex((prev) => (prev + 1) % PHRASES.length);

                slideAnim.setValue(10);

                Animated.parallel([
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.timing(slideAnim, {
                        toValue: 0,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ]).start(() => {
                    setTimeout(runCycle, 5000);
                });
            });
        };

        const start = setTimeout(runCycle, 5000);
        return () => {
            isCancelled = true;
            clearTimeout(start);
        };
    }, [phase, fadeAnim, slideAnim]);

    // Location (lat/lng)
    const [lat, setLat] = useState<number | null>(null);
    const [lng, setLng] = useState<number | null>(null);
    const [locLoading, setLocLoading] = useState(false);

    const getUserLocation = async (): Promise<{
        lat: number;
        lng: number;
    } | null> => {
        try {
            setLocLoading(true);

            const { status } =
                await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert(
                    "Permission Denied",
                    "Please enable location permissions to use this feature.",
                );
                return null;
            }

            const currentLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            const coords = {
                lat: currentLocation.coords.latitude,
                lng: currentLocation.coords.longitude,
            };

            setLat(coords.lat);
            setLng(coords.lng);

            return coords;
        } catch (error) {
            console.error("Error getting location:", error);
            Alert.alert("Error", "Failed to get your location");
            return null;
        } finally {
            setLocLoading(false);
        }
    };

    // Get location when the screen mounts
    useEffect(() => {
        getUserLocation();
    }, []);

    // Input + answer state
    const [input, setInput] = useState("");
    const [query, setQuery] = useState("");
    const [answer, setAnswer] = useState("");
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(false);

    const canSend = input.trim().length > 0;

    const disabledReason = !API_BASE_URL
        ? "Missing API URL"
        : locLoading
          ? "Getting location…"
          : lat === null || lng === null
            ? "No location"
            : null;

    const submit = async () => {
        if (!canSend || loading) return;

        if (!API_BASE_URL) {
            Alert.alert(
                "Missing API URL",
                "Set EXPO_PUBLIC_API_BASE_URL in your .env (use your laptop IP on a real phone).",
            );
            return;
        }

        // If location hasn't arrived yet, try fetching it now
        let coords =
            lat !== null && lng !== null
                ? { lat, lng }
                : await getUserLocation();

        if (!coords) {
            Alert.alert(
                "Location needed",
                "We couldn't get your location yet.",
            );
            return;
        }

        const q = input.trim();
        setInput("");
        setQuery(q);

        if (phase === "landing") setPhase("answer");

        setLoading(true);
        setAnswer("");
        setEvents([]);

        try {
            const res = await fetch(`${API_BASE_URL}/api/events/recommend`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_query: q,
                    lat: coords.lat,
                    lng: coords.lng,
                    radius_m: 10000,
                    active_only: true,
                    precision: 6,
                    limit: 50,
                    top_n: 5,
                    tags: "string",
                }),
            });

            if (!res.ok) {
                const t = await res.text().catch(() => "");
                throw new Error(
                    `Backend ${res.status}: ${t || "Request failed"}`,
                );
            }

            const data = (await res.json()) as BackendResponse;

            if (!data || typeof data.message !== "string") {
                throw new Error("Invalid backend response (missing message)");
            }

            setAnswer(data.message);
            setEvents(data.events || []);
        } catch (err: any) {
            console.error(err);
            setAnswer(
                err?.message ?? "Something went wrong. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    };

    const resetToLanding = () => {
        setPhase("landing");
        setInput("");
        setQuery("");
        setAnswer("");
        setEvents([]);
        setLoading(false);
    };

    // Render the parsed message with event cards
    const renderMessage = () => {
        const parts = parseMessage(answer);
        const eventMap = new Map(events.map(e => [e.event_id, e]));

        return parts.map((part, index) => {
            if (part.type === 'text') {
                return (
                    <ThemedText key={`text-${index}`} style={styles.answerText}>
                        {part.content}
                    </ThemedText>
                );
            } else {
                const event = eventMap.get(part.eventId);
                if (event) {
                    return (
                        <EventCard
                            key={`event-${index}`}
                            event={event}
                            onPress={() =>
                                router.push({
                                    pathname: "/(tabs)/explore",
                                    params: { eventId: event.event_id },
                                })
                            }
                        />
                    );
                } else {
                    // Event not found, show placeholder
                    return (
                        <ThemedText key={`missing-${index}`} style={styles.missingEvent}>
                            [Event not found: {part.eventId}]
                        </ThemedText>
                    );
                }
            }
        });
    };

    // ---------- LANDING ----------
    if (phase === "landing") {
        return (
            <ImageBackground
                source={require("@/assets/images/ephemeral_home_background.png")}
                style={styles.screen}
                resizeMode="cover"
            >
                <ThemedView
                    style={styles.screen}
                    lightColor="transparent"
                    darkColor="transparent"
                >
                    <View style={styles.landingContainer}>
                        <ThemedText style={styles.landingBrand}>
                            ephemeral
                        </ThemedText>

                        <View style={styles.taglineRow}>
                            <ThemedText style={styles.landingTagline}>
                                Discover{" "}
                            </ThemedText>

                            <View style={styles.animatedTextContainer}>
                                <Animated.View
                                    style={{
                                        opacity: fadeAnim,
                                        transform: [{ translateY: slideAnim }],
                                    }}
                                >
                                    <ThemedText
                                        style={[
                                            styles.landingTagline,
                                            styles.highlightText,
                                        ]}
                                    >
                                        {PHRASES[phraseIndex]}
                                    </ThemedText>
                                </Animated.View>
                            </View>

                            <ThemedText style={styles.landingTagline}>
                                {" "}
                                in an
                            </ThemedText>
                        </View>

                        <ThemedText
                            style={[
                                styles.landingTagline,
                                { marginBottom: 12 },
                            ]}
                        >
                            ever-changing city.
                        </ThemedText>

                        <SearchBar
                            input={input}
                            setInput={setInput}
                            submit={submit}
                            canSend={canSend}
                            disabledReason={disabledReason}
                        />

                        {!!disabledReason && (
                            <ThemedText style={styles.statusText}>
                                {disabledReason}
                            </ThemedText>
                        )}
                    </View>
                </ThemedView>
            </ImageBackground>
        );
    }

    // ---------- ANSWER ----------
    return (
        <ImageBackground
            source={require("@/assets/images/bg.png")}
            style={styles.screen}
            resizeMode="cover"
        >
            <ThemedView
                style={styles.screen}
                lightColor="transparent"
                darkColor="transparent"
            >
                <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                    <ThemedText style={styles.headerBrand}>
                        ephemeral
                    </ThemedText>

                    <Pressable
                        onPress={resetToLanding}
                        style={styles.askAnotherBtn}
                    >
                        <ThemedText style={styles.askAnotherText}>
                            Ask another
                        </ThemedText>
                    </Pressable>
                </View>

                <View style={styles.answerOuter}>
                    <ScrollView
                        style={styles.answerScroll}
                        contentContainerStyle={styles.answerScrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {!!query && (
                            <ThemedText style={styles.answerPrompt}>
                                You asked: {query}
                            </ThemedText>
                        )}

                        {loading ? (
                            <ThemedText style={styles.answerLoading}>
                                Thinking…
                            </ThemedText>
                        ) : (
                            <View>{renderMessage()}</View>
                        )}
                    </ScrollView>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                />
            </ThemedView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },

    // Landing
    landingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    landingBrand: {
        fontFamily: "FrauncesBold",
        fontWeight: "200",
        fontSize: 44,
        lineHeight: 54,
        paddingBottom: 6,
        letterSpacing: -0.6,
        color: "#2B2A27",
        marginBottom: 8,
    },
    landingTagline: {
        fontSize: 16,
        opacity: 0.7,
        textAlign: "center",
        marginBottom: 0,
    },
    taglineRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 30,
        marginTop: 10,
        marginBottom: 4,
    },
    animatedTextContainer: {
        minWidth: 0,
        alignItems: "flex-start",
    },
    highlightText: {
        fontWeight: "700",
        color: "#000000",
        paddingHorizontal: 4,
    },

    statusText: {
        marginTop: 6,
        fontSize: 12,
        opacity: 0.55,
        color: "#2B2A27",
    },

    // Header
    header: {
        paddingHorizontal: 16,
        paddingBottom: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "baseline",
    },
    headerBrand: {
        fontFamily: "FrauncesBold",
        fontSize: 34,
        lineHeight: 46,
        paddingVertical: 4,
        letterSpacing: -1.0,
        color: "#2B2A27",
        paddingLeft: 7,
    },

    askAnotherBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: "rgba(246,243,232,0.72)",
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.08)",
    },
    askAnotherText: {
        fontSize: 13,
        color: "#2B2A27",
        opacity: 0.85,
        fontWeight: "600",
    },

    // Answer screen
    answerOuter: {
        flex: 1,
        paddingHorizontal: 16,
        paddingBottom: 18,
    },
    answerScroll: {
        flex: 1,
    },
    answerScrollContent: {
        paddingTop: 12,
        paddingBottom: 24,
    },
    answerPrompt: {
        fontSize: 14,
        opacity: 0.65,
        marginBottom: 10,
        color: "#2B2A27",
    },
    answerLoading: {
        fontFamily: "Fraunces",
        fontSize: 18,
        opacity: 0.65,
        textAlign: "center",
        marginTop: 24,
        color: "#2B2A27",
    },
    answerText: {
        fontFamily: "Fraunces",
        fontSize: 16,
        lineHeight: 26,
        color: "#2B2A27",
        backgroundColor: "rgba(246,243,232,0.72)",
        borderRadius: 24,
        padding: 18,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.08)",
    },
    missingEvent: {
        fontFamily: "Fraunces",
        fontSize: 14,
        lineHeight: 22,
        color: "#AC515F",
        backgroundColor: "rgba(172,81,95,0.15)",
        borderRadius: 16,
        padding: 12,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: "rgba(172,81,95,0.2)",
        fontStyle: "italic",
    },

    // Search bar
    searchWrap: {
        width: "100%",
        maxWidth: 520,
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 12,
        flexDirection: "row",
        alignItems: "center",
    },
    searchWrapBottom: {},
    searchBar: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        height: 48,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.12)",
        backgroundColor: "rgba(246,243,232,0.78)",
        paddingLeft: 12,
        paddingRight: 12,
    },
    searchIcon: {
        fontSize: 16,
        opacity: 0.65,
        marginRight: 8,
        color: "#2B2A27",
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: "#2B2A27",
        paddingVertical: 0,
    },
    searchBtn: {
        marginLeft: 8,
        paddingHorizontal: 16,
        height: 48,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 22,
        backgroundColor: "#2B2A27",
    },
    searchBtnDisabled: { opacity: 0.35 },
    searchBtnText: { color: "#F6F3E8", fontSize: 14, fontWeight: "600" },
});
