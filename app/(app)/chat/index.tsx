import { Redirect } from 'expo-router';
import { useAuth } from '../../context/auth';
import { Text, View } from 'react-native';

export default function ChatScreen() {
  const { user } = useAuth();

  if (user?.role !== 'patient') {
    return <Redirect href="/home" />;  // Redirect non-patients to home
  }

  return (
    <View>
      <Text>Chat Screen</Text>
    </View>
  );
}
