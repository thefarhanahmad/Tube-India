import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Dimensions, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { useIsFocused } from '@react-navigation/native';
import Colors from '../../constants/Colors';
import { videoService } from '../../services/api';
import api from '../../services/api';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import AuthModal from '../../components/AuthModal';
import CommentList from '../../components/CommentList';
import { Modal } from 'react-native';
import { useRouter } from 'expo-router';
const FALLBACK_AVATAR = 'https://via.placeholder.com/80x80.png?text=User';

const { height, width } = Dimensions.get('window');

export default function ShortsScreen() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const isFocused = useIsFocused();
  const [shorts, setShorts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [selectedShortId, setSelectedShortId] = useState<string | null>(null);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  useEffect(() => {
    loadShorts();
  }, [isAuthenticated]);

  const loadShorts = async () => {
    setLoading(true);
    try {
      const data = await api.get('/videos', { params: { type: 'short' } });
      const onlyShorts = (data.data.data || []).map((v: any) => ({
        _id: v._id,
        videoUrl: v.videoUrl,
        thumbnail: v.thumbnail,
        owner: { 
          _id: v.owner?._id,
          name: v.owner?.name || 'Unknown', 
          channelName: v.owner?.channelName,
          avatar: v.owner?.avatar || '' 
        },
        title: v.title,
        likes: v.likes || [],
        commentsCount: v.commentsCount || 0,
        isLiked: v.isLiked ?? (isAuthenticated && v.likes?.includes(user?._id)),
        isFollowing: v.isFollowing || false,
        createdAt: v.createdAt,
      }));
      const orderedShorts = [...onlyShorts].sort((a: any, b: any) => {
        const aFollowing = a?.isFollowing ? 1 : 0;
        const bFollowing = b?.isFollowing ? 1 : 0;
        if (aFollowing !== bFollowing) return bFollowing - aFollowing;
        const aTime = new Date(a?.createdAt || 0).getTime();
        const bTime = new Date(b?.createdAt || 0).getTime();
        return bTime - aTime;
      });
      setShorts(orderedShorts);
    } catch (e) {
      console.log('Failed to load shorts', e);
    }
    setLoading(false);
  };

  const handleLike = async (shortId: string) => {
    if (!isAuthenticated) {
      setAuthModalVisible(true);
      return;
    }

    setShorts(prev => prev.map(s => {
      if (s._id === shortId) {
        const alreadyLiked = s.likes.includes(user?._id);
        const newLikes = alreadyLiked 
          ? s.likes.filter((id: string) => id !== user?._id)
          : [...s.likes, user?._id];
        return { ...s, likes: newLikes, isLiked: !alreadyLiked };
      }
      return s;
    }));

    try {
      await api.post(`/videos/${shortId}/like`);
    } catch (err) {
      loadShorts();
    }
  };

  const handleFollow = async (channelId: string) => {
    if (!isAuthenticated) {
      setAuthModalVisible(true);
      return;
    }

    const prevShorts = [...shorts];
    setShorts(prev => prev.map(s => {
      if (s.owner._id === channelId) {
        return { ...s, isFollowing: !s.isFollowing };
      }
      return s;
    }));

    try {
      await api.post(`/followers/${channelId}`);
    } catch (err) {
      setShorts(prevShorts);
    }
  };

  const handleCommentClick = (shortId: string) => {
    if (!isAuthenticated) {
      setAuthModalVisible(true);
      return;
    }
    setSelectedShortId(shortId);
    setCommentModalVisible(true);
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveVideoIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50
  }).current;

  if (loading) return (
    <View style={[styles.container, styles.centerContainer]}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );

  return (
    <View style={styles.container}>
      <AuthModal visible={authModalVisible} onClose={() => setAuthModalVisible(false)} />
      
      <Modal visible={commentModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.commentModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comments</Text>
              <TouchableOpacity onPress={() => setCommentModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {selectedShortId && (
                <CommentList 
                  videoId={selectedShortId} 
                  onCommentAdded={() => {}} 
                  isAuthenticated={isAuthenticated} 
                  onAuthRequired={() => setAuthModalVisible(true)} 
                />
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <FlatList
        data={shorts}
        keyExtractor={(item) => item._id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item, index }) => (
          <View style={styles.shortItem}>
            <Video
              source={{ uri: item.videoUrl }}
              style={styles.fullVideo}
              resizeMode={ResizeMode.COVER}
              shouldPlay={isFocused && activeVideoIndex === index}
              isLooping
              isMuted={false}
              posterSource={{ uri: item.thumbnail }}
              usePoster
            />
            <View style={styles.overlay}>
              <View style={styles.rightActions}>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(item._id)}>
                  <Ionicons name={item.isLiked ? "thumbs-up" : "thumbs-up-outline"} size={32} color={item.isLiked ? Colors.primary : Colors.white} />
                  <Text style={styles.actionText}>{item.likes.length}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleCommentClick(item._id)}>
                  <Ionicons name="chatbubble-ellipses" size={32} color={Colors.white} />
                  <Text style={styles.actionText}>{item.commentsCount}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="share-social" size={32} color={Colors.white} />
                  <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.bottomDetails}>
                <TouchableOpacity style={styles.ownerRow} onPress={() => item.owner?._id && router.push(`/channel/${item.owner._id}`)}>
                  <Image source={{ uri: item.owner?.avatar || FALLBACK_AVATAR }} style={styles.ownerAvatar} />
                  <Text style={styles.ownerName} numberOfLines={1}>@{item.owner.channelName || item.owner.name}</Text>
                  {item.owner._id !== user?._id && (
                    <TouchableOpacity 
                      style={[styles.followBtn, item.isFollowing && styles.followedBtn]} 
                      onPress={() => handleFollow(item.owner._id)}
                    >
                      <Text style={[styles.followBtnText, item.isFollowing && styles.followedBtnText]}>
                        {item.isFollowing ? 'Unfollow' : 'Follow'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
                <Text style={styles.shortTitle} numberOfLines={2}>{item.title}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  shortItem: {
    width: width,
    height: height - 120, // Adjust for bottom tabs
    position: 'relative',
  },
  fullVideo: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'flex-end',
    padding: 20,
  },
  rightActions: {
    position: 'absolute',
    right: 12,
    bottom: 120,
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  actionText: {
    color: Colors.white,
    fontSize: 12,
    marginTop: 4,
    fontWeight: 'bold',
  },
  bottomDetails: {
    marginBottom: 20,
    paddingRight: 60,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ownerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.white,
  },
  ownerName: {
    color: Colors.white,
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 14,
    flex: 1,
  },
  followBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 15,
    minWidth: 70,
    alignItems: 'center',
  },
  followedBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF8C00', // Orange border
  },
  followBtnText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 11,
  },
  followedBtnText: {
    color: '#FF8C00', // Orange text
  },
  shortTitle: {
    color: Colors.white,
    fontSize: 14,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  commentModalContent: {
    backgroundColor: Colors.white,
    height: '60%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

