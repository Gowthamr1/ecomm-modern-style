import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { Link, Navigate, useLocation } from "react-router";

/**
 * Route guard for role-scoped pages. The server enforces the same roles on
 * every admin mutation, so this only controls what the UI exposes.
 */
export function RequireRole({
  role,
  children,
}: {
  role: "admin";
  children: ReactNode;
}) {
  const { isLoading, isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/auth?returnTo=${encodeURIComponent(returnTo)}`}
        replace
      />
    );
  }

  if (user?.role !== role) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-lg px-6 py-24 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-sand text-primary">
            <ShieldAlert className="size-6" strokeWidth={1.6} />
          </span>
          <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            403 · Admins only
          </p>
          <h1 className="mt-3 font-display text-4xl">Keep out of the back room.</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Your account has the customer role, so product management, order
            fulfilment and refunds are closed to you. Customer pages are still
            open.
          </p>
          <div className="mt-7 flex justify-center gap-2">
            <Button asChild className="rounded-full">
              <Link to="/shop">Back to the shop</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/profile">Your profile</Link>
            </Button>
          </div>
        </div>
      </SiteShell>
    );
  }

  return children;
}
