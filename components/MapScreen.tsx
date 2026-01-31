import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';

interface Point {
  id: number;
  latitude: number;
  longitude: number;
  title: string;
  description: string;
}

export default function MapScreen() {
  const [location, setLocation] = useState<Region | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [points, setPoints] = useState<Point[]>([]);

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
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setLocation(userCoords);

      // Generate arbitrary points near the user
      const nearbyPoints = generatePointsNearLocation(
        userCoords.latitude,
        userCoords.longitude,
        10 // number of points to generate
      );

      setPoints(nearbyPoints);
      setLoading(false);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your location');
      setLoading(false);
    }
  };

  // Generate random points within a radius around the user's location
  const generatePointsNearLocation = (
    lat: number,
    lon: number,
    count: number,
    radiusInKm: number = 1
  ): Point[] => {
    const points: Point[] = [];
    
    for (let i = 0; i < count; i++) {
      // Generate random distance and angle
      const randomDistance = Math.random() * radiusInKm;
      const randomAngle = Math.random() * 2 * Math.PI;

      // Convert to lat/lon offset (rough approximation)
      // 1 degree latitude ≈ 111 km
      // 1 degree longitude ≈ 111 km * cos(latitude)
      const latOffset = (randomDistance / 111) * Math.cos(randomAngle);
      const lonOffset = (randomDistance / (111 * Math.cos(lat * Math.PI / 180))) * Math.sin(randomAngle);

      points.push({
        id: i,
        latitude: lat + latOffset,
        longitude: lon + lonOffset,
        title: `Point ${i + 1}`,
        description: `Random location ${i + 1}`,
      });
    }

    return points;
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
      >
        {/* User's current location marker */}
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title="You are here"
          description="Your current location"
          pinColor="blue"
        />

        {/* Arbitrary points near the user */}
        {points.map((point) => (
          <Marker
            key={point.id}
            coordinate={{
              latitude: point.latitude,
              longitude: point.longitude,
            }}
            title={point.title}
            description={point.description}
          />
        ))}
      </MapView>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>📍 {points.length} points nearby</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
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
});
