import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { convexTest } from "convex-test";
import { api } from "./_generated/api";
import schema from "./schema";

const t = convexTest(schema);

describe("Instagram API関数", () => {
  beforeEach(() => {
    // fetch関数をモック
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("searchHashtag", () => {
    it("有効なハッシュタグIDが返される", async () => {
      const mockResponse = {
        data: [
          {
            id: "123456789",
            name: "the7thdimension"
          }
        ]
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await t.action(api.instagram.searchHashtag, {
        hashtagName: "the7thdimension",
        accessToken: "test_token",
        accountId: "test_account_id"
      });

      expect(result).toBe("123456789");
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("ig_hashtag_search")
      );
    });

    it("ハッシュタグが見つからない場合にエラーが発生", async () => {
      const mockResponse = {
        data: []
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await expect(
        t.action(api.instagram.searchHashtag, {
          hashtagName: "nonexistent",
          accessToken: "test_token",
          accountId: "test_account_id"
        })
      ).rejects.toThrow('Hashtag "nonexistent" not found');
    });

    it("APIエラーが発生した場合にエラーが発生", async () => {
      const mockResponse = {
        error: {
          message: "Invalid access token",
          type: "OAuthException",
          code: 190
        }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => mockResponse
      });

      await expect(
        t.action(api.instagram.searchHashtag, {
          hashtagName: "test",
          accessToken: "invalid_token",
          accountId: "test_account_id"
        })
      ).rejects.toThrow("Invalid access token");
    });

    it("ハッシュタグ名から#を除去する", async () => {
      const mockResponse = {
        data: [
          {
            id: "123456789",
            name: "the7thdimension"
          }
        ]
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await t.action(api.instagram.searchHashtag, {
        hashtagName: "#the7thdimension",
        accessToken: "test_token",
        accountId: "test_account_id"
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("q=the7thdimension")
      );
    });
  });

  describe("getRecentMediaByHashtag", () => {
    it("メディアデータが正常に取得される", async () => {
      const mockResponse = {
        data: [
          {
            id: "media_123",
            caption: "Test caption",
            media_type: "IMAGE",
            media_url: "https://example.com/image.jpg",
            permalink: "https://instagram.com/p/test",
            timestamp: "2024-01-01T00:00:00Z",
            like_count: 100,
            comments_count: 5,
            username: "testuser"
          }
        ]
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await t.action(api.instagram.getRecentMediaByHashtag, {
        hashtagId: "123456789",
        accessToken: "test_token",
        accountId: "test_account_id"
      });

      expect(result).toEqual(mockResponse.data);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("123456789/recent_media")
      );
    });

    it("limitパラメータが適用される", async () => {
      const mockResponse = {
        data: []
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await t.action(api.instagram.getRecentMediaByHashtag, {
        hashtagId: "123456789",
        accessToken: "test_token",
        accountId: "test_account_id",
        limit: 10
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("limit=10")
      );
    });

    it("limitが50を超えた場合は50に制限される", async () => {
      const mockResponse = {
        data: []
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await t.action(api.instagram.getRecentMediaByHashtag, {
        hashtagId: "123456789",
        accessToken: "test_token",
        accountId: "test_account_id",
        limit: 100
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("limit=50")
      );
    });

    it("APIエラーが発生した場合にエラーが発生", async () => {
      const mockResponse = {
        error: {
          message: "Invalid hashtag ID",
          type: "OAuthException",
          code: 100
        }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => mockResponse
      });

      await expect(
        t.action(api.instagram.getRecentMediaByHashtag, {
          hashtagId: "invalid_id",
          accessToken: "test_token",
          accountId: "test_account_id"
        })
      ).rejects.toThrow("Invalid hashtag ID");
    });
  });

  describe("getRecentPostsByHashtagName", () => {
    it("ハッシュタグ名から投稿が取得される", async () => {
      const hashtagSearchResponse = {
        data: [
          {
            id: "123456789",
            name: "the7thdimension"
          }
        ]
      };

      const mediaResponse = {
        data: [
          {
            id: "media_123",
            caption: "Test caption",
            media_type: "IMAGE",
            media_url: "https://example.com/image.jpg",
            permalink: "https://instagram.com/p/test",
            timestamp: "2024-01-01T00:00:00Z",
            like_count: 100,
            comments_count: 5,
            username: "testuser"
          }
        ]
      };

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => hashtagSearchResponse
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mediaResponse
        });

      const result = await t.action(api.instagram.getRecentPostsByHashtagName, {
        hashtagName: "the7thdimension",
        accessToken: "test_token",
        accountId: "test_account_id"
      });

      expect(result).toEqual({
        media: mediaResponse.data,
        savedPosts: mediaResponse.data
      });
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it("ハッシュタグ検索が失敗した場合にエラーが発生", async () => {
      const errorResponse = {
        error: {
          message: "Hashtag not found",
          type: "OAuthException",
          code: 100
        }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => errorResponse
      });

      await expect(
        t.action(api.instagram.getRecentPostsByHashtagName, {
          hashtagName: "nonexistent",
          accessToken: "test_token",
          accountId: "test_account_id"
        })
      ).rejects.toThrow("Failed to fetch posts for hashtag: nonexistent");
    });

    it("期限切れトークンエラーが適切に処理される", async () => {
      const errorResponse = {
        error: {
          message: "Session has expired",
          type: "OAuthException",
          code: 190
        }
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => errorResponse
      });

      await expect(
        t.action(api.instagram.getRecentPostsByHashtagName, {
          hashtagName: "test",
          accessToken: "expired_token",
          accountId: "test_account_id"
        })
      ).rejects.toThrow("Instagram access token has expired");
    });

    it("APIバージョンが正しく設定される", async () => {
      const hashtagSearchResponse = {
        data: [
          {
            id: "123456789",
            name: "the7thdimension"
          }
        ]
      };

      const mediaResponse = {
        data: []
      };

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => hashtagSearchResponse
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mediaResponse
        });

      await t.action(api.instagram.getRecentPostsByHashtagName, {
        hashtagName: "test",
        accessToken: "test_token",
        accountId: "test_account_id",
        apiVersion: "v18.0"
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("v18.0")
      );
    });
  });
});