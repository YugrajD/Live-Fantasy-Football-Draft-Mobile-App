import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiService } from '../services/api';
import { useDraftState } from '../hooks/useDraftState';
import { colors, spacing, borderRadius } from '../src/theme';

interface LobbyScreenProps {
  navigation: any;
  route: {
    params: {
      roomId: string;
      roomCode: string;
      userName: string;
      isHost: boolean;
    };
  };
}

const ParticipantCard = ({ participant, isCurrentUser }: { participant: any; isCurrentUser: boolean }) => (
  <View style={[
    styles.participantCard,
    isCurrentUser && { borderColor: colors.primary }
  ]}>
    <View>
      <Text style={styles.participantName}>
        {participant.user_name}
        {isCurrentUser && ' (You)'}
      </Text>
      <View style={styles.participantMeta}>
        {participant.is_host && (
          <Text style={styles.hostLabel}>Host · </Text>
        )}
        <Text style={styles.draftPosition}>
          Pick #{participant.draft_position}
        </Text>
      </View>
    </View>
    <View style={styles.positionBadge}>
      <Text style={styles.positionText}>#{participant.draft_position}</Text>
    </View>
  </View>
);

export const LobbyScreen: React.FC<LobbyScreenProps> = ({ navigation, route }) => {
  const { roomId, roomCode, userName, isHost } = route.params;
  const [loading, setLoading] = useState(false);
  const [room, setRoom] = useState<any>(null);

  const { room: wsRoom, isConnected } = useDraftState({
    roomId,
    userName,
  });

  useEffect(() => {
    loadRoom();
  }, []);

  useEffect(() => {
    if (wsRoom) {
      setRoom(wsRoom);
      
      // Navigate to draft when it starts
      if (wsRoom.status === 'drafting') {
        navigation.replace('Draft', {
          roomId,
          roomCode,
          userName,
        });
      }
    }
  }, [wsRoom]);

  const loadRoom = async () => {
    try {
      const roomData = await apiService.getRoom(roomId);
      setRoom(roomData);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load room');
    }
  };

  // Use WebSocket room if available, otherwise fall back to REST API room
  const displayRoom = wsRoom || room;

  const handleStartDraft = async () => {
    if (!isHost) {
      Alert.alert('Error', 'Only the host can start the draft');
      return;
    }

    setLoading(true);
    try {
      await apiService.startDraft(roomId);
      // Navigation will happen via WebSocket event
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start draft');
      setLoading(false);
    }
  };

  const participants = displayRoom?.participants || [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.roomName}>{displayRoom?.name || 'Loading...'}</Text>
        <View style={styles.roomCodeContainer}>
          <Text style={styles.roomCodeLabel}>Room Code</Text>
          <Text style={styles.roomCode}>{roomCode}</Text>
        </View>
        {!isConnected && (
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, styles.statusDisconnected]} />
            <Text style={styles.statusText}>Reconnecting...</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Participants ({participants.length})</Text>
        <FlatList
          data={participants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ParticipantCard
              participant={item}
              isCurrentUser={item.user_name === userName}
            />
          )}
        />
      </View>

      {isHost ? (
        <View style={styles.footer}>
          {participants.length < 2 ? (
            <Text style={styles.waitingText}>
              Waiting for more players (need at least 2)
            </Text>
          ) : (
            <TouchableOpacity
              style={[styles.startButton, loading && styles.startButtonDisabled]}
              onPress={handleStartDraft}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={styles.startButtonText}>Start Draft</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.footer}>
          <Text style={styles.waitingText}>Waiting for host to start</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  roomName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  roomCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  roomCodeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  roomCode: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  statusDisconnected: {
    backgroundColor: colors.error,
  },
  statusText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  section: {
    flex: 1,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  participantCard: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  participantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  hostLabel: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  draftPosition: {
    fontSize: 12,
    color: colors.textMuted,
  },
  positionBadge: {
    backgroundColor: colors.backgroundLight,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  positionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  startButtonDisabled: {
    backgroundColor: colors.inputBackground,
    opacity: 0.5,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
  waitingText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
