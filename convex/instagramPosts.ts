import { internalAction, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  permalink: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
  username?: string;
  owner?: {
    username: string;
    profile_picture_url: string;
    id: string;
  };
}

interface InstagramHashtagResponse {
  data: InstagramMedia[];
  paging?: {
    after?: string;
  };
  error?: {
    message: string;
    type: string;
    code: number;
  };
}

interface InstagramHashtagSearchResponse {
  data: Array<{
    id: string;
    name: string;
  }>;
  error?: {
    message: string;
    type: string;
    code: number;
  };
}

export const fetchAndStoreInstagramPosts = internalAction({
  args: {},
  handler: async (ctx) => {
    try {
      console.log("Starting scheduled Instagram posts fetch...");
      
      const activeHashtags = await ctx.runQuery(internal.instagramPosts.getActiveHashtags);
      
      if (activeHashtags.length === 0) {
        console.log("No active hashtags configured, initializing with default hashtag");
        await ctx.runMutation(internal.instagramPosts.initializeDefaultHashtag);
        return;
      }

      for (const hashtagConfig of activeHashtags) {
        try {
          console.log(`Fetching posts for hashtag: ${hashtagConfig.name}`);
          
          const config = getInstagramConfigFromEnv();
          if (!config) {
            console.log("Instagram API not configured, skipping fetch");
            continue;
          }

          const hashtagId = await searchHashtagInternal(
            hashtagConfig.name, 
            config.accessToken, 
            config.accountId, 
            config.apiVersion
          );
          
          const media = await getRecentMediaByHashtagInternal(
            hashtagId,
            config.accessToken,
            config.accountId,
            hashtagConfig.fetchLimit,
            config.apiVersion
          );

          if (media.length > 0) {
            await ctx.runMutation(internal.instagramPosts.storeFetchedPosts, {
              posts: media,
              hashtag: hashtagConfig.name
            });
            
            await ctx.runMutation(internal.instagramPosts.updateHashtagLastFetched, {
              hashtagName: hashtagConfig.name,
              timestamp: new Date().toISOString()
            });
            
            console.log(`Successfully stored ${media.length} posts for hashtag: ${hashtagConfig.name}`);
          } else {
            console.log(`No new posts found for hashtag: ${hashtagConfig.name}`);
          }
        } catch (error) {
          console.error(`Error fetching posts for hashtag ${hashtagConfig.name}:`, error);
        }
      }
    } catch (error) {
      console.error("Error in scheduled Instagram posts fetch:", error);
    }
  }
});

export const getActiveHashtags = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("hashtagConfigs")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  }
});

export const initializeDefaultHashtag = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("hashtagConfigs")
      .withIndex("by_name", (q) => q.eq("name", "the7thdimension"))
      .first();
    
    if (!existing) {
      await ctx.db.insert("hashtagConfigs", {
        name: "the7thdimension",
        isActive: true,
        fetchLimit: 50,
        lastFetchedAt: undefined
      });
      console.log("Initialized default hashtag configuration");
    }
  }
});

export const storeFetchedPosts = internalMutation({
  args: {
    posts: v.array(v.object({
      id: v.string(),
      caption: v.optional(v.string()),
      media_type: v.union(v.literal("IMAGE"), v.literal("VIDEO"), v.literal("CAROUSEL_ALBUM")),
      media_url: v.string(),
      permalink: v.string(),
      timestamp: v.string(),
      like_count: v.optional(v.number()),
      comments_count: v.optional(v.number()),
      username: v.optional(v.string()),
      owner: v.optional(v.object({
        username: v.string(),
        profile_picture_url: v.string(),
        id: v.string(),
      })),
    })),
    hashtag: v.string()
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    let newPosts = 0;
    let updatedPosts = 0;

    for (const post of args.posts) {
      // Store in instagramPosts table for tracking
      const existing = await ctx.db
        .query("instagramPosts")
        .withIndex("by_instagram_id", (q) => q.eq("instagramId", post.id))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          likeCount: post.like_count,
          commentsCount: post.comments_count,
          lastChecked: now
        });
        updatedPosts++;
      } else {
        await ctx.db.insert("instagramPosts", {
          instagramId: post.id,
          caption: post.caption,
          mediaType: post.media_type,
          mediaUrl: post.media_url,
          permalink: post.permalink,
          timestamp: post.timestamp,
          likeCount: post.like_count,
          commentsCount: post.comments_count,
          hashtag: args.hashtag,
          processedAt: now,
          lastChecked: now
        });
        newPosts++;
      }

      // Also store in posts table for UI display
      // Check for duplicates using instagramId first, then permalink as fallback
      let existingPost = await ctx.db
        .query("posts")
        .withIndex("by_source_instagram_id", (q) => 
          q.eq("source", "instagram").eq("instagramId", post.id)
        )
        .first();

      // If not found by instagramId, check by permalink as fallback
      if (!existingPost && post.permalink) {
        existingPost = await ctx.db
          .query("posts")
          .withIndex("by_source_permalink", (q) => 
            q.eq("source", "instagram").eq("permalink", post.permalink)
          )
          .first();
      }

      if (!existingPost && post.id) {
        const isVideo = post.media_type === 'VIDEO';
        const userId = post.owner?.id || `instagram_${post.id}`;
        const username = post.owner?.username || post.username || 'instagram_user';
        const displayName = post.owner?.username || post.username || 'Instagram User';
        const avatar = post.owner?.profile_picture_url || '/images/default-avatar.png';
        
        try {
          await ctx.db.insert("posts", {
            userId: userId,
            username: username,
            displayName: displayName,
            avatar: avatar,
            imageUrls: isVideo ? [] : [post.media_url],
            videoUrl: isVideo ? post.media_url : undefined,
            caption: post.caption || '',
            tags: extractHashtagsFromCaption(post.caption || ''),
            location: 'Instagram',
            likes: post.like_count || 0,
            isVerified: false,
            source: "instagram",
            timestamp: post.timestamp,
            permalink: post.permalink,
            instagramId: post.id,
          });
        } catch (error) {
          // Handle potential race condition duplicates gracefully
          console.log(`Skipping duplicate post with instagramId: ${post.id}`);
        }
      } else if (existingPost) {
        // Update existing post's like count and instagramId if needed
        const updates: any = {};
        if (existingPost.likes !== (post.like_count || 0)) {
          updates.likes = post.like_count || 0;
        }
        if (!existingPost.instagramId && post.id) {
          updates.instagramId = post.id;
        }
        
        if (Object.keys(updates).length > 0) {
          await ctx.db.patch(existingPost._id, updates);
        }
      }
    }

    console.log(`Processed posts: ${newPosts} new, ${updatedPosts} updated`);
  }
});

export const updateHashtagLastFetched = internalMutation({
  args: {
    hashtagName: v.string(),
    timestamp: v.string()
  },
  handler: async (ctx, args) => {
    const hashtag = await ctx.db
      .query("hashtagConfigs")
      .withIndex("by_name", (q) => q.eq("name", args.hashtagName))
      .first();
    
    if (hashtag) {
      await ctx.db.patch(hashtag._id, {
        lastFetchedAt: args.timestamp
      });
    }
  }
});

export const getStoredPosts = query({
  args: {
    hashtag: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    let posts;
    
    if (args.hashtag) {
      posts = await ctx.db
        .query("instagramPosts")
        .withIndex("by_hashtag", (q) => q.eq("hashtag", args.hashtag as string))
        .order("desc")
        .take(limit);
    } else {
      posts = await ctx.db
        .query("instagramPosts")
        .order("desc")
        .take(limit);
    }
    
    return posts.map(post => ({
      id: post.instagramId,
      caption: post.caption,
      media_type: post.mediaType,
      media_url: post.mediaUrl,
      permalink: post.permalink,
      timestamp: post.timestamp,
      like_count: post.likeCount,
      comments_count: post.commentsCount,
      hashtag: post.hashtag,
      processed_at: post.processedAt
    }));
  }
});

export const addHashtagConfig = mutation({
  args: {
    name: v.string(),
    fetchLimit: v.optional(v.number()),
    isActive: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("hashtagConfigs")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
    
    if (existing) {
      throw new Error(`Hashtag config for "${args.name}" already exists`);
    }
    
    await ctx.db.insert("hashtagConfigs", {
      name: args.name,
      isActive: args.isActive ?? true,
      fetchLimit: args.fetchLimit ?? 50,
      lastFetchedAt: undefined
    });
  }
});

export const updateHashtagConfig = mutation({
  args: {
    name: v.string(),
    isActive: v.optional(v.boolean()),
    fetchLimit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const hashtag = await ctx.db
      .query("hashtagConfigs")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
    
    if (!hashtag) {
      throw new Error(`Hashtag config for "${args.name}" not found`);
    }
    
    const updates: Partial<{
      isActive: boolean;
      fetchLimit: number;
    }> = {};
    if (args.isActive !== undefined) updates.isActive = args.isActive;
    if (args.fetchLimit !== undefined) updates.fetchLimit = args.fetchLimit;
    
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(hashtag._id, updates);
    }
  }
});

export const deletePostsByHashtag = internalMutation({
  args: {
    hashtag: v.string()
  },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("instagramPosts")
      .withIndex("by_hashtag", (q) => q.eq("hashtag", args.hashtag))
      .collect();
    
    let deletedCount = 0;
    for (const post of posts) {
      await ctx.db.delete(post._id);
      deletedCount++;
    }
    
    console.log(`Deleted ${deletedCount} posts for hashtag: ${args.hashtag}`);
    return deletedCount;
  }
});

function getInstagramConfigFromEnv() {
  if (typeof process === 'undefined' || !process.env) {
    return null;
  }
  
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const accountId = process.env.INSTAGRAM_ACCOUNT_ID;
  
  if (!accessToken || !accountId) {
    return null;
  }
  
  return {
    accessToken,
    accountId,
    apiVersion: process.env.INSTAGRAM_API_VERSION || 'v22.0'
  };
}

async function searchHashtagInternal(hashtagName: string, accessToken: string, accountId: string, apiVersion: string = 'v22.0'): Promise<string> {
  const baseUrl = `https://graph.facebook.com/${apiVersion}`;
  
  const url = new URL(`${baseUrl}/ig_hashtag_search`);
  url.searchParams.append('user_id', accountId);
  url.searchParams.append('q', hashtagName.replace('#', ''));
  url.searchParams.append('access_token', accessToken);

  console.log(`Searching hashtag with URL: ${url.toString().replace(accessToken, '[TOKEN]')}`);

  const response = await fetch(url.toString());
  const data: InstagramHashtagSearchResponse = await response.json();

  console.log(`Hashtag search response status: ${response.status}`);
  console.log(`Hashtag search response:`, JSON.stringify(data, null, 2));

  if (!response.ok) {
    throw new Error(data.error?.message || 'Instagram API request failed');
  }

  if (!data.data || data.data.length === 0) {
    throw new Error(`Hashtag "${hashtagName}" not found`);
  }

  console.log(`Found hashtag ID: ${data.data[0].id} for hashtag: ${hashtagName}`);
  return data.data[0].id;
}

async function getRecentMediaByHashtagInternal(hashtagId: string, accessToken: string, accountId: string, limit: number = 5, apiVersion: string = 'v22.0'): Promise<InstagramMedia[]> {
  const baseUrl = `https://graph.facebook.com/${apiVersion}`;
  
  const fields = [
    'id',
    'caption',
    'media_type', 
    'media_url',
    'permalink',
    'timestamp',
    'like_count',
    'comments_count'
  ].join(',');

  const url = new URL(`${baseUrl}/${hashtagId}/recent_media`);
  url.searchParams.append('user_id', accountId);
  url.searchParams.append('fields', fields);
  url.searchParams.append('limit', Math.min(limit, 50).toString());
  url.searchParams.append('access_token', accessToken);

  console.log(`Fetching recent media with URL: ${url.toString().replace(accessToken, '[TOKEN]')}`);

  const response = await fetch(url.toString());
  const data: InstagramHashtagResponse = await response.json();

  console.log(`Recent media response status: ${response.status}`);
  console.log(`Recent media response:`, JSON.stringify(data, null, 2));

  if (!response.ok) {
    throw new Error(data.error?.message || 'Instagram API request failed');
  }

  console.log(`Found ${data.data?.length || 0} posts for hashtag ID: ${hashtagId}`);
  return data.data || [];
}

// Helper function to extract hashtags from caption
function extractHashtagsFromCaption(caption: string): string[] {
  const hashtagRegex = /#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g;
  const matches = caption.match(hashtagRegex);
  return matches ? matches.map(tag => tag.substring(1)) : [];
}

export const removeDuplicatePosts = internalMutation({
  args: {
    source: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const source = args.source || "instagram";
    
    // Find all posts for the source
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_source", (q) => q.eq("source", source))
      .collect();
    
    // Group by instagramId first, then by permalink for posts without instagramId
    const instagramIdGroups = new Map<string, typeof posts>();
    const permalinkGroups = new Map<string, typeof posts>();
    
    for (const post of posts) {
      if (post.instagramId) {
        if (!instagramIdGroups.has(post.instagramId)) {
          instagramIdGroups.set(post.instagramId, []);
        }
        instagramIdGroups.get(post.instagramId)!.push(post);
      } else if (post.permalink) {
        if (!permalinkGroups.has(post.permalink)) {
          permalinkGroups.set(post.permalink, []);
        }
        permalinkGroups.get(post.permalink)!.push(post);
      }
    }
    
    let removedCount = 0;
    
    // Remove duplicates by instagramId
    for (const [instagramId, duplicates] of instagramIdGroups) {
      if (duplicates.length > 1) {
        // Sort by creation time, keep the first one
        duplicates.sort((a, b) => a._creationTime - b._creationTime);
        
        // Remove all but the first
        for (let i = 1; i < duplicates.length; i++) {
          await ctx.db.delete(duplicates[i]._id);
          removedCount++;
        }
        
        console.log(`Removed ${duplicates.length - 1} duplicates for instagramId: ${instagramId}`);
      }
    }
    
    // Remove duplicates by permalink (for posts without instagramId)
    for (const [permalink, duplicates] of permalinkGroups) {
      if (duplicates.length > 1) {
        // Sort by creation time, keep the first one
        duplicates.sort((a, b) => a._creationTime - b._creationTime);
        
        // Remove all but the first
        for (let i = 1; i < duplicates.length; i++) {
          await ctx.db.delete(duplicates[i]._id);
          removedCount++;
        }
        
        console.log(`Removed ${duplicates.length - 1} duplicates for permalink: ${permalink}`);
      }
    }
    
    console.log(`Total duplicates removed: ${removedCount}`);
    return removedCount;
  }
}); 