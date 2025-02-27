import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useAuth } from '../../context/auth';
import { Navigation, MapPin, User } from 'lucide-react-native';

export default function MapScreen() {
  const { user } = useAuth();
  const isPatient = user?.role === 'patient';
  const [selectedRoute, setSelectedRoute] = useState(null);

  // Mock data for demonstration
  const patientLocation = {
    latitude: 37.78825,
    longitude: -122.4324,
  };

  const safeZone = {
    latitude: 37.78825,
    longitude: -122.4324,
    radius: 1000, // meters
  };

  const predefinedRoutes = [
    {
      id: 1,
      name: 'Morning Walk',
      coordinates: [
        { latitude: 37.78825, longitude: -122.4324 },
        { latitude: 37.78925, longitude: -122.4344 },
        { latitude: 37.79025, longitude: -122.4354 },
      ],
    },
    // Add more routes as needed
  ];

  const PatientMap = () => (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          ...patientLocation,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={patientLocation}
          title="You are here"
        >
          <User color="#4A90E2" size={24} />
        </Marker>

        {selectedRoute && (
          <Polyline
            coordinates={selectedRoute.coordinates}
            strokeColor="#4A90E2"
            strokeWidth={3}
          />
        )}
      </MapView>

      <View style={styles.routePanel}>
        <Text style={styles.panelTitle}>Available Routes</Text>
        {predefinedRoutes.map(route => (
          <TouchableOpacity
            key={route.id}
            style={styles.routeItem}
            onPress={() => setSelectedRoute(route)}
          >
            <Navigation color="#4A90E2" size={20} />
            <Text style={styles.routeName}>{route.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const CaretakerMap = () => (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          ...patientLocation,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={patientLocation}
          title="Patient Location"
        >
          <User color="#4A90E2" size={24} />
        </Marker>

        {predefinedRoutes.map(route => (
          <Polyline
            key={route.id}
            coordinates={route.coordinates}
            strokeColor="#50C878"
            strokeWidth={3}
          />
        ))}
      </MapView>

      <View style={styles.controlPanel}>
        <Text style={styles.panelTitle}>Patient Tracking</Text>
        <View style={styles.statusContainer}>
          <View style={styles.statusItem}>
            <MapPin color="#4A90E2" size={20} />
            <Text style={styles.statusText}>Within Safe Zone</Text>
          </View>
          <View style={styles.statusItem}>
            <Navigation color="#50C878" size={20} />
            <Text style={styles.statusText}>Following Route: Morning Walk</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return isPatient ? <PatientMap /> : <CaretakerMap />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  routePanel: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  controlPanel: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  routeName: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  statusContainer: {
    marginTop: 10,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
});