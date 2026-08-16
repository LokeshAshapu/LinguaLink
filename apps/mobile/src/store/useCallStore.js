"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callStore = exports.CallStore = void 0;
class CallStore {
    state = {
        currentCallId: null,
        callStatus: 'IDLE',
        remoteUserId: null,
        remoteUserName: null,
        remoteUserLanguage: null,
        isMuted: false,
        isSpeakerOn: true,
        areCaptionsEnabled: true,
        callDurationSeconds: 0,
        originalCaption: '',
        translatedCaption: '',
    };
    listeners = [];
    getState() {
        return { ...this.state };
    }
    setState(partial) {
        this.state = { ...this.state, ...partial };
        this.notify();
    }
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }
    notify() {
        this.listeners.forEach((l) => l());
    }
    resetCall() {
        this.setState({
            currentCallId: null,
            callStatus: 'IDLE',
            remoteUserId: null,
            remoteUserName: null,
            remoteUserLanguage: null,
            isMuted: false,
            callDurationSeconds: 0,
            originalCaption: '',
            translatedCaption: '',
        });
    }
}
exports.CallStore = CallStore;
exports.callStore = new CallStore();
