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

          {/* Stat cards */}
          <View style={styles.statRow}>
            <StatBox icon="eye-outline" label="Total Views" value={formatViews(totalViews)} tint="#3B82F6" />
            <StatBox icon="trending-up-outline" label="Est. Potential" value={`₹${estimatedPotential}`} tint="#10B981" />
            <StatBox icon="videocam-outline" label="Videos" value={String(videoCount)} tint={Colors.primary} />
          </View>

          {/* Monetization eligibility */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: (eligible ? '#10B981' : Colors.primary) + '1A' }]}>
                <Ionicons name={eligible ? 'checkmark-circle' : 'rocket-outline'} size={20} color={eligible ? '#10B981' : Colors.primary} />
              </View>
              <Text style={styles.cardTitle}>{eligible ? "You're eligible!" : 'Monetization progress'}</Text>
            </View>
            <Text style={styles.cardSub}>
              {eligible
                ? 'You meet the requirements. Monetization will switch on for you as soon as it launches.'
                : 'Reach these milestones to qualify for monetization when it launches.'}
            </Text>

            <ProgressRow label="Followers" current={followers} goal={FOLLOWER_GOAL} progress={followerProgress} />
            <ProgressRow label="Total views" current={totalViews} goal={VIEW_GOAL} progress={viewProgress} />
          </View>

          {/* How you'll earn */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { marginBottom: 4 }]}>How you'll earn</Text>
            {[
              { icon: 'megaphone-outline', title: 'Ad revenue', desc: 'Earn a share from ads shown on your videos.' },
              { icon: 'people-outline', title: 'Channel memberships', desc: 'Offer paid perks to your biggest fans.' },
              { icon: 'gift-outline', title: 'Tips & Super Chats', desc: 'Let viewers support you directly.' },
            ].map((row) => (
              <View key={row.title} style={styles.earnRow}>
                <View style={styles.earnIcon}>
                  <Ionicons name={row.icon as any} size={18} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.earnTitle}>{row.title}</Text>
                  <Text style={styles.earnDesc}>{row.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Info banner */}
          <View style={styles.banner}>
            <Ionicons name="information-circle" size={20} color={Colors.primary} />
            <Text style={styles.bannerText}>
              We're building a secure payment gateway and creator monetization. This page will show your
              real earnings and let you withdraw very soon. Thanks for being an early creator!
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const StatBox = ({ icon, label, value, tint }: { icon: any; label: string; value: string; tint: string }) => (
  <View style={styles.statBox}>
    <View style={[styles.statIcon, { backgroundColor: tint + '1A' }]}>
      <Ionicons name={icon} size={18} color={tint} />
    </View>
    <Text style={styles.statValue} numberOfLines={1}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const ProgressRow = ({ label, current, goal, progress }: { label: string; current: number; goal: number; progress: number }) => (
  <View style={styles.progressRow}>
    <View style={styles.progressLabelRow}>
      <Text style={styles.progressLabel}>{label}</Text>
      <Text style={styles.progressValue}>
        {formatViews(current)} / {formatViews(goal)}
      </Text>
    </View>
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backBtn: { padding: 2 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  hero: {
    margin: 16,
    borderRadius: 24,
    padding: 22,
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
  statRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10 },
  statBox: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statValue: { fontSize: 17, fontWeight: '800', color: Colors.text },
  statLabel: { fontSize: 11, color: Colors.textGray, marginTop: 2 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    marginHorizontal: 16,
    marginTop: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  cardSub: { fontSize: 13, color: Colors.textGray, lineHeight: 19, marginBottom: 14 },
  progressRow: { marginTop: 12 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 13, fontWeight: '600', color: Colors.text },
  progressValue: { fontSize: 12, color: Colors.textGray },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: '#EEF0F2', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: Colors.primary },
  earnRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  earnIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.primary + '14', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  earnTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  earnDesc: { fontSize: 12, color: Colors.textGray, marginTop: 1 },
  banner: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: Colors.primary + '12',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 16,
  },
  bannerText: { flex: 1, fontSize: 12.5, color: Colors.text, lineHeight: 18 },
});
