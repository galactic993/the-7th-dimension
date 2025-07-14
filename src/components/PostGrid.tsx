import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Post } from '../types';
import PostCard from './PostCard';

interface PostGridProps {
  posts: Post[];
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onPostClick: (post: Post) => void;
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  onPageChange: (page: number) => void;
}

const PostGrid: React.FC<PostGridProps> = ({ 
  posts, 
  onLike, 
  onSave, 
  onPostClick,
  currentPage,
  totalPages,
  totalPosts,
  onPageChange
}) => {
  const safeCurrentPage = currentPage || 1;
  const safeTotalPages = totalPages || Math.ceil(posts.length / 20);
  const safeTotalPosts = totalPosts || posts.length;



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

  const renderPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, safeCurrentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(safeTotalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-2 mx-1 rounded-lg text-sm font-medium transition-colors ${
            i === safeCurrentPage
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-purple-50 hover:border-purple-300'
          }`}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="space-y-6">
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

      {safeTotalPages > 1 && (
        <div className="flex flex-col items-center space-y-4 py-8">
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => onPageChange(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-purple-50 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              前へ
            </button>

            {safeCurrentPage > 3 && safeTotalPages > 5 && (
              <>
                <button
                  onClick={() => onPageChange(1)}
                  className="px-3 py-2 mx-1 rounded-lg text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-purple-50 hover:border-purple-300"
                >
                  1
                </button>
                {safeCurrentPage > 4 && <span className="px-2 text-gray-500">...</span>}
              </>
            )}

            {renderPageNumbers()}

            {safeCurrentPage < safeTotalPages - 2 && safeTotalPages > 5 && (
              <>
                {safeCurrentPage < safeTotalPages - 3 && <span className="px-2 text-gray-500">...</span>}
                <button
                  onClick={() => onPageChange(safeTotalPages)}
                  className="px-3 py-2 mx-1 rounded-lg text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-purple-50 hover:border-purple-300"
                >
                  {safeTotalPages}
                </button>
              </>
            )}

            <button
              onClick={() => onPageChange(safeCurrentPage + 1)}
              disabled={safeCurrentPage === safeTotalPages}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-purple-50 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300"
            >
              次へ
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          <div className="text-sm text-gray-600">
            {safeTotalPosts}件中 {(safeCurrentPage - 1) * 20 + 1}〜{Math.min(safeCurrentPage * 20, safeTotalPosts)}件を表示
          </div>
        </div>
      )}
    </div>
  );
};

export default PostGrid;