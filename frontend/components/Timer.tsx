import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../src/theme';

interface TimerProps {
  seconds: number | null;
}

export const Timer: React.FC<TimerProps> = ({ seconds }) => {
  if (seconds === null) {
    return null;
  }

  const isLow = seconds <= 10;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const display = `${minutes}:${secs.toString().padStart(2, '0')}`;

  return (
    <View style={styles.timerContainer}>
      <Text style={[styles.timerValue, isLow && styles.timerLow]}>{display}</Text>
      <Text style={styles.timerLabel}>seconds</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  timerLow: {
    color: colors.error,
  },
  timerLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
});
