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
  location: string;
  capacity: number;
  isJoined: boolean;
  occupiedSlots: number;
  playerCount: number;
  players: Player[];
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
  sectionTitle: {
    color: '#102014',
    fontSize: 20,
    fontWeight: '800',
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
