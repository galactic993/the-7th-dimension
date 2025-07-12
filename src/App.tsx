import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import PostGrid from './components/PostGrid';
import PostModal from './components/PostModal';
import { mockPosts } from './data/mockData';
import { Post } from './types';
import { Shuffle } from 'lucide-react';

function App() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isRandomized, setIsRandomized] = useState(false);

  // Fisher-Yates shuffle algorithm
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
  }, [posts, searchQuery, isRandomized]);

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
            </div>
          </div>
          <div className="flex justify-end mb-4">
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