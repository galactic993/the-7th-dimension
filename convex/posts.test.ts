import { describe, it, expect, vi, beforeEach } from "vitest";
import { convexTest } from "convex-test";
import { api } from "./_generated/api";
import schema from "./schema";

const t = convexTest(schema);

describe("Posts関数", () => {
  const mockUser = {
    id: "test_user_id",
    email: "test@example.com",
    name: "Test User",
    nickname: "testuser",
    pictureUrl: "https://example.com/avatar.jpg"
  };

  const mockAuthUserId = "test_user_id";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createPost", () => {
    it("新しい投稿を作成する", async () => {
      const mockCtx = {
        auth: {
          getUserIdentity: vi.fn().mockResolvedValue(mockUser)
        }
      };

      const postData = {
        imageUrls: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
        caption: "Test caption",
        tags: ["test", "vitest"],
        location: "Test Location"
      };

      const result = await t.mutation(api.posts.createPost, postData, { 
        ctx: mockCtx,
        auth: { getUserId: () => mockAuthUserId }
      });

      expect(result).toBeDefined();

      const posts = await t.query(api.posts.getAllPosts, {});
      expect(posts).toHaveLength(1);
      expect(posts[0].caption).toBe("Test caption");
      expect(posts[0].tags).toEqual(["test", "vitest"]);
      expect(posts[0].user.username).toBe("testuser");
      expect(posts[0].source).toBe("user-upload");
    });

    it("認証されていないユーザーの場合エラーを発生させる", async () => {
      const postData = {
        imageUrls: ["https://example.com/image.jpg"],
        caption: "Test caption",
        tags: ["test"],
        location: "Test Location"
      };

      await expect(
        t.mutation(api.posts.createPost, postData, { 
          auth: { getUserId: () => null }
        })
      ).rejects.toThrow("User must be authenticated to create posts");
    });

    it("ユーザーIDが取得できない場合エラーを発生させる", async () => {
      const mockCtx = {
        auth: {
          getUserIdentity: vi.fn().mockResolvedValue(null)
        }
      };

      const postData = {
        imageUrls: ["https://example.com/image.jpg"],
        caption: "Test caption",
        tags: ["test"]
      };

      await expect(
        t.mutation(api.posts.createPost, postData, { 
          ctx: mockCtx,
          auth: { getUserId: () => mockAuthUserId }
        })
      ).rejects.toThrow("User identity not found");
    });

    it("オーディオとビデオURLが正しく保存される", async () => {
      const mockCtx = {
        auth: {
          getUserIdentity: vi.fn().mockResolvedValue(mockUser)
        }
      };

      const postData = {
        imageUrls: ["https://example.com/image.jpg"],
        audioUrl: "https://example.com/audio.mp3",
        videoUrl: "https://example.com/video.mp4",
        caption: "Media test",
        tags: ["media"]
      };

      await t.mutation(api.posts.createPost, postData, { 
        ctx: mockCtx,
        auth: { getUserId: () => mockAuthUserId }
      });

      const posts = await t.query(api.posts.getAllPosts, {});
      expect(posts[0].audioUrl).toBe("https://example.com/audio.mp3");
      expect(posts[0].videoUrl).toBe("https://example.com/video.mp4");
    });
  });

  describe("getAllPosts", () => {
    beforeEach(async () => {
      const mockCtx = {
        auth: {
          getUserIdentity: vi.fn().mockResolvedValue(mockUser)
        }
      };

      // テストデータを作成
      await t.mutation(api.posts.createPost, {
        imageUrls: ["https://example.com/image1.jpg"],
        caption: "Test post 1",
        tags: ["test1"],
        location: "Location 1"
      }, { 
        ctx: mockCtx,
        auth: { getUserId: () => mockAuthUserId }
      });

      await t.mutation(api.posts.createPost, {
        imageUrls: ["https://example.com/image2.jpg"],
        caption: "Test post 2",
        tags: ["test2"],
        location: "Location 2"
      }, { 
        ctx: mockCtx,
        auth: { getUserId: () => mockAuthUserId }
      });
    });

    it("すべての投稿を取得する", async () => {
      const posts = await t.query(api.posts.getAllPosts, {}, {
        auth: { getUserId: () => mockAuthUserId }
      });

      expect(posts).toHaveLength(2);
      expect(posts[0].caption).toBe("Test post 2"); // 新しい順
      expect(posts[1].caption).toBe("Test post 1");
    });

    it("認証されていないユーザーでも投稿を取得できる", async () => {
      const posts = await t.query(api.posts.getAllPosts, {}, {
        auth: { getUserId: () => null }
      });

      expect(posts).toHaveLength(2);
      expect(posts[0].isLiked).toBe(false);
      expect(posts[0].isSaved).toBe(false);
    });

    it("投稿データが正しい形式で返される", async () => {
      const posts = await t.query(api.posts.getAllPosts, {}, {
        auth: { getUserId: () => mockAuthUserId }
      });

      const post = posts[0];
      expect(post).toHaveProperty("id");
      expect(post).toHaveProperty("user");
      expect(post).toHaveProperty("imageUrl");
      expect(post).toHaveProperty("imageUrls");
      expect(post).toHaveProperty("caption");
      expect(post).toHaveProperty("likes");
      expect(post).toHaveProperty("timestamp");
      expect(post).toHaveProperty("isLiked");
      expect(post).toHaveProperty("isSaved");
      expect(post.user).toHaveProperty("username");
      expect(post.user).toHaveProperty("displayName");
      expect(post.user).toHaveProperty("avatar");
    });
  });

  describe("toggleLike", () => {
    let postId: string;

    beforeEach(async () => {
      const mockCtx = {
        auth: {
          getUserIdentity: vi.fn().mockResolvedValue(mockUser)
        }
      };

      postId = await t.mutation(api.posts.createPost, {
        imageUrls: ["https://example.com/image.jpg"],
        caption: "Test post",
        tags: ["test"]
      }, { 
        ctx: mockCtx,
        auth: { getUserId: () => mockAuthUserId }
      });
    });

    it("いいねを追加する", async () => {
      await t.mutation(api.posts.toggleLike, { postId }, {
        auth: { getUserId: () => mockAuthUserId }
      });

      const posts = await t.query(api.posts.getAllPosts, {}, {
        auth: { getUserId: () => mockAuthUserId }
      });

      expect(posts[0].likes).toBe(1);
      expect(posts[0].isLiked).toBe(true);
    });

    it("いいねを削除する", async () => {
      // 最初にいいねを追加
      await t.mutation(api.posts.toggleLike, { postId }, {
        auth: { getUserId: () => mockAuthUserId }
      });

      // 再度いいねを押して削除
      await t.mutation(api.posts.toggleLike, { postId }, {
        auth: { getUserId: () => mockAuthUserId }
      });

      const posts = await t.query(api.posts.getAllPosts, {}, {
        auth: { getUserId: () => mockAuthUserId }
      });

      expect(posts[0].likes).toBe(0);
      expect(posts[0].isLiked).toBe(false);
    });

    it("認証されていないユーザーの場合エラーを発生させる", async () => {
      await expect(
        t.mutation(api.posts.toggleLike, { postId }, {
          auth: { getUserId: () => null }
        })
      ).rejects.toThrow("User must be authenticated to like posts");
    });

    it("複数のユーザーがいいねできる", async () => {
      const otherUserId = "other_user_id";

      await t.mutation(api.posts.toggleLike, { postId }, {
        auth: { getUserId: () => mockAuthUserId }
      });

      await t.mutation(api.posts.toggleLike, { postId }, {
        auth: { getUserId: () => otherUserId }
      });

      const posts = await t.query(api.posts.getAllPosts, {}, {
        auth: { getUserId: () => mockAuthUserId }
      });

      expect(posts[0].likes).toBe(2);
    });
  });

  describe("toggleSave", () => {
    let postId: string;

    beforeEach(async () => {
      const mockCtx = {
        auth: {
          getUserIdentity: vi.fn().mockResolvedValue(mockUser)
        }
      };

      postId = await t.mutation(api.posts.createPost, {
        imageUrls: ["https://example.com/image.jpg"],
        caption: "Test post",
        tags: ["test"]
      }, { 
        ctx: mockCtx,
        auth: { getUserId: () => mockAuthUserId }
      });
    });

    it("投稿を保存する", async () => {
      await t.mutation(api.posts.toggleSave, { postId }, {
        auth: { getUserId: () => mockAuthUserId }
      });

      const posts = await t.query(api.posts.getAllPosts, {}, {
        auth: { getUserId: () => mockAuthUserId }
      });

      expect(posts[0].isSaved).toBe(true);
    });

    it("保存を解除する", async () => {
      // 最初に保存
      await t.mutation(api.posts.toggleSave, { postId }, {
        auth: { getUserId: () => mockAuthUserId }
      });

      // 再度押して保存解除
      await t.mutation(api.posts.toggleSave, { postId }, {
        auth: { getUserId: () => mockAuthUserId }
      });

      const posts = await t.query(api.posts.getAllPosts, {}, {
        auth: { getUserId: () => mockAuthUserId }
      });

      expect(posts[0].isSaved).toBe(false);
    });

    it("認証されていないユーザーの場合エラーを発生させる", async () => {
      await expect(
        t.mutation(api.posts.toggleSave, { postId }, {
          auth: { getUserId: () => null }
        })
      ).rejects.toThrow("User must be authenticated to save posts");
    });
  });

  describe("generateUploadUrl", () => {
    it("認証されたユーザーのアップロードURLを生成する", async () => {
      const mockStorage = {
        generateUploadUrl: vi.fn().mockResolvedValue("https://upload.example.com/test")
      };

      const result = await t.mutation(api.posts.generateUploadUrl, {}, {
        auth: { getUserId: () => mockAuthUserId },
        storage: mockStorage
      });

      expect(result).toBe("https://upload.example.com/test");
      expect(mockStorage.generateUploadUrl).toHaveBeenCalled();
    });

    it("認証されていないユーザーの場合エラーを発生させる", async () => {
      await expect(
        t.mutation(api.posts.generateUploadUrl, {}, {
          auth: { getUserId: () => null }
        })
      ).rejects.toThrow("User must be authenticated to upload files");
    });
  });

  describe("getFileUrl", () => {
    it("ストレージIDからファイルURLを取得する", async () => {
      const mockStorage = {
        getUrl: vi.fn().mockResolvedValue("https://files.example.com/test.jpg")
      };

      const storageId = "test_storage_id";
      const result = await t.query(api.posts.getFileUrl, { storageId }, {
        storage: mockStorage
      });

      expect(result).toBe("https://files.example.com/test.jpg");
      expect(mockStorage.getUrl).toHaveBeenCalledWith(storageId);
    });
  });
});