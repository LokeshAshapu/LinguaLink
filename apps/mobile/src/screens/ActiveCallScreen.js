"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActiveCallScreen = ActiveCallScreen;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const useCallStore_1 = require("../store/useCallStore");
const config_1 = require("@lingualink/config");
function ActiveCallScreen() {
    const [state, setState] = (0, react_1.useState)(useCallStore_1.callStore.getState());
    (0, react_1.useEffect)(() => {
        const unsubscribe = useCallStore_1.callStore.subscribe(() => {
            setState(useCallStore_1.callStore.getState());
        });
        return unsubscribe;
    }, []);
    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    const remoteLangInfo = state.remoteUserLanguage
        ? config_1.SUPPORTED_LANGUAGES[state.remoteUserLanguage]
        : null;
    return ((0, jsx_runtime_1.jsxs)(react_native_1.SafeAreaView, { style: styles.container, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.topBar, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.statusBadge, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.activeDot }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.statusText, children: state.callStatus })] }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.durationText, children: formatDuration(state.callDurationSeconds) })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.participantSection, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.avatarCircle, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.avatarInitial, children: state.remoteUserName ? state.remoteUserName.charAt(0) : 'P' }) }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.participantName, children: state.remoteUserName || 'Priya (Hindi)' }), (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.languageBadge, children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.languageBadgeText, children: remoteLangInfo ? `${remoteLangInfo.flagEmoji} ${remoteLangInfo.nativeName}` : '🇮🇳 हिन्दी' }) })] }), state.areCaptionsEnabled && ((0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.captionsContainer, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.captionCardOriginal, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.captionLabel, children: "Original (Speaker)" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.captionTextOriginal, children: state.originalCaption || 'మీరు ఎలా ఉన్నారు?' })] }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.captionCardTranslated, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.captionLabelTranslated, children: "Translated (Live Voice)" }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.captionTextTranslated, children: state.translatedCaption || 'आप कैसे हैं?' })] })] })), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.controlsBar, children: [(0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { style: [styles.controlBtn, state.isMuted && styles.controlBtnActive], onPress: () => useCallStore_1.callStore.setState({ isMuted: !state.isMuted }), children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.btnText, children: state.isMuted ? 'Unmute' : 'Mute' }) }), (0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { style: [styles.controlBtn, !state.areCaptionsEnabled && styles.controlBtnInactive], onPress: () => useCallStore_1.callStore.setState({ areCaptionsEnabled: !state.areCaptionsEnabled }), children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.btnText, children: state.areCaptionsEnabled ? 'Captions ON' : 'Captions OFF' }) }), (0, jsx_runtime_1.jsx)(react_native_1.TouchableOpacity, { style: styles.endCallBtn, onPress: () => useCallStore_1.callStore.resetCall(), children: (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.endCallText, children: "End Call" }) })] })] }));
}
const styles = react_native_1.StyleSheet.create({
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
        backgroundColor: '#10B981',
        marginRight: 8,
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
