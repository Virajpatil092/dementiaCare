import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, SafeAreaView } from 'react-native';
import { useAuth } from '../../context/auth';
import { Bell, Brain, MapPin, Calendar, CircleAlert as AlertCircle } from 'lucide-react-native';

export default function HomeScreen() {
  const { user } = useAuth();
  const isPatient = user?.role === 'patient';

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

        <View style={[styles.section, styles.lastSection]}>
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
          <View style={styles.patientGrid}>
            <View style={styles.patientCard}>
              <Text style={styles.patientName}>John Patient</Text>
              <Text style={styles.patientStatus}>Status: Active</Text>
              <TouchableOpacity style={styles.viewDetailsButton}>
                <Text style={styles.viewDetailsText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
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
      </SafeAreaView>
    </ScrollView>
  );

  return isPatient ? <PatientDashboard /> : <CaretakerDashboard />;
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
});