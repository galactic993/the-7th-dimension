import { useState, useEffect, useCallback } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Post } from '../types';
import { mapInstagramMediaArrayToPosts } from '../services/instagramDataMapper';

interface UseInstagramPostsResult {
  instagramPosts: Post[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isApiAvailable: boolean;
}

export const useInstagramPosts = (hashtagName?: string, limit: number = 5): UseInstagramPostsResult => {
  const [instagramPosts, setInstagramPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isApiAvailable, setIsApiAvailable] = useState(false);

  const getInstagramPosts = useAction(api.instagram.getRecentPostsByHashtagName);

  const accessToken = import.meta.env.VITE_INSTAGRAM_GRAPH_API_ACCESS_TOKEN;
  const accountId = import.meta.env.VITE_INSTAGRAM_ACCOUNT_ID;
  const apiVersion = import.meta.env.VITE_INSTAGRAM_API_VERSION || 'v15.0';

  useEffect(() => {
    setIsApiAvailable(!!(accessToken && accountId));
  }, [accessToken, accountId]);

  const fetchInstagramPosts = useCallback(async () => {
    if (!accessToken || !accountId || !hashtagName) {
      setError('Instagram API not configured or no hashtag specified');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const media = await getInstagramPosts({
        hashtagName,
        accessToken,
        accountId,
        limit,
        apiVersion
      });
      const posts = mapInstagramMediaArrayToPosts(media);
      setInstagramPosts(posts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      
      if (errorMessage.includes('Authentication failed') || errorMessage.includes('401')) {
        setError('Authentication failed. Please check your access token.');
      } else if (errorMessage.includes('Access denied') || errorMessage.includes('403')) {
        setError('Access denied. Please check your permissions and account settings.');
      } else if (errorMessage.includes('not found') || errorMessage.includes('404')) {
        setError(`Hashtag "${hashtagName}" not found.`);
      } else if (errorMessage.includes('Rate limit') || errorMessage.includes('429')) {
        setError('Rate limit exceeded. Please try again later.');
      } else if (errorMessage.includes('Invalid request') || errorMessage.includes('400')) {
        setError('Invalid request. Please check the hashtag name and API configuration.');
      } else {
        setError(errorMessage || 'Failed to fetch Instagram posts');
      }
      console.error('Instagram API Error:', err);
    } finally {
      setLoading(false);
    }
  }, [getInstagramPosts, accessToken, accountId, hashtagName, limit, apiVersion]);

  useEffect(() => {
    if (hashtagName && accessToken && accountId) {
      fetchInstagramPosts();
    }
  }, [fetchInstagramPosts, hashtagName, accessToken, accountId]);

  return {
    instagramPosts,
    loading,
    error,
    refetch: fetchInstagramPosts,
    isApiAvailable
  };
};