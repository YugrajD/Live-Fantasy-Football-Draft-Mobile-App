import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiService } from '../services/api';
import { colors, spacing, borderRadius } from '../src/theme';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [roomCode, setRoomCode] = useState('');
  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateRoom = async () => {
    if (!roomName.trim() || !userName.trim()) {
      Alert.alert('Error', 'Please enter room name and display name');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.createRoom({
        name: roomName,
        host_name: userName,
        turn_time_sec: 30,
        total_rounds: 3,
      });

      navigation.navigate('Lobby', {
        roomId: response.room_id,
        roomCode: response.code,
        userName: userName,
        isHost: true,
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim() || !userName.trim()) {
      Alert.alert('Error', 'Please enter room code and display name');
      return;
    }

    setLoading(true);
    try {
      const { room_id } = await apiService.getRoomByCode(roomCode.toUpperCase());
      await apiService.joinRoom(room_id, { user_name: userName });

      navigation.navigate('Lobby', {
        roomId: room_id,
        roomCode: roomCode.toUpperCase(),
        userName: userName,
        isHost: false,
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Fantasy Draft</Text>

        <Text style={styles.label}>Display Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Your name"
          placeholderTextColor={colors.textMuted}
          value={userName}
          onChangeText={setUserName}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Create Room</Text>
        <TextInput
          style={styles.input}
          placeholder="Room name"
          placeholderTextColor={colors.textMuted}
          value={roomName}
          onChangeText={setRoomName}
        />
        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={handleCreateRoom}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.primaryButtonText}>Create Room</Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or join existing</Text>
          <View style={styles.dividerLine} />
        </View>

        <Text style={styles.label}>Room Code</Text>
        <TextInput
          style={styles.input}
          placeholder="ABCD"
          placeholderTextColor={colors.textMuted}
          value={roomCode}
          onChangeText={setRoomCode}
          autoCapitalize="characters"
          maxLength={4}
        />
        <TouchableOpacity
          style={[styles.secondaryButton, loading && styles.buttonDisabled]}
          onPress={handleJoinRoom}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={styles.secondaryButtonText}>Join Room</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xl,
    marginTop: spacing.xl,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textMuted,
    paddingHorizontal: spacing.md,
    fontSize: 12,
    textTransform: 'uppercase',
  },
});
