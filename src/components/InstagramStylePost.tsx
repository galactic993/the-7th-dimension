import React, { useState } from 'react';
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { Post } from '../types';
import ConvexImage from './ConvexImage';
import ConvexAudio from './ConvexAudio';
import { renderAvatar } from '../utils/avatarUtils';

interface InstagramStylePostProps {
  post: Post;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onClick: (post: Post) => void;
}

const InstagramStylePost: React.FC<InstagramStylePostProps> = ({ 
  post, 
  onLike, 
  onSave, 
  onClick 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // 画像配列を取得（imagesがあれば使用、なければimageUrlをフォールバック）
  const images = post.images || [post.imageUrl];
  const hasMultipleImages = images.length > 1;

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike(post.id);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave(post.id);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg w-full max-w-sm shadow-sm hover:shadow-md transition-shadow duration-200"
      style={{
        fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center space-x-3">
          {renderAvatar(post.user.avatar, 'sm')}
          <div className="flex items-center space-x-1">
            <span className="font-semibold text-sm text-gray-900">
              {post.user.username}
            </span>
            {post.user.isVerified && (
              <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </div>
          {post.location && (
            <>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-600">{post.location}</span>
            </>
          )}
        </div>
        {/* Three dots menu button - Hidden per user request */}
        {/* 
        <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
          <MoreHorizontal className="w-4 h-4 text-gray-600" />
        </button>
        */}
      </div>

      {/* Media Content */}
      <div 
        className={`w-full cursor-pointer relative ${images.length > 0 ? 'aspect-square' : ''}`}
        onClick={() => onClick(post)}
      >
        {/* Images */}
        {images.length > 0 && (
          <>
            <ConvexImage
              storageId={images[currentImageIndex]}
              alt="Post content"
              className="w-full h-full object-cover"
            />
            
            {/* Multiple images indicator */}
            {hasMultipleImages && (
              <>
                {/* Navigation buttons */}
                {currentImageIndex > 0 && (
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-1 z-10 transition-opacity"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
                
                {currentImageIndex < images.length - 1 && (
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-1 z-10 transition-opacity"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
                
                {/* Image counter */}
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                  {currentImageIndex + 1}/{images.length}
                </div>
                
                {/* Dots indicator */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Audio Content */}
      {post.audioUrl && (
        <div className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
          <ConvexAudio
            storageId={post.audioUrl}
            alt={`${post.user.username}の音声投稿`}
            className="w-full"
            showControls={true}
            showDownload={false}
          />
        </div>
      )}

      {/* Action buttons - Hidden per user request */}
      {/* 
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleLike}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Heart 
              className={`w-6 h-6 ${
                post.isLiked 
                  ? 'fill-red-500 text-red-500' 
                  : 'text-gray-900 hover:text-gray-600'
              }`}
            />
          </button>
          <button 
            onClick={() => onClick(post)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MessageCircle className="w-6 h-6 text-gray-900 hover:text-gray-600" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <Share className="w-6 h-6 text-gray-900 hover:text-gray-600" />
          </button>
        </div>
        <button 
          onClick={handleSave}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Bookmark 
            className={`w-6 h-6 ${
              post.isSaved 
                ? 'fill-gray-900 text-gray-900' 
                : 'text-gray-900 hover:text-gray-600'
            }`}
          />
        </button>
      </div>
      */}

      {/* Likes count - Hidden per user request */}
      {/* 
      <div className="px-3 pb-1">
        <span className="font-semibold text-sm text-gray-900">
          {post.likes.toLocaleString()}件のいいね!
        </span>
      </div>
      */}

      {/* Caption */}
      <div className="px-3 pb-2">
        <span className="text-sm">
          <span className="font-semibold text-gray-900 mr-2">
            {post.user.username}
          </span>
          <span className="text-gray-900">
            {post.caption}
          </span>
        </span>
      </div>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="px-3 pb-2">
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 5).map((tag, index) => (
              <span
                key={`${post.id}-${tag}-${index}`}
                className="text-sm text-blue-900 hover:underline cursor-pointer"
              >
                #{tag}
              </span>
            ))}
            {post.tags.length > 5 && (
              <span className="text-sm text-gray-500">
                +{post.tags.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Comments count */}
      {post.comments.length > 0 && (
        <div className="px-3 pb-2">
          <button 
            onClick={() => onClick(post)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {post.comments.length}件のコメントをすべて表示
          </button>
        </div>
      )}

      {/* Instagram link button */}
      {post.permalink && (
        <div className="px-3 pb-2">
          <a
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span>インスタグラムで表示</span>
          </a>
        </div>
      )}

      {/* Timestamp */}
      <div className="px-3 pb-3">
        <span className="text-xs text-gray-500 uppercase tracking-wide">
          {post.timestamp}
        </span>
      </div>
    </div>
  );
};

export default InstagramStylePost;