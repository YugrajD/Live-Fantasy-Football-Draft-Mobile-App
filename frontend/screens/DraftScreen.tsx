import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDraftState } from '../hooks/useDraftState';
import { PlayerCard } from '../components/PlayerCard';
import { Timer } from '../components/Timer';
import { TurnIndicator } from '../components/TurnIndicator';
import { colors, spacing, borderRadius } from '../src/theme';

interface DraftScreenProps {
  navigation: any;
  route: {
    params: {
      roomId: string;
      roomCode: string;
      userName: string;
    };
  };
}

export const DraftScreen: React.FC<DraftScreenProps> = ({ navigation, route }) => {
  const { roomId, userName } = route.params;
  const {
    room,
    picks,
    availablePlayers,
    myTeam,
    currentTurn,
    timerSeconds,
    isMyTurn,
    makePick,
  } = useDraftState({
    roomId,
    userName,
  });

  const totalPicks = room ? room.total_rounds * (room.participants?.length || 1) : 0;
  const currentPick = room?.current_pick || 0;
  const roundNumber = Math.floor(currentPick / (room?.participants?.length || 1)) + 1;

  const handlePlayerSelect = (playerId: string) => {
    if (!isMyTurn) {
      Alert.alert('Not Your Turn', 'Wait for your turn to make a pick');
      return;
    }

    Alert.alert(
      'Confirm Pick',
      'Are you sure you want to draft this player?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Draft',
          onPress: () => makePick(playerId),
        },
      ]
    );
  };

  const recentPicks = useMemo(() => {
    return picks.slice(-5).reverse();
  }, [picks]);

  if (room?.status === 'completed') {
    navigation.replace('Results', {
      roomId,
      roomCode: route.params.roomCode,
      userName,
    });
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.turnBar}>
        <View style={styles.turnInfo}>
          <Text style={styles.turnLabel}>Current Turn</Text>
          <Text style={[styles.turnName, isMyTurn && styles.yourTurn]}>
            {currentTurn || 'Waiting...'}
          </Text>
        </View>
        {isMyTurn && timerSeconds !== null && (
          <View style={styles.timerContainer}>
            <Timer seconds={timerSeconds} />
          </View>
        )}
        <View style={styles.pickInfo}>
          <Text style={styles.pickNumber}>Pick #{currentPick + 1}</Text>
          <Text style={styles.roundNumber}>Round {roundNumber}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.mainSection}>
          <Text style={styles.sectionTitle}>Available Players</Text>
          <FlatList
            data={availablePlayers}
            keyExtractor={(item) => item.id}
            numColumns={2}
            renderItem={({ item }) => (
              <PlayerCard
                player={item}
                onSelect={handlePlayerSelect}
                disabled={!isMyTurn}
              />
            )}
            style={styles.playerGrid}
          />
        </View>

        <View style={styles.sidebar}>
          <View style={styles.teamSection}>
            <Text style={styles.sectionTitle}>My Team ({myTeam.length})</Text>
            <FlatList
              data={myTeam}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.teamPlayer}>
                  <Text style={styles.teamPlayerName}>{item.name}</Text>
                  <Text style={styles.teamPlayerInfo}>
                    {item.position} • {item.team}
                  </Text>
                </View>
              )}
            />
          </View>

          <View style={styles.pickFeedSection}>
            <Text style={styles.sectionTitle}>Recent Picks</Text>
            <FlatList
              data={recentPicks}
              keyExtractor={(item, index) => `${item.pick_number}-${index}`}
              renderItem={({ item }) => (
                <View style={styles.pickItem}>
                  <Text style={styles.pickItemNumber}>#{item.pick_number}</Text>
                  <View style={styles.pickItemContent}>
                    <Text style={styles.pickItemPlayer}>{item.player.name}</Text>
                    <Text style={styles.pickItemUser}>{item.user_name}</Text>
                  </View>
                </View>
              )}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  turnBar: {
    backgroundColor: colors.cardBackground,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  turnInfo: {
    flex: 1,
  },
  turnLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  turnName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  yourTurn: {
    color: colors.primary,
  },
  timerContainer: {
    alignItems: 'center',
    marginHorizontal: spacing.md,
  },
  pickInfo: {
    alignItems: 'flex-end',
  },
  pickNumber: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  roundNumber: {
    fontSize: 12,
    color: colors.textMuted,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  mainSection: {
    flex: 2,
    padding: spacing.sm,
  },
  sidebar: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    padding: spacing.sm,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  playerGrid: {
    flex: 1,
  },
  teamSection: {
    flex: 1,
    marginBottom: spacing.md,
  },
  teamPlayer: {
    padding: spacing.sm,
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  teamPlayerName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  teamPlayerInfo: {
    fontSize: 12,
    color: colors.textMuted,
  },
  pickFeedSection: {
    flex: 1,
  },
  pickItem: {
    flexDirection: 'row',
    padding: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickItemNumber: {
    width: 30,
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  pickItemContent: {
    flex: 1,
  },
  pickItemPlayer: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  pickItemUser: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
