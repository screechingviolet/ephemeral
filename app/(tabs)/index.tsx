import React, { useRef, useState } from "react";
import {
  FlatList,
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

export default function HomeScreen() {
    const insets = useSafeAreaInsets();

    const [phase, setPhase] = useState<"landing" | "chat">("landing");
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
                    <ThemedText style={styles.landingBrand}>
                        ephemeral
                    </ThemedText>
                    <ThemedText style={styles.landingTagline}>
                        Discover temporary art in an ever-changing city.
                    </ThemedText>

                    {/* Center browser-style textbox */}
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
        fontFamily: "FrauncesSoft",
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
        marginBottom: 28,
        textAlign: "center",
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
    searchBtnDisabled: { opacity: 0.35 },
    searchBtnText: { color: "#F6F3E8", fontSize: 14 },
});
