import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

type Role = "user" | "assistant";
type Msg = { id: string; role: Role; text: string };

const PHRASES = [
    "temporary art",
    "pop-up stands",
    "live concerts",
    "hidden galleries",
    "street performances",
];

// --- MOVED OUTSIDE HOMESCREEN ---
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
        {/* The Input Pill */}
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

        {/* The Button (Now Outside) */}
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

    const [phase, setPhase] = useState<"landing" | "chat">("landing");

    // --- ANIMATION LOGIC ---
    const [phraseIndex, setPhraseIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (phase !== "landing") return;

        const cycleAnimation = () => {
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

                // reset below
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
                ]).start();
            });
        };

        // optional: wait a bit before the first cycle
        const startTimeout = setTimeout(() => {
            cycleAnimation();
        }, 2500);

        const interval = setInterval(cycleAnimation, 5000);

        return () => {
            clearTimeout(startTimeout);
            clearInterval(interval);
        };
    }, [phase]);

    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Msg[]>([
        {
            id: "a-1",
            role: "assistant",
            text: "Try murals near your area—want something colorful or monochrome?",
        },
    ]);

    const listRef = useRef<FlatList<Msg>>(null);
    const canSend = input.trim().length > 0;

    const submit = () => {
        if (!canSend) return;

        const q = input.trim();
        setInput("");

        if (phase === "landing") setPhase("chat");

        setMessages((prev) => [
            ...prev,
            { id: `u-${Date.now()}`, role: "user", text: q },
        ]);

        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                {
                    id: `a-${Date.now()}`,
                    role: "assistant",
                    text: "Want something nearby, or are you open to traveling a bit?",
                },
            ]);
            requestAnimationFrame(() =>
                listRef.current?.scrollToEnd({ animated: true }),
            );
        }, 400);

        requestAnimationFrame(() =>
            listRef.current?.scrollToEnd({ animated: true }),
        );
    };

    const renderBubble = ({ item }: { item: Msg }) => {
        const isUser = item.role === "user";
        return (
            <View
                style={[styles.row, isUser ? styles.rowRight : styles.rowLeft]}
            >
                <View
                    style={[
                        styles.bubble,
                        isUser ? styles.userBubble : styles.assistantBubble,
                    ]}
                >
                    <ThemedText style={styles.bubbleText}>
                        {item.text}
                    </ThemedText>
                </View>
            </View>
        );
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
                        />
                    </View>
                </ThemedView>
            </ImageBackground>
        );
    }

    // ---------- CHAT ----------
    return (
        <ImageBackground
            source={require("@/assets/images/bg.png")}
            style={styles.screen}
            resizeMode="cover"
        >
            <ThemedView
                style={[styles.screen, { backgroundColor: "transparent" }]}
            >
                <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                    <ThemedText style={styles.headerBrand}>ephemeral</ThemedText>
                </View>

                <FlatList
                    ref={listRef}
                    data={messages}
                    keyExtractor={(m) => m.id}
                    renderItem={renderBubble}
                    contentContainerStyle={styles.listContent}
                    style={{ backgroundColor: "transparent" }}
                    onContentSizeChange={() =>
                        listRef.current?.scrollToEnd({ animated: true })
                    }
                />
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                >
                    <SearchBar
                        bottom
                        input={input}
                        setInput={setInput}
                        submit={submit}
                        canSend={canSend}
                    />
                </KeyboardAvoidingView>
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
        fontSize: 34, // Larger size
        lineHeight: 46, // Critical: prevents cutting off tops/bottoms
        paddingVertical: 4, // Extra buffer for safety
        letterSpacing: -1.0, // Tighter spacing looks better at large sizes
        color: "#2B2A27",
        paddingLeft: 7,
    },
    headerMeta: {
        opacity: 0.6,
        fontSize: 14, // Explicit size helps baseline alignment match the new large text
    },

    // Messages
    listContent: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 10,
    },
    row: { width: "100%", flexDirection: "row" },
    rowLeft: { justifyContent: "flex-start" },
    rowRight: { justifyContent: "flex-end" },

    bubble: {
        maxWidth: "82%",
        borderRadius: 18,
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    assistantBubble: {
        backgroundColor: "rgba(246,243,232,0.85)",
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.06)",
    },
    userBubble: {
        backgroundColor: "rgba(110,19,82,0.14)",
        borderWidth: 1,
        borderColor: "rgba(110,19,82,0.14)",
    },
    bubbleText: { fontSize: 15.5, lineHeight: 20 },

    // Search bar
    searchWrap: {
        width: "100%",
        maxWidth: 520,
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 12,
        // Added these to align the bar and button side-by-side
        flexDirection: "row",
        alignItems: "center",
    },
    searchWrapBottom: {},
    searchBar: {
        flex: 1, // Takes up remaining space next to button
        flexDirection: "row",
        alignItems: "center",
        height: 48,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.12)",
        backgroundColor: "rgba(246,243,232,0.78)",
        paddingLeft: 12,
        paddingRight: 12, // Balanced padding now that button is out
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
        paddingHorizontal: 16, // Increased slightly for better standalone look
        height: 48, // Match height of input bar
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 22, // Match border radius of input bar
        backgroundColor: "#2B2A27",
    },
    searchBtnDisabled: { opacity: 0.35 },
    searchBtnText: { color: "#F6F3E8", fontSize: 14, fontWeight: "600" },

    highlightText: {
        fontWeight: "700",
        color: "#000000",
        paddingHorizontal: 4,
    },
});
