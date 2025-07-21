import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Image, User, Sparkles, Heart, Star, Moon, Sun, Leaf, Flower, Zap } from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileCreated: () => void;
  uploadFileToConvex: (file: File) => Promise<string>;
}

const AVATAR_OPTIONS = [
  { icon: User, color: 'bg-gray-500', name: 'ユーザー' },
  { icon: Sparkles, color: 'bg-purple-500', name: 'スパークル' },
  { icon: Heart, color: 'bg-pink-500', name: 'ハート' },
  { icon: Star, color: 'bg-yellow-500', name: '星' },
  { icon: Moon, color: 'bg-indigo-500', name: '月' },
  { icon: Sun, color: 'bg-orange-500', name: '太陽' },
];

const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({ 
  isOpen, 
  onClose, 
  onProfileCreated,
  uploadFileToConvex 
}) => {
  const [profileUsername, setProfileUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [usernameError, setUsernameError] = useState('');

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const createProfile = useMutation(api.userProfiles.createUserProfile);
  const checkUsername = useQuery(api.userProfiles.checkUsernameAvailability, 
    profileUsername.length >= 3 ? { username: profileUsername } : "skip"
  );

  // Username validation
  useEffect(() => {
    if (profileUsername.length >= 3 && checkUsername === false) {
      setUsernameError('このユーザー名は既に使用されています');
    } else if (profileUsername.length >= 3 && checkUsername === true) {
      setUsernameError('');
    } else if (profileUsername.length > 0 && profileUsername.length < 3) {
      setUsernameError('ユーザー名は3文字以上で入力してください');
    } else {
      setUsernameError('');
    }
  }, [profileUsername, checkUsername]);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setProfileUsername('');
      setSelectedAvatar(0);
      setAvatarFile(null);
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarPreview('');
      setUsernameError('');
    }
  }, [isOpen, avatarPreview]);

  const validateProfileForm = useCallback(() => {
    if (profileUsername.length < 3) {
      setUsernameError('ユーザー名は3文字以上で入力してください');
      return false;
    }
    if (checkUsername === false) {
      setUsernameError('このユーザー名は既に使用されています');
      return false;
    }
    return true;
  }, [profileUsername, checkUsername]);

  const handleUsernameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow alphanumeric characters, underscores, and Japanese characters (hiragana, katakana, kanji)
    const filtered = e.target.value.replace(/[^a-zA-Z0-9_\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '');
    setProfileUsername(filtered);
  }, []);

  const handleAvatarSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('画像ファイルを選択してください');
        return;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('ファイルサイズは5MB以下にしてください');
        return;
      }

      setAvatarFile(file);
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
    // Reset input
    event.target.value = '';
  }, [avatarPreview]);

  const handleProfileSubmit = useCallback(async () => {
    if (!validateProfileForm()) return;

    setIsCreatingProfile(true);
    try {
      let avatarString;

      if (avatarFile) {
        // Upload avatar image to Convex Storage
        const storageId = await uploadFileToConvex(avatarFile);
        avatarString = storageId;
      } else {
        // Use selected icon
        const selectedAvatarOption = AVATAR_OPTIONS[selectedAvatar];
        avatarString = JSON.stringify({
          icon: selectedAvatarOption.name,
          color: selectedAvatarOption.color,
        });
      }

      await createProfile({
        username: profileUsername.trim(),
        displayName: profileUsername.trim(), // Use username as display name
        avatar: avatarString,
      });

      // Clean up avatar preview URL
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
      
      onProfileCreated();
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
      setIsCreatingProfile(false);
    }
  }, [
    validateProfileForm,
    avatarFile,
    uploadFileToConvex,
    selectedAvatar,
    createProfile,
    profileUsername,
    avatarPreview,
    onProfileCreated
  ]);

  if (!isOpen) return null;

  const selectedAvatarOption = AVATAR_OPTIONS[selectedAvatar];
  const AvatarIcon = selectedAvatarOption.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">プロファイル設定</h2>
          <button
            onClick={onClose}
            disabled={isCreatingProfile}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-4">
              はじめての投稿へようこそ！<br />
              まずはプロファイルを設定しましょう。
            </p>
          </div>

          {/* Avatar Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">アイコンを選択</label>
            
            {/* Custom Image Upload */}
            <div className="mb-4">
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
              >
                <div className="text-center">
                  <Image className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">画像をアップロード</p>
                  <p className="text-xs text-gray-500">5MB以下のJPG、PNG</p>
                </div>
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarSelect}
              />
            </div>

            {/* Icon Options */}
            <div className="text-center text-sm text-gray-600 mb-2">または</div>
            <div className="grid grid-cols-3 gap-3">
              {AVATAR_OPTIONS.map((option, index) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedAvatar(index);
                      setAvatarFile(null);
                      if (avatarPreview) {
                        URL.revokeObjectURL(avatarPreview);
                      }
                      setAvatarPreview('');
                    }}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedAvatar === index && !avatarFile
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
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className={`w-10 h-10 rounded-full ${selectedAvatarOption.color} flex items-center justify-center`}>
                  <AvatarIcon className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="text-left">
                <div className="text-sm text-gray-500">
                  @{profileUsername || 'username'}
                </div>
              </div>
            </div>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">ユーザー名 *</label>
            <input
              type="text"
              value={profileUsername}
              onChange={handleUsernameChange}
              placeholder="username"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                usernameError ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={20}
              autoComplete="off"
            />
            {usernameError && (
              <p className="text-sm text-red-600">{usernameError}</p>
            )}
            <p className="text-xs text-gray-500">
              3文字以上、英数字・アンダースコア・日本語使用可能
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
          <button
            onClick={handleProfileSubmit}
            disabled={isCreatingProfile || !validateProfileForm()}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreatingProfile ? 'プロファイル作成中...' : 'プロファイルを作成して投稿'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupModal;