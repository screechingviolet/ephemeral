import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Alert, ActivityIndicator, Modal, TouchableOpacity, ScrollView, Image } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import TipButton from '@/components/TipButton';
import { DEMO_CONNECT_ACCOUNT_ID } from '@/constants/payments';
import { API_BASE_URL } from '@/constants/api';

interface Event {
  event_id: string;
  name: string;
  category: string;
  location?: string;
  start_time: number;
  end_time?: number;
  description: string;
  lat: number;
  lng: number;
  _distance_m?: number;
  recipient_id?: string | null;
  image_keys?: string[];
}

type MapScreenProps = {
  refreshSignal?: number;
  selectedEventId?: string;
};

export default function MapScreen({
  refreshSignal = 0,
  selectedEventId,
}: MapScreenProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [location, setLocation] = useState<Region | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [fetchingEvents, setFetchingEvents] = useState<boolean>(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState<boolean>(false);

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (location) {
      fetchNearbyEvents(location.latitude, location.longitude);
    }
  }, [location, refreshSignal]);

  useEffect(() => {
    if (!selectedEventId || events.length === 0) return;
    const match = events.find((event) => event.event_id === selectedEventId);
    if (match) {
      setSelectedEvent(match);
      setModalVisible(true);
    }
  }, [selectedEventId, events]);



  useEffect(() => {
    const loadImageUrl = async () => {
      if (!selectedEvent?.image_keys?.length) {
        setSelectedImageUrl(null);
        return;
      }

      const objectKey = selectedEvent.image_keys[0];
      if (!objectKey) {
        setSelectedImageUrl(null);
        return;
      }

      setImageLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/events/image-download-url?object_key=${encodeURIComponent(objectKey)}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch image URL');
        }
        const data = await response.json();
        setSelectedImageUrl(data.download_url || null);
      } catch (error) {
        console.error('Failed to load image URL:', error);
        setSelectedImageUrl(null);
      } finally {
        setImageLoading(false);
      }
    };

    loadImageUrl();
  }, [selectedEvent]);

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

  const fetchNearbyEvents = async (lat: number, lng: number): Promise<void> => {
    setFetchingEvents(true);
    try {
      // Fetch events within 10km radius
      const response = await fetch(
        `${API_BASE_URL}/events/nearby?lat=${lat}&lng=${lng}&radius_m=4500&limit=50&sort=distance`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data: Event[] = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      Alert.alert('Error', 'Failed to load nearby events');
    } finally {
      setFetchingEvents(false);
    }
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDistance = (meters?: number): string => {
    if (!meters) return '';
    if (meters < 1000) {
      return `${Math.round(meters)}m away`;
    }
    return `${(meters / 1000).toFixed(1)}km away`;
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
        {events.map((event, index) => {
          // Cycle through our retro colors for markers
          const markerColors = ['#E98E58', '#AC515F', '#6E1352', '#B9D3C2'];
          const markerColor = markerColors[index % markerColors.length];
          
          return (
            <Marker
              key={event.event_id}
              coordinate={{
                latitude: event.lat,
                longitude: event.lng,
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
                    {event.name}
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
          {fetchingEvents ? 'Loading...' : `${events.length} moments nearby`}
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
                {selectedEvent.name}
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
            {selectedEvent.image_keys?.length ? (
              <View style={styles.imageSection}>
                {imageLoading ? (
                  <ActivityIndicator size="small" color={colors.text} />
                ) : selectedImageUrl ? (
                  <Image source={{ uri: selectedImageUrl }} style={styles.eventImage} />
                ) : null}
              </View>
            ) : null}
            {selectedEvent._distance_m && (
              <View style={styles.modalSection}>
                <Text style={[styles.modalLabel, { color: colors.text, opacity: 0.7 }]}>
                  📍 Distance
                </Text>
                <Text style={[styles.modalValue, { color: colors.text }]}>
                  {formatDistance(selectedEvent._distance_m)}
                </Text>
              </View>
            )}
            <View style={styles.modalRow}>
              <View style={[styles.modalSection, { flex: 1 }]}>
                <Text style={[styles.modalLabel, { color: colors.text, opacity: 0.7 }]}>
                  Date
                </Text>
                <Text style={[styles.modalValue, { color: colors.text }]}>
                  {formatDate(selectedEvent.start_time)}
                </Text>
              </View>
              <View style={[styles.modalSection, { flex: 1 }]}>
                <Text style={[styles.modalLabel, { color: colors.text, opacity: 0.7 }]}>
                  Time
                </Text>
                <Text style={[styles.modalValue, { color: colors.text }]}>
                  {formatTime(selectedEvent.start_time)}
                  {selectedEvent.end_time && ` - ${formatTime(selectedEvent.end_time)}`}
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

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.remindButton, { backgroundColor: colors.tint }]}
                onPress={() => {
                  Alert.alert('Reminder Set', 'We\'ll remind you about this moment!');
                  setModalVisible(false);
                }}
              >
                <Text style={styles.actionButtonText}>🔔 Remind Me</Text>
              </TouchableOpacity>

              <TipButton
                recipientId={selectedEvent.recipient_id}
                label="💵"
                buttonStyle={[
                  styles.actionButton,
                  styles.tipButton,
                  { backgroundColor: colors.icon },
                ]}
                textStyle={[styles.actionButtonText, { color: '#0F0A08' }]}
              />
            </View>
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
  actionButtonsContainer: {
  flexDirection: 'row',
  gap: 12,
  marginTop: 8,
},
actionButton: {
  paddingVertical: 16,
  borderRadius: 12,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
},
remindButton: {
  flex: 1,
},
tipButton: {
  width: 60,
  justifyContent: 'center',
},
actionButtonText: {
  fontSize: 17,
  fontWeight: '600',
  color: '#FFF',
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
  imageSection: {
    marginTop: 12,
    marginBottom: 12,
  },
  eventImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    marginTop: 8,
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
