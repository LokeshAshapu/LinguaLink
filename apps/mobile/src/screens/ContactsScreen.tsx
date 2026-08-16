import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { User } from '@lingualink/types';
import { contactsApi } from '../services/api/contactsApi';
import { authStore } from '../store/useAuthStore';
import { callStore } from '../store/useCallStore';
import { SUPPORTED_LANGUAGES } from '@lingualink/config';

export function ContactsScreen() {
  const [contacts, setContacts] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = authStore.getState().user;

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await contactsApi.getContacts();
      setContacts(res.contacts);
    } catch (err) {
      console.error('[CONTACTS] Error loading contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleStartCall = (contact: User) => {
    if (!currentUser) return;
    callStore.initiateCall(
      contact.id,
      contact.displayName,
      contact.nativeLanguage,
      currentUser.id,
      currentUser.displayName,
      currentUser.nativeLanguage
    );
  };

  const currentLangInfo = currentUser?.nativeLanguage
    ? SUPPORTED_LANGUAGES[currentUser.nativeLanguage]
    : null;

  return (
    <SafeAreaView style={styles.container}>
      {/* User Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Text style={styles.userInitial}>
              {currentUser?.displayName ? currentUser.displayName.charAt(0) : 'U'}
            </Text>
          </View>
          <View>
            <Text style={styles.userName}>{currentUser?.displayName || 'User'}</Text>
            <Text style={styles.userLang}>
              {currentLangInfo ? `${currentLangInfo.flagEmoji} ${currentLangInfo.name}` : 'Native Speaker'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={() => authStore.logout()}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Directory Title */}
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>Available Contacts</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchContacts}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Contacts List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : contacts.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No available contacts found</Text>
        </View>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => {
            const langInfo = item.nativeLanguage ? SUPPORTED_LANGUAGES[item.nativeLanguage] : null;

            return (
              <View style={styles.card}>
                <View style={styles.cardLeft}>
                  <View style={styles.contactAvatar}>
                    <Text style={styles.contactInitial}>{item.displayName.charAt(0)}</Text>
                  </View>
                  <View style={styles.contactDetails}>
                    <Text style={styles.contactName}>{item.displayName}</Text>
                    <Text style={styles.contactEmail}>{item.email}</Text>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {langInfo ? `${langInfo.flagEmoji} ${langInfo.nativeName}` : item.nativeLanguage}
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => handleStartCall(item)}
                >
                  <Text style={styles.callBtnText}>Call</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInitial: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  userName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userLang: {
    color: '#94A3B8',
    fontSize: 13,
  },
  logoutBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
  },
  refreshBtn: {},
  refreshText: {
    color: '#38BDF8',
    fontSize: 13,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 15,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInitial: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactEmail: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#334155',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 6,
  },
  badgeText: {
    color: '#CBD5E1',
    fontSize: 11,
  },
  callBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 12,
  },
  callBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
