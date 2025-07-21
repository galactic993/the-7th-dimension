import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getUserProfile = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return profile;
  },
});

export const checkIsFirstPost = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return false;
    }

    // Check if user has any posts
    const userPosts = await ctx.db
      .query("posts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // Check if user has a profile
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return !userPosts && !userProfile;
  },
});

export const createUserProfile = mutation({
  args: {
    username: v.string(),
    displayName: v.string(),
    avatar: v.string(),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated to create profile");
    }

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingProfile) {
      throw new Error("User profile already exists");
    }

    // Check if username is already taken
    const existingUsername = await ctx.db
      .query("userProfiles")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (existingUsername) {
      throw new Error("Username is already taken");
    }

    const now = new Date().toISOString();
    
    const profileId = await ctx.db.insert("userProfiles", {
      userId,
      username: args.username,
      displayName: args.displayName,
      avatar: args.avatar,
      bio: args.bio,
      isVerified: false,
      createdAt: now,
      updatedAt: now,
    });

    return profileId;
  },
});

export const updateUserProfile = mutation({
  args: {
    username: v.optional(v.string()),
    displayName: v.optional(v.string()),
    avatar: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated to update profile");
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile) {
      throw new Error("User profile not found");
    }

    // If updating username, check if it's already taken
    if (args.username && args.username !== profile.username) {
      const existingUsername = await ctx.db
        .query("userProfiles")
        .withIndex("by_username", (q) => q.eq("username", args.username))
        .first();

      if (existingUsername) {
        throw new Error("Username is already taken");
      }
    }

    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    if (args.username !== undefined) updates.username = args.username;
    if (args.displayName !== undefined) updates.displayName = args.displayName;
    if (args.avatar !== undefined) updates.avatar = args.avatar;
    if (args.bio !== undefined) updates.bio = args.bio;

    await ctx.db.patch(profile._id, updates);

    return profile._id;
  },
});

export const checkUsernameAvailability = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const existingUsername = await ctx.db
      .query("userProfiles")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    return !existingUsername;
  },
});