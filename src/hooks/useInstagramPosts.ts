import { useState, useEffect, useCallback } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Post } from '../types';
import { mapInstagramMediaArrayToPosts } from '../services/instagramDataMapper';
import { getInstagramConfig, isInstagramConfigAvailable } from '../config/instagram';

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

  useEffect(() => {
    setIsApiAvailable(isInstagramConfigAvailable());
  }, []);

  const fetchInstagramPosts = useCallback(async () => {
    if (!hashtagName) {
      setError('No hashtag specified');
      return;
    }

    try {
      const config = getInstagramConfig();
      
      setLoading(true);
      setError(null);

      const media = await getInstagramPosts({
        hashtagName,
        accessToken: config.accessToken,
        accountId: config.accountId,
        limit,
        apiVersion: config.apiVersion
      });
      const posts = mapInstagramMediaArrayToPosts(media);
      setInstagramPosts(posts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      
      if (errorMessage.includes('Instagram API configuration is incomplete')) {
        setError('Instagram API not configured. Please check your environment variables.');
      } else if (errorMessage.includes('Authentication failed') || errorMessage.includes('401')) {
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
  }, [getInstagramPosts, hashtagName, limit]);

  useEffect(() => {
    if (hashtagName && isApiAvailable) {
      fetchInstagramPosts();
    }
  }, [fetchInstagramPosts, hashtagName, isApiAvailable]);

  return {
    instagramPosts,
    loading,
    error,
    refetch: fetchInstagramPosts,
    isApiAvailable
  };
};