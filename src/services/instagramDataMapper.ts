import { Post, User } from '../types';

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

const createUserFromInstagramPost = (media: InstagramMedia): User => {
  const username = media.username || media.owner?.username || 'instagram_user';
  const avatar = media.owner?.profile_picture_url || '/images/default-avatar.png';
  const userId = media.owner?.id || media.id;
  
  return {
    id: `instagram_${userId}`,
    username: username,
    displayName: username,
    avatar: avatar,
    isVerified: false
  };
};

const extractHashtagsFromCaption = (caption: string): string[] => {
  const hashtagRegex = /#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g;
  const matches = caption.match(hashtagRegex);
  return matches ? matches.map(tag => tag.substring(1)) : [];
};

const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const mapInstagramMediaToPost = (media: InstagramMedia): Post => {
  const caption = media.caption || '';
  const hashtags = extractHashtagsFromCaption(caption);

  return {
    id: `instagram_${media.id}`,
    user: createUserFromInstagramPost(media),
    imageUrl: media.media_url,
    caption: caption,
    likes: media.like_count || getRandomNumber(50, 500),
    comments: [],
    timestamp: formatInstagramTimestamp(media.timestamp),
    tags: hashtags,
    location: 'Instagram',
    isLiked: false,
    isSaved: false,
    source: 'instagram' as const,
    permalink: media.permalink
  };
};

const formatInstagramTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return `${Math.floor((now.getTime() - date.getTime()) / (1000 * 60))}m`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
  }
};

export const mapInstagramMediaArrayToPosts = (mediaArray: InstagramMedia[]): Post[] => {
  return mediaArray.map(mapInstagramMediaToPost);
};