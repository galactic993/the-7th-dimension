import { action } from "./_generated/server";
import { v } from "convex/values";

interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  permalink: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
  username?: string;
  owner?: {
    username: string;
    profile_picture_url: string;
    id: string;
  };
}

interface InstagramHashtagResponse {
  data: InstagramMedia[];
  paging?: {
    after?: string;
  };
  error?: {
    message: string;
    type: string;
    code: number;
  };
}

interface InstagramHashtagSearchResponse {
  data: Array<{
    id: string;
    name: string;
  }>;
  error?: {
    message: string;
    type: string;
    code: number;
  };
}

export const searchHashtag = action({
  args: {
    hashtagName: v.string(),
    accessToken: v.string(),
    accountId: v.string(),
    apiVersion: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { hashtagName, accessToken, accountId, apiVersion = 'v22.0' } = args;
    const baseUrl = `https://graph.facebook.com/${apiVersion}`;
    
    const url = new URL(`${baseUrl}/ig_hashtag_search`);
    url.searchParams.append('user_id', accountId);
    url.searchParams.append('q', hashtagName.replace('#', ''));
    url.searchParams.append('access_token', accessToken);

    try {
      const response = await fetch(url.toString());
      const data: InstagramHashtagSearchResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Instagram API request failed');
      }

      if (!data.data || data.data.length === 0) {
        throw new Error(`Hashtag "${hashtagName}" not found`);
      }

      return data.data[0].id;
    } catch (error) {
      console.error('Error searching hashtag:', error);
      throw new Error(`Failed to search for hashtag: ${hashtagName}`);
    }
  }
});

export const getRecentMediaByHashtag = action({
  args: {
    hashtagId: v.string(),
    accessToken: v.string(),
    accountId: v.string(),
    limit: v.optional(v.number()),
    apiVersion: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { hashtagId, accessToken, accountId, limit = 5, apiVersion = 'v22.0' } = args;
    const baseUrl = `https://graph.facebook.com/${apiVersion}`;
    
    const fields = [
      'id',
      'caption',
      'media_type', 
      'media_url',
      'permalink',
      'timestamp',
      'like_count',
      'comments_count',
      'username',
      'owner{username,profile_picture_url,id}'
    ].join(',');

    const url = new URL(`${baseUrl}/${hashtagId}/recent_media`);
    url.searchParams.append('user_id', accountId);
    url.searchParams.append('fields', fields);
    url.searchParams.append('limit', Math.min(limit, 50).toString());
    url.searchParams.append('access_token', accessToken);

    try {
      const response = await fetch(url.toString());
      const data: InstagramHashtagResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Instagram API request failed');
      }

      return data.data || [];
    } catch (error) {
      console.error('Error fetching recent media:', error);
      throw new Error('Failed to fetch recent media for hashtag');
    }
  }
});

async function searchHashtagInternal(hashtagName: string, accessToken: string, accountId: string, apiVersion: string = 'v22.0'): Promise<string> {
  const baseUrl = `https://graph.facebook.com/${apiVersion}`;
  
  const url = new URL(`${baseUrl}/ig_hashtag_search`);
  url.searchParams.append('user_id', accountId);
  url.searchParams.append('q', hashtagName.replace('#', ''));
  url.searchParams.append('access_token', accessToken);

  const response = await fetch(url.toString());
  const data: InstagramHashtagSearchResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Instagram API request failed');
  }

  if (!data.data || data.data.length === 0) {
    throw new Error(`Hashtag "${hashtagName}" not found`);
  }

  return data.data[0].id;
}

async function getRecentMediaByHashtagInternal(hashtagId: string, accessToken: string, accountId: string, limit: number = 5, apiVersion: string = 'v22.0'): Promise<InstagramMedia[]> {
  const baseUrl = `https://graph.facebook.com/${apiVersion}`;
  
  const fields = [
    'id',
    'caption',
    'media_type', 
    'media_url',
    'permalink',
    'timestamp',
    'like_count',
    'comments_count',
    'username',
    'owner{username,profile_picture_url,id}'
  ].join(',');

  const url = new URL(`${baseUrl}/${hashtagId}/recent_media`);
  url.searchParams.append('user_id', accountId);
  url.searchParams.append('fields', fields);
  url.searchParams.append('limit', Math.min(limit, 50).toString());
  url.searchParams.append('access_token', accessToken);

  const response = await fetch(url.toString());
  const data: InstagramHashtagResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Instagram API request failed');
  }

  return data.data || [];
}

export const getRecentPostsByHashtagName = action({
  args: {
    hashtagName: v.optional(v.string()),
    accessToken: v.string(),
    accountId: v.string(),
    limit: v.optional(v.number()),
    apiVersion: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { hashtagName = 'the7thdimension', accessToken, accountId, limit = 5, apiVersion = 'v22.0' } = args;

    try {
      // First, get the hashtag ID
      const hashtagId = await searchHashtagInternal(hashtagName, accessToken, accountId, apiVersion);

      // Then fetch the recent media
      const media = await getRecentMediaByHashtagInternal(hashtagId, accessToken, accountId, limit, apiVersion);

      // Save the posts to the database (Note: Actions cannot use ctx.db directly)
      const savedPosts = media;

      return { media, savedPosts };
    } catch (error) {
      console.error('Error getting posts by hashtag name:', error);
      
      // Check if error is related to expired token
      if (error instanceof Error && error.message.includes('Session has expired')) {
        throw new Error(`Instagram access token has expired. Please refresh your token at: https://developers.facebook.com/tools/explorer/`);
      }
      
      throw new Error(`Failed to fetch posts for hashtag: ${hashtagName}`);
    }
  }
});

// Helper function to extract hashtags from caption
function extractHashtagsFromCaption(caption: string): string[] {
  const hashtagRegex = /#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g;
  const matches = caption.match(hashtagRegex);
  return matches ? matches.map(tag => tag.substring(1)) : [];
}