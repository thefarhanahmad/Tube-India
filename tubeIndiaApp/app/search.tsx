import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '../constants/Colors';
import VideoCard from '../components/VideoCard';
import api from '../services/api';

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await api.get('/users/search-history');
      if (res.data.success) setHistory(res.data.data || []);
    } catch {
      setHistory([]);
    }
  };

  const handleSearch = async (term = query) => {
    if (!term.trim()) return;
    setQuery(term);
    setLoading(true);
    try {
      api.post('/users/search-history', { term }).then(loadHistory).catch(() => {});
      const res = await api.get('/videos/search', { params: { q: term } });
      if (res.data.success) {
        setResults(res.data.data);
      }
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.input}
            placeholder="Search TubeIndia"
            value={query}
            onChangeText={setQuery}
            autoFocus
            onSubmitEditing={() => handleSearch()}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close" size={20} color={Colors.textGray} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => handleSearch()}>
          <Ionicons name="search" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={results.length > 0 || query.length > 0 ? results : history}
          keyExtractor={(item) => item._id || item.term}
          renderItem={({ item }) => item.term ? (
            <TouchableOpacity style={styles.historyRow} onPress={() => handleSearch(item.term)}>
              <Ionicons name="time-outline" size={18} color={Colors.textGray} />
              <Text style={styles.historyText}>{item.term}</Text>
            </TouchableOpacity>
          ) : <VideoCard video={item} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            query.length > 0 && !loading ? (
              <View style={styles.center}>
                <Text style={styles.emptyText}>No results found for "{query}"</Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    marginHorizontal: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    height: 40,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  list: {
    paddingBottom: 20,
  },
  emptyText: {
    color: Colors.textGray,
    fontSize: 16,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  historyText: {
    marginLeft: 12,
    fontSize: 15,
    color: Colors.text,
  },
});
