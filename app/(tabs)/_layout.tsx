import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const TAB_COLORS = {
  home: '#51B0A5',
  explore: '#E98E58',
  moments: '#AC515F',
  create: '#6E1352',
  profile: '#51B0A5'
};

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Helper to generate the bar style based on a specific color
  const getTabBarStyle = (color: string) => ({
    backgroundColor: '#F6F3E8',
    borderTopWidth: 2,
    borderTopColor: color,
  });

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'home',
          tabBarActiveTintColor: TAB_COLORS.home, // Icon color
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          tabBarStyle: getTabBarStyle(TAB_COLORS.home), // Border color
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'explore',
          tabBarActiveTintColor: TAB_COLORS.explore,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="map.fill" color={color} />,
          tabBarStyle: getTabBarStyle(TAB_COLORS.explore),
        }}
      />

      <Tabs.Screen
        name="list"
        options={{
          title: 'moments',
          tabBarActiveTintColor: TAB_COLORS.moments,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet" color={color} />,
          tabBarStyle: getTabBarStyle(TAB_COLORS.moments),
        }}
      />

      <Tabs.Screen
        name="add"
        options={{
          title: 'create',
          tabBarActiveTintColor: TAB_COLORS.create,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paintbrush.fill" color={color} />,
          tabBarStyle: getTabBarStyle(TAB_COLORS.create),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'profile',
          tabBarActiveTintColor: TAB_COLORS.profile,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
          tabBarStyle: getTabBarStyle(TAB_COLORS.profile),
        }}
      />
    </Tabs>
  );
}