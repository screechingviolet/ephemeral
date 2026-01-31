import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import MapScreen from '@/components/MapScreen';

export default function ExploreScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText
          type="title"
          style={styles.title}>
          Explore
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.mapContainer}>
        <MapScreen />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    zIndex: 10,
  },
  title: {
    fontFamily: Fonts.rounded,
    fontSize: 36,
    fontWeight: 'bold',
  },
  mapContainer: {
    flex: 1,
  },
});
