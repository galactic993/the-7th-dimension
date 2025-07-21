import React from 'react';
import { User, Sparkles, Heart, Star, Moon, Sun, Leaf, Flower, Zap } from 'lucide-react';

export interface AvatarData {
  icon: string;
  color: string;
}

const ICON_MAP = {
  'ユーザー': User,
  'スパークル': Sparkles,
  'ハート': Heart,
  '星': Star,
  '月': Moon,
  '太陽': Sun,
  '葉': Leaf,
  '花': Flower,
  '雷': Zap,
};

export const parseAvatarString = (avatarString: string): AvatarData | null => {
  try {
    return JSON.parse(avatarString) as AvatarData;
  } catch {
    return null;
  }
};

export const renderAvatar = (avatarString: string, size: 'sm' | 'md' | 'lg' = 'md') => {
  const avatarData = parseAvatarString(avatarString);
  
  if (!avatarData) {
    // Fallback to default image
    return (
      <img 
        src="/images/default.png" 
        alt="Default avatar"
        className={`rounded-full object-cover ${getSizeClasses(size)}`}
      />
    );
  }

  const IconComponent = ICON_MAP[avatarData.icon] || User;
  
  return (
    <div className={`rounded-full ${avatarData.color} flex items-center justify-center ${getSizeClasses(size)}`}>
      <IconComponent className={`text-white ${getIconSizeClasses(size)}`} />
    </div>
  );
};

const getSizeClasses = (size: 'sm' | 'md' | 'lg'): string => {
  switch (size) {
    case 'sm':
      return 'w-8 h-8';
    case 'md':
      return 'w-10 h-10';
    case 'lg':
      return 'w-16 h-16';
    default:
      return 'w-10 h-10';
  }
};

const getIconSizeClasses = (size: 'sm' | 'md' | 'lg'): string => {
  switch (size) {
    case 'sm':
      return 'w-4 h-4';
    case 'md':
      return 'w-5 h-5';
    case 'lg':
      return 'w-8 h-8';
    default:
      return 'w-5 h-5';
  }
};