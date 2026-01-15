import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../src/theme';

interface TurnIndicatorProps {
  currentTurn: string | null;
  isMyTurn: boolean;
  pickNumber: number;
  totalPicks: number;
}

export const TurnIndicator: React.FC<TurnIndicatorProps> = ({
  currentTurn,
  isMyTurn,
  pickNumber,
  totalPicks,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pickInfo}>
          Pick {pickNumber} of {totalPicks}
        </Text>
      </View>
      {currentTurn && (
        <View style={[styles.turnBadge, isMyTurn && styles.myTurn]}>
          <Text style={[styles.turnText, isMyTurn && styles.myTurnText]}>
            {isMyTurn ? 'Your Turn' : `${currentTurn}'s Turn`}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  header: {
    marginBottom: spacing.sm,
  },
  pickInfo: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  turnBadge: {
    backgroundColor: colors.cardBackground,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  myTurn: {
    backgroundColor: colors.primary,
  },
  turnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  myTurnText: {
    color: colors.background,
  },
});
