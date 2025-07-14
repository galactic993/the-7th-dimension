import React from 'react';
import { Post } from '../types';
import InstagramStylePost from './InstagramStylePost';
import InstagramEmbed from './InstagramEmbed';

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

  // Use Instagram official embed if instagramUrl is available and it's from Instagram source
  if (post.source === 'instagram' && post.instagramUrl) {
    return (
      <div className="cursor-pointer" onClick={() => onClick(post)}>
        <InstagramEmbed 
          url={post.instagramUrl}
          maxWidth={400}
          hideCaption={false}
        />
      </div>
    );
  }

  // Fallback to custom Instagram-style display for mock data or posts without instagramUrl
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