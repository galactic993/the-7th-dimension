import React from 'react';
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal } from 'lucide-react';
import { Post } from '../types';

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
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike(post.id);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave(post.id);
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
          <img
            src={post.user.avatar}
            alt={post.user.displayName}
            className="w-8 h-8 rounded-full object-cover"
          />
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

      {/* Image */}
      <div 
        className="aspect-square w-full cursor-pointer"
        onClick={() => onClick(post)}
      >
        <img
          src={post.imageUrl}
          alt="Post content"
          className="w-full h-full object-cover"
        />
      </div>

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
            {post.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
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