import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ProtectedScreen } from '@/components/ProtectedScreen';
import { ApiError, apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type Player = {
  id: number;
  name: string;
  email: string;
  extraSlots: number;
};

type MatchDetails = {
  id: number;
  groupTitle: string;
  matchDate: string;
  matchTime: string;
  startsAt: string;
  location: string;
  state: string;
  capacityState: string;
  capacity: number;
  canceled: boolean;
  isOpen: boolean;
  isJoined: boolean;
  extraSlots: number;
  occupiedSlots: number;
  playerCount: number;
  players: Player[];
  comments: Comment[];
};

type Comment = {
  id: number;
  text: string;
  createdAt: string;
  authorName: string;
};

type MatchDetailsResponse = {
  data: MatchDetails;
};

export default function MatchDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { logout, token } = useAuth();
  const [match, setMatch] = useState<MatchDetails | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [isUpdatingSlots, setIsUpdatingSlots] = useState(false);

  const loadMatch = useCallback(async () => {
    if (!token || !id) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await apiRequest<MatchDetailsResponse>(`/matches/${id}`, { token });
      setMatch(response.data);
    } catch (loadError) {
      if (loadError instanceof ApiError && loadError.status === 401) {
        logout();
        return;
      }

      setError(loadError instanceof Error ? loadError.message : 'Could not load match.');
    } finally {
      setIsLoading(false);
    }
  }, [id, logout, token]);

  async function updateJoinStatus() {
    if (!token || !id || !match) {
      return;
    }

    setIsMutating(true);
    setError('');

    try {
      const response = await apiRequest<MatchDetailsResponse>(
        `/matches/${id}/${match.isJoined ? 'leave' : 'join'}`,
        {
          method: 'POST',
          token,
        },
      );
      setMatch(response.data);
    } catch (mutationError) {
      if (mutationError instanceof ApiError && mutationError.status === 401) {
        logout();
        return;
      }

      setError(
        mutationError instanceof Error ? mutationError.message : 'Could not update this match.',
      );
    } finally {
      setIsMutating(false);
    }
  }

  async function updateExtraSlots(nextExtraSlots: number) {
    if (!token || !id || !match || !match.isJoined) {
      return;
    }

    setIsUpdatingSlots(true);
    setError('');

    try {
      const response = await apiRequest<MatchDetailsResponse>(`/matches/${id}/slots`, {
        method: 'POST',
        token,
        body: {
          extraSlots: Math.max(0, nextExtraSlots),
        },
      });
      setMatch(response.data);
    } catch (slotError) {
      if (slotError instanceof ApiError && slotError.status === 401) {
        logout();
        return;
      }

      setError(slotError instanceof Error ? slotError.message : 'Could not update reserved slots.');
    } finally {
      setIsUpdatingSlots(false);
    }
  }

  useEffect(() => {
    loadMatch();
  }, [loadMatch]);

  return (
    <ProtectedScreen>
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#0f7a3b" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {match ? (
            <>
              <View style={styles.header}>
                <Text style={styles.eyebrow}>{match.groupTitle}</Text>
                <Text style={styles.title}>
                  {match.matchDate} at {match.matchTime}
                </Text>
                <Text style={styles.location}>{match.location}</Text>
              </View>

              <View style={styles.stats}>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>State</Text>
                  <Text style={styles.statValue}>{formatLabel(match.state)}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Capacity state</Text>
                  <Text style={styles.statValue}>{formatLabel(match.capacityState)}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Status</Text>
                  <Text style={styles.statValue}>
                    {match.canceled ? 'Canceled' : match.isOpen ? 'Open' : 'Closed'}
                  </Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Starts</Text>
                  <Text style={styles.statValue}>{formatDateTime(match.startsAt)}</Text>
                </View>
                <Text style={styles.statText}>
                  {match.occupiedSlots}/{match.capacity} slots filled
                </Text>
                <Text style={styles.statText}>{match.playerCount} players joined</Text>
              </View>

              <Pressable
                disabled={isMutating}
                onPress={updateJoinStatus}
                style={({ pressed }) => [
                  styles.button,
                  match.isJoined && styles.leaveButton,
                  (pressed || isMutating) && styles.pressed,
                ]}>
                <Text style={styles.buttonText}>
                  {isMutating ? 'Updating...' : match.isJoined ? 'Leave match' : 'Join match'}
                </Text>
              </Pressable>

              {match.isJoined ? (
                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Reserved slots</Text>
                    <Text style={styles.slotCount}>+{match.extraSlots}</Text>
                  </View>
                  <Text style={styles.helperText}>Reserve extra spots for friends coming with you.</Text>
                  <View style={styles.slotControls}>
                    <Pressable
                      disabled={isUpdatingSlots || match.extraSlots <= 0}
                      onPress={() => updateExtraSlots(match.extraSlots - 1)}
                      style={({ pressed }) => [
                        styles.slotButton,
                        (isUpdatingSlots || match.extraSlots <= 0) && styles.slotButtonDisabled,
                        pressed && !isUpdatingSlots && match.extraSlots > 0 && styles.pressed,
                      ]}>
                      <Text style={styles.slotButtonText}>-1</Text>
                    </Pressable>
                    <Text style={styles.slotValue}>
                      {isUpdatingSlots ? 'Updating...' : `${match.extraSlots} extra`}
                    </Text>
                    <Pressable
                      disabled={isUpdatingSlots}
                      onPress={() => updateExtraSlots(match.extraSlots + 1)}
                      style={({ pressed }) => [
                        styles.slotButton,
                        isUpdatingSlots && styles.slotButtonDisabled,
                        pressed && !isUpdatingSlots && styles.pressed,
                      ]}>
                      <Text style={styles.slotButtonText}>+1</Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Players</Text>
                {match.players.length ? (
                  match.players.map((player) => (
                    <View key={player.id} style={styles.playerRow}>
                      <View>
                        <Text style={styles.playerName}>{player.name}</Text>
                        <Text style={styles.playerEmail}>{player.email}</Text>
                      </View>
                      {player.extraSlots ? (
                        <Text style={styles.extraSlots}>+{player.extraSlots}</Text>
                      ) : null}
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No players have joined yet.</Text>
                )}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Comments</Text>
                {match.comments.length ? (
                  match.comments.map((comment) => (
                    <View key={comment.id} style={styles.commentRow}>
                      <View style={styles.commentHeader}>
                        <Text style={styles.commentAuthor}>{comment.authorName}</Text>
                        <Text style={styles.commentDate}>{formatDateTime(comment.createdAt)}</Text>
                      </View>
                      <Text style={styles.commentText}>{comment.text}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No comments yet.</Text>
                )}
              </View>
            </>
          ) : (
            <Pressable onPress={loadMatch} style={styles.button}>
              <Text style={styles.buttonText}>Try again</Text>
            </Pressable>
          )}
        </ScrollView>
      )}
    </ProtectedScreen>
  );
}

function formatLabel(value: string) {
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 18,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    gap: 8,
  },
  eyebrow: {
    color: '#0f7a3b',
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: '#102014',
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
  },
  location: {
    color: '#3f5144',
    fontSize: 17,
  },
  stats: {
    backgroundColor: '#ffffff',
    borderColor: '#dbe6dd',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  statRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  statLabel: {
    color: '#637167',
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  statValue: {
    color: '#102014',
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
  },
  statText: {
    color: '#102014',
    fontSize: 16,
    fontWeight: '700',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#0f7a3b',
    borderRadius: 8,
    minHeight: 50,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  leaveButton: {
    backgroundColor: '#9a1f1f',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  section: {
    gap: 10,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderColor: '#dbe6dd',
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: '#102014',
    fontSize: 20,
    fontWeight: '800',
  },
  helperText: {
    color: '#637167',
    fontSize: 14,
    lineHeight: 20,
  },
  slotControls: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  slotButton: {
    alignItems: 'center',
    backgroundColor: '#0f7a3b',
    borderRadius: 8,
    minWidth: 72,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  slotButtonDisabled: {
    backgroundColor: '#d9e4dc',
  },
  slotButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  slotCount: {
    color: '#0f7a3b',
    fontSize: 22,
    fontWeight: '900',
  },
  slotValue: {
    color: '#102014',
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  playerRow: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#dbe6dd',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
  },
  playerName: {
    color: '#102014',
    fontSize: 16,
    fontWeight: '800',
  },
  playerEmail: {
    color: '#637167',
    fontSize: 14,
    marginTop: 3,
  },
  extraSlots: {
    color: '#0f7a3b',
    fontSize: 16,
    fontWeight: '800',
  },
  emptyText: {
    color: '#637167',
    fontSize: 15,
  },
  commentRow: {
    backgroundColor: '#ffffff',
    borderColor: '#dbe6dd',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 14,
  },
  commentHeader: {
    gap: 3,
  },
  commentAuthor: {
    color: '#102014',
    fontSize: 15,
    fontWeight: '800',
  },
  commentDate: {
    color: '#637167',
    fontSize: 13,
  },
  commentText: {
    color: '#3f5144',
    fontSize: 15,
    lineHeight: 21,
  },
  error: {
    backgroundColor: '#fff0f0',
    borderColor: '#e5b5b5',
    borderRadius: 8,
    borderWidth: 1,
    color: '#9a1f1f',
    fontSize: 14,
    lineHeight: 20,
    padding: 12,
  },
  pressed: {
    opacity: 0.82,
  },
});
