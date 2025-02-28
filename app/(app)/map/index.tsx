import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, TextInput, Modal, Alert, Platform } from 'react-native';
import { useAuth } from '../../context/auth';
import { Navigation, MapPin, User, Plus, X, Flag, MapPinOff } from 'lucide-react-native';
import { WalkingRoute } from '../../types/auth';

// Mock MapView component for web
const MockMapView = ({ children, style, initialRegion, onPress }: any) => (
  <View style={[style, { backgroundColor: '#e0e0e0' }]}>
    <Text style={{ textAlign: 'center', marginTop: 20 }}>
      Map View (Not available on web)
    </Text>
    <TouchableOpacity 
      style={{ padding: 10, backgroundColor: '#f0f0f0', margin: 20, borderRadius: 8 }}
      onPress={() => onPress?.({ nativeEvent: { coordinate: { latitude: 37.78825, longitude: -122.4324 } } })}
    >
      <Text style={{ textAlign: 'center' }}>Tap to simulate map press</Text>
    </TouchableOpacity>
    {children}
  </View>
);

// Mock Marker component for web
const MockMarker = ({ coordinate, title, children, draggable, onDragEnd }: any) => (
  <View style={{ display: 'none' }}>{children}</View>
);

// Mock Polyline component for web
const MockPolyline = ({ coordinates, strokeColor, strokeWidth }: any) => (
  <View style={{ display: 'none' }} />
);

// Use actual components or mocks based on platform
const MapViewComponent = Platform.OS === 'web' ? MockMapView : require('react-native-maps').default;
const MarkerComponent = Platform.OS === 'web' ? MockMarker : require('react-native-maps').Marker;
const PolylineComponent = Platform.OS === 'web' ? MockPolyline : require('react-native-maps').Polyline;

export default function MapScreen() {
  const { user, getWalkingRoutes, addWalkingRoute, getPatientDetails } = useAuth();
  const isPatient = user?.role === 'patient';
  const [selectedRoute, setSelectedRoute] = useState<WalkingRoute | null>(null);
  const [routes, setRoutes] = useState<WalkingRoute[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [connectedPatients, setConnectedPatients] = useState<any[]>([]);
  
  // Route creation state
  const [routeName, setRouteName] = useState('');
  const [isCreatingRoute, setIsCreatingRoute] = useState(false);
  const [routePoints, setRoutePoints] = useState<{latitude: number, longitude: number}[]>([]);
  const [startPoint, setStartPoint] = useState<{latitude: number, longitude: number} | null>(null);
  const [endPoint, setEndPoint] = useState<{latitude: number, longitude: number} | null>(null);
  const [routeCreationStep, setRouteCreationStep] = useState<'start' | 'end' | 'complete'>('start');

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

  useEffect(() => {
    // Get connected patients if caretaker
    if (user?.role === 'caretaker' && user.connectedPatients) {
      const patients = user.connectedPatients.map(id => getPatientDetails(id)).filter(Boolean);
      setConnectedPatients(patients);
      if (patients.length > 0 && !selectedPatientId) {
        setSelectedPatientId(patients[0].id);
      }
    }

    // Get routes for the appropriate user
    const patientId = isPatient ? user?.id : selectedPatientId;
    if (patientId) {
      const patientRoutes = getWalkingRoutes(patientId);
      setRoutes(patientRoutes);
      if (patientRoutes.length > 0 && !selectedRoute) {
        setSelectedRoute(patientRoutes[0]);
      }
    }
  }, [user, selectedPatientId]);

  const handleMapPress = (event: any) => {
    if (!isCreatingRoute) return;
    
    const { coordinate } = event.nativeEvent;
    
    if (routeCreationStep === 'start') {
      setStartPoint(coordinate);
      setRouteCreationStep('end');
    } else if (routeCreationStep === 'end') {
      setEndPoint(coordinate);
      
      // Generate route points between start and end
      if (startPoint) {
        const newRoutePoints = generateRoutePoints(startPoint, coordinate);
        setRoutePoints(newRoutePoints);
      }
      
      setRouteCreationStep('complete');
      setModalVisible(true);
    }
  };

  // Generate route points between start and end (simplified for demo)
  const generateRoutePoints = (start: {latitude: number, longitude: number}, end: {latitude: number, longitude: number}) => {
    // For a real app, you would use a routing API to get actual walking directions
    // This is a simplified version that creates a few points between start and end
    const points = [start];
    
    // Add some intermediate points (simplified)
    const steps = 3; // Number of intermediate points
    for (let i = 1; i <= steps; i++) {
      const fraction = i / (steps + 1);
      points.push({
        latitude: start.latitude + (end.latitude - start.latitude) * fraction,
        longitude: start.longitude + (end.longitude - start.longitude) * fraction
      });
    }
    
    points.push(end);
    return points;
  };

  const handleAddRoute = async () => {
    if (!routeName.trim()) {
      Alert.alert('Error', 'Please enter a route name');
      return;
    }

    try {
      const patientId = isPatient ? user?.id : selectedPatientId;
      if (!patientId) {
        Alert.alert('Error', 'No patient selected');
        return;
      }

      // Create a route with the selected points
      const newRoute: Omit<WalkingRoute, 'id'> = {
        name: routeName,
        coordinates: routePoints,
        patientId,
      };

      await addWalkingRoute(newRoute);

      // Refresh routes
      const updatedRoutes = getWalkingRoutes(patientId);
      setRoutes(updatedRoutes);
      
      // Reset form and creation state
      resetRouteCreation();
    } catch (error) {
      Alert.alert('Error', 'Failed to add route');
    }
  };

  const resetRouteCreation = () => {
    setRouteName('');
    setIsCreatingRoute(false);
    setRoutePoints([]);
    setStartPoint(null);
    setEndPoint(null);
    setRouteCreationStep('start');
    setModalVisible(false);
  };

  const handlePatientChange = (patientId: string) => {
    setSelectedPatientId(patientId);
    const patientRoutes = getWalkingRoutes(patientId);
    setRoutes(patientRoutes);
    if (patientRoutes.length > 0) {
      setSelectedRoute(patientRoutes[0]);
    } else {
      setSelectedRoute(null);
    }
  };

  const startRouteCreation = () => {
    setIsCreatingRoute(true);
    setRouteCreationStep('start');
    Alert.alert(
      'Create Route',
      'Tap on the map to set the starting point of the route',
      [{ text: 'OK' }]
    );
  };

  const cancelRouteCreation = () => {
    resetRouteCreation();
  };

  const PatientMap = () => (
    <View style={styles.container}>
      <MapViewComponent
        style={styles.map}
        initialRegion={{
          ...patientLocation,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <MarkerComponent
          coordinate={patientLocation}
          title="You are here"
        >
          <User color="#4A90E2" size={24} />
        </MarkerComponent>

        {selectedRoute && (
          <PolylineComponent
            coordinates={selectedRoute.coordinates}
            strokeColor="#4A90E2"
            strokeWidth={3}
          />
        )}
      </MapViewComponent>

      <View style={styles.routePanel}>
        <Text style={styles.panelTitle}>Available Routes</Text>
        {routes.length > 0 ? (
          routes.map(route => (
            <TouchableOpacity
              key={route.id}
              style={[
                styles.routeItem,
                selectedRoute?.id === route.id && styles.routeItemActive
              ]}
              onPress={() => setSelectedRoute(route)}
            >
              <Navigation color={selectedRoute?.id === route.id ? "#fff" : "#4A90E2"} size={20} />
              <Text style={[
                styles.routeName,
                selectedRoute?.id === route.id && styles.routeNameActive
              ]}>
                {route.name}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No routes available</Text>
        )}
      </View>
    </View>
  );

  const CaretakerMap = () => (
    <View style={styles.container}>
      <MapViewComponent
        style={styles.map}
        initialRegion={{
          ...patientLocation,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onPress={handleMapPress}
      >
        <MarkerComponent
          coordinate={patientLocation}
          title="Patient Location"
        >
          <User color="#4A90E2" size={24} />
        </MarkerComponent>

        {/* Display existing routes */}
        {routes.map(route => (
          <PolylineComponent
            key={route.id}
            coordinates={route.coordinates}
            strokeColor={selectedRoute?.id === route.id ? "#4A90E2" : "#50C878"}
            strokeWidth={selectedRoute?.id === route.id ? 5 : 3}
          />
        ))}

        {/* Display route being created */}
        {startPoint && (
          <MarkerComponent
            coordinate={startPoint}
            title="Start Point"
            draggable
            onDragEnd={(e) => setStartPoint(e.nativeEvent.coordinate)}
          >
            <Flag color="#4A90E2" size={24} />
          </MarkerComponent>
        )}

        {endPoint && (
          <MarkerComponent
            coordinate={endPoint}
            title="End Point"
            draggable
            onDragEnd={(e) => setEndPoint(e.nativeEvent.coordinate)}
          >
            <MapPinOff color="#FF6B6B" size={24} />
          </MarkerComponent>
        )}

        {routePoints.length > 0 && (
          <PolylineComponent
            coordinates={routePoints}
            strokeColor="#FF6B6B"
            strokeWidth={4}
          />
        )}
      </MapViewComponent>

      <View style={styles.controlPanel}>
        <View style={styles.controlHeader}>
          <Text style={styles.panelTitle}>Route Management</Text>
          {!isCreatingRoute ? (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={startRouteCreation}
            >
              <Plus color="#fff" size={20} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={cancelRouteCreation}
            >
              <X color="#fff" size={20} />
            </TouchableOpacity>
          )}
        </View>

        {isCreatingRoute && (
          <View style={styles.creationStatus}>
            <Text style={styles.creationText}>
              {routeCreationStep === 'start' && 'Tap on the map to set the starting point'}
              {routeCreationStep === 'end' && 'Now tap to set the ending point'}
              {routeCreationStep === 'complete' && 'Route created! Add details to save.'}
            </Text>
          </View>
        )}

        {connectedPatients.length > 0 && !isCreatingRoute && (
          <View style={styles.patientSelector}>
            <Text style={styles.selectorLabel}>Select Patient:</Text>
            <View style={styles.patientButtons}>
              {connectedPatients.map(patient => (
                <TouchableOpacity
                  key={patient.id}
                  style={[
                    styles.patientButton,
                    selectedPatientId === patient.id && styles.patientButtonActive
                  ]}
                  onPress={() => handlePatientChange(patient.id)}
                >
                  <Text 
                    style={[
                      styles.patientButtonText,
                      selectedPatientId === patient.id && styles.patientButtonTextActive
                    ]}
                  >
                    {patient.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {!isCreatingRoute && (
          <>
            <Text style={styles.routesLabel}>Available Routes:</Text>
            {routes.length > 0 ? (
              routes.map(route => (
                <TouchableOpacity
                  key={route.id}
                  style={[
                    styles.routeItem,
                    selectedRoute?.id === route.id && styles.routeItemActive
                  ]}
                  onPress={() => setSelectedRoute(route)}
                >
                  <Navigation color={selectedRoute?.id === route.id ? "#fff" : "#4A90E2"} size={20} />
                  <Text style={[
                    styles.routeName,
                    selectedRoute?.id === route.id && styles.routeNameActive
                  ]}>
                    {route.name}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No routes available</Text>
            )}
          </>
        )}
      </View>
    </View>
  );

  return (
    isPatient ? <PatientMap /> : 
    
    <>
      <CaretakerMap />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Save Walking Route</Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <X color="#666" size={24} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Route Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Morning Park Walk"
                value={routeName}
                onChangeText={setRouteName}
              />
            </View>
            
            <View style={styles.routePreview}>
              <Text style={styles.previewLabel}>Route Preview:</Text>
              <View style={styles.previewDetails}>
                <View style={styles.previewItem}>
                  <Flag color="#4A90E2" size={16} />
                  <Text style={styles.previewText}>Start: Selected</Text>
                </View>
                <View style={styles.previewItem}>
                  <MapPinOff color="#FF6B6B" size={16} />
                  <Text style={styles.previewText}>End: Selected</Text>
                </View>
                <View style={styles.previewItem}>
                  <Navigation color="#50C878" size={16} />
                  <Text style={styles.previewText}>Distance: ~0.5 miles</Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleAddRoute}
            >
              <Text style={styles.submitButtonText}>Save Route</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
    </>
  
  );
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
  controlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
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
  routeItemActive: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    borderBottomWidth: 0,
  },
  routeName: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  routeNameActive: {
    color: '#fff',
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
  addButton: {
    backgroundColor: '#4A90E2',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FF6B6B',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientSelector: {
    marginBottom: 15,
  },
  selectorLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  patientButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  patientButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  patientButtonActive: {
    backgroundColor: '#4A90E2',
  },
  patientButtonText: {
    color: '#666',
    fontSize: 14,
  },
  patientButtonTextActive: {
    color: '#fff',
  },
  routesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  routePreview: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  previewDetails: {
    marginTop: 5,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  creationStatus: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  creationText: {
    fontSize: 14,
    color: '#333',
  },
});