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
  imageUrl: string;
  caption: string;
  likes: number;
  comments: Comment[];
  timestamp: string;
  tags: string[];
  location?: string;
  isLiked: boolean;
  isSaved: boolean;
}

export interface Comment {
  id: string;
  user: User;
  text: string;
  timestamp: string;
  likes: number;
}

export type FilterCategory = 'all' | 'fashion' | 'food' | 'travel' | 'nature' | 'lifestyle';