import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import PostGrid from './components/PostGrid';
import PostModal from './components/PostModal';
import { mockPosts } from './data/mockData';
import { Post } from './types';
import { Shuffle, RefreshCw, AlertCircle } from 'lucide-react';
import { useInstagramPosts } from './hooks/useInstagramPosts';

function App() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isRandomized, setIsRandomized] = useState(false);
  
  const hashtagName = import.meta.env.VITE_INSTAGRAM_SEARCH_HASHTAG_NAME || 'the7thdimension';
  const { 
    instagramPosts, 
    loading: instagramLoading, 
    error: instagramError, 
    refetch: refetchInstagram, 
    isApiAvailable 
  } = useInstagramPosts(hashtagName, 5);

  // Fisher-Yates shuffle algorithm
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  const allPosts = useMemo(() => {
    return [...posts, ...instagramPosts];
  }, [posts, instagramPosts]);

  const filteredPosts = useMemo(() => {
    let filtered = allPosts;

    // Filter by search query
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

    // Apply randomization if enabled
    if (isRandomized) {
      filtered = shuffleArray(filtered);
    }
    return filtered;
  }, [allPosts, searchQuery, isRandomized]);

  const handleRandomShuffle = () => {
    setIsRandomized(!isRandomized);
  };
  const handleLike = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { 
              ...post, 
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1
            }
          : post
      )
    );
  };

  const handleSave = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, isSaved: !post.isSaved }
          : post
      )
    );
  };

  const handlePostClick = (post: Post) => {
    // Find the most up-to-date version of the post
    const currentPost = posts.find(p => p.id === post.id) || post;
    setSelectedPost(currentPost);
  };

  const handleCloseModal = () => {
    setSelectedPost(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
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
            <div className="text-sm text-gray-600">
              {filteredPosts.length}件の投稿
              {instagramLoading && (
                <span className="ml-2 text-blue-600">
                  <RefreshCw className="w-4 h-4 inline animate-spin" /> Instagram読み込み中...
                </span>
              )}
            </div>
          </div>
          
          {instagramError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Instagram API Error</h3>
                  <p className="text-sm text-red-700 mt-1">{instagramError}</p>
                  <button
                    onClick={refetchInstagram}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                  >
                    再試行
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {isApiAvailable && instagramPosts.length > 0 && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-green-700">
                  Instagram APIから{instagramPosts.length}件の投稿を取得しました
                </span>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 mb-4">
            <button
              onClick={refetchInstagram}
              disabled={instagramLoading}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300 transition-all duration-200 text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${instagramLoading ? 'animate-spin' : ''}`} />
              <span className="font-medium text-sm">Instagram再取得</span>
            </button>
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
    </div>
  );
}

export default App;