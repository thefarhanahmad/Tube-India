import React from 'react';
import { View, StyleSheet, ActivityIndicator, Image } from 'react-native';
import Colors from '../constants/Colors';

/**
 * Full-screen branded splash shown while the app boots. This guarantees a
 * full-bleed splash regardless of the Android 12+ system splash (which only
 * shows a small centered icon). `onLayout` is used to hide the native splash
 * once this view is on screen, avoiding any blank flash.
 */
export default function AppSplash({ onLayout }: { onLayout?: () => void }) {
  return (
    <View style={styles.root} onLayout={onLayout}>
      <Image 
        source={require('../assets/splash_screen.png')} 
        style={styles.splashImage}
        resizeMode="contain"
      />
      <ActivityIndicator color={Colors.white} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashImage: {
    width: '100%',
    height: '100%',
  },
  spinner: {
    position: 'absolute',
    bottom: 50,
  },
});
