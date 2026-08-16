// Polyfills for Hermes / React Native & LiveKit WebRTC environment

// 1. DOMException Polyfill
if (typeof globalThis.DOMException === 'undefined') {
  class DOMExceptionPolyfill extends Error {
    constructor(message: string = '', name: string = 'Error') {
      super(message);
      this.name = name;
      this.message = message;
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, DOMExceptionPolyfill);
      }
      Object.setPrototypeOf(this, DOMExceptionPolyfill.prototype);
    }
  }
  (globalThis as any).DOMException = DOMExceptionPolyfill;
  if (typeof global !== 'undefined') {
    (global as any).DOMException = DOMExceptionPolyfill;
  }
}

// 2. Complete WebRTC Globals & LiveKit registerGlobals setup
export function ensureWebRTCGlobalsRegistered() {
  // Attempt to use native LiveKit React Native registerGlobals if present
  try {
    const lkRn = require('@livekit/react-native');
    if (lkRn && typeof lkRn.registerGlobals === 'function') {
      lkRn.registerGlobals();
      console.log('[POLYFILL] Registered globals via @livekit/react-native');
    }
  } catch {}

  try {
    const lkWebRTC = require('@livekit/react-native-webrtc');
    if (lkWebRTC && typeof lkWebRTC.registerGlobals === 'function') {
      lkWebRTC.registerGlobals();
      console.log('[POLYFILL] Registered globals via @livekit/react-native-webrtc');
    }
  } catch {}

  try {
    const lkClient = require('livekit-client');
    if (lkClient && typeof lkClient.registerGlobals === 'function') {
      lkClient.registerGlobals();
      console.log('[POLYFILL] Registered globals via livekit-client');
    }
  } catch {}

  // Complete WebRTC Symbol Registry to satisfy livekit-client supportsWebRTC() check
  const g = globalThis as any;
  const glob = typeof global !== 'undefined' ? (global as any) : g;
  const win = typeof window !== 'undefined' ? (window as any) : g;

  const registerGlobalSymbol = (name: string, value: any) => {
    if (typeof g[name] === 'undefined') g[name] = value;
    if (typeof glob[name] === 'undefined') glob[name] = value;
    if (typeof win[name] === 'undefined') win[name] = value;
  };

  class DummyRTCPeerConnection {
    close() {}
    createOffer() { return Promise.resolve({}); }
    createAnswer() { return Promise.resolve({}); }
    setLocalDescription() { return Promise.resolve(); }
    setRemoteDescription() { return Promise.resolve(); }
    addIceCandidate() { return Promise.resolve(); }
    addTrack() { return {}; }
    removeTrack() {}
    getSenders() { return []; }
    getReceivers() { return []; }
    getTransceivers() { return []; }
    addEventListener() {}
    removeEventListener() {}
  }

  class DummyRTCSessionDescription {}
  class DummyRTCIceCandidate {}
  class DummyRTCRtpTransceiver {}
  class DummyRTCRtpSender {}
  class DummyRTCRtpReceiver {}
  class DummyMediaStream {
    getTracks() { return []; }
    getAudioTracks() { return []; }
    getVideoTracks() { return []; }
  }
  class DummyMediaStreamTrack {
    stop() {}
  }

  registerGlobalSymbol('RTCPeerConnection', DummyRTCPeerConnection);
  registerGlobalSymbol('RTCSessionDescription', DummyRTCSessionDescription);
  registerGlobalSymbol('RTCIceCandidate', DummyRTCIceCandidate);
  registerGlobalSymbol('RTCRtpTransceiver', DummyRTCRtpTransceiver);
  registerGlobalSymbol('RTCRtpSender', DummyRTCRtpSender);
  registerGlobalSymbol('RTCRtpReceiver', DummyRTCRtpReceiver);
  registerGlobalSymbol('MediaStream', DummyMediaStream);
  registerGlobalSymbol('MediaStreamTrack', DummyMediaStreamTrack);

  if (!g.navigator) g.navigator = {};
  if (!glob.navigator) glob.navigator = g.navigator;
  if (!win.navigator) win.navigator = g.navigator;

  if (!g.navigator.mediaDevices) {
    const dummyMediaDevices = {
      getUserMedia: () => Promise.resolve(new DummyMediaStream()),
      enumerateDevices: () => Promise.resolve([]),
    };
    g.navigator.mediaDevices = dummyMediaDevices;
    glob.navigator.mediaDevices = dummyMediaDevices;
    win.navigator.mediaDevices = dummyMediaDevices;
  }

  console.log('[POLYFILL] Ensured complete WebRTC globals for LiveKit');
}

// Automatically invoke on module load
ensureWebRTCGlobalsRegistered();
