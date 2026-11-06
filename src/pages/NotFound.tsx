import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <SiteShell>
      <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-28 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          404
        </p>
        <h1 className="mt-3 font-display text-5xl leading-none tracking-tight">
          Nothing here.
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
          The page you were looking for has moved, sold out or never existed.
          The collection is a good place to restart.
        </p>
        <div className="mt-8 flex gap-2">
          <Button asChild className="rounded-full">
            <Link to="/shop">Browse the shop</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/">
              <ArrowLeft className="mr-2 size-4" />
              Home
            </Link>
          </Button>
        </div>
      </div>
    </SiteShell>
  );
}
