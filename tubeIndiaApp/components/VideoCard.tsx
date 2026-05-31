import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useRouter } from 'expo-router';
import { formatTimeAgo } from '../utils/formatDate';
import api from '../services/api';

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
  };
  onMenuPress?: () => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onMenuPress }) => {
  const router = useRouter();
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState('');

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
          if (onMenuPress) {
            onMenuPress();
          } else {
            setReportOpen(true);
          }
        }}>
          <Ionicons name="ellipsis-vertical" size={18} color={Colors.text} />
        </TouchableOpacity>
      </View>
      <Modal visible={reportOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.reportBox}>
            <Text style={styles.reportTitle}>Report video</Text>
            <TextInput
              style={styles.reportInput}
              placeholder="Tell us what is wrong"
              value={reason}
              onChangeText={setReason}
              multiline
            />
            <View style={styles.reportActions}>
              <TouchableOpacity onPress={() => { setReportOpen(false); setReason(''); }}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitReport}
                onPress={async () => {
                  try {
                    await api.post(`/videos/${video._id}/report`, { reason });
                    Alert.alert('Report sent', 'Thanks for helping keep Tube India safe.');
                    setReportOpen(false);
                    setReason('');
                  } catch (err: any) {
                    Alert.alert('Report failed', err.response?.data?.message || 'Please login and try again');
                  }
                }}
              >
                <Text style={styles.submitReportText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  reportBox: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 16,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  reportInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    minHeight: 90,
    padding: 10,
    textAlignVertical: 'top',
  },
  reportActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 14,
    gap: 18,
  },
  cancelText: { color: Colors.textGray, fontWeight: '600' },
  submitReport: { backgroundColor: Colors.primary, borderRadius: 8, paddingHorizontal: 18, paddingVertical: 10 },
  submitReportText: { color: Colors.white, fontWeight: 'bold' },
});

export default VideoCard;
