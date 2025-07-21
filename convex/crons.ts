import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "fetch instagram posts",
  { minutes: 1 },
  internal.instagramPosts.fetchAndStoreInstagramPosts,
  {}
);

export default crons; 