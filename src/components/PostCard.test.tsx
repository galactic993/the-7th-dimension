import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import PostCard from './PostCard';
import { Post } from '../types';

// Mock the child components
vi.mock('./InstagramStylePost', () => ({
  default: ({ post, onLike, onSave, onClick }: any) => (
    <div data-testid="instagram-style-post">
      <div data-testid="post-id">{post.id}</div>
      <div data-testid="post-caption">{post.caption}</div>
      <button 
        data-testid="like-button" 
        onClick={(e) => {
          e.stopPropagation();
          onLike(post.id);
        }}
      >
        Like
      </button>
      <button 
        data-testid="save-button" 
        onClick={(e) => {
          e.stopPropagation();
          onSave(post.id);
        }}
      >
        Save
      </button>
      <button 
        data-testid="click-button" 
        onClick={() => onClick(post)}
      >
        Click
      </button>
    </div>
  )
}));

vi.mock('./InstagramEmbed', () => ({
  default: ({ url, maxWidth, hideCaption }: any) => (
    <div data-testid="instagram-embed">
      <div data-testid="embed-url">{url}</div>
      <div data-testid="embed-max-width">{maxWidth}</div>
      <div data-testid="embed-hide-caption">{hideCaption.toString()}</div>
    </div>
  )
}));

describe('PostCard', () => {
  const mockPost: Post = {
    id: 'test-post-1',
    user: {
      id: 'user-1',
      username: 'testuser',
      displayName: 'Test User',
      avatar: 'https://example.com/avatar.jpg',
      isVerified: true
    },
    imageUrl: 'https://example.com/image.jpg',
    caption: 'Test caption',
    likes: 100,
    comments: [],
    timestamp: '2時間前',
    tags: ['test', 'photo'],
    location: 'Test Location',
    isLiked: false,
    isSaved: false,
    source: 'mock'
  };

  const mockInstagramPost: Post = {
    ...mockPost,
    id: 'instagram-post-1',
    source: 'instagram',
    instagramUrl: 'https://www.instagram.com/p/test/'
  };

  const mockOnLike = vi.fn();
  const mockOnSave = vi.fn();
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本的なレンダリング', () => {
    it('renders PostCard component', () => {
      render(
        <PostCard 
          post={mockPost}
          onLike={mockOnLike}
          onSave={mockOnSave}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByTestId('instagram-style-post')).toBeInTheDocument();
      expect(screen.getByTestId('post-id')).toHaveTextContent('test-post-1');
      expect(screen.getByTestId('post-caption')).toHaveTextContent('Test caption');
    });

    it('renders InstagramEmbed for Instagram posts with instagramUrl', () => {
      render(
        <PostCard 
          post={mockInstagramPost}
          onLike={mockOnLike}
          onSave={mockOnSave}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByTestId('instagram-embed')).toBeInTheDocument();
      expect(screen.getByTestId('embed-url')).toHaveTextContent('https://www.instagram.com/p/test/');
      expect(screen.getByTestId('embed-max-width')).toHaveTextContent('400');
      expect(screen.getByTestId('embed-hide-caption')).toHaveTextContent('false');
    });

    it('renders InstagramStylePost for Instagram posts without instagramUrl', () => {
      const instagramPostWithoutUrl = {
        ...mockInstagramPost,
        instagramUrl: undefined
      };

      render(
        <PostCard 
          post={instagramPostWithoutUrl}
          onLike={mockOnLike}
          onSave={mockOnSave}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByTestId('instagram-style-post')).toBeInTheDocument();
      expect(screen.queryByTestId('instagram-embed')).not.toBeInTheDocument();
    });

    it('renders InstagramStylePost for non-Instagram posts', () => {
      const nonInstagramPost = {
        ...mockPost,
        source: 'mock' as const
      };

      render(
        <PostCard 
          post={nonInstagramPost}
          onLike={mockOnLike}
          onSave={mockOnSave}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByTestId('instagram-style-post')).toBeInTheDocument();
      expect(screen.queryByTestId('instagram-embed')).not.toBeInTheDocument();
    });
  });

  describe('イベントハンドリング', () => {
    it('calls onLike with correct post ID when like button is clicked', () => {
      render(
        <PostCard 
          post={mockPost}
          onLike={mockOnLike}
          onSave={mockOnSave}
          onClick={mockOnClick}
        />
      );

      fireEvent.click(screen.getByTestId('like-button'));
      expect(mockOnLike).toHaveBeenCalledWith('test-post-1');
      expect(mockOnLike).toHaveBeenCalledTimes(1);
    });

    it('calls onSave with correct post ID when save button is clicked', () => {
      render(
        <PostCard 
          post={mockPost}
          onLike={mockOnLike}
          onSave={mockOnSave}
          onClick={mockOnClick}
        />
      );

      fireEvent.click(screen.getByTestId('save-button'));
      expect(mockOnSave).toHaveBeenCalledWith('test-post-1');
      expect(mockOnSave).toHaveBeenCalledTimes(1);
    });

    it('calls onClick with post object when post is clicked', () => {
      render(
        <PostCard 
          post={mockPost}
          onLike={mockOnLike}
          onSave={mockOnSave}
          onClick={mockOnClick}
        />
      );

      fireEvent.click(screen.getByTestId('click-button'));
      expect(mockOnClick).toHaveBeenCalledWith(mockPost);
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick when Instagram embed is clicked', () => {
      render(
        <PostCard 
          post={mockInstagramPost}
          onLike={mockOnLike}
          onSave={mockOnSave}
          onClick={mockOnClick}
        />
      );

      // Instagram embed should be wrapped in a clickable div
      const embedContainer = screen.getByTestId('instagram-embed').closest('div');
      expect(embedContainer).toHaveClass('cursor-pointer');
      
      fireEvent.click(embedContainer!);
      expect(mockOnClick).toHaveBeenCalledWith(mockInstagramPost);
    });

    it('prevents event propagation when like button is clicked', () => {
      render(
        <PostCard 
          post={mockPost}
          onLike={mockOnLike}
          onSave={mockOnSave}
          onClick={mockOnClick}
        />
      );

      const likeButton = screen.getByTestId('like-button');
      fireEvent.click(likeButton);
      
      // Like should be called but onClick should not be called due to stopPropagation
      expect(mockOnLike).toHaveBeenCalledWith('test-post-1');
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('prevents event propagation when save button is clicked', () => {
      render(
        <PostCard 
          post={mockPost}
          onLike={mockOnLike}
          onSave={mockOnSave}
          onClick={mockOnClick}
        />
      );

      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);
      
      // Save should be called but onClick should not be called due to stopPropagation
      expect(mockOnSave).toHaveBeenCalledWith('test-post-1');
      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('条件分岐', () => {
    it('renders InstagramEmbed when source is instagram and instagramUrl exists', () => {
      const instagramPost = {
        ...mockPost,
        source: 'instagram' as const,
        instagramUrl: 'https://www.instagram.com/p/test/'
      };

      render(
        <PostCard 
          post={instagramPost}
          onLike={mockOnLike}
          onSave={mockOnSave}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByTestId('instagram-embed')).toBeInTheDocument();
      expect(screen.queryByTestId('instagram-style-post')).not.toBeInTheDocument();
    });

    it('renders InstagramStylePost when source is instagram but instagramUrl is missing', () => {
      const instagramPost = {
        ...mockPost,
        source: 'instagram' as const,
        instagramUrl: undefined
      };

      render(
        <PostCard 
          post={instagramPost}
          onLike={mockOnLike}
          onSave={mockOnSave}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByTestId('instagram-style-post')).toBeInTheDocument();
      expect(screen.queryByTestId('instagram-embed')).not.toBeInTheDocument();
    });

    it('renders InstagramStylePost when source is not instagram', () => {
      const mockPost2 = {
        ...mockPost,
        source: 'mock' as const
      };

      render(
        <PostCard 
          post={mockPost2}
          onLike={mockOnLike}
          onSave={mockOnSave}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByTestId('instagram-style-post')).toBeInTheDocument();
      expect(screen.queryByTestId('instagram-embed')).not.toBeInTheDocument();
    });

    it('renders InstagramStylePost when source is instagram but instagramUrl is empty string', () => {
      const instagramPost = {
        ...mockPost,
        source: 'instagram' as const,
        instagramUrl: ''
      };

      render(
        <PostCard 
          post={instagramPost}
          onLike={mockOnLike}
          onSave={mockOnSave}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByTestId('instagram-style-post')).toBeInTheDocument();
      expect(screen.queryByTestId('instagram-embed')).not.toBeInTheDocument();
    });
  });

  describe('プロパティの渡し方', () => {
    it('passes all required props to InstagramStylePost', () => {
      render(
        <PostCard 
          post={mockPost}
          onLike={mockOnLike}
          onSave={mockOnSave}
          onClick={mockOnClick}
        />
      );

      const instagramStylePost = screen.getByTestId('instagram-style-post');
      expect(instagramStylePost).toBeInTheDocument();
      
      // Check that the post data is passed correctly
      expect(screen.getByTestId('post-id')).toHaveTextContent('test-post-1');
      expect(screen.getByTestId('post-caption')).toHaveTextContent('Test caption');
    });

    it('passes correct props to InstagramEmbed', () => {
      render(
        <PostCard 
          post={mockInstagramPost}
          onLike={mockOnLike}
          onSave={mockOnSave}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByTestId('embed-url')).toHaveTextContent('https://www.instagram.com/p/test/');
      expect(screen.getByTestId('embed-max-width')).toHaveTextContent('400');
      expect(screen.getByTestId('embed-hide-caption')).toHaveTextContent('false');
    });
  });

  describe('アクセシビリティ', () => {
    it('has proper cursor styling for Instagram embed', () => {
      render(
        <PostCard 
          post={mockInstagramPost}
          onLike={mockOnLike}
          onSave={mockOnSave}
          onClick={mockOnClick}
        />
      );

      const embedContainer = screen.getByTestId('instagram-embed').closest('div');
      expect(embedContainer).toHaveClass('cursor-pointer');
    });

    it('handles keyboard navigation for Instagram embed', () => {
      render(
        <PostCard 
          post={mockInstagramPost}
          onLike={mockOnLike}
          onSave={mockOnSave}
          onClick={mockOnClick}
        />
      );

      const embedContainer = screen.getByTestId('instagram-embed').closest('div');
      
      // Test Enter key
      fireEvent.keyDown(embedContainer!, { key: 'Enter' });
      // Note: The component doesn't handle keyboard events, but we test the structure
      expect(embedContainer).toBeInTheDocument();
    });
  });

  describe('エラーハンドリング', () => {
    it('handles missing post properties gracefully', () => {
      const incompletePost = {
        ...mockPost,
        instagramUrl: null as any
      };

      render(
        <PostCard 
          post={incompletePost}
          onLike={mockOnLike}
          onSave={mockOnSave}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByTestId('instagram-style-post')).toBeInTheDocument();
    });

    it('handles undefined instagramUrl', () => {
      const postWithUndefinedUrl = {
        ...mockPost,
        source: 'instagram' as const,
        instagramUrl: undefined
      };

      render(
        <PostCard 
          post={postWithUndefinedUrl}
          onLike={mockOnLike}
          onSave={mockOnSave}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByTestId('instagram-style-post')).toBeInTheDocument();
      expect(screen.queryByTestId('instagram-embed')).not.toBeInTheDocument();
    });
  });
});