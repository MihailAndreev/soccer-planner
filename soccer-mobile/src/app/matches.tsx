import { useFocusEffect } from '@react-navigation/native';
import { Link } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ProtectedScreen, ScreenMessage } from '@/components/ProtectedScreen';
import { ApiError, apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type MatchSummary = {
  id: number;
  groupTitle: string;
  matchDate: string;
  matchTime: string;
  location: string;
  capacity: number;
  isJoined: boolean;
  occupiedSlots: number;
  playerCount: number;
};

type Paging = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

type MatchesResponse = {
  data: MatchSummary[];
  paging: Paging;
};

const PAGE_SIZE = 10;

export default function MatchesScreen() {
  const { logout, token } = useAuth();
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [paging, setPaging] = useState<Paging | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasLoadedOnce = useRef(false);

  const loadMatches = useCallback(
    async (page = 1, refreshing = false, quiet = false) => {
      if (!token) {
        return;
      }

      if (refreshing) {
        setIsRefreshing(true);
      } else if (!quiet) {
        setIsLoading(true);
      }

      setError('');

      try {
        const response = await apiRequest<MatchesResponse>(
          `/matches?page=${page}&pageSize=${PAGE_SIZE}`,
          { token },
        );

        setMatches(response.data);
        setPaging(response.paging);
        hasLoadedOnce.current = true;
      } catch (loadError) {
        if (loadError instanceof ApiError && loadError.status === 401) {
          logout();
          return;
        }

        setError(loadError instanceof Error ? loadError.message : 'Could not load matches.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [logout, token],
  );

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  useFocusEffect(
    useCallback(() => {
      if (hasLoadedOnce.current) {
        loadMatches(paging?.page ?? 1, false, true);
      }
    }, [loadMatches, paging?.page]),
  );

  const currentPage = paging?.page ?? 1;
  const totalPages = paging?.totalPages ?? 1;
  const totalMatches = paging?.total ?? matches.length;
  const canGoBack = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <ProtectedScreen>
      <View style={styles.container}>
        <Text style={styles.title}>Matches</Text>
        <Text style={styles.subtitle}>
          {totalMatches ? `${totalMatches} active matches from your groups.` : 'Active matches from your groups.'}
        </Text>

        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color="#0f7a3b" />
          </View>
        ) : error ? (
          <View style={styles.errorBlock}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => loadMatches(currentPage)} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Try again</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            contentContainerStyle={styles.listContent}
            data={matches}
            keyExtractor={(item) => String(item.id)}
            ListEmptyComponent={<ScreenMessage message="No upcoming matches found." />}
            ListFooterComponent={
              totalPages > 1 ? (
                <View style={styles.pager}>
                  <Pressable
                    disabled={!canGoBack}
                    onPress={() => loadMatches(currentPage - 1)}
                    style={({ pressed }) => [
                      styles.pageButton,
                      !canGoBack && styles.pageButtonDisabled,
                      pressed && canGoBack && styles.pressed,
                    ]}>
                    <Text
                      style={[
                        styles.pageButtonText,
                        !canGoBack && styles.pageButtonTextDisabled,
                      ]}>
                      Previous
                    </Text>
                  </Pressable>

                  <Text style={styles.pageText}>
                    Page {currentPage} of {totalPages}
                  </Text>

                  <Pressable
                    disabled={!canGoNext}
                    onPress={() => loadMatches(currentPage + 1)}
                    style={({ pressed }) => [
                      styles.pageButton,
                      !canGoNext && styles.pageButtonDisabled,
                      pressed && canGoNext && styles.pressed,
                    ]}>
                    <Text
                      style={[
                        styles.pageButtonText,
                        !canGoNext && styles.pageButtonTextDisabled,
                      ]}>
                      Next
                    </Text>
                  </Pressable>
                </View>
              ) : null
            }
            refreshControl={
              <RefreshControl
                onRefresh={() => loadMatches(1, true)}
                refreshing={isRefreshing}
                tintColor="#0f7a3b"
              />
            }
            renderItem={({ item }) => (
              <Link href={`/matches/${item.id}`} asChild>
                <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.group}>{item.groupTitle}</Text>
                    <Text style={[styles.badge, item.isJoined && styles.joinedBadge]}>
                      {item.isJoined ? 'Joined' : 'Open'}
                    </Text>
                  </View>
                  <Text style={styles.date}>
                    {item.matchDate} at {item.matchTime}
                  </Text>
                  <Text style={styles.location}>{item.location}</Text>
                  <Text style={styles.capacity}>
                    {item.occupiedSlots}/{item.capacity} slots filled by {item.playerCount} players
                  </Text>
                </Pressable>
              </Link>
            )}
          />
        )}
      </View>
    </ProtectedScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    color: '#102014',
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    color: '#3f5144',
    fontSize: 16,
    marginBottom: 18,
    marginTop: 6,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    gap: 12,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#dbe6dd',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  group: {
    color: '#102014',
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
  },
  badge: {
    backgroundColor: '#eaf3ed',
    borderRadius: 999,
    color: '#0f7a3b',
    fontSize: 13,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  joinedBadge: {
    backgroundColor: '#0f7a3b',
    color: '#ffffff',
  },
  date: {
    color: '#102014',
    fontSize: 15,
    fontWeight: '700',
  },
  location: {
    color: '#3f5144',
    fontSize: 15,
  },
  capacity: {
    color: '#637167',
    fontSize: 14,
  },
  pager: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  pageButton: {
    alignItems: 'center',
    backgroundColor: '#0f7a3b',
    borderRadius: 8,
    minWidth: 104,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pageButtonDisabled: {
    backgroundColor: '#d9e4dc',
  },
  pageButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  pageButtonTextDisabled: {
    color: '#738278',
  },
  pageText: {
    color: '#3f5144',
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorBlock: {
    backgroundColor: '#fff0f0',
    borderColor: '#e5b5b5',
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  errorText: {
    color: '#9a1f1f',
    fontSize: 15,
    lineHeight: 21,
  },
  retryButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#0f7a3b',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.82,
  },
});
