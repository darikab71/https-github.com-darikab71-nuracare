import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { ShieldAlert, X, CheckCircle2 } from 'lucide-react-native';
import { ReportReason } from '../../types/communityTypes';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  targetType: 'post' | 'group' | 'discussion' | 'user';
  targetTitle?: string;
}

const REPORT_REASONS: ReportReason[] = [
  'Harassment',
  'Spam',
  'Hate or abuse',
  'Dangerous content',
  'Medical misinformation',
  'Other',
];

export default function ReportModal({
  visible,
  onClose,
  targetType,
  targetTitle,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!selectedReason) {
      Alert.alert('Selection required', 'Please select a reason for reporting.');
      return;
    }
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSelectedReason(null);
      setDetails('');
      onClose();
    }, 1800);
  };

  const handleClose = () => {
    setSubmitted(false);
    setSelectedReason(null);
    setDetails('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <View style={styles.headerTitleWrap}>
              <ShieldAlert size={18} color="#dc2626" />
              <Text style={styles.headerTitle}>Report {targetType}</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <X size={18} color="#64748b" />
            </TouchableOpacity>
          </View>

          {submitted ? (
            <View style={styles.submittedWrap}>
              <View style={styles.successCircle}>
                <CheckCircle2 size={32} color="#16a34a" />
              </View>
              <Text style={styles.successTitle}>Report Submitted</Text>
              <Text style={styles.successSub}>
                Thanks for helping keep NuraCare supportive and safe. Our moderation team will review this shortly.
              </Text>
            </View>
          ) : (
            <View>
              <Text style={styles.questionText}>What’s wrong with this {targetType}?</Text>
              {targetTitle ? (
                <Text style={styles.targetPreview} numberOfLines={1}>
                  "{targetTitle}"
                </Text>
              ) : null}

              <View style={styles.reasonList}>
                {REPORT_REASONS.map((reason) => {
                  const isSelected = selectedReason === reason;
                  return (
                    <TouchableOpacity
                      key={reason}
                      style={[styles.reasonOption, isSelected && styles.reasonOptionSelected]}
                      onPress={() => setSelectedReason(reason)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                      <Text style={[styles.reasonText, isSelected && styles.reasonTextSelected]}>
                        {reason}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TextInput
                style={styles.detailsInput}
                placeholder="Optional: add any helpful context..."
                placeholderTextColor="#94a3b8"
                value={details}
                onChangeText={setDetails}
                multiline
                maxLength={300}
              />

              <View style={styles.btnRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitBtn, !selectedReason && styles.submitBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={!selectedReason}
                >
                  <Text style={styles.submitBtnText}>Submit Report</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 420,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    textTransform: 'capitalize',
  },
  closeBtn: {
    padding: 4,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 6,
  },
  targetPreview: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  reasonList: {
    gap: 8,
    marginBottom: 14,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  reasonOptionSelected: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#94a3b8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioCircleSelected: {
    borderColor: '#dc2626',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#dc2626',
  },
  reasonText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  reasonTextSelected: {
    color: '#991b1b',
    fontWeight: '600',
  },
  detailsInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    color: '#0f172a',
    minHeight: 64,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  submitBtn: {
    backgroundColor: '#dc2626',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  submitBtnDisabled: {
    backgroundColor: '#fca5a5',
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  submittedWrap: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  successSub: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
});
