import React, { useState, useMemo } from 'react';
import { useUser } from '@clerk/clerk-react';
import Header from './Header';
import PostGrid from './PostGrid';
import PostModal from './PostModal';
import CreatePost from './CreatePost';
import LoginPromptDialog from './LoginPromptDialog';
import { Post } from '../types';
import { Shuffle, Plus, Loader2 } from 'lucide-react';
import { useConvexPosts } from '../hooks/useConvexPosts';

function MainApp() {
  const { isSignedIn } = useUser();
  // useConvexPostsの検索機能を使用
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isRandomized, setIsRandomized] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });

  const { 
    loading, 
    error,
    currentPage,
    totalPages,
    totalPosts,
    setCurrentPage,
    paginatedPosts,
    setSearchQuery: setConvexSearchQuery,
    searchQuery: convexSearchQuery
  } = useConvexPosts();

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const displayPosts = useMemo(() => {
    if (!paginatedPosts || paginatedPosts.length === 0) {
      return [];
    }
    
    let posts = paginatedPosts;

    if (isRandomized) {
      posts = shuffleArray(posts);
    }
    
    return posts;
  }, [paginatedPosts, isRandomized]);

  const handleRandomShuffle = () => {
    setIsRandomized(!isRandomized);
  };

  const handleLike = (postId: string) => {
    if (!isSignedIn) {
      setLoginPrompt({ isOpen: true, message: 'いいねするにはログインが必要です' });
      return;
    }
    // TODO: Convexのmutationを使ってDBを更新
    console.log('Like post:', postId);
  };

  const handleSave = (postId: string) => {
    if (!isSignedIn) {
      setLoginPrompt({ isOpen: true, message: '保存するにはログインが必要です' });
      return;
    }
    // TODO: Convexのmutationを使ってDBを更新
    console.log('Save post:', postId);
  };

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
  };

  const handleCloseModal = () => {
    setSelectedPost(null);
  };

  const handleCreatePost = () => {
    if (!isSignedIn) {
      setLoginPrompt({ isOpen: true, message: '投稿するにはログインが必要です' });
      return;
    }
    setIsCreatePostOpen(true);
  };

  const handleCloseCreatePost = () => {
    setIsCreatePostOpen(false);
  };

  const handlePostCreated = () => {
    // Refresh the page or refetch posts after creating a new post
    window.location.reload();
  };

  const handleCloseLoginPrompt = () => {
    setLoginPrompt({ isOpen: false, message: '' });
  };

  return (
    <div className="min-h-screen relative">
      <div className="starry-background">
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="shooting-star"></div>
        <div className="shooting-star"></div>
        <div className="shooting-star"></div>
      </div>
      <Header 
        searchQuery={convexSearchQuery}
        onSearchChange={setConvexSearchQuery}
      />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          {/* Desktop Header */}
          <div className="hidden sm:flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              あなたはどんなことを感じましたか？🌟
            </h2>
            <div className="flex items-center gap-4">
              <button
                onClick={handleCreatePost}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">投稿を作成</span>
              </button>
              <div className="text-sm text-gray-600">
                {loading ? (
                  <span className="flex items-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    読み込み中...
                  </span>
                ) : (
                  `${totalPosts}件の投稿`
                )}
              </div>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="flex sm:hidden flex-col space-y-3 mb-4">
            <h2 className="text-lg font-bold text-gray-900 text-center">
              あなたはどんなことを感じましたか？🌟
            </h2>
            <div className="flex flex-col space-y-2">
              <button
                onClick={handleCreatePost}
                className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 shadow-lg transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium text-sm">投稿を作成</span>
              </button>
              <div className="text-xs text-gray-600 text-center">
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    読み込み中...
                  </span>
                ) : (
                  `${totalPosts}件の投稿`
                )}
              </div>
            </div>
          </div>
          
          {error && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div>
                  <p className="text-sm text-yellow-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          
          {/* Desktop Random Button */}
          <div className="hidden sm:flex justify-end gap-2 mb-4">
            <button
              onClick={handleRandomShuffle}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-full transition-all duration-200 text-sm ${
                isRandomized
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-purple-300 hover:shadow-md'
              }`}
            >
              <Shuffle className={`w-4 h-4 ${isRandomized ? 'animate-pulse' : ''}`} />
              <span className="font-medium text-sm">
                {isRandomized ? 'ランダム表示中' : 'ランダムに並び替え'}
              </span>
            </button>
          </div>

          {/* Mobile Random Button */}
          <div className="flex sm:hidden justify-center mb-4">
            <button
              onClick={handleRandomShuffle}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-full transition-all duration-200 text-sm w-full max-w-xs ${
                isRandomized
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-purple-300 hover:shadow-md'
              }`}
            >
              <Shuffle className={`w-4 h-4 ${isRandomized ? 'animate-pulse' : ''}`} />
              <span className="font-medium text-sm">
                {isRandomized ? 'ランダム表示中' : 'ランダムに並び替え'}
              </span>
            </button>
          </div>
        </div>

        <PostGrid
          posts={displayPosts}
          onLike={handleLike}
          onSave={handleSave}
          onPostClick={handlePostClick}
          currentPage={currentPage}
          totalPages={totalPages}
          totalPosts={totalPosts}
          onPageChange={setCurrentPage}
        />
      </main>

      {selectedPost && (
        <PostModal
          post={selectedPost}
          isOpen={!!selectedPost}
          onClose={handleCloseModal}
          onLike={handleLike}
          onSave={handleSave}
        />
      )}

      {isSignedIn && (
        <CreatePost
          isOpen={isCreatePostOpen}
          onClose={handleCloseCreatePost}
          onPostCreated={handlePostCreated}
        />
      )}

      <LoginPromptDialog
        isOpen={loginPrompt.isOpen}
        message={loginPrompt.message}
        onClose={handleCloseLoginPrompt}
      />
    </div>
  );
}

export default MainApp;