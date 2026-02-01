import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Alert, ActivityIndicator, Modal, TouchableOpacity, ScrollView } from 'react-native';
import MapView, { Marker, Region, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Event {
  id: number;
  title: string;
  category: string;
  // location: string;
  date: string;
  time: string;
  endtime: string;
  description: string;
  latitude: number;
  longitude: number;
}

// Hardcoded events near Warwick, RI
const MOCK_EVENTS: Event[] = [
  {
    id: 1,
    title: 'Summer Jazz Festival',
    category: 'Free Entry - Tip Optional',
    location: 'Providence',
    date: 'Feb 15, 2026',
    time: '7:00 PM',
    description: 'Live jazz performances under the stars featuring local musicians',
    latitude: 41.8240,
    longitude: -71.4128,
  },
  {
    id: 2,
    title: 'Tech Innovation Summit',
    category: 'Ticketed',
    location: 'Warwick',
    date: 'Feb 20, 2026',
    time: '9:00 AM',
    description: 'Leading tech innovators discuss the future of technology',
    latitude: 41.7001,
    longitude: -71.4162,
  },
  {
    id: 3,
    title: 'Local Farmers Market',
    category: 'Free Entry - No Payment',
    location: 'Newport',
    date: 'Feb 8, 2026',
    time: '8:00 AM',
    description: 'Fresh produce and local artisan goods every weekend',
    latitude: 41.4901,
    longitude: -71.3128,
  },
  {
    id: 4,
    title: 'Art Gallery Opening',
    category: 'Free - Tip Optional',
    location: 'Providence',
    date: 'Feb 12, 2026',
    time: '6:00 PM',
    description: 'Contemporary art exhibition featuring local artists',
    latitude: 41.8230,
    longitude: -71.4220,
  },
  {
    id: 5,
    title: 'Live Music Night',
    category: 'Ticketed',
    location: 'Warwick',
    date: 'Feb 16, 2026',
    time: '8:00 PM',
    description: 'Local bands and acoustic performances in an intimate setting',
    latitude: 41.7100,
    longitude: -71.4200,
  },
  {
    id: 6,
    title: 'Leftover Flower Bouquets',
    category: 'After-Hours Sale',
    location: 'Warwick',
    date: 'Feb 14, 2026',
    time: '8:00 PM',
    description: 'Selling for $2 each!',
    latitude: 41.8000,
    longitude: -71.4200,
  },
  {
    id: 7,
    title: 'Violinist Performance',
    category: 'Tip Optional',
    location: 'Warwick',
    date: 'Feb 16, 2026',
    time: '8:00 PM',
    description: 'Playing on the street corner. Come by and watch :)',
    latitude: 41.7100,
    longitude: -71.5000,
  }
];

export default function MapScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [location, setLocation] = useState<Region | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async (): Promise<void> => {
    try {
      // Request permission to access location
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Please enable location permissions to use this feature.'
        );
        setLoading(false);
        return;
      }

      // Get current position
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const userCoords: Region = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };

      setLocation(userCoords);
      setLoading(false);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your location');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unable to get location</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={location}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        customMapStyle={retroMapStyle}
      >
        {/* User's current location marker */}
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title="You are here"
          description="Your current location"
        >
          <View style={[styles.customMarker, { backgroundColor: '#51B0A5' }]}>
            <Text style={styles.markerEmoji}>📍</Text>
          </View>
        </Marker>

        {/* Event markers */}
        {MOCK_EVENTS.map((event, index) => {
          // Cycle through our retro colors for markers
          const markerColors = ['#E98E58', '#AC515F', '#6E1352', '#B9D3C2'];
          const markerColor = markerColors[index % markerColors.length];
          
          return (
            <Marker
              key={event.id}
              coordinate={{
                latitude: event.latitude,
                longitude: event.longitude,
              }}
              onPress={() => {
                setSelectedEvent(event);
                setModalVisible(true);
              }}
            >
              <View style={styles.eventMarkerContainer}>
                {/* Title box */}
                <View style={[styles.eventTitleBox, { backgroundColor: colors.background }]}>
                  <Text style={[styles.eventTitleText, { color: colors.text }]} numberOfLines={1}>
                    {event.title}
                  </Text>
                </View>
                {/* Arrow marker */}
                <View style={[styles.eventMarker, { backgroundColor: markerColor }]}>
                  <Text style={styles.arrowEmoji}>↓</Text>
                </View>
              </View>
            </Marker>
          );
        })}
      </MapView>

      <View style={[styles.infoBox, { backgroundColor: colors.background }]}>
        <Text style={[styles.infoText, { color: colors.text }]}>
          📍 {MOCK_EVENTS.length} moments nearby
        </Text>
      </View>

      {/* Event Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedEvent && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>
                      {selectedEvent.title}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setModalVisible(false)}
                      style={styles.closeButton}
                    >
                      <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.categoryBadge, { backgroundColor: colors.accent }]}>
                    <Text style={styles.categoryText}>{selectedEvent.category}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: colors.text, opacity: 0.7 }]}>
                      Location
                    </Text>
                    <Text style={[styles.modalValue, { color: colors.text }]}>
                      {selectedEvent.location}
                    </Text>
                  </View>

                  <View style={styles.modalRow}>
                    <View style={[styles.modalSection, { flex: 1 }]}>
                      <Text style={[styles.modalLabel, { color: colors.text, opacity: 0.7 }]}>
                        Date
                      </Text>
                      <Text style={[styles.modalValue, { color: colors.text }]}>
                        {selectedEvent.date}
                      </Text>
                    </View>

                    <View style={[styles.modalSection, { flex: 1 }]}>
                      <Text style={[styles.modalLabel, { color: colors.text, opacity: 0.7 }]}>
                        Time
                      </Text>
                      <Text style={[styles.modalValue, { color: colors.text }]}>
                        {selectedEvent.time}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: colors.text, opacity: 0.7 }]}>
                      About
                    </Text>
                    <Text style={[styles.modalDescription, { color: colors.text }]}>
                      {selectedEvent.description}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.attendButton, { backgroundColor: colors.tint }]}
                    onPress={() => {
                      Alert.alert('Success', 'You\'re interested in this moment!');
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.attendButtonText}>I'm Interested</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
  },
  infoBox: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  customMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  markerText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  markerEmoji: {
    fontSize: 20,
  },
  eventMarkerContainer: {
    alignItems: 'center',
  },
  eventTitleBox: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 4,
    maxWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  eventTitleText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  eventMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  arrowEmoji: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    paddingRight: 16,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
  },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F0A08',
  },
  modalSection: {
    marginBottom: 20,
  },
  modalRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
  attendButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  attendButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFF',
  },
});

// Retro map styling
const retroMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#E8DED2" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#523735" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#F5F1E6" }]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#C9B2A6" }]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#D4C4B8" }]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#AE9E93" }]
  },
  {
    "featureType": "landscape.natural",
    "elementType": "geometry",
    "stylers": [{ "color": "#D9D0C7" }]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [{ "color": "#D4C9BF" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#93817C" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#B9D3C2" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#5A7A6C" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#F6F3E8" }]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [{ "color": "#EFE9DD" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#E5DDD0" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#C9B8A9" }]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [{ "color": "#DDD4C7" }]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#C0B0A3" }]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#7A6E68" }]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [{ "color": "#D1C5BA" }]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [{ "color": "#C9BDB2" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#51B0A5" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#3D7A71" }]
  }
];
