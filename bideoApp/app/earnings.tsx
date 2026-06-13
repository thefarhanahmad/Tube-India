import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import Colors from '../constants/Colors';
import api from '../services/api';
import { showAlert } from '../components/AppAlert';
import { RootState } from '../redux/store';
import { formatViews } from '../utils/formatDate';

// Illustrative rate used only to show *potential* earnings — real payouts begin
// once monetization + the payment gateway launch.
const EST_CPM = 30; // ₹ per 1,000 views (illustrative)
const FOLLOWER_GOAL = 1000;
const VIEW_GOAL = 4000;

export default function EarningsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [totalViews, setTotalViews] = useState(0);
  const [videoCount, setVideoCount] = useState(0);

  const followers = user?.followersCount || 0;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/videos/me');
        const vids = res.data?.data || [];
        setVideoCount(vids.length);
        setTotalViews(vids.reduce((sum: number, v: any) => sum + (v.views || 0), 0));
      } catch (err) {
        console.log('Failed to load earnings data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const estimatedPotential = ((totalViews / 1000) * EST_CPM).toFixed(2);
  const followerProgress = Math.min(followers / FOLLOWER_GOAL, 1);
  const viewProgress = Math.min(totalViews / VIEW_GOAL, 1);
  const eligible = followerProgress >= 1 && viewProgress >= 1;

  const comingSoon = () =>
    showAlert(
      'Coming Soon',
      'Withdrawals will open once monetization and our secure payment gateway go live. Keep creating — your views are already counting!'
    );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Earnings</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}>
          {/* Hero balance card */}
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroTopRow}>
              <Text style={styles.heroLabel}>Total Earnings</Text>
              <View style={styles.badge}><Text style={styles.badgeText}>Coming soon</Text></View>
            </View>
            <Text style={styles.heroAmount}>₹0.00</Text>
            <Text style={styles.heroSub}>Available to withdraw</Text>

            <TouchableOpacity style={styles.withdrawBtn} activeOpacity={0.85} onPress={comingSoon}>
              <Ionicons name="cash-outline" size={18} color={Colors.primary} />
              <Text style={styles.withdrawBtnText}>Withdraw</Text>
            </TouchableOpacity>
          </LinearGradient>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backBtn: { padding: 2 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  hero: {
    margin: 12,
    borderRadius: 20,
    padding: 18,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '600' },
  badge: { backgroundColor: 'rgba(255,255,255,0.22)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  badgeText: { color: Colors.white, fontSize: 11, fontWeight: '700' },
  heroAmount: { color: Colors.white, fontSize: 40, fontWeight: '800', marginTop: 10 },
  heroSub: { color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 2 },
  withdrawBtn: {
    marginTop: 18,
    alignSelf: 'flex-start',
    backgroundColor: Colors.white,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  withdrawBtnText: { color: Colors.primary, fontSize: 14, fontWeight: '700' },
});
