import "@testing-library/jest-dom";
import { expect, vi } from "vitest";

global.fetch = fetch;

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn()
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
})
window.IntersectionObserver = mockIntersectionObserver

// Mock ResizeObserver
const mockResizeObserver = vi.fn()
mockResizeObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
})
window.ResizeObserver = mockResizeObserver

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock Clerk
vi.mock('@clerk/clerk-react', () => ({
  useAuth: vi.fn(() => ({
    isSignedIn: true,
    userId: 'test-user-id',
    signOut: vi.fn(),
    getToken: vi.fn(() => Promise.resolve('test-token'))
  })),
  useUser: vi.fn(() => ({
    user: {
      id: 'test-user-id',
      firstName: 'Test',
      lastName: 'User',
      imageUrl: 'test-image-url'
    }
  })),
  SignInButton: ({ children }: { children: React.ReactNode }) => children,
  SignOutButton: ({ children }: { children: React.ReactNode }) => children,
  UserButton: () => null,
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
  useClerk: vi.fn(() => ({
    signOut: vi.fn()
  }))
}))

// Mock Convex
vi.mock('convex/react', () => ({
  useQuery: vi.fn(() => []),
  useMutation: vi.fn(() => vi.fn()),
  useConvexAuth: vi.fn(() => ({
    isLoading: false,
    isAuthenticated: true
  })),
  ConvexProvider: ({ children }: { children: React.ReactNode }) => children,
  ConvexReactClient: vi.fn()
}))

// Mock image URLs
global.URL.createObjectURL = vi.fn(() => 'mocked-url')
global.URL.revokeObjectURL = vi.fn()

// Mock DOM methods
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  value: vi.fn(),
  writable: true,
})

// グローバル設定
Object.defineProperty(global, "process", {
  value: {
    env: {
      NODE_ENV: "test",
      INSTAGRAM_ACCESS_TOKEN: "test_token",
      INSTAGRAM_ACCOUNT_ID: "test_account_id", 
      INSTAGRAM_API_VERSION: "v22.0"
    }
  }
});