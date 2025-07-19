import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import LoginPromptDialog from './LoginPromptDialog';

const mockOpenSignIn = vi.fn();

vi.mock('@clerk/clerk-react', () => ({
  useClerk: () => ({
    openSignIn: mockOpenSignIn
  })
}));

describe('LoginPromptDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    message: 'í°¤óLÅjÍ\gY'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ú,„jìóÀêó°', () => {
    it('renders when isOpen is true', () => {
      render(<LoginPromptDialog {...defaultProps} />);
      
      expect(screen.getByText('í°¤óLÅgY')).toBeInTheDocument();
      expect(screen.getByText('í°¤óLÅjÍ\gY')).toBeInTheDocument();
      expect(screen.getByText('í°¤óY‹')).toBeInTheDocument();
      expect(screen.getByText('­ãó»ë')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(<LoginPromptDialog {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByText('í°¤óLÅgY')).not.toBeInTheDocument();
    });

    it('displays the correct message', () => {
      const customMessage = 'DDmY‹koí°¤óWfO`UD';
      render(<LoginPromptDialog {...defaultProps} message={customMessage} />);
      
      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    it('displays the title correctly', () => {
      render(<LoginPromptDialog {...defaultProps} />);
      
      const title = screen.getByText('í°¤óLÅgY');
      expect(title).toHaveClass('text-lg', 'font-semibold', 'text-gray-900');
    });
  });

  describe('¤ÙóÈÏóÉêó°', () => {
    it('calls onClose when close button (X) is clicked', () => {
      render(<LoginPromptDialog {...defaultProps} />);
      
      const closeButton = document.querySelector('button[aria-label="close"]') ||
                         document.querySelector('svg').closest('button');
      
      fireEvent.click(closeButton!);
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('calls onClose when cancel button is clicked', () => {
      render(<LoginPromptDialog {...defaultProps} />);
      
      const cancelButton = screen.getByText('­ãó»ë');
      fireEvent.click(cancelButton);
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('calls openSignIn and onClose when login button is clicked', () => {
      render(<LoginPromptDialog {...defaultProps} />);
      
      const loginButton = screen.getByText('í°¤óY‹');
      fireEvent.click(loginButton);
      
      expect(mockOpenSignIn).toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('does not call onClose when dialog content is clicked', () => {
      render(<LoginPromptDialog {...defaultProps} />);
      
      const dialogContent = document.querySelector('.bg-white');
      fireEvent.click(dialogContent!);
      
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('calls onClose when backdrop is clicked', () => {
      render(<LoginPromptDialog {...defaultProps} />);
      
      const backdrop = document.querySelector('.fixed.inset-0');
      fireEvent.click(backdrop!);
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('ì¤¢¦Èh¹¿¤êó°', () => {
    it('has proper modal structure', () => {
      render(<LoginPromptDialog {...defaultProps} />);
      
      const backdrop = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
      expect(backdrop).toBeInTheDocument();
      
      const modal = document.querySelector('.bg-white.rounded-lg');
      expect(modal).toBeInTheDocument();
    });

    it('has proper button styling', () => {
      render(<LoginPromptDialog {...defaultProps} />);
      
      const loginButton = screen.getByText('í°¤óY‹');
      expect(loginButton).toHaveClass('bg-gradient-to-r', 'from-blue-500', 'to-purple-600');
      
      const cancelButton = screen.getByText('­ãó»ë');
      expect(cancelButton).toHaveClass('bg-gray-100', 'text-gray-700');
    });

    it('has proper spacing and layout', () => {
      render(<LoginPromptDialog {...defaultProps} />);
      
      const modal = document.querySelector('.max-w-sm.w-full');
      expect(modal).toBeInTheDocument();
      
      const padding = document.querySelector('.p-6');
      expect(padding).toBeInTheDocument();
    });

    it('centers content properly', () => {
      render(<LoginPromptDialog {...defaultProps} />);
      
      const centeringContainer = document.querySelector('.flex.items-center.justify-center');
      expect(centeringContainer).toBeInTheDocument();
    });
  });

  describe('¢¯»·ÓêÆ£', () => {
    it('has proper heading structure', () => {
      render(<LoginPromptDialog {...defaultProps} />);
      
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('í°¤óLÅgY');
    });

    it('has focusable buttons', () => {
      render(<LoginPromptDialog {...defaultProps} />);
      
      const loginButton = screen.getByRole('button', { name: 'í°¤óY‹' });
      const cancelButton = screen.getByRole('button', { name: '­ãó»ë' });
      
      expect(loginButton).toBeInTheDocument();
      expect(cancelButton).toBeInTheDocument();
    });

    it('has proper z-index for modal overlay', () => {
      render(<LoginPromptDialog {...defaultProps} />);
      
      const overlay = document.querySelector('.z-50');
      expect(overlay).toBeInTheDocument();
    });
  });

  describe('ì¹İó·ÖÇ¶¤ó', () => {
    it('has responsive padding and margins', () => {
      render(<LoginPromptDialog {...defaultProps} />);
      
      const modal = document.querySelector('.mx-4');
      expect(modal).toBeInTheDocument();
    });

    it('has proper max width', () => {
      render(<LoginPromptDialog {...defaultProps} />);
      
      const modal = document.querySelector('.max-w-sm');
      expect(modal).toBeInTheDocument();
    });
  });

  describe('Ü¿ón¹¿¤êó°', () => {
    it('login button has gradient and hover effects', () => {
      render(<LoginPromptDialog {...defaultProps} />);
      
      const loginButton = screen.getByText('í°¤óY‹');
      expect(loginButton).toHaveClass(
        'bg-gradient-to-r',
        'from-blue-500',
        'to-purple-600',
        'text-white',
        'hover:from-blue-600',
        'hover:to-purple-700',
        'shadow-lg',
        'hover:shadow-xl',
        'transform',
        'hover:scale-105'
      );
    });

    it('cancel button has proper styling', () => {
      render(<LoginPromptDialog {...defaultProps} />);
      
      const cancelButton = screen.getByText('­ãó»ë');
      expect(cancelButton).toHaveClass(
        'bg-gray-100',
        'text-gray-700',
        'hover:bg-gray-200'
      );
    });

    it('close button has proper styling', () => {
      render(<LoginPromptDialog {...defaultProps} />);
      
      const closeButton = document.querySelector('svg').closest('button');
      expect(closeButton).toHaveClass(
        'text-gray-400',
        'hover:text-gray-600',
        'transition-colors'
      );
    });
  });

  describe('¨éüÏóÉêó°', () => {
    it('handles empty message gracefully', () => {
      render(<LoginPromptDialog {...defaultProps} message="" />);
      
      expect(screen.getByText('í°¤óLÅgY')).toBeInTheDocument();
      // Empty message should still render the dialog
      const messageElement = document.querySelector('p');
      expect(messageElement).toHaveTextContent('');
    });

    it('handles undefined message gracefully', () => {
      render(<LoginPromptDialog {...defaultProps} message={undefined as any} />);
      
      expect(screen.getByText('í°¤óLÅgY')).toBeInTheDocument();
    });
  });

  describe('­üÜüÉÊÓ²ü·çó', () => {
    it('supports tab navigation between buttons', () => {
      render(<LoginPromptDialog {...defaultProps} />);
      
      const loginButton = screen.getByText('í°¤óY‹');
      const cancelButton = screen.getByText('­ãó»ë');
      
      // Test that buttons can receive focus
      loginButton.focus();
      expect(document.activeElement).toBe(loginButton);
      
      cancelButton.focus();
      expect(document.activeElement).toBe(cancelButton);
    });

    it('handles Enter key on buttons', () => {
      render(<LoginPromptDialog {...defaultProps} />);
      
      const loginButton = screen.getByText('í°¤óY‹');
      fireEvent.keyDown(loginButton, { key: 'Enter' });
      
      expect(mockOpenSignIn).toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('áÃ»ü¸h:', () => {
    it('displays various message types correctly', () => {
      const messages = [
        'DDmY‹koí°¤óLÅgY',
        'İXY‹koí°¤óLÅgY',
        '•?Y‹koí°¤óLÅgY'
      ];

      messages.forEach(message => {
        const { rerender } = render(<LoginPromptDialog {...defaultProps} message={message} />);
        expect(screen.getByText(message)).toBeInTheDocument();
        rerender(<div />); // Clear between tests
      });
    });

    it('handles long messages properly', () => {
      const longMessage = 'SŒo^8kwDáÃ»ü¸gYæü¶üLí°¤óY‹ÅLB‹1’sWO¬WfD~Y';
      render(<LoginPromptDialog {...defaultProps} message={longMessage} />);
      
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });
  });
});