import Constants from 'expo-constants';
import { NativeModules } from 'react-native';

const DEFAULT_RENDER_API_URL = 'https://lingualink-api.onrender.com/api/v1';
const DEFAULT_RENDER_SIGNALING_URL = 'wss://lingualink-api.onrender.com/signaling';
const DEFAULT_LIVEKIT_URL = 'wss://lingualink-api.onrender.com/livekit';

const getHostIp = (): string => {
  try {
    const scriptURL = NativeModules.SourceCode?.scriptURL;
    if (scriptURL) {
      const match = scriptURL.match(/https?:\/\/([^/:]+)/);
      if (match && match[1] && match[1] !== '127.0.0.1' && match[1] !== 'localhost') {
        return match[1];
      }
    }

    const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest?.debuggerHost || (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip && ip !== '127.0.0.1' && ip !== 'localhost') {
        return ip;
      }
    }
  } catch (err) {
    console.warn('[ENV] Failed to extract host IP:', err);
  }

  return '10.174.48.182';
};

const host = getHostIp();

const getApiUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && envUrl.startsWith('http')) {
    return envUrl;
  }
  return DEFAULT_RENDER_API_URL;
};

const getSignalingUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_SIGNALING_URL;
  if (envUrl && (envUrl.startsWith('ws') || envUrl.startsWith('wss'))) {
    return envUrl;
  }
  return DEFAULT_RENDER_SIGNALING_URL;
};

const getLiveKitUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_LIVEKIT_URL;
  if (envUrl && (envUrl.startsWith('ws') || envUrl.startsWith('wss'))) {
    return envUrl;
  }
  return DEFAULT_LIVEKIT_URL;
};

export const ENV = {
  HOST: host,
  API_URL: getApiUrl(),
  SIGNALING_URL: getSignalingUrl(),
  LIVEKIT_URL: getLiveKitUrl(),
};

console.log('[ENV] Resolved API_URL:', ENV.API_URL);
console.log('[ENV] Resolved SIGNALING_URL:', ENV.SIGNALING_URL);
console.log('[ENV] Resolved LIVEKIT_URL:', ENV.LIVEKIT_URL);
