import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useState } from "react";
import { 
    StyleSheet, 
    ImageBackground, 
    View, 
    TextInput, 
    Pressable,
    ScrollView 
} from "react-native";

export default function ProfileScreen() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");

    const handleAuth = () => {
        // TODO: Add actual authentication logic here
        console.log(isSignUp ? "Sign up" : "Login", { email, password, name });
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setEmail("");
        setPassword("");
        setName("");
    };

    if (isLoggedIn) {
        return (
            <ImageBackground
                source={require("@/assets/images/bg.png")}
                style={styles.background}
                resizeMode="cover"
            >
                <ThemedView style={[styles.container, { backgroundColor: 'transparent' }]}>
                    <ThemedText style={styles.title}>Profile</ThemedText>
                    <ThemedText style={styles.subtitle}>
                        Welcome back, {name || email}!
                    </ThemedText>
                    
                    <Pressable style={styles.logoutButton} onPress={handleLogout}>
                        <ThemedText style={styles.logoutButtonText}>Log Out</ThemedText>
                    </Pressable>
                </ThemedView>
            </ImageBackground>
        );
    }

    return (
        <ImageBackground
            source={require("@/assets/images/bg.png")}
            style={styles.background}
            resizeMode="cover"
        >
            <ScrollView style={styles.scrollView}>
                <ThemedView style={[styles.container, { backgroundColor: 'transparent' }]}>
                    <ThemedText style={styles.title}>
                        {isSignUp ? "Sign Up" : "Login"}
                    </ThemedText>
                    <ThemedText style={styles.subtitle}>
                        {isSignUp 
                            ? "Create your account" 
                            : "Welcome back to Ephemeral"
                        }
                    </ThemedText>

                    <View style={styles.formContainer}>
                        {isSignUp && (
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Name"
                                    placeholderTextColor="#8E8A83"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>
                        )}

                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor="#8E8A83"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>

                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor="#8E8A83"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>

                        <Pressable 
                            style={styles.authButton} 
                            onPress={handleAuth}
                        >
                            <ThemedText style={styles.authButtonText}>
                                {isSignUp ? "Sign Up" : "Login"}
                            </ThemedText>
                        </Pressable>

                        <Pressable 
                            style={styles.switchButton}
                            onPress={() => setIsSignUp(!isSignUp)}
                        >
                            <ThemedText style={styles.switchButtonText}>
                                {isSignUp 
                                    ? "Already have an account? Login" 
                                    : "Don't have an account? Sign Up"
                                }
                            </ThemedText>
                        </Pressable>
                    </View>
                </ThemedView>
            </ScrollView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 70,
    },
    title: {
        fontFamily: "FrauncesBold",
        fontSize: 40,
        letterSpacing: -0.3,
        color: "#2B2A27",
        textAlign: "center",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        opacity: 0.7,
        textAlign: "center",
        color: "#2B2A27",
        marginBottom: 32,
    },
    formContainer: {
        width: "100%",
        maxWidth: 400,
        alignSelf: "center",
    },
    inputWrapper: {
        marginBottom: 16,
    },
    input: {
        height: 54,
        borderRadius: 26,
        backgroundColor: "rgba(246,243,232,0.70)",
        borderWidth: 1,
        borderColor: "rgba(43,42,39,0.10)",
        paddingHorizontal: 20,
        fontSize: 16,
        color: "#2B2A27",
    },
    authButton: {
        height: 54,
        borderRadius: 26,
        backgroundColor: "#2B2A27",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 8,
    },
    authButtonText: {
        color: "#F6F3E8",
        fontSize: 16,
        fontWeight: "600",
    },
    switchButton: {
        marginTop: 20,
        paddingVertical: 12,
    },
    switchButtonText: {
        fontSize: 14,
        color: "#2B2A27",
        opacity: 0.7,
        textAlign: "center",
    },
    logoutButton: {
        height: 54,
        borderRadius: 26,
        backgroundColor: "#AC515F",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 32,
        maxWidth: 400,
        width: "100%",
        alignSelf: "center",
    },
    logoutButtonText: {
        color: "#F6F3E8",
        fontSize: 16,
        fontWeight: "600",
    },
});