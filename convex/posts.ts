import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createPost = mutation({
  args: {
    imageUrls: v.array(v.string()),
    audioUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    caption: v.string(),
    tags: v.array(v.string()),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated to create posts");
    }

    // Get user info from Clerk integration
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("User identity not found");
    }

    const postId = await ctx.db.insert("posts", {
      userId: userId,
      username: user.nickname || user.email?.split('@')[0] || "user",
      displayName: user.name || user.nickname || "Unknown User",
      avatar: user.pictureUrl || "/api/placeholder/40/40",
      imageUrls: args.imageUrls,
      audioUrl: args.audioUrl,
      videoUrl: args.videoUrl,
      caption: args.caption,
      tags: args.tags,
      location: args.location,
      likes: 0,
      isVerified: false,
      source: "user-upload",
      timestamp: new Date().toISOString(),
    });

    return postId;
  },
});

export const getAllPosts = query({
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("posts")
      .order("desc")
      .collect();

    // Get current user for like/save status
    const userId = await getAuthUserId(ctx);
    
    const postsWithInteractions = await Promise.all(
      posts.map(async (post) => {
        let isLiked = false;
        let isSaved = false;
        
        if (userId) {
          const like = await ctx.db
            .query("likes")
            .withIndex("by_post_user", (q) => q.eq("postId", post._id).eq("userId", userId))
            .first();
          isLiked = !!like;
          
          const save = await ctx.db
            .query("saves")
            .withIndex("by_post_user", (q) => q.eq("postId", post._id).eq("userId", userId))
            .first();
          isSaved = !!save;
        }

        return {
          id: post._id,
          user: {
            id: post.userId,
            username: post.username,
            displayName: post.displayName,
            avatar: post.avatar,
            isVerified: post.isVerified,
          },
          imageUrl: post.imageUrls[0] || "", // Primary image for grid display
          imageUrls: post.imageUrls,
          audioUrl: post.audioUrl,
          videoUrl: post.videoUrl,
          caption: post.caption,
          likes: post.likes,
          comments: [], // Will implement comments later if needed
          timestamp: post.timestamp,
          tags: post.tags,
          location: post.location,
          isLiked,
          isSaved,
          source: post.source,
        };
      })
    );

    return postsWithInteractions;
  },
});

export const toggleLike = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated to like posts");
    }

    const existingLike = await ctx.db
      .query("likes")
      .withIndex("by_post_user", (q) => q.eq("postId", args.postId).eq("userId", userId))
      .first();

    if (existingLike) {
      // Unlike
      await ctx.db.delete(existingLike._id);
      
      // Decrement like count
      const post = await ctx.db.get(args.postId);
      if (post) {
        await ctx.db.patch(args.postId, { 
          likes: Math.max(0, post.likes - 1) 
        });
      }
    } else {
      // Like
      await ctx.db.insert("likes", {
        postId: args.postId,
        userId: userId,
      });
      
      // Increment like count
      const post = await ctx.db.get(args.postId);
      if (post) {
        await ctx.db.patch(args.postId, { 
          likes: post.likes + 1 
        });
      }
    }
  },
});

export const toggleSave = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated to save posts");
    }

    const existingSave = await ctx.db
      .query("saves")
      .withIndex("by_post_user", (q) => q.eq("postId", args.postId).eq("userId", userId))
      .first();

    if (existingSave) {
      // Unsave
      await ctx.db.delete(existingSave._id);
    } else {
      // Save
      await ctx.db.insert("saves", {
        postId: args.postId,
        userId: userId,
      });
    }
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated to upload files");
    }
    
    return await ctx.storage.generateUploadUrl();
  },
});

export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
}); 