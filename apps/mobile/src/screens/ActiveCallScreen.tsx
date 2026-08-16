import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { callStore, CallStoreState } from '../store/useCallStore';
import { SUPPORTED_LANGUAGES } from '@lingualink/config';

export function ActiveCallScreen() {
  const [state, setState] = useState<CallStoreState>(callStore.getState());

  useEffect(() => {
    const unsubscribe = callStore.subscribe(() => {
      setState(callStore.getState());
    });
    return unsubscribe;
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const remoteLangInfo = state.remoteUserLanguage
    ? SUPPORTED_LANGUAGES[state.remoteUserLanguage]
    : null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar: Connection Quality & Call Duration */}
      <View style={styles.topBar}>
        <View style={styles.statusBadge}>
          <View
            style={[
              styles.activeDot,
              state.callStatus === 'CONNECTED' ? styles.dotConnected : styles.dotCalling,
            ]}
          />
          <Text style={styles.statusText}>{state.callStatus}</Text>
        </View>
        <Text style={styles.durationText}>{formatDuration(state.callDurationSeconds)}</Text>
      </View>

      {/* Error Banner */}
      {state.errorMessage && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{state.errorMessage}</Text>
        </View>
      )}

      {/* Participant Info Header */}
      <View style={styles.participantSection}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial}>
            {state.remoteUserName ? state.remoteUserName.charAt(0) : 'P'}
          </Text>
        </View>
        <Text style={styles.participantName}>{state.remoteUserName || 'Contact'}</Text>
        <View style={styles.languageBadge}>
          <Text style={styles.languageBadgeText}>
            {remoteLangInfo ? `${remoteLangInfo.flagEmoji} ${remoteLangInfo.nativeName}` : 'Multilingual'}
          </Text>
        </View>
        {state.callStatus !== 'CONNECTED' && state.callStatus !== 'FAILED' && (
          <ActivityIndicator color="#38BDF8" style={{ marginTop: 12 }} />
        )}
      </View>

      {/* Live Translated Captions Display */}
      {state.areCaptionsEnabled && (
        <View style={styles.captionsContainer}>
          <View style={styles.captionCardOriginal}>
            <Text style={styles.captionLabel}>Original (Speaker)</Text>
            <Text style={styles.captionTextOriginal}>
              {state.originalCaption || (state.callStatus === 'CONNECTED' ? 'Listening for audio stream...' : 'Connecting audio call...')}
            </Text>
          </View>

          <View style={styles.captionCardTranslated}>
            <Text style={styles.captionLabelTranslated}>Translated (Live Voice)</Text>
            <Text style={styles.captionTextTranslated}>
              {state.translatedCaption || (state.callStatus === 'CONNECTED' ? 'Real-time audio stream connected' : 'Waiting for connection...')}
            </Text>
          </View>
        </View>
      )}

      {/* Call Action Controls */}
      <View style={styles.controlsBar}>
        <TouchableOpacity
          style={[styles.controlBtn, state.isMuted && styles.controlBtnActive]}
          onPress={() => callStore.toggleMute()}
        >
          <Text style={styles.btnText}>{state.isMuted ? 'Unmute' : 'Mute'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlBtn, !state.areCaptionsEnabled && styles.controlBtnInactive]}
          onPress={() => callStore.setState({ areCaptionsEnabled: !state.areCaptionsEnabled })}
        >
          <Text style={styles.btnText}>{state.areCaptionsEnabled ? 'Captions ON' : 'Captions OFF'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.endCallBtn}
          onPress={() => callStore.resetCall()}
        >
          <Text style={styles.endCallText}>End Call</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'space-between',
    padding: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  dotConnected: {
    backgroundColor: '#10B981',
  },
  dotCalling: {
    backgroundColor: '#F59E0B',
  },
  statusText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: 'bold',
  },
  durationText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: '#7F1D1D',
    padding: 10,
    borderRadius: 8,
    marginVertical: 6,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 13,
    textAlign: 'center',
  },
  participantSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  participantName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  languageBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  languageBadgeText: {
    color: '#CBD5E1',
    fontSize: 13,
  },
  captionsContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
  },
  captionCardOriginal: {
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  captionLabel: {
    fontSize: 11,
    color: '#64748B',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  captionTextOriginal: {
    fontSize: 16,
    color: '#94A3B8',
    lineHeight: 22,
  },
  captionCardTranslated: {},
  captionLabelTranslated: {
    fontSize: 11,
    color: '#38BDF8',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  captionTextTranslated: {
    fontSize: 18,
    color: '#38BDF8',
    fontWeight: '600',
    lineHeight: 24,
  },
  controlsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
  },
  controlBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 30,
    minWidth: 90,
    alignItems: 'center',
  },
  controlBtnActive: {
    backgroundColor: '#EF4444',
  },
  controlBtnInactive: {
    backgroundColor: '#475569',
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  endCallBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  endCallText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
