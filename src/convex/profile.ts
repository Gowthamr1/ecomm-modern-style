import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, requireUser } from "./lib/roles";

/** True while the store has no admin yet — used to offer the bootstrap claim. */
export const adminExists = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").take(500);
    return users.some((user) => user.role === "admin");
  },
});

/**
 * Demo role bootstrap: the first signed-in visitor can claim the admin role.
 * Once an admin exists the claim is closed, so the role cannot be self-granted
 * afterwards.
 */
export const claimAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const users = await ctx.db.query("users").take(500);
    if (users.some((candidate) => candidate.role === "admin")) {
      throw new Error("This store already has an admin.");
    }
    await ctx.db.patch(user._id, { role: "admin" });
    return { role: "admin" as const };
  },
});

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
