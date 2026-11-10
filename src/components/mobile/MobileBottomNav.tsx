import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";
import { Compass, Home, Package, ShoppingBag, User } from "lucide-react";
import { Link, useLocation } from "react-router";

interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
  badge?: number;
  matchPrefix?: boolean;
}

export function MobileBottomNav() {
  const location = useLocation();
  const { count } = useCart();
  const { isAuthenticated } = useAuth();

  const items: NavItem[] = [
    { to: "/", label: "Home", icon: Home },
    { to: "/shop", label: "Shop", icon: Compass, matchPrefix: true },
    { to: "/cart", label: "Bag", icon: ShoppingBag, badge: count },
    { to: "/orders", label: "Orders", icon: Package, matchPrefix: true },
    {
      to: isAuthenticated ? "/profile" : "/auth",
      label: isAuthenticated ? "Profile" : "Sign In",
      icon: User,
      matchPrefix: true,
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 md:hidden",
        "border-t border-border/80 bg-background/95 backdrop-blur-xl",
        "pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_20px_rgba(0,0,0,0.04)]",
      )}
    >
      <div className="flex h-16 items-center justify-around px-2">
        {items.map((item) => {
          const isActive = item.matchPrefix
            ? location.pathname.startsWith(item.to)
            : location.pathname === item.to;
          const Icon = item.icon;

          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "relative flex flex-col items-center justify-center py-1.5 px-3 min-w-[56px] rounded-xl transition-all duration-200 select-none",
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground active:scale-95",
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "size-5 transition-transform duration-200",
                    isActive ? "scale-110 stroke-[2.2]" : "stroke-[1.6]",
                  )}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground animate-in zoom-in">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
              <span className="mt-1 text-[10px] tracking-tight leading-none">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 size-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
