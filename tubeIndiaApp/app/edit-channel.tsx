import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import Colors from '../constants/Colors';
import api from '../services/api';
import { RootState } from '../redux/store';
import { loginSuccess } from '../redux/slices/authSlice';
const getAvatarUri = (avatar?: string) => {
  if (!avatar) return null;
  const value = avatar.trim();
  if (!value || value === 'default-avatar.png') return null;
  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('file://') ||
    value.startsWith('content://') ||
    value.startsWith('data:image/')
  ) {
    return value;
  }
  return null;
};

export default function EditChannelScreen() {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const isCreateMode = !user?.channelName;

  const [name, setName] = useState(user?.name || '');
  const [channelName, setChannelName] = useState(user?.channelName || '');
  const [about, setAbout] = useState(user?.about || '');
  const [avatar, setAvatar] = useState(user?.channelName ? (user?.avatar || '') : '');
  const [coverImage, setCoverImage] = useState(user?.coverImage || '');
  const [loading, setLoading] = useState(false);

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your photos to update your avatar.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        setAvatar(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick avatar. Please try again.');
    }
  };

  const pickCoverImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your photos to update your cover image.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setCoverImage(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick cover image. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!channelName.trim()) {
      Alert.alert('Error', 'Channel name is required');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('channelName', channelName);
      formData.append('about', about);
      
      const isLocalAvatar = avatar?.startsWith('file://') || avatar?.startsWith('content://');
      const isRemoteAvatar = avatar?.startsWith('http://') || avatar?.startsWith('https://');

      if (isLocalAvatar) {
        // @ts-ignore
        formData.append('avatar', {
          uri: avatar,
          type: 'image/jpeg',
          name: 'avatar.jpg',
        });
      } else if (isRemoteAvatar) {
        formData.append('avatar', avatar);
      }

      const isLocalCover = coverImage?.startsWith('file://') || coverImage?.startsWith('content://');
      const isRemoteCover = coverImage?.startsWith('http://') || coverImage?.startsWith('https://');

      if (isLocalCover) {
        // @ts-ignore
        formData.append('coverImage', {
          uri: coverImage,
          type: 'image/jpeg',
          name: 'cover.jpg',
        });
      } else if (isRemoteCover) {
        formData.append('coverImage', coverImage);
      }

      const res = await api.put('/auth/channel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        // Update local state
        dispatch(loginSuccess({ user: res.data.data, token: token! }));
        Alert.alert('Success', 'Channel updated successfully');
        router.back();
      }
    } catch (err: any) {
      const statusCode = err?.response?.status;
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data?.errors?.[0]?.msg;
      const fallbackMessage =
        statusCode === 400
          ? 'Please check channel details and try again.'
          : statusCode === 401
          ? 'Your session expired. Please login again.'
          : 'Channel update failed. You can update channel name/about without uploading an avatar.';
      Alert.alert('Update Failed', apiMessage || fallbackMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isCreateMode ? 'Create Channel' : 'Edit Channel'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.label}>Channel Banner (16:9)</Text>
      <TouchableOpacity style={styles.coverSection} onPress={pickCoverImage}>
        {getAvatarUri(coverImage) ? (
          <Image source={{ uri: getAvatarUri(coverImage)! }} style={styles.coverImage} />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Ionicons name="image-outline" size={40} color={Colors.textGray} />
            <Text style={styles.placeholderText}>Tap to select cover image</Text>
          </View>
        )}
        <View style={styles.coverCameraIcon}>
          <Ionicons name="camera" size={20} color={Colors.white} />
        </View>
      </TouchableOpacity>

      <View style={styles.avatarSection}>
        <TouchableOpacity onPress={pickAvatar}>
          {getAvatarUri(avatar) ? (
            <Image source={{ uri: getAvatarUri(avatar)! }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Ionicons name="person" size={48} color={Colors.textGray} />
            </View>
          )}
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={20} color={Colors.white} />
          </View>
        </TouchableOpacity>
        <Text style={styles.avatarLabel}>Change Profile Picture</Text>
      </View>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        placeholderTextColor={Colors.textGray}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Channel Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter channel name"
        placeholderTextColor={Colors.textGray}
        value={channelName}
        onChangeText={setChannelName}
      />

      <Text style={styles.label}>About</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Tell viewers about your channel"
        placeholderTextColor={Colors.textGray}
        multiline
        numberOfLines={4}
        value={about}
        onChangeText={setAbout}
      />

      <TouchableOpacity 
        style={[styles.saveButton, loading && styles.disabledButton]} 
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={styles.saveButtonText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    padding: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  coverSection: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  placeholderText: {
    color: Colors.textGray,
    fontSize: 14,
    fontWeight: '500',
  },
  coverCameraIcon: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5E7EB',
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  avatarLabel: {
    marginTop: 10,
    color: Colors.primary,
    fontWeight: '600',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 40,
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
