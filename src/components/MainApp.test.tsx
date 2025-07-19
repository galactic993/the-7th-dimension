import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import MainApp from './MainApp';

vi.mock('../hooks/useConvexPosts', () => ({
  useConvexPosts: vi.fn()
}));

vi.mock('./Header', () => ({
  default: ({ searchQuery, onSearchChange }: { searchQuery: string; onSearchChange: (query: string) => void }) => (
    <div data-testid="header">
      <input
        data-testid="search-input"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="検索"
      />
    </div>
  )
}));

vi.mock('./PostGrid', () => ({
  default: ({ posts, onLike, onSave, onPostClick, currentPage, totalPages, totalPosts, onPageChange }: any) => (
    <div data-testid="post-grid">
      <div data-testid="post-count">{posts.length}</div>
      <div data-testid="total-posts">{totalPosts}</div>
      <div data-testid="current-page">{currentPage}</div>
      <div data-testid="total-pages">{totalPages}</div>
      {posts.map((post: any) => (
        <div key={post.id} data-testid={`post-${post.id}`}>
          <button onClick={() => onPostClick(post)}>Click Post</button>
          <button onClick={() => onLike(post.id)}>Like</button>
          <button onClick={() => onSave(post.id)}>Save</button>
        </div>
      ))}
      <button onClick={() => onPageChange(currentPage + 1)}>Next Page</button>
    </div>
  )
}));

vi.mock('./PostModal', () => ({
  default: ({ post, isOpen, onClose, onLike, onSave }: any) => (
    isOpen ? (
      <div data-testid="post-modal">
        <div data-testid="modal-post-id">{post.id}</div>
        <button onClick={onClose}>Close</button>
        <button onClick={() => onLike(post.id)}>Like</button>
        <button onClick={() => onSave(post.id)}>Save</button>
      </div>
    ) : null
  )
}));

vi.mock('./CreatePost', () => ({
  default: ({ isOpen, onClose, onPostCreated }: any) => (
    isOpen ? (
      <div data-testid="create-post-modal">
        <button onClick={onClose}>Close</button>
        <button onClick={onPostCreated}>Create Post</button>
      </div>
    ) : null
  )
}));

vi.mock('./LoginPromptDialog', () => ({
  default: ({ isOpen, message, onClose }: any) => (
    isOpen ? (
      <div data-testid="login-prompt">
        <div data-testid="login-message">{message}</div>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
  )
}));

describe('MainApp', () => {
  const mockPosts = [
    { id: '1', content: 'Test post 1', author: 'User 1' },
    { id: '2', content: 'Test post 2', author: 'User 2' },
    { id: '3', content: 'Test post 3', author: 'User 3' }
  ];

  const mockUseConvexPosts = {
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 3,
    totalPosts: 15,
    setCurrentPage: vi.fn(),
    paginatedPosts: mockPosts,
    setSearchQuery: vi.fn(),
    searchQuery: ''
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const { useConvexPosts } = require('../hooks/useConvexPosts');
    useConvexPosts.mockReturnValue(mockUseConvexPosts);
  });

  it('renders MainApp component', () => {
    render(<MainApp />);
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('post-grid')).toBeInTheDocument();
    expect(screen.getByText('🌟')).toBeInTheDocument();
  });

  it('displays posts count', () => {
    render(<MainApp />);
    
    expect(screen.getByText('15件の投稿')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    const { useConvexPosts } = require('../hooks/useConvexPosts');
    useConvexPosts.mockReturnValue({
      ...mockUseConvexPosts,
      loading: true
    });

    render(<MainApp />);
    
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('displays error state', () => {
    const { useConvexPosts } = require('../hooks/useConvexPosts');
    useConvexPosts.mockReturnValue({
      ...mockUseConvexPosts,
      error: 'Error loading posts'
    });

    render(<MainApp />);
    
    expect(screen.getByText('Error loading posts')).toBeInTheDocument();
  });

  it('opens create post modal when create button is clicked (signed in)', () => {
    const { useUser } = require('@clerk/clerk-react');
    useUser.mockReturnValue({ isSignedIn: true });

    render(<MainApp />);
    
    const createButton = screen.getByText('投稿を作成');
    fireEvent.click(createButton);
    
    expect(screen.getByTestId('create-post-modal')).toBeInTheDocument();
  });

  it('shows login prompt when create button is clicked (not signed in)', () => {
    const { useUser } = require('@clerk/clerk-react');
    useUser.mockReturnValue({ isSignedIn: false });

    render(<MainApp />);
    
    const createButton = screen.getByText('投稿を作成');
    fireEvent.click(createButton);
    
    expect(screen.getByTestId('login-prompt')).toBeInTheDocument();
    expect(screen.getByText('投稿するにはログインが必要です')).toBeInTheDocument();
  });

  it('toggles random shuffle mode', () => {
    render(<MainApp />);
    
    const shuffleButton = screen.getByText('ランダムに並び替え');
    fireEvent.click(shuffleButton);
    
    expect(screen.getByText('ランダム表示中')).toBeInTheDocument();
  });

  it('opens post modal when post is clicked', () => {
    render(<MainApp />);
    
    const postButton = screen.getAllByText('Click Post')[0];
    fireEvent.click(postButton);
    
    expect(screen.getByTestId('post-modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-post-id')).toHaveTextContent('1');
  });

  it('closes post modal when close button is clicked', () => {
    render(<MainApp />);
    
    const postButton = screen.getAllByText('Click Post')[0];
    fireEvent.click(postButton);
    
    expect(screen.getByTestId('post-modal')).toBeInTheDocument();
    
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    
    expect(screen.queryByTestId('post-modal')).not.toBeInTheDocument();
  });

  it('shows login prompt when like button is clicked (not signed in)', () => {
    const { useUser } = require('@clerk/clerk-react');
    useUser.mockReturnValue({ isSignedIn: false });

    render(<MainApp />);
    
    const likeButton = screen.getAllByText('Like')[0];
    fireEvent.click(likeButton);
    
    expect(screen.getByTestId('login-prompt')).toBeInTheDocument();
    expect(screen.getByText('いいねするにはログインが必要です')).toBeInTheDocument();
  });

  it('shows login prompt when save button is clicked (not signed in)', () => {
    const { useUser } = require('@clerk/clerk-react');
    useUser.mockReturnValue({ isSignedIn: false });

    render(<MainApp />);
    
    const saveButton = screen.getAllByText('Save')[0];
    fireEvent.click(saveButton);
    
    expect(screen.getByTestId('login-prompt')).toBeInTheDocument();
    expect(screen.getByText('保存するにはログインが必要です')).toBeInTheDocument();
  });

  it('handles like action when signed in', () => {
    const { useUser } = require('@clerk/clerk-react');
    useUser.mockReturnValue({ isSignedIn: true });

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    render(<MainApp />);
    
    const likeButton = screen.getAllByText('Like')[0];
    fireEvent.click(likeButton);
    
    expect(consoleSpy).toHaveBeenCalledWith('Like post:', '1');
    consoleSpy.mockRestore();
  });

  it('handles save action when signed in', () => {
    const { useUser } = require('@clerk/clerk-react');
    useUser.mockReturnValue({ isSignedIn: true });

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    render(<MainApp />);
    
    const saveButton = screen.getAllByText('Save')[0];
    fireEvent.click(saveButton);
    
    expect(consoleSpy).toHaveBeenCalledWith('Save post:', '1');
    consoleSpy.mockRestore();
  });

  it('closes login prompt when close button is clicked', () => {
    const { useUser } = require('@clerk/clerk-react');
    useUser.mockReturnValue({ isSignedIn: false });

    render(<MainApp />);
    
    const likeButton = screen.getAllByText('Like')[0];
    fireEvent.click(likeButton);
    
    expect(screen.getByTestId('login-prompt')).toBeInTheDocument();
    
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    
    expect(screen.queryByTestId('login-prompt')).not.toBeInTheDocument();
  });

  it('handles post creation success', async () => {
    const { useUser } = require('@clerk/clerk-react');
    useUser.mockReturnValue({ isSignedIn: true });

    const reloadSpy = vi.spyOn(window.location, 'reload').mockImplementation(() => {});

    render(<MainApp />);
    
    const createButton = screen.getByText('投稿を作成');
    fireEvent.click(createButton);
    
    const createPostButton = screen.getByText('Create Post');
    fireEvent.click(createPostButton);
    
    expect(reloadSpy).toHaveBeenCalled();
    reloadSpy.mockRestore();
  });

  it('updates search query', () => {
    render(<MainApp />);
    
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    
    expect(mockUseConvexPosts.setSearchQuery).toHaveBeenCalledWith('test search');
  });

  it('handles page change', () => {
    render(<MainApp />);
    
    const nextPageButton = screen.getByText('Next Page');
    fireEvent.click(nextPageButton);
    
    expect(mockUseConvexPosts.setCurrentPage).toHaveBeenCalledWith(2);
  });

  it('renders mobile view elements', () => {
    render(<MainApp />);
    
    const mobileElements = screen.getAllByText('投稿を作成');
    expect(mobileElements.length).toBeGreaterThan(0);
  });

  it('shuffles posts when random mode is enabled', () => {
    render(<MainApp />);
    
    const shuffleButton = screen.getByText('ランダムに並び替え');
    fireEvent.click(shuffleButton);
    
    expect(screen.getByText('ランダム表示中')).toBeInTheDocument();
  });

  it('shows starry background elements', () => {
    render(<MainApp />);
    
    const starryBackground = document.querySelector('.starry-background');
    expect(starryBackground).toBeInTheDocument();
    
    const stars = document.querySelectorAll('.star');
    expect(stars.length).toBe(12);
    
    const shootingStars = document.querySelectorAll('.shooting-star');
    expect(shootingStars.length).toBe(3);
  });
});