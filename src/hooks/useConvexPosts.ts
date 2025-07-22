import { useState, useEffect, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Post } from '../types';
import { mockPosts } from '../data/mockData';

interface UseConvexPostsResult {
  posts: Post[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  postsPerPage: number;
  setCurrentPage: (page: number) => void;
  paginatedPosts: Post[];
  filteredPosts: Post[];
  setSearchQuery: (query: string) => void;
  searchQuery: string;
}

export const useConvexPosts = (): UseConvexPostsResult => {
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const postsPerPage = 20;

  // 常にConvexクエリを呼び出す（フックの順序を保つため）
  const convexPosts = useQuery(api.posts.getAllPosts);
  
  // 開発環境ではモックデータを使用、本番環境ではConvexを使用
  const userPosts = import.meta.env.MODE === 'development' ? mockPosts : convexPosts;

  const loading = import.meta.env.MODE === 'development' ? false : convexPosts === undefined;

  const posts = useMemo(() => {
    if (import.meta.env.MODE === 'development') {
      // モックデータを使用
      return mockPosts.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    }

    if (loading) return [];

    // Convexのpostテーブルからすべての投稿を取得（Instagram投稿も含む）
    if (userPosts) {
      // タイムスタンプで降順ソート
      return userPosts.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    }

    return [];
  }, [userPosts, loading]);

  useEffect(() => {
    if (!loading && posts.length === 0) {
      setError('投稿が見つかりませんでした');
    } else {
      setError(null);
    }
  }, [loading, posts.length]);

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    
    const query = searchQuery.toLowerCase();
    return posts.filter(post =>
      post.caption.toLowerCase().includes(query) ||
      post.user.username.toLowerCase().includes(query) ||
      post.user.displayName.toLowerCase().includes(query) ||
      post.tags.some(tag => tag.toLowerCase().includes(query)) ||
      (post.location && post.location.toLowerCase().includes(query))
    );
  }, [posts, searchQuery]);

  const totalPosts = filteredPosts.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    return filteredPosts.slice(startIndex, endIndex);
  }, [filteredPosts, currentPage, postsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);


  return {
    posts,
    loading,
    error,
    currentPage,
    totalPages,
    totalPosts,
    postsPerPage,
    setCurrentPage,
    paginatedPosts,
    filteredPosts,
    setSearchQuery,
    searchQuery,
  };
};

// ハッシュタグを抽出するヘルパー関数
function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF]+/g;
  const matches = text.match(hashtagRegex);
  return matches ? matches.map(tag => tag.slice(1)) : []; // #を除去
}