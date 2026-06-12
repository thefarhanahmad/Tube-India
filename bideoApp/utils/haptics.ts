import * as Haptics from 'expo-haptics';

// Thin wrappers so call sites stay clean and failures never crash (e.g. web).
export const hapticLight = () =>
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

export const hapticMedium = () =>
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

export const hapticSuccess = () =>
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

export const hapticSelection = () => Haptics.selectionAsync().catch(() => {});
