import Constants from 'expo-constants';
import { NativeModules } from 'react-native';

const getHostIp = (): string => {
  try {
    // 1. Try NativeModules.SourceCode.scriptURL
    const scriptURL = NativeModules.SourceCode?.scriptURL;
    if (scriptURL) {
      const match = scriptURL.match(/https?:\/\/([^/:]+)/);
      if (match && match[1] && match[1] !== '127.0.0.1' && match[1] !== 'localhost') {
        return match[1];
      }
    }

    // 2. Try Expo Constants hostUri
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
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }
  return `http://${host}:3000/api/v1`;
};

const getSignalingUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_SIGNALING_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }
  return `ws://${host}:3000/signaling`;
};

export const ENV = {
  HOST: host,
  API_URL: getApiUrl(),
  SIGNALING_URL: getSignalingUrl(),
};

console.log('[ENV] Resolved Host IP:', host);
console.log('[ENV] Resolved API_URL:', ENV.API_URL);
console.log('[ENV] Resolved SIGNALING_URL:', ENV.SIGNALING_URL);
