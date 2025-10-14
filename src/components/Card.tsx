import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface CardProps {
  title: string;
  description?: string;
  onPress?: () => void;
  variant?: 'default' | 'primary' | 'success';
}

export const Card: React.FC<CardProps> = ({ 
  title, 
  description, 
  onPress, 
  variant = 'default' 
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-500 border-blue-600';
      case 'success':
        return 'bg-green-500 border-green-600';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const getTextVariantClasses = () => {
    switch (variant) {
      case 'primary':
      case 'success':
        return 'text-white';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`${getVariantClasses()} border-2 rounded-lg p-4 shadow-sm mb-3`}
    >
      <Text className={`${getTextVariantClasses()} text-lg font-bold mb-2`}>
        {title}
      </Text>
      {description && (
        <Text className={`${getTextVariantClasses()} opacity-80`}>
          {description}
        </Text>
      )}
    </TouchableOpacity>
  );
};
