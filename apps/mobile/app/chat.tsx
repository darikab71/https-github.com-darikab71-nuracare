import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { Send, Bot, ArrowLeft, Mic, MicOff, AlertTriangle, Globe, Sparkles } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useChatStore } from '../src/store';
import { useProfile } from '../src/context/ProfileContext';
import { useTheme } from '../src/context/ThemeContext';
import { SupportedLanguage, SUPPORTED_LANGUAGES } from '../src/ai/aiTypes';
import { TRILINGUAL_PROMPTS } from '../src/ai/trilingualPrompts';
import { classifyHealthQuery } from '../src/ai/safetyClassifier';
import { buildMinimizedContext } from '../src/ai/contextMinimizer';
import PermissionExplanationModal from '../src/permissions/components/PermissionExplanationModal';
import { permissionService } from '../src/permissions/permissionService';

export default function ChatScreen() {
  const { prompt: paramPrompt } = useLocalSearchParams<{ prompt?: string }>();
  const { messages, addMessage } = useChatStore() as any;
  const { profile } = useProfile();
  const { theme, isDark } = useTheme();
  
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('en');
  const [input, setInput] = useState(paramPrompt || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [emergencyAlert, setEmergencyAlert] = useState<string | null>(null);
  const [showMicModal, setShowMicModal] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const prompts = TRILINGUAL_PROMPTS[selectedLanguage];

  useEffect(() => {
    if (paramPrompt && !input) {
      setInput(paramPrompt);
    }
  }, [paramPrompt]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setEmergencyAlert(null);

    // 1. Safety Classification
    const safety = classifyHealthQuery(userText);
    if (!safety.safeToProceed && safety.emergencyGuidance) {
      setEmergencyAlert(safety.emergencyGuidance);
      addMessage({
        id: `msg_${Date.now()}`,
        role: 'user',
        content: userText,
        created_at: new Date().toISOString()
      });
      addMessage({
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: safety.emergencyGuidance,
        created_at: new Date().toISOString()
      });
      return;
    }

    // 2. Add user message
    const userMsg = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: userText,
      created_at: new Date().toISOString()
    };
    addMessage(userMsg);
    setIsLoading(true);

    // 3. Build Minimized Context (Consent-aware)
    const context = buildMinimizedContext(profile, [], userText);

    // 4. Generate context-aware response
    setTimeout(() => {
      let aiResponseText = '';
      if (selectedLanguage === 'am') {
        aiResponseText = `ጤና ይስጥልኝ! መልዕክትዎን ተመልክቻለሁ። እንደ እርስዎ የሰውነት ዕረፍት ሁኔታ (Recovery ${context?.recoveryScore ?? 84}%)፣ ዛሬ የተመጣጠነ ምግብ (ሽሮ፣ ጤፍና ተልባ) መመገብና በቂ ውኃ መጠጣት ይመከራል።`;
      } else if (selectedLanguage === 'om') {
        aiResponseText = `Akkam jirtu! Ergaa keessan argeera. Haala boqonnaa keessan irratti hundaa'uun (Recovery ${context?.recoveryScore ?? 84}%), har'a bishaan gahaa dhuguu fi soorata madaalawaa soorachuun baay'ee gaariidha.`;
      } else {
        aiResponseText = `Based on your recovery level (${context?.recoveryScore ?? 84}%), your energy is in a good range. If you are observing Ethiopian fasting (Tsom), ensure you get sufficient plant proteins like lentils, chickpeas, and flaxseed.`;
      }

      addMessage({
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: aiResponseText,
        created_at: new Date().toISOString()
      });
      setIsLoading(false);
    }, 950);
  };

  const handleVoicePress = async () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }
    const hasPermission = await permissionService.checkPermission('microphone');
    if (!hasPermission) {
      setShowMicModal(true);
      return;
    }
    toggleRecording();
  };

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        const samplePrompt = selectedLanguage === 'am' 
          ? 'ስለ ጾም ምግብና የሰውነት ዕረፍት ንገረኝ'
          : selectedLanguage === 'om'
          ? 'Soorata soomaa fi boqonnaa naaf ibsi'
          : 'Can you give me a personalized recovery summary for today?';
        setInput(samplePrompt);
      }, 3500);
    } else {
      setIsRecording(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: theme.surfaceElevated }]}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <View style={[styles.botBadge, { backgroundColor: theme.accent }]}>
          <Bot size={20} color="#ffffff" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Nura AI Companion</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Private • Localized Health Intelligence</Text>
        </View>
      </View>

      {/* Language Selector Bar */}
      <View style={[styles.languageBar, { backgroundColor: theme.surface, borderBottomColor: theme.borderSubtle }]}>
        <Globe size={14} color={theme.textTertiary} />
        {SUPPORTED_LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            onPress={() => setSelectedLanguage(lang.code)}
            style={[
              styles.langChip,
              { backgroundColor: theme.surfaceElevated },
              selectedLanguage === lang.code && { backgroundColor: theme.accentDeep, borderColor: theme.accent, borderWidth: 1 }
            ]}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.langText,
              { color: theme.textSecondary },
              selectedLanguage === lang.code && { color: theme.accent, fontWeight: '700' }
            ]}>
              {lang.nativeLabel}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Emergency Guidance Banner */}
      {emergencyAlert && (
        <View style={[styles.emergencyBanner, { backgroundColor: theme.errorBackground, borderColor: theme.error + '40' }]}>
          <AlertTriangle size={18} color={theme.error} />
          <Text style={[styles.emergencyText, { color: theme.error }]}>{emergencyAlert}</Text>
        </View>
      )}

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef} 
        style={styles.chatArea} 
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconCircle, { backgroundColor: theme.accentGlow }]}>
              <Sparkles size={36} color={theme.accent} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>{prompts.greeting}</Text>
            <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>
              Ask in English, Amharic (አማርኛ), or Afaan Oromo. Nura provides personalized lifestyle guidance.
            </Text>
            <View style={[styles.disclaimerPill, { backgroundColor: theme.surfaceElevated }]}>
              <Text style={[styles.disclaimerText, { color: theme.textTertiary }]}>{prompts.disclaimers}</Text>
            </View>
          </View>
        ) : (
          messages.map((msg: any) => {
            const isUser = msg.role === 'user';
            return (
              <View 
                key={msg.id} 
                style={[
                  styles.messageBubble, 
                  isUser 
                    ? [styles.userBubble, { backgroundColor: theme.userBubble }] 
                    : [styles.aiBubble, { backgroundColor: theme.aiBubble, borderColor: theme.aiBubbleBorder }]
                ]}
              >
                <Text style={[
                  styles.messageText, 
                  isUser ? [styles.userText, { color: theme.userBubbleText }] : [styles.aiText, { color: theme.aiBubbleText }]
                ]}>
                  {msg.content}
                </Text>
              </View>
            );
          })
        )}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.accent} />
            <Text style={[styles.loadingText, { color: theme.textTertiary }]}>Nura is thinking...</Text>
          </View>
        )}
      </ScrollView>

      {/* Voice Recording Waveform Indicator */}
      {isRecording && (
        <View style={[styles.recordingBar, { backgroundColor: theme.errorBackground }]}>
          <Text style={[styles.recordingText, { color: theme.error }]}>Listening in {SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.nativeLabel}...</Text>
          <TouchableOpacity style={[styles.stopRecordBtn, { backgroundColor: theme.error }]} onPress={toggleRecording}>
            <Text style={styles.stopRecordText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Input Area */}
      <View style={[styles.inputArea, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <TouchableOpacity 
          style={[
            styles.micBtn, 
            { backgroundColor: isRecording ? theme.error : theme.accentGlow },
            isRecording && styles.micBtnActive
          ]} 
          onPress={handleVoicePress}
          activeOpacity={0.7}
        >
          {isRecording ? <MicOff size={20} color="#ffffff" /> : <Mic size={20} color={theme.accent} />}
        </TouchableOpacity>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.inputBackground,
              borderColor: theme.inputBorder,
              color: theme.inputText,
            }
          ]}
          value={input}
          onChangeText={setInput}
          placeholder={prompts.placeholder}
          placeholderTextColor={theme.placeholderText}
          multiline
          maxLength={400}
        />

        <TouchableOpacity 
          style={[
            styles.sendBtn, 
            { backgroundColor: theme.accent },
            !input.trim() && { backgroundColor: isDark ? theme.surfaceElevated : '#cbd5e1' }
          ]} 
          onPress={handleSend}
          disabled={!input.trim() || isLoading}
          activeOpacity={0.8}
        >
          <Send size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Microphone Permission Explanation Modal */}
      <PermissionExplanationModal
        visible={showMicModal}
        type="microphone"
        onCancel={() => setShowMicModal(false)}
        onContinue={async () => {
          setShowMicModal(false);
          await permissionService.requestPermission('microphone');
          toggleRecording();
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 14, 
    paddingTop: Platform.OS === 'ios' ? 52 : 40, 
    borderBottomWidth: 1,
  },
  backBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  botBadge: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800' },
  headerSubtitle: { fontSize: 12 },
  languageBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, gap: 8 },
  langChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  langText: { fontSize: 12, fontWeight: '600' },
  emergencyBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, marginHorizontal: 16, marginTop: 12, borderRadius: 14, borderWidth: 1 },
  emergencyText: { flex: 1, fontSize: 12, lineHeight: 18, fontWeight: '600' },
  chatArea: { flex: 1 },
  chatContent: { padding: 16, paddingBottom: 24 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, marginTop: 60 },
  emptyIconCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  emptyDesc: { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 16 },
  disclaimerPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  disclaimerText: { fontSize: 11, textAlign: 'center' },
  messageBubble: { maxWidth: '82%', borderRadius: 18, padding: 14, marginBottom: 12 },
  userBubble: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  aiBubble: { alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1 },
  messageText: { fontSize: 15, lineHeight: 22 },
  userText: { fontWeight: '500' },
  aiText: { fontWeight: '400' },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 12 },
  loadingText: { fontSize: 13, fontStyle: 'italic' },
  recordingBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  recordingText: { fontWeight: '700', fontSize: 13 },
  stopRecordBtn: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  stopRecordText: { color: '#ffffff', fontWeight: '700', fontSize: 12 },
  inputArea: { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, gap: 10 },
  micBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  micBtnActive: {},
  input: { flex: 1, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100, borderWidth: 1 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
});
