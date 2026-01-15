import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDraftState } from '../hooks/useDraftState';
import { Timer } from '../components/Timer';
import { colors, spacing, borderRadius } from '../src/theme';
import { Player } from '../types';

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


const PlayerRow: React.FC<{
  player: Player;
  onSelect: (playerId: string) => void;
  disabled: boolean;
}> = ({ player, onSelect, disabled }) => {
  return (
    <TouchableOpacity
      style={[styles.playerRow, disabled && styles.playerRowDisabled]}
      onPress={() => onSelect(player.id)}
      disabled={disabled}
    >
      <View style={styles.playerRowLeft}>
        <Text style={styles.playerPosition}>{player.position}</Text>
        <View>
          <Text style={styles.playerName}>{player.name}</Text>
          <Text style={styles.playerTeam}>{player.team}</Text>
        </View>
      </View>
      <View style={styles.playerRowRight}>
        <Text style={styles.playerFpts}>{player.fantasy_pts}</Text>
        <Text style={styles.playerFptsLabel}>FPTS</Text>
      </View>
    </TouchableOpacity>
  );
};

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

  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const totalPicks = room ? room.total_rounds * (room.participants?.length || 1) : 0;
  // Use picks length to determine current pick number if room.current_pick isn't updating
  const currentPick = picks.length > 0 ? picks.length : (room?.current_pick || 0);
  const numParticipants = room?.participants?.length || 1;
  const roundNumber = Math.floor(currentPick / numParticipants) + 1;

  const filteredPlayers = useMemo(() => {
    return availablePlayers.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [availablePlayers, search]);

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
        <View style={[styles.mainSection, drawerOpen && styles.mainSectionNarrow]}>
          <Text style={styles.sectionTitle}>Available Players</Text>
          
          {/* Search Bar */}
          <TextInput
            style={styles.searchInput}
            placeholder="Search players..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />

          {/* Player List */}
          <FlatList
            data={filteredPlayers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PlayerRow
                player={item}
                onSelect={handlePlayerSelect}
                disabled={!isMyTurn}
              />
            )}
            style={styles.playerList}
            contentContainerStyle={styles.playerListContent}
          />
        </View>

        {/* Drawer Toggle Button */}
        <TouchableOpacity
          style={styles.drawerToggle}
          onPress={() => setDrawerOpen(!drawerOpen)}
        >
          <Text style={styles.drawerToggleText}>{drawerOpen ? '›' : '‹'}</Text>
        </TouchableOpacity>

        {/* Drawer */}
        {drawerOpen && (
          <View style={styles.drawer}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>My Team & Picks</Text>
            </View>

            <View style={styles.drawerSection}>
              <Text style={styles.drawerSectionTitle}>MY TEAM ({myTeam.length})</Text>
              <FlatList
                data={myTeam}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.drawerItem}>
                    <Text style={styles.drawerItemName}>{item.name}</Text>
                    <Text style={styles.drawerItemMeta}>
                      {item.position} · {item.team}
                    </Text>
                  </View>
                )}
                scrollEnabled={false}
              />
            </View>

            <View style={styles.drawerSection}>
              <Text style={styles.drawerSectionTitle}>RECENT PICKS</Text>
              <FlatList
                data={recentPicks}
                keyExtractor={(item, index) => `${item.pick_number}-${index}`}
                renderItem={({ item }) => (
                  <View style={styles.drawerItem}>
                    <Text style={styles.pickNumberBadge}>#{item.pick_number}</Text>
                    <View style={styles.drawerItemContent}>
                      <Text style={styles.drawerItemName}>{item.player.name}</Text>
                      <Text style={styles.drawerItemMeta}>{item.user_name}</Text>
                    </View>
                  </View>
                )}
                scrollEnabled={false}
              />
            </View>
          </View>
        )}
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
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
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
    flex: 1,
  },
  mainSectionNarrow: {
    flex: 0.6,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing.md,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchInput: {
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 15,
    marginHorizontal: spacing.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  playerList: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  playerListContent: {
    paddingBottom: spacing.md,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: 12,
    marginBottom: 8,
  },
  playerRowDisabled: {
    opacity: 0.4,
  },
  playerRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  playerPosition: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.secondary,
    backgroundColor: colors.inputBackground,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  playerTeam: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  playerRowRight: {
    alignItems: 'flex-end',
  },
  playerFpts: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  playerFptsLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  drawerToggle: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: [{ translateY: -30 }],
    backgroundColor: colors.cardBackground,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    borderTopLeftRadius: borderRadius.md,
    borderBottomLeftRadius: borderRadius.md,
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    zIndex: 10,
  },
  drawerToggleText: {
    color: colors.textSecondary,
    fontSize: 18,
    fontWeight: '600',
  },
  drawer: {
    width: '40%',
    backgroundColor: colors.backgroundLight,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    padding: spacing.md,
  },
  drawerHeader: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  drawerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  drawerSection: {
    marginBottom: spacing.lg,
  },
  drawerSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  drawerItemContent: {
    flex: 1,
  },
  drawerItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  drawerItemMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  pickNumberBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    width: 28,
  },
});
