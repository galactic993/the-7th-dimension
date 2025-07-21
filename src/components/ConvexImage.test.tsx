import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ConvexImage from './ConvexImage';

vi.mock('convex/react', () => ({
  useQuery: vi.fn(() => 'https://example.com/test-image.jpg')
}));

vi.mock('../../convex/_generated/api', () => ({
  api: {
    posts: {
      getFileUrl: 'posts:getFileUrl'
    }
  }
}));

describe('ConvexImage', () => {
  const defaultProps = {
    storageId: 'https://example.com/image.jpg',
    alt: 'Test image',
    className: 'test-class'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders image component', () => {
    render(<ConvexImage {...defaultProps} />);
    
    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('alt', 'Test image');
    expect(image).toHaveClass('test-class');
  });

  it('handles image load error', () => {
    render(
      <ConvexImage 
        storageId="https://example.com/broken.jpg" 
        alt="Broken image"
        fallback="/fallback.jpg"
      />
    );

    const image = screen.getByAltText('Broken image');
    fireEvent.error(image);
    
    expect(image).toHaveAttribute('src', '/fallback.jpg');
  });

  it('uses default fallback when not provided', () => {
    render(
      <ConvexImage 
        storageId="https://example.com/broken.jpg" 
        alt="Test image"
      />
    );

    const image = screen.getByAltText('Test image');
    fireEvent.error(image);
    
    expect(image).toHaveAttribute('src', '/images/default.png/400x400/e5e7eb/9ca3af?text=画像');
  });

  it('handles empty storageId', () => {
    render(
      <ConvexImage 
        storageId="" 
        alt="Empty image"
      />
    );

    const image = screen.getByAltText('Empty image');
    expect(image).toBeInTheDocument();
  });

  it('uses default values for optional props', () => {
    render(<ConvexImage storageId="https://example.com/image.jpg" />);

    const image = document.querySelector('img');
    expect(image).toHaveAttribute('alt', '');
    expect(image).toHaveAttribute('class', '');
  });
});