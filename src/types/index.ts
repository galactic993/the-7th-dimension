export interface User {
  id: string;
  username: string;
  avatar: string;
  displayName: string;
  isVerified?: boolean;
}

export interface Post {
  id: string;
  user: User;
  imageUrl: string; // 後方互換性のため保持
  images?: string[]; // 複数画像サポート（省略可能）
  caption: string;
  likes: number;
  comments: Comment[];
  timestamp: string;
  tags: string[];
  location?: string;
  isLiked: boolean;
  isSaved: boolean;
  source?: 'mock' | 'instagram';
  permalink?: string;
  instagramUrl?: string;
}

export interface Comment {
  id: string;
  user: User;
  text: string;
  timestamp: string;
  likes: number;
}

export type FilterCategory = 'all' | 'fashion' | 'food' | 'travel' | 'nature' | 'lifestyle';