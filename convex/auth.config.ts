export default {
  providers: [
    {
      domain: process.env.CLERK_DOMAIN || "https://settling-dassie-49.clerk.accounts.dev",
      applicationID: "convex",
    },
  ]
};