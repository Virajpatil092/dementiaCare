import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, SafeAreaView, Modal, TextInput, Alert } from 'react-native';
import { useAuth } from '../../context/auth';
import { Bell, Brain, MapPin, Calendar, CircleAlert as AlertCircle, Plus, X, Image as ImageIcon } from 'lucide-react-native';
import { FamilyPhoto } from '../../types/auth';

export default function HomeScreen() {
  const { user, getFamilyPhotos, addFamilyPhoto, getPatientDetails } = useAuth();
  const isPatient = user?.role === 'patient';
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [connectedPatients, setConnectedPatients] = useState<any[]>([]);
  const [familyPhotos, setFamilyPhotos] = useState<FamilyPhoto[]>([]);
  
  // Form state
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoDescription, setPhotoDescription] = useState('');

  useEffect(() => {
    // Get connected patients if caretaker
    if (user?.role === 'caretaker' && user.connectedPatients) {
      const patients = user.connectedPatients.map(id => getPatientDetails(id)).filter(Boolean);
      setConnectedPatients(patients);
      if (patients.length > 0 && !selectedPatientId) {
        setSelectedPatientId(patients[0].id);
      }
    }

    // Get photos for the appropriate user
    const patientId = isPatient ? user?.id : selectedPatientId;
    if (patientId) {
      const photos = getFamilyPhotos(patientId);
      setFamilyPhotos(photos);
    }
  }, [user, selectedPatientId]);

  const handleAddPhoto = async () => {
    if (!photoTitle.trim() || !photoUrl.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const patientId = isPatient ? user?.id : selectedPatientId;
      if (!patientId) {
        Alert.alert('Error', 'No patient selected');
        return;
      }

      await addFamilyPhoto({
        title: photoTitle,
        url: photoUrl,
        description: photoDescription,
        uploadedAt: new Date().toISOString(),
        patientId,
      });

      // Refresh photos
      const updatedPhotos = getFamilyPhotos(patientId);
      setFamilyPhotos(updatedPhotos);
      
      // Reset form
      setPhotoTitle('');
      setPhotoUrl('');
      setPhotoDescription('');
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to add photo');
    }
  };

  const handlePatientChange = (patientId: string) => {
    setSelectedPatientId(patientId);
    const photos = getFamilyPhotos(patientId);
    setFamilyPhotos(photos);
  };

  const PatientDashboard = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1551076805-e1869033e561' }}
            style={styles.profileImage}
          />
          <View style={styles.headerText}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{user?.name}</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.sosButton}>
            <AlertCircle color="#fff" size={32} />
            <Text style={styles.sosText}>SOS</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Activities</Text>
          <View style={styles.activityGrid}>
            <TouchableOpacity style={styles.activityCard}>
              <Brain color="#4A90E2" size={24} />
              <Text style={styles.activityText}>Brain Games</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.activityCard}>
              <MapPin color="#50C878" size={24} />
              <Text style={styles.activityText}>Daily Walk</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.activityCard}>
              <Bell color="#FFB347" size={24} />
              <Text style={styles.activityText}>Medications</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.activityCard}>
              <Calendar color="#FF69B4" size={24} />
              <Text style={styles.activityText}>Schedule</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Reminders</Text>
          <View style={styles.reminderList}>
            <View style={styles.reminderItem}>
              <Bell color="#4A90E2" size={20} />
              <Text style={styles.reminderText}>Take morning medication - 9:00 AM</Text>
            </View>
            <View style={styles.reminderItem}>
              <MapPin color="#50C878" size={20} />
              <Text style={styles.reminderText}>Morning walk - 10:00 AM</Text>
            </View>
            <View style={styles.reminderItem}>
              <Brain color="#FFB347" size={20} />
              <Text style={styles.reminderText}>Memory Game Session - 2:00 PM</Text>
            </View>
          </View>
        </View>

        {familyPhotos.length > 0 && (
          <View style={[styles.section, styles.lastSection]}>
            <Text style={styles.sectionTitle}>Family Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
              {familyPhotos.map(photo => (
                <View key={photo.id} style={styles.photoCard}>
                  <Image source={{ uri: photo.url }} style={styles.familyPhoto} />
                  <Text style={styles.photoTitle}>{photo.title}</Text>
                  {photo.description && (
                    <Text style={styles.photoDescription}>{photo.description}</Text>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </SafeAreaView>
    </ScrollView>
  );

  const CaretakerDashboard = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330' }}
            style={styles.profileImage}
          />
          <View style={styles.headerText}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{user?.name}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Overview</Text>
          {connectedPatients.length > 0 ? (
            <View style={styles.patientGrid}>
              {connectedPatients.map(patient => (
                <View key={patient.id} style={styles.patientCard}>
                  <Text style={styles.patientName}>{patient.name}</Text>
                  <Text style={styles.patientStatus}>Status: Active</Text>
                  <TouchableOpacity 
                    style={styles.viewDetailsButton}
                    onPress={() => setSelectedPatientId(patient.id)}
                  >
                    <Text style={styles.viewDetailsText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No patients connected</Text>
              <Text style={styles.emptyStateSubtext}>
                Connect to patients in the Profile tab
              </Text>
            </View>
          )}
        </View>

        {connectedPatients.length > 0 && (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Family Photos</Text>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => setModalVisible(true)}
                >
                  <Plus color="#fff" size={20} />
                </TouchableOpacity>
              </View>

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

              {familyPhotos.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
                  {familyPhotos.map(photo => (
                    <View key={photo.id} style={styles.photoCard}>
                      <Image source={{ uri: photo.url }} style={styles.familyPhoto} />
                      <Text style={styles.photoTitle}>{photo.title}</Text>
                      {photo.description && (
                        <Text style={styles.photoDescription}>{photo.description}</Text>
                      )}
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.emptyPhotos}>
                  <ImageIcon color="#666" size={40} />
                  <Text style={styles.emptyPhotosText}>No photos added yet</Text>
                  <Text style={styles.emptyPhotosSubtext}>
                    Add family photos to help your patient remember loved ones
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.activityGrid}>
                <TouchableOpacity style={styles.activityCard}>
                  <MapPin color="#4A90E2" size={24} />
                  <Text style={styles.activityText}>Track Location</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.activityCard}>
                  <Calendar color="#50C878" size={24} />
                  <Text style={styles.activityText}>Set Schedule</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.activityCard}>
                  <Bell color="#FFB347" size={24} />
                  <Text style={styles.activityText}>Set Reminders</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.activityCard}>
                  <Brain color="#FF69B4" size={24} />
                  <Text style={styles.activityText}>Assign Games</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.section, styles.lastSection]}>
              <Text style={styles.sectionTitle}>Recent Alerts</Text>
              <View style={styles.alertList}>
                <View style={[styles.alertItem, styles.alertHigh]}>
                  <AlertCircle color="#fff" size={20} />
                  <Text style={styles.alertText}>SOS Alert - 2 hours ago</Text>
                </View>
                <View style={[styles.alertItem, styles.alertMedium]}>
                  <Bell color="#fff" size={20} />
                  <Text style={styles.alertText}>Missed Medication - 4 hours ago</Text>
                </View>
                <View style={[styles.alertItem, styles.alertLow]}>
                  <MapPin color="#fff" size={20} />
                  <Text style={styles.alertText}>Left Safe Zone - Yesterday</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </SafeAreaView>
    </ScrollView>
  );

  return (
    isPatient ? <PatientDashboard /> : 
    <><CaretakerDashboard />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Family Photo</Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <X color="#666" size={24} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Family Reunion"
                value={photoTitle}
                onChangeText={setPhotoTitle}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Photo URL</Text>
              <TextInput
                style={styles.input}
                placeholder="https://example.com/photo.jpg"
                value={photoUrl}
                onChangeText={setPhotoUrl}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add details about this photo..."
                value={photoDescription}
                onChangeText={setPhotoDescription}
                multiline
                numberOfLines={3}
              />
            </View>
            
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleAddPhoto}
            >
              <Text style={styles.submitButtonText}>Add Photo</Text>
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
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flexGrow: 1,
  },
  safeArea: {
    flex: 1,
    paddingBottom: Platform.OS === 'ios' ? 85 : 65, // Match tab bar height
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  headerText: {
    marginLeft: 15,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  quickActions: {
    padding: 20,
  },
  sosButton: {
    backgroundColor: '#ff3b30',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  sosText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  lastSection: {
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  activityCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    margin: '1%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  activityText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  reminderList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  reminderText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  patientGrid: {
    marginTop: 10,
  },
  patientCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  patientStatus: {
    fontSize: 14,
    color: '#4A90E2',
    marginTop: 5,
  },
  viewDetailsButton: {
    backgroundColor: '#4A90E2',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  viewDetailsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  alertList: {
    marginTop: 10,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  alertHigh: {
    backgroundColor: '#ff3b30',
  },
  alertMedium: {
    backgroundColor: '#ff9500',
  },
  alertLow: {
    backgroundColor: '#4A90E2',
  },
  alertText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  photoScroll: {
    marginTop: 10,
  },
  photoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginRight: 15,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  familyPhoto: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  photoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  photoDescription: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  emptyPhotos: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyPhotosText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
  },
  emptyPhotosSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#4A90E2',
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
});