import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import Header from './Header';

const mockSignOut = vi.fn();
const mockOpenSignIn = vi.fn();

vi.mock('@clerk/clerk-react', () => ({
  useClerk: vi.fn(() => ({
    signOut: mockSignOut,
    openSignIn: mockOpenSignIn
  })),
  useUser: vi.fn(() => ({ isSignedIn: true }))
}));

describe('Header', () => {
  const defaultProps = {
    searchQuery: '',
    onSearchChange: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders header component', () => {
    render(<Header {...defaultProps} />);
    
    expect(screen.getByText('n¹Æü¸')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('displays logo text', () => {
    render(<Header {...defaultProps} />);
    
    const logoText = screen.getByText('n¹Æü¸');
    expect(logoText).toBeInTheDocument();
    expect(logoText).toHaveClass('text-lg', 'sm:text-2xl', 'font-bold');
  });

  it('renders search input with placeholder', () => {
    render(<Header {...defaultProps} />);
    
    const searchInputs = screen.getAllByPlaceholderText(/"/);
    expect(searchInputs.length).toBeGreaterThan(0);
  });

  it('calls onSearchChange when search input value changes', () => {
    const onSearchChange = vi.fn();
    render(<Header {...defaultProps} onSearchChange={onSearchChange} />);
    
    const searchInput = screen.getAllByPlaceholderText(/"/)[0];
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    
    expect(onSearchChange).toHaveBeenCalledWith('test search');
  });

  it('displays search query in input field', () => {
    render(<Header {...defaultProps} searchQuery="test query" />);
    
    const searchInputs = screen.getAllByDisplayValue('test query');
    expect(searchInputs.length).toBeGreaterThan(0);
  });

  it('shows logout button when user is signed in', () => {
    const { useUser } = require('@clerk/clerk-react');
    useUser.mockReturnValue({ isSignedIn: true });

    render(<Header {...defaultProps} />);
    
    expect(screen.getByText('í°¢¦È')).toBeInTheDocument();
    expect(screen.queryByText('í°¤ó')).not.toBeInTheDocument();
  });

  it('shows login button when user is not signed in', () => {
    const { useUser } = require('@clerk/clerk-react');
    useUser.mockReturnValue({ isSignedIn: false });

    render(<Header {...defaultProps} />);
    
    expect(screen.getByText('í°¤ó')).toBeInTheDocument();
    expect(screen.queryByText('í°¢¦È')).not.toBeInTheDocument();
  });

  it('calls signOut when logout button is clicked', () => {
    const { useUser } = require('@clerk/clerk-react');
    useUser.mockReturnValue({ isSignedIn: true });

    render(<Header {...defaultProps} />);
    
    const logoutButton = screen.getByText('í°¢¦È');
    fireEvent.click(logoutButton);
    
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('calls openSignIn when login button is clicked', () => {
    const { useUser } = require('@clerk/clerk-react');
    useUser.mockReturnValue({ isSignedIn: false });

    render(<Header {...defaultProps} />);
    
    const loginButton = screen.getByText('í°¤ó');
    fireEvent.click(loginButton);
    
    expect(mockOpenSignIn).toHaveBeenCalled();
  });

  it('renders search icons', () => {
    render(<Header {...defaultProps} />);
    
    // There should be two search icons (desktop and mobile)
    const searchIcons = document.querySelectorAll('svg');
    const searchIconsCount = Array.from(searchIcons).filter(
      icon => icon.getAttribute('class')?.includes('w-4') || icon.getAttribute('class')?.includes('w-3')
    ).length;
    
    expect(searchIconsCount).toBeGreaterThan(0);
  });

  it('has correct styling classes', () => {
    render(<Header {...defaultProps} />);
    
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('sticky', 'top-0', 'z-50');
  });

  it('renders both desktop and mobile search inputs', () => {
    render(<Header {...defaultProps} />);
    
    // Desktop search input (hidden on small screens)
    const desktopSearchInput = document.querySelector('.hidden.sm\\:flex input');
    expect(desktopSearchInput).toBeInTheDocument();
    
    // Mobile search input (shown only on small screens)
    const mobileSearchInput = document.querySelector('.flex.sm\\:hidden input');
    expect(mobileSearchInput).toBeInTheDocument();
  });

  it('has correct placeholder text for mobile and desktop', () => {
    render(<Header {...defaultProps} />);
    
    expect(screen.getByPlaceholderText('"...')).toBeInTheDocument(); // Desktop
    expect(screen.getByPlaceholderText('"')).toBeInTheDocument(); // Mobile
  });

  it('logout button has correct styling when signed in', () => {
    const { useUser } = require('@clerk/clerk-react');
    useUser.mockReturnValue({ isSignedIn: true });

    render(<Header {...defaultProps} />);
    
    const logoutButton = screen.getByText('í°¢¦È').closest('button');
    expect(logoutButton).toHaveClass('text-gray-600', 'hover:text-gray-800');
  });

  it('login button has correct styling when not signed in', () => {
    const { useUser } = require('@clerk/clerk-react');
    useUser.mockReturnValue({ isSignedIn: false });

    render(<Header {...defaultProps} />);
    
    const loginButton = screen.getByText('í°¤ó').closest('button');
    expect(loginButton).toHaveClass('bg-gradient-to-r', 'from-blue-500', 'to-purple-600');
  });

  it('search input has focus styles', () => {
    render(<Header {...defaultProps} />);
    
    const searchInput = screen.getAllByPlaceholderText(/"/)[0];
    expect(searchInput).toHaveClass('focus:ring-2', 'focus:ring-pink-500');
  });

  it('handles empty search query', () => {
    const onSearchChange = vi.fn();
    render(<Header {...defaultProps} searchQuery="" onSearchChange={onSearchChange} />);
    
    const searchInput = screen.getAllByPlaceholderText(/"/)[0];
    expect(searchInput).toHaveValue('');
    
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(onSearchChange).toHaveBeenCalledWith('');
  });

  it('handles long search query', () => {
    const longQuery = 'this is a very long search query that might overflow';
    const onSearchChange = vi.fn();
    render(<Header {...defaultProps} searchQuery={longQuery} onSearchChange={onSearchChange} />);
    
    const searchInput = screen.getAllByDisplayValue(longQuery)[0];
    expect(searchInput).toHaveValue(longQuery);
  });

  it('maintains search query across re-renders', () => {
    const { rerender } = render(<Header {...defaultProps} searchQuery="initial" />);
    
    expect(screen.getAllByDisplayValue('initial')[0]).toBeInTheDocument();
    
    rerender(<Header {...defaultProps} searchQuery="updated" />);
    
    expect(screen.getAllByDisplayValue('updated')[0]).toBeInTheDocument();
    expect(screen.queryByDisplayValue('initial')).not.toBeInTheDocument();
  });
});