import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/lib/cart";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  Command,
  CreditCard,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";

const NAV = [
  { to: "/shop", label: "Shop" },
  { to: "/orders", label: "Orders" },
  { to: "/payments", label: "Payments" },
];

export function Brand({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn(
        "group inline-flex items-baseline gap-1 font-display text-[26px] leading-none tracking-tight text-foreground",
        className,
      )}
    >
      Forma
      <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400 ml-1">Spices</span>
      <span className="size-1.5 rounded-full bg-[#E5A93B] transition-colors group-hover:bg-primary" />
    </Link>
  );
}

export function SiteHeader({
  onOpenSearch,
}: {
  onOpenSearch?: () => void;
}) {
  const { isAuthenticated, isLoading, user, signOut } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-[#1B382B] px-4 py-2 text-center text-[10px] font-medium uppercase tracking-[0.22em] text-white/90">
        Heritage Spices · Complimentary shipping across India over ₹1,500 · 100% Single-Origin Guaranteed
      </div>
      <div className="border-b hairline bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-8">
          <div className="flex items-center gap-6 sm:gap-8">
            <Brand />
            <nav className="hidden items-center gap-7 md:flex">
              {NAV.map((item) => {
                const active = location.pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "relative text-[13px] font-medium tracking-wide transition-colors",
                      active
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item.label}
                    {active && (
                      <span className="absolute -bottom-[21px] left-0 h-px w-full bg-foreground" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Quick Search Button (Desktop) */}
          <div className="hidden sm:flex flex-1 max-w-xs mx-4">
            <button
              type="button"
              onClick={onOpenSearch}
              className="flex w-full items-center justify-between rounded-full border border-border/80 bg-muted/40 px-3.5 py-1.5 text-xs text-muted-foreground transition-all hover:border-primary/40 hover:bg-muted/70 cursor-pointer shadow-xs"
            >
              <span className="flex items-center gap-2">
                <Search className="size-3.5 text-muted-foreground/80" />
                Search catalog...
              </span>
              <kbd className="inline-flex items-center gap-0.5 rounded border border-border/80 bg-background px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground">
                <Command className="size-2.5" /> K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Quick Search Button (Mobile) */}
            <button
              type="button"
              onClick={onOpenSearch}
              className="inline-flex sm:hidden size-10 items-center justify-center rounded-full text-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label="Search catalog"
            >
              <Search className="size-[18px]" strokeWidth={1.8} />
            </button>

            <Link
              to="/cart"
              className="relative inline-flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
              aria-label={`Bag, ${count} item${count === 1 ? "" : "s"}`}
            >
              <ShoppingBag className="size-[18px]" strokeWidth={1.6} />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-[18px] items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground animate-in zoom-in">
                  {count}
                </span>
              )}
            </Link>

            {isLoading ? (
              <div className="size-9 animate-pulse rounded-full bg-muted" />
            ) : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex size-9 items-center justify-center rounded-full bg-sand text-[11px] font-semibold tracking-wide text-primary ring-1 ring-primary/10 transition-shadow hover:shadow-soft"
                    aria-label="Account menu"
                  >
                    {initials(user?.name ?? user?.email)}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <span className="block truncate text-sm font-medium">
                      {user?.name ?? "Signed in"}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {user?.email ?? "Demo customer"}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 size-4" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/orders")}>
                    <Package className="mr-2 size-4" /> Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/payments")}>
                    <CreditCard className="mr-2 size-4" /> Payments
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 size-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                asChild
                size="sm"
                className="ml-1 hidden rounded-full px-4 text-xs sm:inline-flex"
              >
                <Link to="/auth?returnTo=%2Fshop">Sign in</Link>
              </Button>
            )}

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full md:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="size-5" strokeWidth={1.6} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <SheetHeader>
                  <SheetTitle className="font-display text-2xl font-normal">
                    Forma
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-2 flex flex-col gap-1 px-4 pb-6">
                  {NAV.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="my-3 h-px bg-border" />
                  {isAuthenticated ? (
                    <>
                      <Link
                        to="/profile"
                        onClick={() => setMobileOpen(false)}
                        className="rounded-lg px-3 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted"
                      >
                        Profile
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileOpen(false);
                          void handleSignOut();
                        }}
                        className="rounded-lg px-3 py-3 text-left text-sm text-destructive transition-colors hover:bg-muted"
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <Button asChild className="mt-1 rounded-full">
                      <Link
                        to="/auth?returnTo=%2Fshop"
                        onClick={() => setMobileOpen(false)}
                      >
                        Sign in
                      </Link>
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
