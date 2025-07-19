export default {
  providers: [
    {
      domain: process.env.CLERK_FRONTEND_API_URL || "https://settled-dassie-49.clerk.accounts.dev",
      applicationID: "convex",
    },
  ]
};