import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  posts: defineTable({
    userId: v.string(),
    username: v.string(),
    displayName: v.string(),
    avatar: v.string(),
    imageUrls: v.array(v.string()), // Support up to 9 images
    audioUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    caption: v.string(),
    tags: v.array(v.string()),
    location: v.optional(v.string()),
    likes: v.number(),
    isVerified: v.optional(v.boolean()),
    source: v.string(), // 'user-upload' for user posts
    timestamp: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"])
    .searchIndex("search_content", {
      searchField: "caption",
      filterFields: ["userId", "tags"]
    }),
  
  likes: defineTable({
    postId: v.id("posts"),
    userId: v.string(),
  })
    .index("by_post", ["postId"])
    .index("by_user", ["userId"])
    .index("by_post_user", ["postId", "userId"]),
    
  saves: defineTable({
    postId: v.id("posts"),
    userId: v.string(),
  })
    .index("by_post", ["postId"])
    .index("by_user", ["userId"])
    .index("by_post_user", ["postId", "userId"]),
}); 