import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";

const TAB_COLORS = {
    home: "#51B0A5",
    explore: "#E98E58",
    moments: "#AC515F",
    create: "#6E1352",
    profile: "#51B0A5",
};

export default function TabLayout() {
    const colorScheme = useColorScheme();

    // Helper to generate the bar style based on a specific color
    const getTabBarStyle = (color: string) => ({
        backgroundColor: "#F6F3E8",
        borderTopWidth: 2,
        borderTopColor: color,
    });

    // Helper listener to reload the page if clicked while active
    const handleTabPress = ({ navigation, route }: any) => ({
        tabPress: (e: any) => {
            if (navigation.isFocused()) {
                e.preventDefault();
                // This forces a "hard" reset of the screen, effectively reloading it
                navigation.reset({
                    index: 0,
                    routes: [{ name: route.name }],
                });
            }
        },
    });

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarButton: HapticTab,
            }}
        >
            <Tabs.Screen
                name="index"
                listeners={handleTabPress}
                options={{
                    title: "home",
                    tabBarActiveTintColor: TAB_COLORS.home,
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name="house.fill" color={color} />
                    ),
                    tabBarStyle: getTabBarStyle(TAB_COLORS.home),
                }}
            />

            <Tabs.Screen
                name="explore"
                listeners={handleTabPress}
                options={{
                    title: "explore",
                    tabBarActiveTintColor: TAB_COLORS.explore,
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name="map.fill" color={color} />
                    ),
                    tabBarStyle: getTabBarStyle(TAB_COLORS.explore),
                }}
            />

            <Tabs.Screen
                name="list"
                listeners={handleTabPress}
                options={{
                    title: "moments",
                    tabBarActiveTintColor: TAB_COLORS.moments,
                    tabBarIcon: ({ color }) => (
                        <IconSymbol
                            size={28}
                            name="list.bullet"
                            color={color}
                        />
                    ),
                    tabBarStyle: getTabBarStyle(TAB_COLORS.moments),
                }}
            />

            <Tabs.Screen
                name="add"
                listeners={handleTabPress}
                options={{
                    title: "create",
                    tabBarActiveTintColor: TAB_COLORS.create,
                    tabBarIcon: ({ color }) => (
                        <IconSymbol
                            size={28}
                            name="paintbrush.fill"
                            color={color}
                        />
                    ),
                    tabBarStyle: getTabBarStyle(TAB_COLORS.create),
                }}
            />
            <Tabs.Screen
                name="profile"
                listeners={handleTabPress}
                options={{
                    title: "profile",
                    tabBarActiveTintColor: TAB_COLORS.profile,
                    tabBarIcon: ({ color }) => (
                        <IconSymbol
                            size={28}
                            name="person.fill"
                            color={color}
                        />
                    ),
                    tabBarStyle: getTabBarStyle(TAB_COLORS.profile),
                }}
            />
        </Tabs>
    );
}
