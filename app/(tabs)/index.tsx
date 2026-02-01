import React, { useEffect, useRef, useState } from "react";
import {
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

// --- SearchBar stays outside for stability ---
type SearchBarProps = {
    bottom?: boolean;
    input: string;
    setInput: (text: string) => void;
    submit: () => void;
    canSend: boolean;
};

const SearchBar = ({
    bottom,
    input,
    setInput,
    submit,
    canSend,
}: SearchBarProps) => (
    <View style={[styles.searchWrap, bottom && styles.searchWrapBottom]}>
        {/* Input pill */}
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
            />
        </View>

        {/* Button */}
        <Pressable
            onPress={submit}
            disabled={!canSend}
            style={[styles.searchBtn, !canSend && styles.searchBtnDisabled]}
        >
            <ThemedText style={styles.searchBtnText}>Go</ThemedText>
        </Pressable>
    </View>
);

export default function HomeScreen() {
    const insets = useSafeAreaInsets();

    // NEW FLOW: landing -> answer
    const [phase, setPhase] = useState<"landing" | "answer">("landing");

    // Landing animation
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
                    // wait 5s AFTER animation completes
                    setTimeout(runCycle, 5000);
                });
            });
        };

        // initial delay before first change
        const start = setTimeout(runCycle, 5000);

        return () => {
            isCancelled = true;
            clearTimeout(start);
        };
    }, [phase]);

    // Input + answer state
    const [input, setInput] = useState("");
    const [query, setQuery] = useState("");
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(false);

    const canSend = input.trim().length > 0;

    const submit = () => {
        if (!canSend) return;

        const q = input.trim();
        setInput("");
        setQuery(q);

        if (phase === "landing") setPhase("answer");

        setLoading(true);
        setAnswer("");

        // Mock response (replace with real model call later)
        setTimeout(() => {
            setLoading(false);
            setAnswer(
                `Here are a few ideas inspired by “${q}”:\n\n` +
                    `• A mural corridor or street-art block nearby\n` +
                    `• A pop-up market or stand this weekend\n` +
                    `• A small gallery opening (often free) with live music\n\n` +
                    `Want walking distance only, or are you open to a short bus ride?`,
            );
        }, 450);
    };

    const resetToLanding = () => {
        setPhase("landing");
        setInput("");
        setQuery("");
        setAnswer("");
        setLoading(false);
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

                        {/* Original textbox stays on landing */}
                        <SearchBar
                            input={input}
                            setInput={setInput}
                            submit={submit}
                            canSend={canSend}
                        />
                    </View>
                </ThemedView>
            </ImageBackground>
        );
    }

    // ---------- ANSWER (full-page response, no textbox) ----------
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
                {/* Header */}
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

                {/* Full-page answer */}
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
                            <ThemedText style={styles.answerText}>
                                {answer}
                            </ThemedText>
                        )}
                    </ScrollView>
                </View>

                {/* Optional: keep a bottom bar for “ask another” feel (currently hidden).
            If you want it, I can add a “New question” bottom button instead. */}
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
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.08)",
    },

    // Search bar (pill + outside button)
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
