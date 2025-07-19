import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Login from './Login';

vi.mock('@clerk/clerk-react', () => ({
  SignIn: ({ routing, signUpUrl, appearance }: any) => (
    <div data-testid="sign-in-component">
      <div data-testid="routing">{routing}</div>
      <div data-testid="signup-url">{signUpUrl?.toString() || 'null'}</div>
      <div data-testid="appearance">{JSON.stringify(appearance)}</div>
      <button>í°¤ó</button>
    </div>
  )
}));

describe('Login', () => {
  it('renders Login component', () => {
    render(<Login />);
    
    expect(screen.getByText('The 7th Dimension')).toBeInTheDocument();
    expect(screen.getByText('í°¤óWf³óÆóÄ’J}WO`UD')).toBeInTheDocument();
    expect(screen.getByTestId('sign-in-component')).toBeInTheDocument();
  });

  it('displays the correct title and description', () => {
    render(<Login />);
    
    const title = screen.getByText('The 7th Dimension');
    expect(title).toHaveClass('text-3xl', 'font-bold', 'text-gray-900');
    
    const description = screen.getByText('í°¤óWf³óÆóÄ’J}WO`UD');
    expect(description).toHaveClass('text-gray-600');
  });

  it('has proper layout structure', () => {
    render(<Login />);
    
    const container = document.querySelector('.min-h-screen');
    expect(container).toHaveClass('bg-gradient-to-br', 'from-gray-50', 'via-white', 'to-gray-50');
    
    const contentWrapper = document.querySelector('.max-w-md');
    expect(contentWrapper).toHaveClass('w-full', 'space-y-8', 'p-8');
  });

  it('passes correct props to SignIn component', () => {
    render(<Login />);
    
    expect(screen.getByTestId('routing')).toHaveTextContent('hash');
    expect(screen.getByTestId('signup-url')).toHaveTextContent('null');
    
    const appearanceData = screen.getByTestId('appearance');
    const appearance = JSON.parse(appearanceData.textContent || '{}');
    
    expect(appearance.elements.formButtonPrimary).toBe('bg-blue-600 hover:bg-blue-700 text-white');
    expect(appearance.elements.card).toBe('shadow-lg');
    expect(appearance.elements.footerActionLink.display).toBe('none');
    expect(appearance.elements.footerAction.display).toBe('none');
    expect(appearance.elements.footerActionText.display).toBe('none');
    expect(appearance.elements.footer.display).toBe('none');
  });

  it('centers the sign-in component', () => {
    render(<Login />);
    
    const signInWrapper = screen.getByTestId('sign-in-component').closest('.flex');
    expect(signInWrapper).toHaveClass('justify-center');
  });

  it('has proper text styling', () => {
    render(<Login />);
    
    const title = screen.getByRole('heading', { level: 2 });
    expect(title).toHaveClass('text-3xl', 'font-bold', 'text-gray-900', 'mb-2');
  });

  it('has proper responsive design', () => {
    render(<Login />);
    
    const container = document.querySelector('.min-h-screen');
    expect(container).toHaveClass('flex', 'items-center', 'justify-center');
    
    const wrapper = document.querySelector('.max-w-md');
    expect(wrapper).toHaveClass('w-full');
  });

  it('has proper spacing between elements', () => {
    render(<Login />);
    
    const textContainer = document.querySelector('.text-center');
    expect(textContainer).toBeInTheDocument();
    
    const spacingWrapper = document.querySelector('.space-y-8');
    expect(spacingWrapper).toBeInTheDocument();
  });

  it('renders sign-in button', () => {
    render(<Login />);
    
    expect(screen.getByRole('button', { name: 'í°¤ó' })).toBeInTheDocument();
  });

  describe('¢¯»·ÓêÆ£', () => {
    it('has proper heading structure', () => {
      render(<Login />);
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('The 7th Dimension');
    });

    it('has proper semantic structure', () => {
      render(<Login />);
      
      expect(document.querySelector('.text-center')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('¹¿¤êó°', () => {
    it('uses gradient background', () => {
      render(<Login />);
      
      const background = document.querySelector('.bg-gradient-to-br');
      expect(background).toHaveClass('from-gray-50', 'via-white', 'to-gray-50');
    });

    it('has proper padding and margins', () => {
      render(<Login />);
      
      const contentWrapper = document.querySelector('.p-8');
      expect(contentWrapper).toBeInTheDocument();
      
      const title = screen.getByText('The 7th Dimension');
      expect(title).toHaveClass('mb-2');
    });

    it('centers content properly', () => {
      render(<Login />);
      
      const centeringContainer = document.querySelector('.flex.items-center.justify-center');
      expect(centeringContainer).toBeInTheDocument();
      
      const signInCenter = document.querySelector('.flex.justify-center');
      expect(signInCenter).toBeInTheDocument();
    });
  });

  describe('Clerkq', () => {
    it('configures SignIn with hash routing', () => {
      render(<Login />);
      
      expect(screen.getByTestId('routing')).toHaveTextContent('hash');
    });

    it('disables sign-up functionality', () => {
      render(<Login />);
      
      expect(screen.getByTestId('signup-url')).toHaveTextContent('null');
    });

    it('hides footer elements', () => {
      render(<Login />);
      
      const appearance = JSON.parse(screen.getByTestId('appearance').textContent || '{}');
      
      expect(appearance.elements.footerActionLink.display).toBe('none');
      expect(appearance.elements.footerAction.display).toBe('none');
      expect(appearance.elements.footerActionText.display).toBe('none');
      expect(appearance.elements.footer.display).toBe('none');
    });

    it('applies custom button styling', () => {
      render(<Login />);
      
      const appearance = JSON.parse(screen.getByTestId('appearance').textContent || '{}');
      expect(appearance.elements.formButtonPrimary).toBe('bg-blue-600 hover:bg-blue-700 text-white');
    });

    it('applies card shadow', () => {
      render(<Login />);
      
      const appearance = JSON.parse(screen.getByTestId('appearance').textContent || '{}');
      expect(appearance.elements.card).toBe('shadow-lg');
    });
  });
});