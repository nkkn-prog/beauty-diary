import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { StyleSheet, View, Animated, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type ToastType = 'success' | 'error' | 'info';

type ToastConfig = {
  message: string;
  type?: ToastType;
  duration?: number;
};

type ToastContextValue = {
  showToast: (config: ToastConfig) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

type ToastProviderProps = {
  children: ReactNode;
};

export function ToastProvider({ children }: ToastProviderProps) {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('success');
  const [opacity] = useState(new Animated.Value(0));

  const showToast = useCallback(
    ({ message, type = 'success', duration = 2000 }: ToastConfig) => {
      setMessage(message);
      setType(type);
      setVisible(true);

      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(duration),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setVisible(false);
      });
    },
    [opacity]
  );

  const getIconName = (): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'alert-circle';
      case 'info':
        return 'information-circle';
    }
  };

  const getBackgroundColor = (): string => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'info':
        return '#2196F3';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {visible && (
        <Animated.View
          style={[
            styles.container,
            {
              top: insets.top + 10,
              opacity,
              backgroundColor: getBackgroundColor(),
            },
          ]}
        >
          <Ionicons name={getIconName()} size={20} color="#fff" />
          <Text style={styles.message}>{message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 9999,
  },
  message: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
});
