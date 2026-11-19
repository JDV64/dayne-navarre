import { ReactNode } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';

import { colors, radius, space } from '../lib/theme';
import { Phase, PHASES } from '../lib/types';

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.section}>{children}</Text>
      {right}
    </View>
  );
}

const TEINTES_PHASE: Record<Phase, { fg: string; bg: string }> = {
  Prospect: { fg: colors.muted, bg: '#ECE8E1' },
  Diagnostic: { fg: '#7A5A2E', bg: colors.sand },
  Conception: { fg: colors.accent, bg: colors.accentSoft },
  Consultation: { fg: '#7A5A2E', bg: '#F1E6D2' },
  Chantier: { fg: '#2F5D7A', bg: '#DFEAF1' },
  Réception: { fg: colors.green, bg: colors.greenSoft },
  'Levée des réserves': { fg: '#8A4F2A', bg: '#F2E2D6' },
  Clôturé: { fg: colors.muted, bg: '#E7E4DE' },
};

export function PhaseBadge({ phase }: { phase: Phase }) {
  const t = TEINTES_PHASE[phase];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <Text style={[styles.badgeText, { color: t.fg }]}>{phase}</Text>
    </View>
  );
}

export function phaseProgress(phase: Phase) {
  return PHASES.indexOf(phase) / (PHASES.length - 1);
}

export function ProgressBar({ value, color = colors.accent }: { value: number; color?: string }) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%`, backgroundColor: color }]} />
    </View>
  );
}

type BtnProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  small?: boolean;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
};

export function Button({ label, onPress, variant = 'primary', small, style, disabled }: BtnProps) {
  const v = {
    primary: { bg: colors.accent, fg: colors.white, border: colors.accent },
    secondary: { bg: colors.card, fg: colors.text, border: colors.border },
    danger: { bg: colors.card, fg: colors.red, border: colors.redSoft },
    ghost: { bg: 'transparent', fg: colors.accent, border: 'transparent' },
  }[variant];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        small && styles.btnSmall,
        { backgroundColor: v.bg, borderColor: v.border, opacity: disabled ? 0.4 : pressed ? 0.75 : 1 },
        style,
      ]}
    >
      <Text style={[styles.btnText, small && { fontSize: 14 }, { color: v.fg }]}>{label}</Text>
    </Pressable>
  );
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function Field({
  label,
  hint,
  error,
  ...props
}: TextInputProps & { label: string; hint?: string; error?: string }) {
  return (
    <View style={{ marginBottom: space(4) }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#A8A59C"
        {...props}
        style={[styles.input, props.multiline && { minHeight: 80, textAlignVertical: 'top' }, !!error && { borderColor: colors.red }, props.style]}
      />
      {!!error && <Text style={[styles.hint, { color: colors.red }]}>{error}</Text>}
      {!error && !!hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space(4),
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space(6),
    marginBottom: space(2),
  },
  section: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  track: { height: 6, borderRadius: 3, backgroundColor: '#ECE8E1', overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  btn: {
    minHeight: 48,
    paddingHorizontal: space(5),
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSmall: { minHeight: 38, paddingHorizontal: space(3) },
  btnText: { fontSize: 16, fontWeight: '600' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginRight: 8,
  },
  chipActive: { backgroundColor: colors.text, borderColor: colors.text },
  chipText: { fontSize: 14, color: colors.text, fontWeight: '500' },
  chipTextActive: { color: colors.white },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6 },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  hint: { fontSize: 12, color: colors.muted, marginTop: 4 },
});
