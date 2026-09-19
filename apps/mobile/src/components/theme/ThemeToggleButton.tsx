import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Moon, Sun, Eye, Sparkles } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import ThemeSelectorModal from './ThemeSelectorModal';

interface ThemeToggleButtonProps {
  size?: number;
  showModalOnClick?: boolean;
}

export default function ThemeToggleButton({
  size = 20,
  showModalOnClick = true,
}: ThemeToggleButtonProps) {
  const { isDark, activeTheme, toggleTheme, theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const handlePress = () => {
    if (showModalOnClick) {
      setModalVisible(true);
    } else {
      toggleTheme();
    }
  };

  const renderIcon = () => {
    if (activeTheme === 'deep_night') {
      return <Sparkles size={size} color={theme.accent} />;
    }
    if (activeTheme === 'night') {
      return <Eye size={size} color={theme.accent} />;
    }
    if (isDark) {
      return <Moon size={size} color={theme.accent} />;
    }
    return <Sun size={size} color="#f59e0b" />;
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.btn,
          {
            backgroundColor: isDark ? theme.surfaceElevated : 'rgba(0, 0, 0, 0.04)',
            borderColor: isDark ? theme.border : 'rgba(0, 0, 0, 0.08)',
          },
        ]}
        onPress={handlePress}
        onLongPress={() => setModalVisible(true)}
        activeOpacity={0.75}
        accessibilityLabel="Toggle Theme & Night Vision"
      >
        {renderIcon()}
      </TouchableOpacity>

      <ThemeSelectorModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
