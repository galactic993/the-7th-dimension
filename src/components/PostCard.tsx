import React from 'react';
import { Heart, MessageCircle, Bookmark } from 'lucide-react';
import { Post } from '../types';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onClick: (post: Post) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onSave, onClick }) => {
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
      className="relative aspect-square bg-white rounded-lg overflow-hidden cursor-pointer group shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      onClick={() => onClick(post)}
    >
      {/* Image */}
      <img
        src={post.imageUrl}
        alt="Post"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      
      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <div className="flex items-center space-x-6 text-white">
          <div className="flex items-center space-x-2">
            <Heart className="w-6 h-6 fill-current" />
            <span className="font-semibold">{post.likes.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-6 h-6 fill-current" />
            <span className="font-semibold">{post.comments.length}</span>
          </div>
        </div>
      </div>

      {/* User info overlay */}
      <div className="absolute top-3 left-3 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <img
          src={post.user.avatar}
          alt={post.user.displayName}
          className="w-8 h-8 rounded-full object-cover border-2 border-white"
        />
        <span className="text-white font-semibold text-sm drop-shadow-lg">
          {post.user.username}
        </span>
        {post.user.isVerified && (
          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
        )}
      </div>

      {/* Tags indicator */}
      {post.tags.length > 0 && (
        <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-black/60 text-white text-xs rounded-full backdrop-blur-sm"
              >
                #{tag}
              </span>
            ))}
            {post.tags.length > 2 && (
              <span className="px-2 py-1 bg-black/60 text-white text-xs rounded-full backdrop-blur-sm">
                +{post.tags.length - 2}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;