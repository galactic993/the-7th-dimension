import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { X, User, Sparkles, Heart, Star, Moon, Sun, Leaf, Flower, Zap } from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface ProfileSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileCreated: () => void;
}

const AVATAR_OPTIONS = [
  { icon: User, color: 'bg-gray-500', name: 'ユーザー' },
  { icon: Sparkles, color: 'bg-purple-500', name: 'スパークル' },
  { icon: Heart, color: 'bg-pink-500', name: 'ハート' },
  { icon: Star, color: 'bg-yellow-500', name: '星' },
  { icon: Moon, color: 'bg-indigo-500', name: '月' },
  { icon: Sun, color: 'bg-orange-500', name: '太陽' },
  { icon: Leaf, color: 'bg-green-500', name: '葉' },
  { icon: Flower, color: 'bg-rose-500', name: '花' },
  { icon: Zap, color: 'bg-blue-500', name: '雷' },
];

const ProfileSetup: React.FC<ProfileSetupProps> = ({ isOpen, onClose, onProfileCreated }) => {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameError, setUsernameError] = useState('');

  const createProfile = useMutation(api.userProfiles.createUserProfile);
  const debouncedUsername = useMemo(() => {
    return username.length >= 3 ? username : null;
  }, [username]);

  const checkUsername = useQuery(api.userProfiles.checkUsernameAvailability, 
    debouncedUsername ? { username: debouncedUsername } : "skip"
  );

  useEffect(() => {
    if (username.length >= 3 && checkUsername === false) {
      setUsernameError('このユーザー名は既に使用されています');
    } else if (username.length >= 3 && checkUsername === true) {
      setUsernameError('');
    } else if (username.length > 0 && username.length < 3) {
      setUsernameError('ユーザー名は3文字以上で入力してください');
    } else {
      setUsernameError('');
    }
  }, [username, checkUsername]);

  const validateForm = () => {
    if (username.length < 3) {
      setUsernameError('ユーザー名は3文字以上で入力してください');
      return false;
    }
    if (checkUsername === false) {
      setUsernameError('このユーザー名は既に使用されています');
      return false;
    }
    if (!displayName.trim()) {
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const selectedAvatarOption = AVATAR_OPTIONS[selectedAvatar];
      const avatarString = JSON.stringify({
        icon: selectedAvatarOption.name,
        color: selectedAvatarOption.color,
      });

      await createProfile({
        username: username.trim(),
        displayName: displayName.trim(),
        avatar: avatarString,
      });

      onProfileCreated();
      onClose();
    } catch (error) {
      console.error('プロファイル作成エラー:', error);
      if (error instanceof Error) {
        if (error.message.includes('already taken')) {
          setUsernameError('このユーザー名は既に使用されています');
        } else {
          alert(`プロファイル作成に失敗しました: ${error.message}`);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUsernameChange = useCallback((value: string) => {
    // Allow only alphanumeric characters and underscores
    const filtered = value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
    setUsername(filtered);
  }, []);

  if (!isOpen) return null;

  const selectedAvatarOption = AVATAR_OPTIONS[selectedAvatar];
  const AvatarIcon = selectedAvatarOption.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">プロファイル設定</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">

          {/* Avatar Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">アイコンを選択</label>
            <div className="grid grid-cols-3 gap-3">
              {AVATAR_OPTIONS.map((option, index) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedAvatar(index)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedAvatar === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full ${option.color} flex items-center justify-center mx-auto mb-2`}>
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs text-gray-600">{option.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center space-x-3">
              <div className={`w-10 h-10 rounded-full ${selectedAvatarOption.color} flex items-center justify-center`}>
                <AvatarIcon className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">
                  {displayName || 'あなたの表示名'}
                </div>
                <div className="text-sm text-gray-500">
                  @{username || 'username'}
                </div>
              </div>
            </div>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">ユーザー名 *</label>
            <input
              type="text"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              placeholder="username"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                usernameError ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={20}
            />
            {usernameError && (
              <p className="text-sm text-red-600">{usernameError}</p>
            )}
            <p className="text-xs text-gray-500">
              3文字以上、英数字とアンダースコアのみ使用可能
            </p>
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">表示名 *</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="あなたの表示名"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={30}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !validateForm()}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'プロファイル作成中...' : 'プロファイルを作成'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;