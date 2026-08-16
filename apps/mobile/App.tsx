import './src/polyfills';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { authStore, AuthStoreState } from './src/store/useAuthStore';
import { callStore, CallStoreState } from './src/store/useCallStore';
import { signalingService } from './src/services/signaling/SignalingService';
import { LoginScreen } from './src/screens/LoginScreen';
import { ContactsScreen } from './src/screens/ContactsScreen';
import { ActiveCallScreen } from './src/screens/ActiveCallScreen';
import { IncomingCallModal } from './src/screens/IncomingCallModal';

export default function App() {
  const [authState, setAuthState] = useState<AuthStoreState>(authStore.getState());
  const [callState, setCallState] = useState<CallStoreState>(callStore.getState());

  useEffect(() => {
    // Restore saved user session on launch
    authStore.loadStoredSession();

    const unsubAuth = authStore.subscribe(() => {
      setAuthState(authStore.getState());
    });

    const unsubCall = callStore.subscribe(() => {
      setCallState(callStore.getState());
    });

    return () => {
      unsubAuth();
      unsubCall();
    };
  }, []);

  useEffect(() => {
    if (authState.isAuthenticated && authState.token) {
      // Connect WebSocket signaling gateway & setup call listeners
      signalingService.connect(authState.token).then(() => {
        callStore.setupSignalingListeners();
      }).catch((err) => {
        console.warn('[APP] Signaling connection failed:', err);
      });
    } else {
      signalingService.disconnect();
    }
  }, [authState.isAuthenticated, authState.token]);

  if (authState.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!authState.isAuthenticated) {
    return <LoginScreen />;
  }

  const isCallActive = callState.callStatus !== 'IDLE';

  return (
    <View style={styles.container}>
      {isCallActive ? <ActiveCallScreen /> : <ContactsScreen />}
      <IncomingCallModal incomingCall={callState.incomingCall} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
