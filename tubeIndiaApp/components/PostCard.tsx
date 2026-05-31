import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '../constants/Colors';
import { formatTimeAgo } from '../utils/formatDate';

const FALLBACK_AVATAR = 'https://via.placeholder.com/80x80.png?text=User';

const PostCard = ({ post }: { post: any }) => {
  const router = useRouter();
  const owner = post.owner || {};

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={() => owner._id && router.push(`/channel/${owner._id}`)}>
        <Image source={{ uri: owner.avatar || FALLBACK_AVATAR }} style={styles.avatar} />
        <View style={styles.headerText}>
          <Text style={styles.ownerName}>{owner.channelName || owner.name || 'User'}</Text>
          <Text style={styles.time}>{formatTimeAgo(post.createdAt)}</Text>
        </View>
      </TouchableOpacity>
      {!!post.text && <Text style={styles.text}>{post.text}</Text>}
      {!!post.imageUrl && <Image source={{ uri: post.imageUrl }} style={styles.image} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    padding: 14,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.border,
  },
  headerText: {
    marginLeft: 10,
    flex: 1,
  },
  ownerName: {
    color: Colors.text,
    fontWeight: '700',
  },
  time: {
    color: Colors.textGray,
    fontSize: 12,
    marginTop: 2,
  },
  text: {
    color: Colors.text,
    fontSize: 15,
    lineHeight: 21,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 8,
    marginTop: 12,
    backgroundColor: Colors.border,
  },
});

export default PostCard;
