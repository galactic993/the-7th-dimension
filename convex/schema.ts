import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  instagramPosts: defineTable({
    instagramId: v.string(),
    caption: v.optional(v.string()),
    mediaType: v.union(v.literal("IMAGE"), v.literal("VIDEO"), v.literal("CAROUSEL_ALBUM")),
    mediaUrl: v.string(),
    permalink: v.string(),
    timestamp: v.string(),
    likeCount: v.optional(v.number()),
    commentsCount: v.optional(v.number()),
    hashtag: v.string(),
    processedAt: v.string(),
    lastChecked: v.string(),
    username: v.optional(v.string()),
    ownerUsername: v.optional(v.string()),
    ownerProfilePictureUrl: v.optional(v.string()),
    ownerId: v.optional(v.string()),
  }).index("by_instagram_id", ["instagramId"])
    .index("by_hashtag", ["hashtag"])
    .index("by_timestamp", ["timestamp"])
    .index("by_processed_at", ["processedAt"]),

  hashtagConfigs: defineTable({
    name: v.string(),
    lastFetchedAt: v.optional(v.string()),
    isActive: v.boolean(),
    fetchLimit: v.number(),
  }).index("by_name", ["name"])
    .index("by_active", ["isActive"]),

  posts: defineTable({
    userId: v.string(),
    username: v.string(),
    displayName: v.string(),
    avatar: v.string(),
    imageUrls: v.array(v.string()),
    audioUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    caption: v.string(),
    tags: v.array(v.string()),
    location: v.optional(v.string()),
    likes: v.number(),
    isVerified: v.boolean(),
    source: v.string(),
    timestamp: v.string(),
    permalink: v.optional(v.string()),
    instagramId: v.optional(v.string()),
  }).index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_source", ["source"])
    .index("by_permalink", ["permalink"])
    .index("by_source_permalink", ["source", "permalink"])
    .index("by_instagram_id", ["instagramId"])
    .index("by_source_instagram_id", ["source", "instagramId"]),

  likes: defineTable({
    postId: v.id("posts"),
    userId: v.string(),
  }).index("by_post_user", ["postId", "userId"])
    .index("by_user", ["userId"]),

  saves: defineTable({
    postId: v.id("posts"),
    userId: v.string(),
  }).index("by_post_user", ["postId", "userId"])
    .index("by_user", ["userId"]),

  userProfiles: defineTable({
    userId: v.string(),
    username: v.string(),
    displayName: v.string(),
    avatar: v.string(),
    bio: v.optional(v.string()),
    isVerified: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_user", ["userId"])
    .index("by_username", ["username"]),
}); 