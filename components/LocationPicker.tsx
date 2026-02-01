import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface LocationPickerProps {
  onLocationSelect: (latitude: number, longitude: number, address?: string) => void;
  initialLatitude?: number;
  initialLongitude?: number;
}

export default function LocationPicker({
  onLocationSelect,
  initialLatitude,
  initialLongitude,
}: LocationPickerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [address, setAddress] = useState('');
  const [searching, setSearching] = useState(false);
  const [region, setRegion] = useState<Region>({
    latitude: initialLatitude || 41.8240,
    longitude: initialLongitude || -71.4128,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(
    initialLatitude && initialLongitude
      ? { latitude: initialLatitude, longitude: initialLongitude }
      : null
  );

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      if (!initialLatitude && !initialLongitude) {
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const searchAddress = async () => {
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter an address');
      return;
    }

    setSearching(true);
    try {
      const results = await Location.geocodeAsync(address);
      
      if (results.length > 0) {
        const { latitude, longitude } = results[0];
        
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        
        setSelectedLocation({ latitude, longitude });
        onLocationSelect(latitude, longitude, address);
        
        // Alert.alert('Success', 'Location found!');
      } else {
        Alert.alert('Not Found', 'Could not find this address. Try dropping a pin instead.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      Alert.alert('Error', 'Failed to search for address');
    } finally {
      setSearching(false);
    }
  };

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    
    setSelectedLocation({ latitude, longitude });
    onLocationSelect(latitude, longitude);

    // Try to get address from coordinates (reverse geocoding)
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (results.length > 0) {
        const result = results[0];
        const addressString = `${result.street || ''}, ${result.city || ''}, ${result.region || ''}`.trim();
        setAddress(addressString);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  const useCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location permissions');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;

      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      setSelectedLocation({ latitude, longitude });
      onLocationSelect(latitude, longitude);

      // Get address
      try {
        const results = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (results.length > 0) {
          const result = results[0];
          const addressString = `${result.street || ''}, ${result.city || ''}, ${result.region || ''}`.trim();
          setAddress(addressString);
        }
      } catch (error) {
        console.error('Reverse geocoding error:', error);
      }

      // Alert.alert('Success', 'Using your current location');
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Failed to get your location');
    }
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>Event Location *</ThemedText>

      {/* Address Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Enter address or drop a pin on map"
          placeholderTextColor={colorScheme === 'dark' ? colors.icon : '#8B6B5C'}
          value={address}
          onChangeText={setAddress}
          onSubmitEditing={searchAddress}
        />
        <TouchableOpacity
          style={[styles.searchButton, { backgroundColor: colors.tint }]}
          onPress={searchAddress}
          disabled={searching}
        >
          {searching ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <ThemedText style={styles.searchButtonText}>Search</ThemedText>
          )}
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <TouchableOpacity
        style={[styles.currentLocationButton, { borderColor: colors.icon }]}
        onPress={useCurrentLocation}
      >
        <ThemedText style={[styles.currentLocationText, { color: colors.tint }]}>
          📍 Use My Current Location
        </ThemedText>
      </TouchableOpacity>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={region}
          onPress={handleMapPress}
          customMapStyle={retroMapStyle}
        >
          {selectedLocation && (
            <Marker
              coordinate={selectedLocation}
              draggable
              onDragEnd={handleMapPress}
            >
              <View style={[styles.customMarker, { backgroundColor: colors.accent }]}>
                <ThemedText style={styles.markerText}>📍</ThemedText>
              </View>
            </Marker>
          )}
        </MapView>
        
        <View style={[styles.mapHint, { backgroundColor: colors.background }]}>
          <ThemedText style={[styles.mapHintText, { color: colors.text }]}>
            Tap anywhere on the map to drop a pin
          </ThemedText>
        </View>
      </View>

      {selectedLocation && (
        <View style={[styles.coordinatesBox, { backgroundColor: colors.background }]}>
          <ThemedText style={[styles.coordinatesLabel, { color: colors.text, opacity: 0.7 }]}>
            Selected Coordinates:
          </ThemedText>
          <ThemedText style={[styles.coordinatesText, { color: colors.text }]}>
            {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: typeof Colors.light | typeof Colors.dark) =>
  StyleSheet.create({
    container: {
      marginBottom: 24,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
      opacity: 0.9,
    },
    searchContainer: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 12,
    },
    input: {
      flex: 1,
      backgroundColor: colors.background === '#F6F3E8' ? '#FFFFFF' : '#1A1410',
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      borderWidth: 1,
      borderColor: colors.icon,
    },
    searchButton: {
      paddingHorizontal: 20,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: 80,
    },
    searchButtonText: {
      color: '#FFF',
      fontWeight: '600',
      fontSize: 15,
    },
    currentLocationButton: {
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: 'center',
      marginBottom: 16,
    },
    currentLocationText: {
      fontSize: 15,
      fontWeight: '600',
    },
    mapContainer: {
      height: 300,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.icon,
      position: 'relative',
    },
    map: {
      width: '100%',
      height: '100%',
    },
    mapHint: {
      position: 'absolute',
      bottom: 12,
      left: 12,
      right: 12,
      padding: 10,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 3,
    },
    mapHintText: {
      fontSize: 12,
      textAlign: 'center',
      opacity: 0.8,
    },
    customMarker: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 5,
    },
    markerText: {
      fontSize: 24,
    },
    coordinatesBox: {
      marginTop: 12,
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.icon,
    },
    coordinatesLabel: {
      fontSize: 12,
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    coordinatesText: {
      fontSize: 14,
      fontWeight: '500',
      fontFamily: 'monospace',
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
