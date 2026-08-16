import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { authStore } from '../store/useAuthStore';
import { ENV } from '../config/env';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (loginEmail?: string, loginPassword?: string) => {
    const targetEmail = loginEmail || email;
    const targetPassword = loginPassword || password;

    if (!targetEmail || !targetPassword) {
      setErrorMsg('Email and password are required');
      return;
    }

    setErrorMsg(null);
    setLoading(true);
    try {
      const success = await authStore.login(targetEmail, targetPassword);
      setLoading(false);
      if (!success) {
        const storeErr = authStore.getState().error;
        setErrorMsg(storeErr || 'Login failed. Please check credentials or network.');
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(`Connection error: ${err.message || 'Cannot reach API server'}\nTarget: ${ENV.API_URL}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Brand Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>LL</Text>
          </View>
          <Text style={styles.title}>LinguaLink AI</Text>
          <Text style={styles.subtitle}>Real-time Multilingual Voice Call</Text>
        </View>

        {/* Global Error Banner */}
        {errorMsg && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {/* Quick Test Login Switcher */}
        <View style={styles.quickLoginSection}>
          <Text style={styles.quickLoginLabel}>QUICK DEMO ACCOUNTS (SELECT ROLE)</Text>

          <TouchableOpacity
            style={[styles.quickBtn, styles.quickBtnA]}
            onPress={() => handleLogin('userA@lingualink.ai', 'password123')}
            disabled={loading}
          >
            <Text style={styles.quickBtnText}>Login as Ramesh (Telugu Speaker)</Text>
            <Text style={styles.quickBtnSub}>userA@lingualink.ai</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickBtn, styles.quickBtnB]}
            onPress={() => handleLogin('userB@lingualink.ai', 'password123')}
            disabled={loading}
          >
            <Text style={styles.quickBtnText}>Login as Priya (Hindi Speaker)</Text>
            <Text style={styles.quickBtnSub}>userB@lingualink.ai</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR CUSTOM LOGIN</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Manual Login Form */}
        <TextInput
          style={styles.input}
          placeholder="Email address"
          placeholderTextColor="#64748B"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#64748B"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.submitBtn} onPress={() => handleLogin()} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>Sign In</Text>
          )}
        </TouchableOpacity>

        {/* Server Target Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Server: {ENV.API_URL}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  errorBox: {
    backgroundColor: '#7F1D1D',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  quickLoginSection: {
    marginBottom: 16,
  },
  quickLoginLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#38BDF8',
    marginBottom: 10,
    letterSpacing: 1,
    textAlign: 'center',
  },
  quickBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  quickBtnA: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  quickBtnB: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  quickBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  quickBtnSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#334155',
  },
  dividerText: {
    color: '#64748B',
    fontSize: 11,
    marginHorizontal: 12,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  submitBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#475569',
    fontSize: 11,
  },
});
