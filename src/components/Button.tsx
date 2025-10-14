import React from 'react';
import { TouchableOpacity, Text, ViewStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  className?: string;
  textClassName?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  className,
  textClassName,
}) => {
  const getVariantClasses = () => {
    if (disabled) {
      return 'bg-gray-300 border-gray-300';
    }
    
    switch (variant) {
      case 'secondary':
        return 'bg-gray-500 border-gray-600';
      case 'outline':
        return 'bg-transparent border-2 border-blue-500';
      default:
        return 'bg-blue-500 border-blue-600';
    }
  };

  const getTextVariantClasses = () => {
    if (disabled) {
      return 'text-gray-500';
    }
    
    switch (variant) {
      case 'outline':
        return 'text-blue-500';
      default:
        return 'text-white';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'py-2 px-4';
      case 'large':
        return 'py-4 px-8';
      default:
        return 'py-3 px-6';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`${getVariantClasses()} ${getSizeClasses()} rounded-lg items-center justify-center mb-3 ${className || ''}`}
      style={style}
    >
      <Text className={`${getTextVariantClasses()} font-semibold text-base ${textClassName || ''}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
