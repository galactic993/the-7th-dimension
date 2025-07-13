import { defineApp } from "convex/server";
import auth from "./convex/auth.config.js";

const app = defineApp();
app.use(auth);

export default app;