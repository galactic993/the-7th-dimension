import React, { useState, useMemo } from 'react';
import { useUser } from '@clerk/clerk-react';
import Header from './Header';
import PostGrid from './PostGrid';
import PostModal from './PostModal';
import CreatePost from './CreatePost';
import { Post } from '../types';
import { Shuffle, Plus, Loader2 } from 'lucide-react';
import { useConvexPosts } from '../hooks/useConvexPosts';

function MainApp() {
  const { isSignedIn } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isRandomized, setIsRandomized] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  const { 
    posts, 
    loading, 
    error 
  } = useConvexPosts();

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const filteredPosts = useMemo(() => {
    let filtered = posts;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post =>
        post.caption.toLowerCase().includes(query) ||
        post.user.username.toLowerCase().includes(query) ||
        post.user.displayName.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query)) ||
        (post.location && post.location.toLowerCase().includes(query))
      );
    }

    if (isRandomized) {
      filtered = shuffleArray(filtered);
    }
    return filtered;
  }, [posts, searchQuery, isRandomized]);

  const handleRandomShuffle = () => {
    setIsRandomized(!isRandomized);
  };

  const handleLike = (postId: string) => {
    if (!isSignedIn) {
      alert('いいねするにはログインが必要です');
      return;
    }
    // TODO: Convexのmutationを使ってDBを更新
    console.log('Like post:', postId);
  };

  const handleSave = (postId: string) => {
    if (!isSignedIn) {
      alert('保存するにはログインが必要です');
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
      alert('投稿するにはログインが必要です');
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
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
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
                  `${filteredPosts.length}件の投稿`
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
          
          
          <div className="flex justify-end gap-2 mb-4">
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
        </div>

        <PostGrid
          posts={filteredPosts}
          onLike={handleLike}
          onSave={handleSave}
          onPostClick={handlePostClick}
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
    </div>
  );
}

export default MainApp;