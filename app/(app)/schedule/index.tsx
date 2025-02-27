import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/auth';
import { Clock } from 'lucide-react-native';

type ScheduleItem = {
  id: number;
  time: string;
  title: string;
  type: string;
  completed: boolean;
};

export default function ScheduleScreen() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    setSchedule([
      { id: 1, time: '08:00 AM', title: 'Morning Medication', type: 'medication', completed: false },
      { id: 2, time: '09:30 AM', title: 'Memory Game Session', type: 'activity', completed: false },
      { id: 3, time: '10:30 AM', title: 'Morning Walk', type: 'exercise', completed: false },
      { id: 4, time: '12:00 PM', title: 'Lunch Time', type: 'meal', completed: false },
      { id: 5, time: '02:00 PM', title: 'Afternoon Medication', type: 'medication', completed: false },
    ]);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    schedule.forEach((item) => {
      const itemTime = new Date();
      const match = item.time.match(/(\d+):(\d+)\s(AM|PM)/);
      if (match) {
        let [_, hour, minute, period] = match;
        let hours = parseInt(hour, 10);
        const minutes = parseInt(minute, 10);
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        itemTime.setHours(hours, minutes, 0);
      }
      
      if (
        itemTime.getHours() === currentTime.getHours() &&
        itemTime.getMinutes() === currentTime.getMinutes()
      ) {
        Alert.alert('Reminder', `It's time for: ${item.title}`);
      }
    });
  }, [currentTime, schedule]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Today's Schedule</Text>
        <Text style={styles.headerDate}>{currentTime.toLocaleString()}</Text>
      </View>
      <View style={styles.timeline}>
        {schedule.map((item) => (
          <View key={item.id} style={styles.timelineItem}>
            <View style={styles.timeColumn}>
              <Text style={styles.timeText}>{item.time}</Text>
              <View style={styles.timelineConnector} />
            </View>
            <View style={[styles.eventCard, item.completed && styles.eventCompleted]}>
              <Text style={styles.eventTitle}>{item.title}</Text>
              <View style={styles.eventMeta}>
                <Clock size={16} color="#666" />
                <Text style={styles.eventDuration}>30 mins</Text>
              </View>
              {!item.completed && (
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={() =>
                    setSchedule((prev) =>
                      prev.map((s) =>
                        s.id === item.id ? { ...s, completed: true } : s
                      )
                    )
                  }
                >
                  <Text style={styles.completeButtonText}>Mark Complete</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  timeline: {
    padding: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timeColumn: {
    width: 80,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  timelineConnector: {
    width: 2,
    height: '100%',
    backgroundColor: '#ddd',
    marginTop: 10,
  },
  eventCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginLeft: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  eventDuration: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  eventCompleted: {
    backgroundColor: '#d3f9d8',
    opacity: 0.8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  completeButton: {
    backgroundColor: '#4A90E2',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});