import { StripeProvider } from "@stripe/stripe-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { PAYMENTS_API_BASE_URL } from "@/constants/payments";

type StripeGateProps = {
    children: React.ReactNode;
};

export default function StripeGate({ children }: StripeGateProps) {
    const [publishableKey, setPublishableKey] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const loadKey = async () => {
            try {
                const response = await fetch(
                    `${PAYMENTS_API_BASE_URL}/config`,
                );
                if (!response.ok) {
                    throw new Error("Failed to load Stripe publishable key");
                }
                const data = await response.json();
                if (!data.publishableKey) {
                    throw new Error("Missing Stripe publishable key");
                }
                if (isMounted) {
                    setPublishableKey(data.publishableKey);
                }
            } catch (err) {
                if (isMounted) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to load Stripe key",
                    );
                }
            }
        };

        loadKey();
        return () => {
            isMounted = false;
        };
    }, []);

    if (error) {
        return (
            <View style={{ padding: 16 }}>
                <ThemedText>{error}</ThemedText>
            </View>
        );
    }

    if (!publishableKey) {
        return (
            <View style={{ padding: 16 }}>
                <ActivityIndicator />
            </View>
        );
    }

    return (
        <StripeProvider publishableKey={publishableKey}>
            {children}
        </StripeProvider>
    );
}
