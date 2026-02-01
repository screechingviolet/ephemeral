import React, { useRef, useState, useEffect } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  Animated,
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
  "street performances"
];

export default function HomeScreen() {
    const insets = useSafeAreaInsets();

    const [phase, setPhase] = useState<"landing" | "chat">("landing");

    // --- ANIMATION LOGIC ---
    const [phraseIndex, setPhraseIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
    if (phase === "landing") {
        const cycleAnimation = () => {
        // 1. Fade Out and Slide Up
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: -10, duration: 400, useNativeDriver: true })
        ]).start(() => {
            // 2. Switch Text
            setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
            
            // 3. Reset position to bottom BEFORE starting fade in
            slideAnim.setValue(10);
            
            // 4. Fade In and Slide Up to center
            Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true })
            ]).start();
        });
        };

        const interval = setInterval(cycleAnimation, 5000);
        return () => clearInterval(interval);
    }
    }, [phase, fadeAnim, slideAnim]);
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

        // First submit flips to chat view so the bar "moves down"
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

    const SearchBar = ({ bottom }: { bottom?: boolean }) => (
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
                />
                <Pressable
                    onPress={submit}
                    disabled={!canSend}
                    style={[
                        styles.searchBtn,
                        !canSend && styles.searchBtnDisabled,
                    ]}
                >
                    <ThemedText style={styles.searchBtnText}>Go</ThemedText>
                </Pressable>
            </View>
        </View>
    );

    // ---------- LANDING (center textbox) ----------
    if (phase === "landing") {
        return (
        <ThemedView style={styles.screen}>
            <View style={styles.landingContainer}>
            <ThemedText style={styles.landingBrand}>ephemeral</ThemedText>
            
            <View style={styles.taglineRow}>
                <ThemedText style={styles.landingTagline}>Discover </ThemedText>
                
                <View style={styles.animatedTextContainer}>
                <Animated.View style={{ 
                    opacity: fadeAnim, 
                    transform: [{ translateY: slideAnim }] 
                }}>
                    <ThemedText style={[styles.landingTagline, styles.highlightText]}>
                    {PHRASES[phraseIndex]}
                    </ThemedText>
                </Animated.View>
                </View>

                <ThemedText style={styles.landingTagline}> in an</ThemedText>
            </View>

            <ThemedText style={[styles.landingTagline, { marginBottom: 12 }]}>
                ever-changing city.
            </ThemedText>

            <SearchBar />
            </View>
        </ThemedView>
        );
    }

    // ---------- CHAT (textbox pinned to bottom) ----------
    return (
        <ThemedView style={styles.screen}>
            {/* Header with safe area */}
            <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                <ThemedText style={styles.headerBrand}>Ephemera</ThemedText>
                <ThemedText style={styles.headerMeta}>beta</ThemedText>
            </View>

            {/* Messages */}
            <FlatList
                ref={listRef}
                data={messages}
                keyExtractor={(m) => m.id}
                renderItem={renderBubble}
                contentContainerStyle={styles.listContent}
                onContentSizeChange={() =>
                    listRef.current?.scrollToEnd({ animated: true })
                }
            />

            {/* Bottom search bar */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <SearchBar bottom />
            </KeyboardAvoidingView>
        </ThemedView>
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
        marginBottom: 0, // Set this to 0 because the taglineRow handles the spacing
    },
    taglineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 30, 
        marginTop: 10, // Add space above the row
        marginBottom: 4, // Space between this and the "in an ever-changing city" line
    },
    animatedTextContainer: {
        minWidth: 0, // Adjust this to fit your longest phrase
        alignItems: 'flex-start',
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
        fontSize: 22,
        letterSpacing: -0.2,
        color: "#2B2A27",
        marginTop: 2,
    },
    headerMeta: { opacity: 0.6 },

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
        backgroundColor: "rgba(110,19,82,0.14)", // plum tint
        borderWidth: 1,
        borderColor: "rgba(110,19,82,0.14)",
    },
    bubbleText: { fontSize: 15.5, lineHeight: 20 },

    // Search bar (shared)
    searchWrap: {
        width: "100%",
        maxWidth: 520,
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 12,
    },
    searchWrapBottom: {
        // same spacing; kept for clarity if you want to change later
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        height: 48,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.12)",
        backgroundColor: "rgba(246,243,232,0.78)",
        paddingLeft: 12,
        paddingRight: 10,
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
        paddingHorizontal: 12,
        paddingVertical: 9,
        borderRadius: 16,
        backgroundColor: "#2B2A27",
    },
    // Move these out of the brackets above
    searchBtnDisabled: { 
        opacity: 0.35 
    },
    searchBtnText: { 
        color: "#F6F3E8", 
        fontSize: 14 
    },
    highlightText: {
        fontWeight: "700",
        color: "#000000", 
        paddingHorizontal: 4,
    },
}); // End of StyleSheet
