import React from 'react';
import { Post } from '../types';
import PostCard from './PostCard';

interface PostGridProps {
  posts: Post[];
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onPostClick: (post: Post) => void;
}

const PostGrid: React.FC<PostGridProps> = ({ posts, onLike, onSave, onPostClick }) => {
  if (posts.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-6xl mb-4">📱</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">投稿が見つかりません</h3>
          <p className="text-gray-600">検索条件を変更してみてください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <div key={post.id} className="flex justify-center">
          <PostCard
            post={post}
            onLike={onLike}
            onSave={onSave}
            onClick={onPostClick}
          />
        </div>
      ))}
    </div>
  );
};

export default PostGrid;