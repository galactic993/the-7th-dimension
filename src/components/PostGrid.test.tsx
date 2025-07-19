import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import PostGrid from './PostGrid';

vi.mock('./PostCard', () => ({
  default: ({ post, onLike, onSave, onClick }: any) => (
    <div data-testid={`post-card-${post.id}`}>
      <div data-testid={`post-content-${post.id}`}>{post.content}</div>
      <button onClick={() => onClick(post)}>Click Post</button>
      <button onClick={() => onLike(post.id)}>Like</button>
      <button onClick={() => onSave(post.id)}>Save</button>
    </div>
  )
}));

describe('PostGrid', () => {
  const mockPosts = [
    { id: '1', content: 'Test post 1', author: 'User 1' },
    { id: '2', content: 'Test post 2', author: 'User 2' },
    { id: '3', content: 'Test post 3', author: 'User 3' }
  ];

  const defaultProps = {
    posts: mockPosts,
    onLike: vi.fn(),
    onSave: vi.fn(),
    onPostClick: vi.fn(),
    currentPage: 1,
    totalPages: 5,
    totalPosts: 100,
    onPageChange: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders PostGrid component with posts', () => {
    render(<PostGrid {...defaultProps} />);
    
    expect(screen.getByTestId('post-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('post-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('post-card-3')).toBeInTheDocument();
  });

  it('displays empty state when no posts', () => {
    render(<PostGrid {...defaultProps} posts={[]} />);
    
    expect(screen.getByText('•?L‹dKŠ~[“')).toBeInTheDocument();
    expect(screen.getByText('"aö’	ôWffO`UD')).toBeInTheDocument();
    expect(screen.getByText('=ñ')).toBeInTheDocument();
  });

  it('renders posts in grid layout', () => {
    render(<PostGrid {...defaultProps} />);
    
    const gridContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3');
    expect(gridContainer).toBeInTheDocument();
  });

  it('calls onPostClick when post is clicked', () => {
    render(<PostGrid {...defaultProps} />);
    
    const postButton = screen.getAllByText('Click Post')[0];
    fireEvent.click(postButton);
    
    expect(defaultProps.onPostClick).toHaveBeenCalledWith(mockPosts[0]);
  });

  it('calls onLike when like button is clicked', () => {
    render(<PostGrid {...defaultProps} />);
    
    const likeButton = screen.getAllByText('Like')[0];
    fireEvent.click(likeButton);
    
    expect(defaultProps.onLike).toHaveBeenCalledWith('1');
  });

  it('calls onSave when save button is clicked', () => {
    render(<PostGrid {...defaultProps} />);
    
    const saveButton = screen.getAllByText('Save')[0];
    fireEvent.click(saveButton);
    
    expect(defaultProps.onSave).toHaveBeenCalledWith('1');
  });

  it('displays pagination when totalPages > 1', () => {
    render(<PostGrid {...defaultProps} totalPages={3} />);
    
    expect(screen.getByText('Mx')).toBeInTheDocument();
    expect(screen.getByText('!x')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('hides pagination when totalPages is 1', () => {
    render(<PostGrid {...defaultProps} totalPages={1} />);
    
    expect(screen.queryByText('Mx')).not.toBeInTheDocument();
    expect(screen.queryByText('!x')).not.toBeInTheDocument();
  });

  it('disables previous button on first page', () => {
    render(<PostGrid {...defaultProps} currentPage={1} />);
    
    const prevButton = screen.getByText('Mx').closest('button');
    expect(prevButton).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<PostGrid {...defaultProps} currentPage={5} totalPages={5} />);
    
    const nextButton = screen.getByText('!x').closest('button');
    expect(nextButton).toBeDisabled();
  });

  it('calls onPageChange when previous button is clicked', () => {
    render(<PostGrid {...defaultProps} currentPage={2} />);
    
    const prevButton = screen.getByText('Mx');
    fireEvent.click(prevButton);
    
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(1);
  });

  it('calls onPageChange when next button is clicked', () => {
    render(<PostGrid {...defaultProps} currentPage={1} />);
    
    const nextButton = screen.getByText('!x');
    fireEvent.click(nextButton);
    
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange when page number is clicked', () => {
    render(<PostGrid {...defaultProps} currentPage={1} totalPages={5} />);
    
    const pageButton = screen.getByText('3');
    fireEvent.click(pageButton);
    
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(3);
  });

  it('highlights current page button', () => {
    render(<PostGrid {...defaultProps} currentPage={2} totalPages={5} />);
    
    const currentPageButton = screen.getByText('2').closest('button');
    expect(currentPageButton).toHaveClass('bg-purple-600', 'text-white');
  });

  it('displays page information', () => {
    render(<PostGrid {...defaultProps} currentPage={2} totalPosts={100} />);
    
    expect(screen.getByText('100ö- 2140ö’h:')).toBeInTheDocument();
  });

  it('handles undefined/null props gracefully', () => {
    render(
      <PostGrid
        {...defaultProps}
        currentPage={undefined as any}
        totalPages={undefined as any}
        totalPosts={undefined as any}
      />
    );
    
    expect(screen.getByTestId('post-card-1')).toBeInTheDocument();
  });

  it('calculates safe values correctly', () => {
    render(
      <PostGrid
        {...defaultProps}
        posts={mockPosts}
        currentPage={0}
        totalPages={0}
        totalPosts={0}
      />
    );
    
    expect(screen.getByText('3ö- 13ö’h:')).toBeInTheDocument();
  });

  it('shows ellipsis for large page ranges', () => {
    render(<PostGrid {...defaultProps} currentPage={5} totalPages={10} />);
    
    const ellipsis = screen.getAllByText('...');
    expect(ellipsis.length).toBeGreaterThan(0);
  });

  it('shows first and last page buttons for large page ranges', () => {
    render(<PostGrid {...defaultProps} currentPage={5} totalPages={10} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('does not show ellipsis for small page ranges', () => {
    render(<PostGrid {...defaultProps} currentPage={2} totalPages={3} />);
    
    expect(screen.queryByText('...')).not.toBeInTheDocument();
  });

  it('displays correct page range for middle pages', () => {
    render(<PostGrid {...defaultProps} currentPage={5} totalPages={10} />);
    
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('handles edge case for page calculation at beginning', () => {
    render(<PostGrid {...defaultProps} currentPage={1} totalPages={10} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('handles edge case for page calculation at end', () => {
    render(<PostGrid {...defaultProps} currentPage={10} totalPages={10} />);
    
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('calculates correct display range for last page', () => {
    render(<PostGrid {...defaultProps} currentPage={5} totalPages={5} totalPosts={85} />);
    
    expect(screen.getByText('85ö- 8185ö’h:')).toBeInTheDocument();
  });

  it('renders all posts provided', () => {
    const largePosts = Array.from({ length: 10 }, (_, i) => ({
      id: (i + 1).toString(),
      content: `Post ${i + 1}`,
      author: `User ${i + 1}`
    }));

    render(<PostGrid {...defaultProps} posts={largePosts} />);
    
    largePosts.forEach(post => {
      expect(screen.getByTestId(`post-card-${post.id}`)).toBeInTheDocument();
    });
  });

  it('handles hover states for pagination buttons', () => {
    render(<PostGrid {...defaultProps} currentPage={2} totalPages={5} />);
    
    const pageButton = screen.getByText('3').closest('button');
    expect(pageButton).toHaveClass('hover:bg-purple-50', 'hover:border-purple-300');
  });
});