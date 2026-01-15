import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiService } from '../services/api';
import { Player } from '../types';
import { colors, spacing, borderRadius } from '../src/theme';

interface ResultsScreenProps {
  navigation: any;
  route: {
    params: {
      roomId: string;
      roomCode: string;
      userName: string;
    };
  };
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ navigation, route }) => {
  const { roomId } = route.params;
  const [teams, setTeams] = useState<Record<string, Player[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const response = await apiService.getTeams(roomId);
      setTeams(response.teams);
    } catch (error: any) {
      console.error('Error loading teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTeamScore = (players: Player[]): number => {
    return players.reduce((sum, p) => sum + p.fantasy_pts, 0);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading results...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const teamEntries = Object.entries(teams).sort(
    (a, b) => calculateTeamScore(b[1]) - calculateTeamScore(a[1])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Draft Complete</Text>
        <Text style={styles.subtitle}>Final Standings</Text>
      </View>

      <FlatList
        data={teamEntries}
        keyExtractor={([userName]) => userName}
        renderItem={({ item: [userName, players], index }) => {
          const score = calculateTeamScore(players);
          const isCurrentUser = userName === route.params.userName;

          return (
            <View style={[styles.teamSection, isCurrentUser && styles.myTeamSection]}>
              <View style={styles.teamHeader}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{index + 1}</Text>
                </View>
                <View style={styles.teamInfo}>
                  <Text style={styles.teamName}>
                    {userName} {isCurrentUser && '(You)'}
                  </Text>
                  <Text style={styles.teamPoints}>{score.toFixed(1)} Total Points</Text>
                </View>
              </View>

              <FlatList
                data={players}
                keyExtractor={(player) => player.id}
                renderItem={({ item: player }) => (
                  <View style={styles.rosterItem}>
                    <View style={styles.rosterPlayer}>
                      <Text style={styles.rosterPosition}>{player.position}</Text>
                      <Text style={styles.rosterName}>{player.name}</Text>
                    </View>
                    <Text style={styles.rosterPoints}>
                      {player.fantasy_pts.toFixed(1)} pts
                    </Text>
                  </View>
                )}
              />
            </View>
          );
        }}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.newDraftButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.newDraftButtonText}>New Draft</Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textMuted,
  },
  header: {
    padding: spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  teamsContainer: {
    flex: 1,
  },
  teamSection: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  myTeamSection: {
    backgroundColor: colors.cardBackground,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  rankText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  teamPoints: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  rosterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rosterPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rosterPosition: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondary,
    width: 30,
  },
  rosterName: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  rosterPoints: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  newDraftButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  newDraftButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
});
