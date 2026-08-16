import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal } from 'react-native';
import { callStore, IncomingCallData } from '../store/useCallStore';
import { authStore } from '../store/useAuthStore';
import { SUPPORTED_LANGUAGES } from '@lingualink/config';

interface IncomingCallModalProps {
  incomingCall: IncomingCallData | null;
}

export function IncomingCallModal({ incomingCall }: IncomingCallModalProps) {
  if (!incomingCall) return null;

  const currentUser = authStore.getState().user;

  const handleAccept = () => {
    if (currentUser) {
      callStore.acceptIncomingCall(currentUser.id);
    }
  };

  const handleReject = () => {
    callStore.rejectIncomingCall();
  };

  const langInfo = incomingCall.callerLanguage
    ? SUPPORTED_LANGUAGES[incomingCall.callerLanguage]
    : null;

  return (
    <Modal visible={true} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.ringingLabel}>INCOMING VOICE CALL...</Text>

          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>
              {incomingCall.callerName ? incomingCall.callerName.charAt(0) : 'C'}
            </Text>
          </View>

          <Text style={styles.callerName}>{incomingCall.callerName}</Text>

          <View style={styles.languageBadge}>
            <Text style={styles.languageBadgeText}>
              {langInfo ? `${langInfo.flagEmoji} Speaks ${langInfo.nativeName}` : 'Incoming Call'}
            </Text>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={handleReject}>
              <Text style={styles.actionBtnText}>Decline</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} onPress={handleAccept}>
              <Text style={styles.actionBtnText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  ringingLabel: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 40,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarInitial: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  callerName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  languageBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 60,
  },
  languageBadgeText: {
    color: '#CBD5E1',
    fontSize: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  actionBtn: {
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 32,
    minWidth: 130,
    alignItems: 'center',
  },
  rejectBtn: {
    backgroundColor: '#DC2626',
  },
  acceptBtn: {
    backgroundColor: '#10B981',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
