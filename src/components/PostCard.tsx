import React from 'react';
import { Post } from '../types';
import InstagramStylePost from './InstagramStylePost';

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

  // Both Instagram and mock posts use the same Instagram-style display
  return (
    <InstagramStylePost
      post={post}
      onLike={onLike}
      onSave={onSave}
      onClick={onClick}
    />
  );
};

export default PostCard;