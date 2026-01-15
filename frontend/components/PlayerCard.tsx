import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Player } from '../types';
import { colors, spacing, borderRadius } from '../src/theme';

interface PlayerCardProps {
  player: Player;
  onSelect: (playerId: string) => void;
  disabled?: boolean;
  selected?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  onSelect,
  disabled = false,
  selected = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.playerCard,
        selected && styles.playerCardSelected,
        disabled && styles.playerCardDisabled,
      ]}
      onPress={() => onSelect(player.id)}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={styles.playerPosition}>{player.position}</Text>
      <Text style={styles.playerName}>{player.name}</Text>
      <Text style={styles.playerTeam}>{player.team}</Text>
      <View style={styles.playerStats}>
        {player.position === 'QB' && (
          <>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{player.pass_yds || 0}</Text>
              <Text style={styles.statLabel}>YDS</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{player.pass_td || 0}</Text>
              <Text style={styles.statLabel}>TD</Text>
            </View>
          </>
        )}
        {(player.position === 'RB') && (
          <>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{player.rush_yds || 0}</Text>
              <Text style={styles.statLabel}>YDS</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{player.rush_td || 0}</Text>
              <Text style={styles.statLabel}>TD</Text>
            </View>
          </>
        )}
        {(player.position === 'WR' || player.position === 'TE') && (
          <>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{player.rec_yds || 0}</Text>
              <Text style={styles.statLabel}>YDS</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{player.rec_td || 0}</Text>
              <Text style={styles.statLabel}>TD</Text>
            </View>
          </>
        )}
        {player.position === 'K' && (
          <>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{player.fg_made || 0}</Text>
              <Text style={styles.statLabel}>FG</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{player.xp_made || 0}</Text>
              <Text style={styles.statLabel}>XP</Text>
            </View>
          </>
        )}
        {player.position === 'DEF' && (
          <>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{player.sacks || 0}</Text>
              <Text style={styles.statLabel}>SACKS</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{player.ints || 0}</Text>
              <Text style={styles.statLabel}>INTS</Text>
            </View>
          </>
        )}
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {player.fantasy_pts.toFixed(1)}
          </Text>
          <Text style={styles.statLabel}>FPTS</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  playerCard: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    margin: spacing.xs,
    flex: 1,
    minWidth: 150,
  },
  playerCardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  playerCardDisabled: {
    opacity: 0.4,
  },
  playerPosition: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.secondary,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  playerName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  playerTeam: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  playerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
});
