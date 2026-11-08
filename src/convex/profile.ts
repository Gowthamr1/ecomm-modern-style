import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getCurrentUser } from "./lib/roles";

export const updateProfile = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Please sign in to continue.");
    const trimmed = name.trim().slice(0, 60);
    if (!trimmed) throw new Error("Please enter a name.");
    await ctx.db.patch(user._id, { name: trimmed });
  },
});
