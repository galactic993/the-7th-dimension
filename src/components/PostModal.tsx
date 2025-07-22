import React, { useState } from 'react';
import { X, Heart, MessageCircle, Bookmark, MapPin, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { Post } from '../types';
import ConvexImage from './ConvexImage';
import ConvexAudio from './ConvexAudio';
import { renderAvatar } from '../utils/avatarUtils';

interface PostModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
}

const PostModal: React.FC<PostModalProps> = ({ post, isOpen, onClose, onLike, onSave }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  if (!isOpen) return null;

  // 画像配列を取得（imagesがあれば使用、なければimageUrlをフォールバック）
  const images = post.images || [post.imageUrl];
  const hasMultipleImages = images.length > 1;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="flex h-full">
          {/* Media Content */}
          <div className="flex-1 bg-black flex items-center justify-center relative">
            {/* Images */}
            {images.length > 0 && (
              <>
                <ConvexImage
                  storageId={images[currentImageIndex]}
                  alt="Post"
                  className="max-w-full max-h-full object-contain"
                />
                
                {/* Multiple images navigation */}
                {hasMultipleImages && (
                  <>
                    {/* Navigation buttons */}
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 z-10 transition-opacity"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 z-10 transition-opacity"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    
                    {/* Image counter */}
                    <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white text-sm px-3 py-1 rounded-full">
                      {currentImageIndex + 1}/{images.length}
                    </div>
                    
                    {/* Dots indicator */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
            
            {/* Audio-only posts */}
            {images.length === 0 && post.audioUrl && (
              <div className="w-full max-w-md p-8">
                <ConvexAudio
                  storageId={post.audioUrl}
                  alt={`${post.user.username}の音声投稿`}
                  className="w-full bg-gray-900"
                  showControls={true}
                  showDownload={true}
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="w-96 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                {renderAvatar(post.user.avatar, 'md')}
                <div>
                  <div className="flex items-center space-x-1">
                    <span className="font-semibold text-gray-900">{post.user.username}</span>
                    {post.user.isVerified && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                  {post.location && (
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span>{post.location}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <MoreHorizontal className="w-5 h-5 text-gray-600" />
                </button>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Audio Content for posts with images */}
            {images.length > 0 && post.audioUrl && (
              <div className="p-4 border-b border-gray-200">
                <ConvexAudio
                  storageId={post.audioUrl}
                  alt={`${post.user.username}の音声投稿`}
                  className="w-full"
                  showControls={true}
                  showDownload={false}
                />
              </div>
            )}

            {/* Caption */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-start space-x-3">
                <img
                  src={post.user.avatar}
                  alt={post.user.displayName}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1">
                  <span className="font-semibold text-gray-900 mr-2">{post.user.username}</span>
                  <span className="text-gray-700">{post.caption}</span>
                  <div className="text-xs text-gray-400 mt-1">{post.timestamp}</div>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-3">
                  <img
                    src={comment.user.avatar}
                    alt={comment.user.displayName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div>
                      <span className="font-semibold text-gray-900 mr-2">{comment.user.username}</span>
                      <span className="text-gray-700">{comment.text}</span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-400">{comment.timestamp}</span>
                      <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
                        {comment.likes}いいね！
                      </button>
                      <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
                        返信
                      </button>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-red-500 transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => onLike(post.id)}
                    className={`transition-all duration-200 ${
                      post.isLiked 
                        ? 'text-red-500 scale-110' 
                        : 'text-gray-700 hover:text-red-500 hover:scale-110'
                    }`}
                  >
                    <Heart className={`w-6 h-6 ${post.isLiked ? 'fill-current' : ''}`} />
                  </button>
                  <button className="text-gray-700 hover:text-gray-900 transition-colors">
                    <MessageCircle className="w-6 h-6" />
                  </button>
                </div>
                <button
                  onClick={() => onSave(post.id)}
                  className={`transition-all duration-200 ${
                    post.isSaved 
                      ? 'text-blue-500 scale-110' 
                      : 'text-gray-700 hover:text-blue-500 hover:scale-110'
                  }`}
                >
                  <Bookmark className={`w-6 h-6 ${post.isSaved ? 'fill-current' : ''}`} />
                </button>
              </div>

              <div className="mb-3">
                <span className="font-semibold text-gray-900">{post.likes.toLocaleString()}</span>
                <span className="text-gray-600 text-sm ml-1">いいね！</span>
              </div>

              {/* Comment Input */}
              <div className="flex items-center space-x-3 pt-3 border-t border-gray-100">
                <input
                  type="text"
                  placeholder="コメントを追加..."
                  className="flex-1 border-none outline-none text-sm py-2"
                />
                <button className="text-blue-500 font-semibold text-sm hover:text-blue-600 transition-colors">
                  投稿
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostModal;