import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['convex/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'convex/instagram.ts',
        'convex/instagramPosts.ts',
        'convex/posts.ts'
      ]
    }
  }
});