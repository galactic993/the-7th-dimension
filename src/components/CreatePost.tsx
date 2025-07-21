import React, { useState, useRef, useEffect } from 'react';
import { X, Image, Video, Mic, Hash, Upload, User, Sparkles, Heart, Star, Moon, Sun, Leaf, Flower, Zap } from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { useUser, SignIn } from '@clerk/clerk-react';
import { api } from '../../convex/_generated/api';

interface CreatePostProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

interface FilePreview {
  file: File;
  url: string;
  type: 'image' | 'video' | 'audio';
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

const CreatePost: React.FC<CreatePostProps> = ({ isOpen, onClose, onPostCreated }) => {
  const [caption, setCaption] = useState('');
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  
  // Profile setup states
  const [profileUsername, setProfileUsername] = useState('');
  const [profileDisplayName, setProfileDisplayName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  
  const { isSignedIn, isLoaded } = useUser();
  const createPost = useMutation(api.posts.createPost);
  const generateUploadUrl = useMutation(api.posts.generateUploadUrl);
  const checkIsFirstPostQuery = useQuery(api.userProfiles.checkIsFirstPost);
  const createProfile = useMutation(api.userProfiles.createUserProfile);
  const checkUsername = useQuery(api.userProfiles.checkUsernameAvailability, 
    profileUsername.length >= 3 ? { username: profileUsername } : "skip"
  );

  // デバッグ: クエリの状態をログ出力
  useEffect(() => {
    console.log('Query state changed:', {
      isOpen,
      isSignedIn,
      isLoaded,
      checkIsFirstPostQuery
    });
  }, [isOpen, isSignedIn, isLoaded, checkIsFirstPostQuery]);

  useEffect(() => {
    if (!isOpen) {
      setShowProfileSetup(false);
      setShowLoginPrompt(false);
      setPendingSubmit(false);
      // Reset profile setup states
      setProfileUsername('');
      setProfileDisplayName('');
      setSelectedAvatar(0);
      setUsernameError('');
    }
  }, [isOpen]);

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

  // ログイン状態が変化した時の処理
  useEffect(() => {
    if (isSignedIn && pendingSubmit) {
      setPendingSubmit(false);
      setShowLoginPrompt(false);
      // ログイン後、投稿処理を続行
      continueSubmission();
    }
  }, [isSignedIn, pendingSubmit]);


  const handleCloseAll = () => {
    setShowProfileSetup(false);
    setShowLoginPrompt(false);
    onClose();
  };

  const validateProfileForm = () => {
    if (profileUsername.length < 3) {
      setUsernameError('ユーザー名は3文字以上で入力してください');
      return false;
    }
    if (checkUsername === false) {
      setUsernameError('このユーザー名は既に使用されています');
      return false;
    }
    if (!profileDisplayName.trim()) {
      return false;
    }
    return true;
  };

  const handleUsernameChange = (value: string) => {
    // Allow only alphanumeric characters and underscores
    const filtered = value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
    setProfileUsername(filtered);
  };

  const handleProfileSubmit = async () => {
    if (!validateProfileForm()) return;

    setIsCreatingProfile(true);
    try {
      const selectedAvatarOption = AVATAR_OPTIONS[selectedAvatar];
      const avatarString = JSON.stringify({
        icon: selectedAvatarOption.name,
        color: selectedAvatarOption.color,
      });

      await createProfile({
        username: profileUsername.trim(),
        displayName: profileDisplayName.trim(),
        avatar: avatarString,
      });

      setShowProfileSetup(false);
      // プロファイル作成後、投稿を実行
      executePostCreation();
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
  };


  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.slice(1)) : [];
  };

  const handleCaptionChange = (text: string) => {
    setCaption(text);
    const extractedTags = extractHashtags(text);
    setTags(extractedTags);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'audio') => {
    const selectedFiles = Array.from(event.target.files || []);
    const validFiles: FilePreview[] = [];
    
    for (const file of selectedFiles) {
      // Limit to 9 total files
      if (files.length + validFiles.length >= 9) {
        alert('最大9個のファイルまでアップロード可能です');
        break;
      }

      // Validate file types
      if (type === 'image' && !file.type.startsWith('image/')) {
        alert('画像ファイルを選択してください');
        continue;
      }
      if (type === 'video' && !file.type.startsWith('video/')) {
        alert('動画ファイルを選択してください');
        continue;
      }
      if (type === 'audio' && !file.type.startsWith('audio/')) {
        alert('音声ファイルを選択してください');
        continue;
      }

      // Check file size (1GB limit)
      if (file.size > 1024 * 1024 * 1024) {
        alert('ファイルサイズは1GB以下にしてください');
        continue;
      }

      const url = URL.createObjectURL(file);
      validFiles.push({ file, url, type });
    }
    
    // Add all valid files at once
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }
    
    // Reset input
    event.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].url);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const uploadFileToConvex = async (file: File): Promise<string> => {
    const uploadUrl = await generateUploadUrl();
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': file.type },
      body: file,
    });

    if (!response.ok) {
      throw new Error('ファイルのアップロードに失敗しました');
    }

    const { storageId } = await response.json();
    return storageId;
  };

  const handleSubmit = async () => {
    if (!caption.trim() && files.length === 0) {
      alert('テキストまたはファイルを追加してください');
      return;
    }

    // ログイン状態をチェック
    if (!isLoaded) {
      return; // まだ読み込み中
    }

    if (!isSignedIn) {
      setPendingSubmit(true);
      setShowLoginPrompt(true);
      return;
    }

    continueSubmission();
  };

  const continueSubmission = async () => {
    // デバッグログを追加
    console.log('continueSubmission called');
    console.log('checkIsFirstPostQuery:', checkIsFirstPostQuery);
    console.log('isSignedIn:', isSignedIn);
    console.log('isLoaded:', isLoaded);

    // 認証エラーの場合は初回投稿として扱う
    if (!isSignedIn || !isLoaded) {
      console.log('User not properly authenticated, showing profile setup');
      setShowProfileSetup(true);
      return;
    }

    // 初回投稿かチェック（queryの結果を使用）
    if (checkIsFirstPostQuery === true) {
      console.log('First post detected, showing profile setup');
      setShowProfileSetup(true);
      return;
    } else if (checkIsFirstPostQuery === undefined) {
      // まだクエリが完了していない場合は初回投稿として扱う
      console.log('Query still loading, treating as first post');
      setShowProfileSetup(true);
      return;
    } else if (checkIsFirstPostQuery === false) {
      console.log('Not first post, proceeding with post creation');
      // 投稿を実行
      executePostCreation();
    } else {
      console.log('Unexpected query result, treating as first post');
      setShowProfileSetup(true);
    }
  };

  const executePostCreation = async () => {
    setIsUploading(true);
    
    try {
      console.log('投稿作成を開始します...');
      console.log('選択されたファイル:', files);
      
      // Upload all files to Convex Storage
      const imageUrls: string[] = [];
      let audioUrl: string | undefined;
      let videoUrl: string | undefined;

      for (const filePreview of files) {
        console.log('ファイルをアップロード中:', filePreview.file.name);
        
        try {
          const storageId = await uploadFileToConvex(filePreview.file);
          console.log('アップロード成功:', storageId);
          
          if (filePreview.type === 'image') {
            imageUrls.push(storageId);
          } else if (filePreview.type === 'video' && !videoUrl) {
            videoUrl = storageId;
          } else if (filePreview.type === 'audio' && !audioUrl) {
            audioUrl = storageId;
          }
        } catch (fileError) {
          console.error('ファイルアップロードエラー:', fileError);
          const errorMessage = fileError instanceof Error ? fileError.message : 'unknown error';
          throw new Error(`ファイル ${filePreview.file.name} のアップロードに失敗しました: ${errorMessage}`);
        }
      }

      console.log('すべてのファイルアップロード完了');
      console.log('imageUrls:', imageUrls);
      console.log('audioUrl:', audioUrl);
      console.log('videoUrl:', videoUrl);

      // Create the post
      console.log('投稿を作成中...');
      const postId = await createPost({
        imageUrls,
        audioUrl,
        videoUrl,
        caption: caption.trim(),
        tags,
        location: undefined,
      });

      console.log('投稿作成成功:', postId);

      // Reset form
      setCaption('');
      setTags([]);
      setFiles([]);
      
      // Clean up file URLs
      files.forEach(file => URL.revokeObjectURL(file.url));
      
      alert('投稿が正常に作成されました！');
      onPostCreated();
      handleCloseAll();
    } catch (error) {
      console.error('投稿作成エラー:', error);
      
      // より詳細なエラーメッセージを表示
      let errorMessage = '投稿の作成に失敗しました。';
      
      if (error instanceof Error) {
        errorMessage += `\n詳細: ${error.message}`;
        
        if (error.message.includes('User must be authenticated')) {
          errorMessage += '\n認証が必要です。ログインしてください。';
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  // プロファイル設定モーダルコンポーネント
  const ProfileSetupModal = () => {
    const selectedAvatarOption = AVATAR_OPTIONS[selectedAvatar];
    const AvatarIcon = selectedAvatarOption.icon;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">プロファイル設定</h2>
            <button
              onClick={handleCloseAll}
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
              <div className="grid grid-cols-3 gap-3">
                {AVATAR_OPTIONS.map((option, index) => {
                  const IconComponent = option.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedAvatar(index)}
                      className={`p-3 rounded-lg border-2 transition-all ${
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
                    {profileDisplayName || 'あなたの表示名'}
                  </div>
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
                value={profileDisplayName}
                onChange={(e) => setProfileDisplayName(e.target.value)}
                placeholder="あなたの表示名"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={30}
              />
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

  // ログインプロンプトコンポーネント
  const LoginPrompt = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">ログインが必要です</h2>
          <button
            onClick={handleCloseAll}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="text-center mb-6">
          <p className="text-gray-600">投稿するにはログインしてください</p>
        </div>
        
        <div className="flex justify-center">
          <SignIn 
            routing="hash"
            appearance={{
              elements: {
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
                card: "shadow-none border-0",
                footerActionLink: { display: "none" },
                footerAction: { display: "none" },
                footerActionText: { display: "none" },
                footer: { display: "none" },
              },
            }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {showLoginPrompt && <LoginPrompt />}
      
      {showProfileSetup && <ProfileSetupModal />}
      
      {isOpen && !showLoginPrompt && !showProfileSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">新しい投稿を作成</h2>
              <button
                onClick={handleCloseAll}
                disabled={isUploading}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* File Upload Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">メディアをアップロード</h3>
            
            {/* File Preview Grid */}
            {files.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                {files.map((filePreview, index) => (
                  <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {filePreview.type === 'image' && (
                      <img src={filePreview.url} alt="" className="w-full h-full object-cover" />
                    )}
                    {filePreview.type === 'video' && (
                      <video src={filePreview.url} className="w-full h-full object-cover" />
                    )}
                    {filePreview.type === 'audio' && (
                      <div className="w-full h-full flex items-center justify-center">
                        <Mic className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Buttons */}
            {files.length < 9 && (
              <div className="flex gap-3">
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Image className="w-4 h-4" />
                  <span className="text-sm">画像</span>
                </button>
                
                <button
                  onClick={() => videoInputRef.current?.click()}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Video className="w-4 h-4" />
                  <span className="text-sm">動画</span>
                </button>
                
                <button
                  onClick={() => audioInputRef.current?.click()}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Mic className="w-4 h-4" />
                  <span className="text-sm">音声</span>
                </button>
              </div>
            )}

            {/* Hidden file inputs */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e, 'image')}
            />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e, 'video')}
            />
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e, 'audio')}
            />
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">キャプション</label>
            <textarea
              value={caption}
              onChange={(e) => handleCaptionChange(e.target.value)}
              placeholder="あなたの体験をシェアしてください..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Hash className="w-4 h-4 mr-1" />
                ハッシュタグ
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
          <div className="flex justify-end gap-3">
            <button
              onClick={handleCloseAll}
              disabled={isUploading}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
            >
              キャンセル
            </button>
            <button
              onClick={handleSubmit}
              disabled={isUploading || (!caption.trim() && files.length === 0)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isUploading && <Upload className="w-4 h-4 animate-spin" />}
              <span>{isUploading ? 'アップロード中...' : '投稿する'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
      )}
    </>
  );
};

export default CreatePost; 