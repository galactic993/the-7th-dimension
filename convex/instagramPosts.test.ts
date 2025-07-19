import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { convexTest } from "convex-test";
import { api } from "./_generated/api";
import schema from "./schema";

const t = convexTest(schema);

describe("Instagram Posts関数", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("api.instagramPosts.getActiveHashtags", () => {
    it("アクティブなハッシュタグ設定を取得する", async () => {
      await t.mutation(api.instagramPosts.api.instagramPosts.addHashtagConfig, {
        name: "test_hashtag",
        isActive: true,
        fetchLimit: 10
      });

      await t.mutation(api.instagramPosts.api.instagramPosts.addHashtagConfig, {
        name: "inactive_hashtag",
        isActive: false,
        fetchLimit: 10
      });

      const result = await t.query(api.instagramPosts.api.instagramPosts.getActiveHashtags, {});
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("test_hashtag");
      expect(result[0].isActive).toBe(true);
    });

    it("アクティブなハッシュタグがない場合は空配列を返す", async () => {
      const result = await t.query(api.instagramPosts.getActiveHashtags, {});
      expect(result).toHaveLength(0);
    });
  });

  describe("api.instagramPosts.initializeDefaultHashtag", () => {
    it("デフォルトハッシュタグが初期化される", async () => {
      await t.mutation(api.instagramPosts.initializeDefaultHashtag, {});

      const hashtags = await t.query(api.instagramPosts.getActiveHashtags, {});
      expect(hashtags).toHaveLength(1);
      expect(hashtags[0].name).toBe("the7thdimension");
      expect(hashtags[0].isActive).toBe(true);
      expect(hashtags[0].fetchLimit).toBe(50);
    });

    it("既存のデフォルトハッシュタグがある場合は重複作成しない", async () => {
      await t.mutation(api.instagramPosts.initializeDefaultHashtag, {});
      await t.mutation(api.instagramPosts.initializeDefaultHashtag, {});

      const hashtags = await t.query(api.instagramPosts.getActiveHashtags, {});
      expect(hashtags).toHaveLength(1);
    });
  });

  describe("api.instagramPosts.addHashtagConfig", () => {
    it("新しいハッシュタグ設定を追加する", async () => {
      await t.mutation(api.instagramPosts.addHashtagConfig, {
        name: "new_hashtag",
        fetchLimit: 20,
        isActive: true
      });

      const hashtags = await t.query(api.instagramPosts.getActiveHashtags, {});
      expect(hashtags).toHaveLength(1);
      expect(hashtags[0].name).toBe("new_hashtag");
      expect(hashtags[0].fetchLimit).toBe(20);
    });

    it("重複するハッシュタグ名の場合エラーを発生させる", async () => {
      await t.mutation(api.instagramPosts.addHashtagConfig, {
        name: "duplicate_hashtag",
        fetchLimit: 10
      });

      await expect(
        t.mutation(api.instagramPosts.addHashtagConfig, {
          name: "duplicate_hashtag",
          fetchLimit: 15
        })
      ).rejects.toThrow('Hashtag config for "duplicate_hashtag" already exists');
    });
  });

  describe("api.instagramPosts.updateHashtagConfig", () => {
    it("既存のハッシュタグ設定を更新する", async () => {
      await t.mutation(api.instagramPosts.addHashtagConfig, {
        name: "update_test",
        fetchLimit: 10,
        isActive: true
      });

      await t.mutation(api.instagramPosts.updateHashtagConfig, {
        name: "update_test",
        fetchLimit: 30,
        isActive: false
      });

      const hashtags = await t.query(api.instagramPosts.getActiveHashtags, {});
      expect(hashtags).toHaveLength(0); // isActive: false なので取得されない
    });

    it("存在しないハッシュタグを更新しようとするとエラーが発生", async () => {
      await expect(
        t.mutation(api.instagramPosts.updateHashtagConfig, {
          name: "nonexistent",
          isActive: false
        })
      ).rejects.toThrow('Hashtag config for "nonexistent" not found');
    });
  });

  describe("api.instagramPosts.storeFetchedPosts", () => {
    it("取得した投稿をデータベースに保存する", async () => {
      const mockPosts = [
        {
          id: "post_1",
          caption: "Test caption",
          media_type: "IMAGE" as const,
          media_url: "https://example.com/image.jpg",
          permalink: "https://instagram.com/p/test1",
          timestamp: "2024-01-01T00:00:00Z",
          like_count: 100,
          comments_count: 5,
          username: "testuser"
        }
      ];

      await t.mutation(api.instagramPosts.storeFetchedPosts, {
        posts: mockPosts,
        hashtag: "test_hashtag"
      });

      const storedPosts = await t.query(api.instagramPosts.getStoredPosts, {
        hashtag: "test_hashtag"
      });

      expect(storedPosts).toHaveLength(1);
      expect(storedPosts[0].id).toBe("post_1");
      expect(storedPosts[0].caption).toBe("Test caption");
      expect(storedPosts[0].hashtag).toBe("test_hashtag");
    });

    it("重複する投稿は新規作成されない", async () => {
      const mockPost = {
        id: "duplicate_post",
        caption: "Test caption",
        media_type: "IMAGE" as const,
        media_url: "https://example.com/image.jpg",
        permalink: "https://instagram.com/p/test",
        timestamp: "2024-01-01T00:00:00Z",
        like_count: 50,
        comments_count: 2,
        username: "testuser"
      };

      // 最初の投稿を保存
      await t.mutation(api.instagramPosts.storeFetchedPosts, {
        posts: [mockPost],
        hashtag: "test_hashtag"
      });

      // 同じ投稿を再度保存（いいね数が更新されている）
      await t.mutation(api.instagramPosts.storeFetchedPosts, {
        posts: [{ ...mockPost, like_count: 100 }],
        hashtag: "test_hashtag"
      });

      const storedPosts = await t.query(api.instagramPosts.getStoredPosts, {
        hashtag: "test_hashtag"
      });

      expect(storedPosts).toHaveLength(1);
      expect(storedPosts[0].like_count).toBe(100); // 更新された値
    });
  });

  describe("api.instagramPosts.updateHashtagLastFetched", () => {
    it("ハッシュタグの最終取得時刻を更新する", async () => {
      await t.mutation(api.instagramPosts.addHashtagConfig, {
        name: "test_hashtag",
        fetchLimit: 10
      });

      const testTimestamp = "2024-01-01T12:00:00Z";
      await t.mutation(api.instagramPosts.updateHashtagLastFetched, {
        hashtagName: "test_hashtag",
        timestamp: testTimestamp
      });

      const hashtags = await t.query(api.instagramPosts.getActiveHashtags, {});
      expect(hashtags[0].lastFetchedAt).toBe(testTimestamp);
    });
  });

  describe("api.instagramPosts.getStoredPosts", () => {
    beforeEach(async () => {
      // テストデータを準備
      const mockPosts = [
        {
          id: "post_1",
          caption: "Test post 1",
          media_type: "IMAGE" as const,
          media_url: "https://example.com/image1.jpg",
          permalink: "https://instagram.com/p/test1",
          timestamp: "2024-01-01T00:00:00Z",
          like_count: 100,
          comments_count: 5,
          username: "testuser1"
        },
        {
          id: "post_2",
          caption: "Test post 2",
          media_type: "VIDEO" as const,
          media_url: "https://example.com/video.mp4",
          permalink: "https://instagram.com/p/test2",
          timestamp: "2024-01-02T00:00:00Z",
          like_count: 50,
          comments_count: 2,
          username: "testuser2"
        }
      ];

      await t.mutation(api.instagramPosts.storeFetchedPosts, {
        posts: mockPosts,
        hashtag: "test_hashtag"
      });
    });

    it("すべての投稿を取得する", async () => {
      const posts = await t.query(api.instagramPosts.getStoredPosts, {});
      expect(posts).toHaveLength(2);
    });

    it("指定したハッシュタグの投稿のみを取得する", async () => {
      const posts = await t.query(api.instagramPosts.getStoredPosts, {
        hashtag: "test_hashtag"
      });
      expect(posts).toHaveLength(2);
      expect(posts[0].hashtag).toBe("test_hashtag");
    });

    it("limit設定が適用される", async () => {
      const posts = await t.query(api.instagramPosts.getStoredPosts, {
        limit: 1
      });
      expect(posts).toHaveLength(1);
    });

    it("存在しないハッシュタグを指定した場合は空配列を返す", async () => {
      const posts = await t.query(api.instagramPosts.getStoredPosts, {
        hashtag: "nonexistent"
      });
      expect(posts).toHaveLength(0);
    });
  });

  describe("api.instagramPosts.deletePostsByHashtag", () => {
    it("指定したハッシュタグの投稿を削除する", async () => {
      const mockPosts = [
        {
          id: "post_1",
          caption: "Test post 1",
          media_type: "IMAGE" as const,
          media_url: "https://example.com/image1.jpg",
          permalink: "https://instagram.com/p/test1",
          timestamp: "2024-01-01T00:00:00Z",
          like_count: 100,
          comments_count: 5,
          username: "testuser1"
        }
      ];

      await t.mutation(api.instagramPosts.storeFetchedPosts, {
        posts: mockPosts,
        hashtag: "delete_test"
      });

      const deletedCount = await t.mutation(api.instagramPosts.deletePostsByHashtag, {
        hashtag: "delete_test"
      });

      expect(deletedCount).toBe(1);

      const remainingPosts = await t.query(api.instagramPosts.getStoredPosts, {
        hashtag: "delete_test"
      });
      expect(remainingPosts).toHaveLength(0);
    });

    it("存在しないハッシュタグを指定した場合は0を返す", async () => {
      const deletedCount = await t.mutation(api.instagramPosts.deletePostsByHashtag, {
        hashtag: "nonexistent"
      });
      expect(deletedCount).toBe(0);
    });
  });

  describe("api.instagramPosts.removeDuplicatePosts", () => {
    it("重複した投稿を削除する", async () => {
      // 手動でpostsテーブルに重複データを作成
      const testPost = {
        userId: "test_user",
        username: "testuser",
        displayName: "Test User",
        avatar: "https://example.com/avatar.jpg",
        imageUrls: ["https://example.com/image.jpg"],
        caption: "Test post",
        tags: ["test"],
        location: "Test Location",
        likes: 100,
        isVerified: false,
        source: "instagram",
        timestamp: "2024-01-01T00:00:00Z",
        permalink: "https://instagram.com/p/test",
        instagramId: "duplicate_id"
      };

      // 同じinstagramIdで複数の投稿を作成
      await t.mutation(async (ctx) => {
        await ctx.db.insert("posts", testPost);
        await ctx.db.insert("posts", testPost);
        await ctx.db.insert("posts", testPost);
      }, {});

      const removedCount = await t.mutation(api.instagramPosts.removeDuplicatePosts, {
        source: "instagram"
      });

      expect(removedCount).toBe(2); // 3個中2個削除（1個残す）

      const remainingPosts = await t.query(async (ctx) => {
        return await ctx.db.query("posts").collect();
      }, {});

      expect(remainingPosts).toHaveLength(1);
    });
  });

  describe("api.instagramPosts.fetchAndStoreInstagramPosts", () => {
    it("アクティブなハッシュタグがない場合はデフォルトハッシュタグを初期化する", async () => {
      await t.action(api.instagramPosts.fetchAndStoreInstagramPosts, {});

      const hashtags = await t.query(api.instagramPosts.getActiveHashtags, {});
      expect(hashtags).toHaveLength(1);
      expect(hashtags[0].name).toBe("the7thdimension");
    });

    it("Instagram APIが設定されていない場合は処理をスキップする", async () => {
      // 環境変数を削除
      delete process.env.INSTAGRAM_ACCESS_TOKEN;
      delete process.env.INSTAGRAM_ACCOUNT_ID;

      await t.mutation(api.instagramPosts.addHashtagConfig, {
        name: "test_hashtag",
        isActive: true,
        fetchLimit: 10
      });

      await t.action(api.instagramPosts.fetchAndStoreInstagramPosts, {});

      const posts = await t.query(api.instagramPosts.getStoredPosts, {});
      expect(posts).toHaveLength(0);
    });
  });
});