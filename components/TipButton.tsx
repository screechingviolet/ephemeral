import { useStripe } from "@stripe/stripe-react-native";
import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text } from "react-native";

import {
    DEFAULT_TIP_AMOUNT_CENTS,
    DEMO_CONNECT_ACCOUNT_ID,
    PAYMENTS_API_BASE_URL,
} from "@/constants/payments";

type TipButtonProps = {
    recipientId?: string | null;
    amountCents?: number;
    label?: string;
};

export default function TipButton({
    recipientId,
    amountCents = DEFAULT_TIP_AMOUNT_CENTS,
    label = "Tip $5",
}: TipButtonProps) {
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const [loading, setLoading] = useState(false);

    const handleTip = async () => {
        const demoRecipient =
            recipientId || DEMO_CONNECT_ACCOUNT_ID || null;

        if (!demoRecipient || !demoRecipient.startsWith("acct_")) {
            Alert.alert(
                "Tipping unavailable",
                "Missing demo Stripe Connect account ID.",
            );
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `${PAYMENTS_API_BASE_URL}/create-payment-intent`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        amount: amountCents,
                        recipient_id: demoRecipient,
                    }),
                },
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to create payment intent");
            }

            const data = await response.json();
            const clientSecret = data.clientSecret;
            if (!clientSecret) {
                throw new Error("Missing clientSecret in response");
            }

            const initResult = await initPaymentSheet({
                paymentIntentClientSecret: clientSecret,
                merchantDisplayName: "Ephemeral",
            });

            if (initResult.error) {
                throw new Error(initResult.error.message);
            }

            const presentResult = await presentPaymentSheet();
            if (presentResult.error) {
                throw new Error(presentResult.error.message);
            }

            Alert.alert("Success", "Thanks for the tip!");
        } catch (error) {
            console.error("Tip failed:", error);
            Alert.alert("Payment failed", "Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleTip}
            disabled={loading}
        >
            <Text style={styles.buttonText}>
                {loading ? "Processing..." : label}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        height: 44,
        paddingHorizontal: 16,
        borderRadius: 14,
        backgroundColor: "#2B2A27",
        alignItems: "center",
        justifyContent: "center",
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: "#F6F3E8",
        fontSize: 14,
        fontWeight: "600",
    },
});
