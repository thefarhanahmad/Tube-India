import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, Pressable, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useRouter } from 'expo-router';
import { formatTimeAgo } from '../utils/formatDate';
import api from '../services/api';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

const FALLBACK_IMAGE = 'https://via.placeholder.com/640x360?text=No+Image';
const FALLBACK_AVATAR = 'https://via.placeholder.com/80x80.png?text=User';

interface VideoCardProps {
  video: {
    _id: string;
    title: string;
    thumbnail: string;
    views: number;
    createdAt: string;
    owner: {
      _id?: string;
      name: string;
      channelName?: string;
      avatar: string;
    };
    duration: number;
    videoUrl?: string;
  };
  onMenuPress?: () => void;
  onPlaylistPress?: (videoId: string) => void;
  onReportPress?: (video: any) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onPlaylistPress, onReportPress }) => {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [menuVisible, setMenuVisible] = useState(false);

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
    return `${views} views`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleShare = async () => {
    setMenuVisible(false);
    try {
      await Share.share({
        message: `Check out this video on TubeIndia: ${video.title}\n${video.videoUrl || ''}`,
      });
    } catch (err) {
      console.error('Share failed', err);
    }
  };

  const handleReport = () => {
    setMenuVisible(false);
    if (onReportPress) {
      onReportPress(video);
    }
  };

  const handlePlaylist = () => {
    setMenuVisible(false);
    if (onPlaylistPress) {
      onPlaylistPress(video._id);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(`/video/${video._id}`)}
    >
      <View style={styles.thumbnailContainer}>
        <Image source={{ uri: video?.thumbnail || FALLBACK_IMAGE }} style={styles.thumbnail} />
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{formatDuration(video?.duration || 0)}</Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <TouchableOpacity onPress={() => video?.owner?._id && router.push(`/channel/${video.owner._id}`)}>
          <Image source={{ uri: video?.owner?.avatar || FALLBACK_AVATAR }} style={styles.avatar} />
        </TouchableOpacity>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {video?.title || 'Untitled'}
          </Text>
          <Text
            style={styles.metadata}
            onPress={() => video?.owner?._id && router.push(`/channel/${video.owner._id}`)}
          >
            {(video?.owner?.channelName || video?.owner?.name || 'Unknown')} - {formatViews(video?.views || 0)} - {formatTimeAgo(video?.createdAt)}
          </Text>
        </View>
        <TouchableOpacity style={styles.menuButton} onPress={(e) => {
          e.stopPropagation();
          setMenuVisible(true);
        }}>
          <Ionicons name="ellipsis-vertical" size={18} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Action Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContent}>
            <TouchableOpacity style={styles.menuItem} onPress={handlePlaylist}>
              <Ionicons name="add-circle-outline" size={24} color={Colors.text} />
              <Text style={styles.menuText}>Add to Playlist</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={24} color={Colors.text} />
              <Text style={styles.menuText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleReport}>
              <Ionicons name="flag-outline" size={24} color={Colors.text} />
              <Text style={styles.menuText}>Report</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelItem} onPress={() => setMenuVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: 200,
    backgroundColor: '#E5E7EB',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailsContainer: {
    flexDirection: 'row',
    padding: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    backgroundColor: '#E5E7EB',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  metadata: {
    fontSize: 12,
    color: Colors.textGray,
  },
  menuButton: {
    paddingLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  menuContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 15,
    color: Colors.text,
  },
  cancelItem: {
    marginTop: 10,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 10,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textGray,
  },
});

export default VideoCard;
