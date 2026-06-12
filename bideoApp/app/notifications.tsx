import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import api from '../services/api';
import { EmptyState } from '../components/ListStates';
import { formatTimeAgo } from '../utils/formatDate';

export default function NotificationsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.data.success) setItems(res.data.data || []);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const openItem = async (item: any) => {
    if (!item.read) api.put(`/notifications/${item._id}/read`).catch(() => {});
    if (item.video?._id) router.push(`/video/${item.video._id}`);
    else if (item.post?._id) router.push(`/post/${item.post._id}`);
    else if (item.video) router.push(`/video/${item.video}`);
    else if (item.post) router.push(`/post/${item.post}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity onPress={() => api.put('/notifications/read-all').then(loadNotifications).catch(() => {})}>
          <Text style={styles.readAll}>Read all</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.item, !item.read && styles.unread]} onPress={() => openItem(item)} activeOpacity={0.7}>
              <Image source={{ uri: item.actor?.avatar || 'https://via.placeholder.com/48x48.png?text=U' }} style={styles.avatar} contentFit="cover" transition={200} />
              <View style={styles.itemText}>
                <Text style={styles.message} numberOfLines={2}>{item.message || 'New activity on your content'}</Text>
                <Text style={styles.time}>{formatTimeAgo(item.createdAt)}</Text>
              </View>
              {!item.read && <View style={styles.dot} />}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="notifications-outline"
              title="You're all caught up"
              subtitle="Likes, comments, follows and other activity will show up here."
            />
          }
          refreshing={loading}
          onRefresh={loadNotifications}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { paddingTop: 52, paddingHorizontal: 16, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  readAll: { color: Colors.primary, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  unread: { backgroundColor: '#FFF7ED' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.border },
  itemText: { flex: 1, marginLeft: 12 },
  message: { color: Colors.text, fontSize: 14, lineHeight: 19 },
  time: { color: Colors.textGray, fontSize: 12, marginTop: 4 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: Colors.primary, marginLeft: 10 },
  empty: { textAlign: 'center', color: Colors.textGray, marginTop: 40 },
});
