import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../../context/auth';
import { Brain, Trophy, Timer, Star } from 'lucide-react-native';

export default function ActivitiesScreen() {
  const { user } = useAuth();
  const isPatient = user?.role === 'patient';

  const games = [
    {
      id: 1,
      title: 'Memory Match',
      description: 'Match pairs of cards to train your memory',
      icon: Brain,
      difficulty: 'Easy',
      duration: '5-10 min',
    },
    {
      id: 2,
      title: 'Word Puzzle',
      description: 'Find hidden words to enhance vocabulary',
      icon: Brain,
      difficulty: 'Medium',
      duration: '10-15 min',
    },
    {
      id: 3,
      title: 'Pattern Recognition',
      description: 'Identify and complete patterns',
      icon: Brain,
      difficulty: 'Hard',
      duration: '15-20 min',
    },
  ];

  const PatientActivities = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Brain Training Games</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Trophy color="#FFD700" size={24} />
            <Text style={styles.statValue}>1,250</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statItem}>
            <Timer color="#4A90E2" size={24} />
            <Text style={styles.statValue}>45</Text>
            <Text style={styles.statLabel}>Minutes Today</Text>
          </View>
          <View style={styles.statItem}>
            <Star color="#50C878" size={24} />
            <Text style={styles.statValue}>Level 5</Text>
            <Text style={styles.statLabel}>Current Level</Text>
          </View>
        </View>
      </View>

      <View style={styles.gamesContainer}>
        {games.map(game => (
          <TouchableOpacity key={game.id} style={styles.gameCard}>
            <game.icon color="#4A90E2" size={32} />
            <View style={styles.gameInfo}>
              <Text style={styles.gameTitle}>{game.title}</Text>
              <Text style={styles.gameDescription}>{game.description}</Text>
              <View style={styles.gameMetaContainer}>
                <Text style={styles.gameMeta}>{game.difficulty}</Text>
                <Text style={styles.gameMeta}>{game.duration}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const CaretakerActivities = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity Management</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Patient Progress</Text>
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>John's Activity Summary</Text>
            <Text style={styles.progressDate}>Last 7 Days</Text>
          </View>
          <View style={styles.progressStats}>
            <View style={styles.progressItem}>
              <Text style={styles.progressValue}>12</Text>
              <Text style={styles.progressLabel}>Games Completed</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressValue}>3.5h</Text>
              <Text style={styles.progressLabel}>Total Time</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressValue}>85%</Text>
              <Text style={styles.progressLabel}>Accuracy</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Manage Games</Text>
        {games.map(game => (
          <View key={game.id} style={styles.managementCard}>
            <game.icon color="#4A90E2" size={24} />
            <View style={styles.managementInfo}>
              <Text style={styles.managementTitle}>{game.title}</Text>
              <Text style={styles.managementDescription}>{game.description}</Text>
            </View>
            <TouchableOpacity style={styles.managementButton}>
              <Text style={styles.managementButtonText}>Configure</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return isPatient ? <PatientActivities /> : <CaretakerActivities />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  gamesContainer: {
    padding: 20,
  },
  gameCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  gameInfo: {
    marginLeft: 15,
    flex: 1,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  gameDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  gameMetaContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  gameMeta: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressHeader: {
    marginBottom: 15,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  progressDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressItem: {
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  managementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  managementInfo: {
    flex: 1,
    marginLeft: 15,
  },
  managementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  managementDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  managementButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  managementButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});